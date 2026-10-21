# Proposition : détection, téléchargement et activation des nouvelles versions de l'IHM POSDOC

## 1. Rappel du besoin

| # | Besoin exprimé | Reformulation technique |
|---|----------------|-------------------------|
| 1 | Être informé qu'une nouvelle version de l'IHM existe, pour déclencher l'actualisation et le téléchargement. | Détecter côté navigateur qu'une version plus récente que celle en cours d'exécution a été déployée sur le serveur, la télécharger en tâche de fond et prévenir l'utilisateur. |
| 2 | Lorsque la version est opérationnelle, elle doit s'activer. | N'activer la nouvelle version que lorsqu'elle est complète et intègre (tous les bundles présents, hash vérifiés), puis recharger l'application sans casser le travail en cours. |
| 3 | Être informé d'un problème d'installation, pour déclencher un nouveau téléchargement. | Détecter l'échec d'installation ou la corruption du cache applicatif, l'afficher, et proposer une réinstallation propre (purge du cache + rechargement). |

L'idée complémentaire était d'imposer l'égalité stricte des numéros de version back / front et de forcer le rechargement en cas de delta.

## 2. État des lieux dans le code

Ce qui existe déjà et sur quoi la proposition s'appuie :

- **Aucun service worker aujourd'hui.** `@angular/service-worker` n'est pas dans `package.json`, il n'y a pas de `ngsw-config.json`. Angular 19.2 le supporte nativement.
- **Build déjà prêt pour le cache long** : `outputHashing: all` en production, et `src/.htaccess` sert `index.html` en `no-store`, les bundles hashés en `immutable` un an, les JSON en `no-cache`.
- **Version front** : `package.json` (`version` injectée par le paramètre Jenkins `VERSION`, `date` par `update-date.js`) importé à la compilation dans `nav.component.ts` et affiché en bas du menu.
- **Version back** : `version.properties` généré par Maven (`project.version` + timestamp), exposé par la query GraphQL `getVersion` (résolveur `VersionResolver`), déjà consommée par `VersionService` côté front avec `fetchPolicy: 'no-cache'`.
- **Pipelines indépendants** : le front et le back ont chacun leur Jenkinsfile, leur paramètre de version (`VERSION` / `POM_VERSION`) et leur branche Hawai (`lot_8.0_ihm` / `lot_9.0_ihm`). Les deux ne sont donc pas livrés de façon atomique.
- **Briques réutilisables** : `ApiInterceptor` (ajout d'en-têtes sur `/api/v1`), `ToastService`, `NgbModal`, `InactivityLogoutService` (suit déjà l'activité utilisateur), `CanDesactivateGuard` (10 écrans protègent des saisies en cours), `AppConfigService` (config runtime `assets/configuration/configuration.json`).
- **Point de vigilance** : `assets/configuration/configuration.json` contient des tokens `@POSDOC.…@` remplacés au déploiement Hawai. Son contenu change donc **après** le build.

Problème actuel non couvert : après un déploiement, un utilisateur qui garde un onglet ouvert conserve un `index.html` ancien. Dès qu'il navigue vers un écran chargé en lazy loading, le chunk ancien n'existe plus sur le serveur (nouveau hash) et l'application plante (`ChunkLoadError`). Le service worker résout ce cas en servant l'ancienne version depuis le cache jusqu'au rechargement.

## 3. Analyse de l'idée « version back = version front »

L'intention est bonne (détecter un delta et pousser l'utilisateur à recharger), mais l'égalité stricte pose plusieurs problèmes dans ce projet :

1. **Livraisons non atomiques.** Les deux pipelines sont séparés. Pendant la fenêtre de déploiement, et à chaque hotfix livré d'un seul côté, les versions diffèrent légitimement. Une égalité stricte bloquerait les utilisateurs sans raison.
2. **Le rechargement forcé ne suffit pas.** Recharger le navigateur ne garantit pas de charger la nouvelle version : si un service worker est en place, il continue de servir la version en cache tant que la nouvelle n'a pas été téléchargée et activée. La séquence correcte est : *détecter → télécharger → vérifier → activer → recharger*. Sans service worker, le rechargement fonctionne mais ne couvre ni le besoin 2 ni le besoin 3.
3. **Deux questions différentes.** « Y a-t-il une nouvelle IHM sur le serveur ? » (besoins 1 à 3) et « Mon IHM est-elle compatible avec le back ? » sont deux contrôles distincts. Les mélanger produit des faux positifs.

Proposition : séparer les deux mécanismes.

- **Mise à jour de l'IHM** : le front se compare à **lui-même** (version déployée sur le serveur vs version exécutée dans le navigateur). C'est exactement ce que fait le service worker Angular via le manifeste `ngsw.json`.
- **Compatibilité back / front** : le back publie une **version minimale de front requise** (ou signale une incompatibilité). Le front compare, et seulement en cas d'incompatibilité, bascule en mode « mise à jour forcée ». Le changement de version du back sert aussi de **déclencheur** pour vérifier immédiatement s'il existe un nouveau front, sans jamais exiger l'égalité.

## 4. Architecture cible

```
┌──────────────────────────── Navigateur ────────────────────────────┐
│  App Angular (version courante)                                    │
│   ├─ AppUpdateService                                              │
│   │    ├─ SwUpdate.versionUpdates  (DETECTED / READY / FAILED)     │
│   │    ├─ SwUpdate.unrecoverable   (cache corrompu)                │
│   │    ├─ checkForUpdate() périodique + au retour d'onglet         │
│   │    └─ déclenché aussi par changement de version back           │
│   ├─ UpdateBannerComponent (bandeau non bloquant)                  │
│   ├─ UpdateForcedDialog (modal bloquante, cas incompatibilité)     │
│   └─ ApiInterceptor  (lit X-Posdoc-Be-Version / X-Posdoc-Fe-Min)   │
│                                                                    │
│  Service worker Angular (ngsw-worker.js)                           │
│   └─ cache versionné par hash : index.html, bundles, assets        │
└────────────────────────────────────────────────────────────────────┘
          │ ngsw.json (no-cache)                 │ /api/v1 (GraphQL)
          ▼                                      ▼
   Apache (posdoc_fe_ihm)                 Back Spring Boot
   .htaccess existant                     + filtre d'en-têtes de version
```

### 4.1 Service worker Angular (besoins 1, 2, 3)

**Mise en place**

- `ng add @angular/service-worker` : ajoute `ngsw-config.json`, enregistre `ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production, registrationStrategy: 'registerWhenStable:30000' })` dans `AppModule`.
- Désactivé en `ng serve`, en tests Karma et en E2E Playwright (pas de service worker dans ces contextes).
- Prérequis : HTTPS (déjà le cas sur l'intranet) et portée `/posdoc_fe_ihm/` cohérente avec le `base-href`.

**`ngsw-config.json` proposé**

```json
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "appData": { "version": "0.0.0", "date": "" },
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "updateMode": "prefetch",
      "resources": {
        "files": ["/favicon.ico", "/index.html", "/*.css", "/*.js"]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/assets/**",
          "!/assets/configuration/**",
          "!/assets/datasets/release-notes.json"
        ]
      }
    }
  ]
}
```

Points importants :

- `installMode: prefetch` sur le groupe `app` : la nouvelle version n'est annoncée `VERSION_READY` qu'une fois **tous** les bundles téléchargés et leurs hash vérifiés. C'est ce qui répond au besoin 2 (« opérationnelle avant activation »).
- **Exclusion de `assets/configuration/**`** : ces fichiers sont modifiés après le build par le remplacement des tokens Hawai. Si le service worker les prenait en charge, le hash calculé au build ne correspondrait plus au contenu servi et la version serait considérée comme corrompue. Ils continuent d'être servis par le réseau avec le `no-cache` déjà en place dans `.htaccess`.
- `release-notes.json` est exclu pour pouvoir être mis à jour à chaud sans nouvelle livraison (à confirmer selon l'usage).
- Les appels `/api/v1`, les endpoints Prisme et `prismeKit.js` (domaine `pss.gidn.recouv`) ne sont pas listés : le service worker les laisse passer tels quels. Aucun `dataGroups` n'est défini volontairement.
- `appData` est alimenté au build (voir 4.4) avec la version et la date de `package.json`, pour afficher « Version X.Y.Z disponible » dans le bandeau.

**`AppUpdateService` (nouveau, `providedIn: 'root'`, démarré dans `AppComponent.ngOnInit` comme les autres services périodiques)**

| Événement | Source | Comportement |
|-----------|--------|--------------|
| `VERSION_DETECTED` | `swUpdate.versionUpdates` | Journal uniquement. Le téléchargement démarre tout seul. |
| `VERSION_READY` | `swUpdate.versionUpdates` | Besoin 1 : affiche le bandeau « Une nouvelle version (X.Y.Z) est disponible » avec un bouton **Actualiser**. Mémorise l'état « prêt ». |
| `VERSION_INSTALLATION_FAILED` | `swUpdate.versionUpdates` | Besoin 3 : affiche « Problème d'installation de la nouvelle version » avec un bouton **Réessayer** qui relance `checkForUpdate()`. |
| `unrecoverable` | `swUpdate.unrecoverable` | Besoin 3 : le cache est corrompu (fichier manquant côté serveur, hash invalide). Modal : « L'application doit être réinstallée » avec un bouton **Réinstaller** qui purge les caches `ngsw:*`, désenregistre le service worker et recharge. |
| Vérification périodique | `interval` 15 min (aligné sur `NOTIFICATION_REFRESH_INTERVAL`) + `visibilitychange` quand l'onglet redevient visible + changement de version back (4.2) | `swUpdate.checkForUpdate()` |

**Activation (besoin 2)** : `activateUpdate()` puis `document.location.reload()`. Angular recommande de toujours recharger après activation, sinon les chunks lazy de l'ancienne version peuvent ne plus correspondre. Trois modes d'activation, du moins intrusif au plus strict :

1. **Sur action utilisateur** (défaut) : clic sur **Actualiser** dans le bandeau. Si l'écran courant est protégé par `CanDesactivateGuard`, on passe par le guard pour éviter de perdre une saisie.
2. **Automatique à l'inactivité** : si une version est prête et que l'utilisateur est inactif depuis N minutes (réutilisation du suivi d'activité d'`InactivityLogoutService`, N configurable dans `configuration.json`, par exemple 10 min), l'application se recharge seule. L'utilisateur retrouve la nouvelle version sans intervention, ce qui répond à « elle doit s'activer ».
3. **Forcée** : modal bloquante avec compte à rebours, réservée au cas d'incompatibilité back / front (4.2) ou à un flag `forceUpdate` dans `appData`.

Les onglets multiples sont gérés nativement côté cache : le service worker continue de servir l'ancienne version aux clients qui ne se sont pas encore rechargés. Les fenêtres détachées (`angular-popout-window`) sont un cas fonctionnel à part, traité au point 9.

### 4.2 Couplage back / front (remplace l'égalité stricte)

**Côté back (Spring Boot 2.7)** : un `OncePerRequestFilter` sur `/api/v1/**` ajoute deux en-têtes de réponse, exposés en CORS :

- `X-Posdoc-Be-Version` : valeur de `version.properties` (déjà chargée par `VersionService`).
- `X-Posdoc-Fe-Min-Version` : version minimale de front supportée, nouvelle propriété de configuration (`posdoc.front.min-version`, par défaut `0.0.0`). Elle n'est renseignée qu'en cas de rupture de contrat GraphQL, ce qui est rare.

**Côté front** : `ApiInterceptor` existe déjà et lit les réponses `/api/v1`. On y ajoute :

- Mémorisation de `X-Posdoc-Be-Version` à la première réponse. Si la valeur change en cours de session, le back a été redéployé : on appelle immédiatement `checkForUpdate()` au lieu d'attendre le prochain tick. C'est le « delta » souhaité, sans égalité imposée.
- Comparaison semver entre la version de `package.json` et `X-Posdoc-Fe-Min-Version`. Si le front est trop ancien : bascule en mode d'activation forcée (modal bloquante, puis `checkForUpdate` → `activateUpdate` → `reload`). Si aucune nouvelle version n'est disponible côté serveur (le front n'a pas encore été livré), le message l'indique clairement au lieu de boucler sur des rechargements.

Variante possible : le front envoie `X-Posdoc-Fe-Version` dans la requête et le back refuse en `426 Upgrade Required` lorsque la version est trop ancienne. Plus strict, mais toute requête GraphQL en vol échoue brutalement ; l'approche par en-tête de réponse est préférée en première itération.

### 4.3 Interface utilisateur

- **Bandeau** en haut du `ContainerComponent`, persistant, non bloquant, couleur info du thème `@acoss/theme-intranet` : « Une nouvelle version de POSDOC (0.20.0) est disponible. [Actualiser] [Plus tard] ». « Plus tard » masque le bandeau jusqu'à la prochaine navigation.
- **Modal** (NgbModal, déjà utilisé) pour les cas bloquants : installation irrécupérable, incompatibilité back.
- **Pied du menu** (`nav.component.html`) : la version affichée reste celle de `package.json`. Le survol indique déjà la version back.

### 4.4 Build, déploiement, exploitation

- `update-date.js` est étendu pour écrire `version` et `date` de `package.json` dans `appData` de `ngsw-config.json` avant `ng build`. Le pipeline Jenkins ne change pas (`npm run update-date && npm run build-prod`).
- `.htaccess` : ajouter `ngsw-worker.js` et `safety-worker.js` à la règle `no-store`. `ngsw.json` est déjà couvert par la règle `*.json`.
- Vérifier la cohérence de la règle `RewriteRule . /posdoc-ihm-fe/index.html` avec le `base-href` `/posdoc_fe_ihm/` : la portée du service worker en dépend.
- **Kill switch** : Angular livre `safety-worker.js` dans `node_modules/@angular/service-worker/`. Il n'est pas copié dans le build par défaut : l'ajouter aux `assets` de `angular.json` (voir 8.6). En cas de problème en production, le déployer sous le nom `ngsw-worker.js` désinstalle le service worker chez tous les utilisateurs au prochain chargement, sans action de leur part.
- Rollback d'une livraison : fonctionne naturellement, le service worker voit un `ngsw.json` différent et le traite comme une nouvelle version.

### 4.5 Tests

- Unitaires (Karma) : `AppUpdateService` testé avec un `SwUpdate` mocké (`versionUpdates` et `unrecoverable` pilotés par des `Subject`), `ApiInterceptor` testé sur le changement d'en-tête back et le seuil `min-version`.
- E2E (Playwright) : service worker désactivé par défaut ; un scénario dédié peut simuler `VERSION_READY` via l'API `postMessage` du worker si nécessaire.
- Back : test du filtre d'en-têtes dans `posdoc-ihm-be-ws`.
- Recette manuelle : déployer deux versions successives sur DEV et vérifier bandeau, activation, multi-onglets, popout, et le cas « fichier supprimé du serveur » (déclenche `unrecoverable`).

## 5. Alternative sans service worker (plan B)

Si le service worker est refusé (contrainte sécurité, proxy intranet, politique navigateur) :

- Générer un `version.json` au build (`{ version, date, buildId }`), servi en `no-cache`.
- `AppUpdateService` le lit toutes les 15 min et au retour d'onglet, compare au `buildId` embarqué, affiche le même bandeau, et le bouton **Actualiser** recharge la page.

Limites : pas de téléchargement anticipé, pas de garantie d'intégrité avant activation (besoin 2 partiellement couvert), pas de détection d'installation défaillante (besoin 3 non couvert), et le `ChunkLoadError` post-déploiement subsiste. À réserver au cas où le plan A est impossible.

## 6. Découpage proposé

| Lot | Contenu | Besoins couverts | Ordre de grandeur |
|-----|---------|------------------|-------------------|
| 1 | Service worker : `ng add`, `ngsw-config.json`, exclusions Hawai, `.htaccess`, `update-date.js`, enregistrement conditionnel | socle | 1 à 2 j |
| 2 | `AppUpdateService`, bandeau, modal, activation sur action et à l'inactivité, gestion des échecs, tests unitaires | 1, 2, 3 | 2 à 3 j |
| 3 | Filtre d'en-têtes back, extension `ApiInterceptor`, mode forcé sur incompatibilité, tests | couplage back / front | 1 à 2 j |
| 4 | Recette DEV multi-versions, documentation exploitation (kill switch, rollback), mise à jour du CHANGELOG | exploitation | 1 j |

Les lots 1 et 2 sont livrables seuls et apportent déjà l'essentiel. Le lot 3 est indépendant et peut être livré ensuite.

## 7. Décisions à prendre

1. Mode d'activation par défaut : sur action utilisateur uniquement, ou avec rechargement automatique à l'inactivité (recommandé : les deux, délai d'inactivité configurable).
2. Délai de vérification périodique (proposé : 15 min, aligné sur les autres timers de l'application).
3. Conserver ou non la compatibilité stricte en option (`X-Posdoc-Fe-Min-Version`), et qui en porte la valeur (configuration Hawai du back).
4. Faut-il inclure `release-notes.json` dans le cache du service worker ou le laisser mis à jour à chaud ?

## 8. Implémentation de référence

Code cible des lots 1 à 3, à adapter lors du développement. Il reprend les conventions du projet (`inject`, services racine démarrés depuis `AppComponent`, `AppConfigService` pour la configuration runtime).

### 8.1 `AppUpdateService` (front, lot 2)

```ts
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { fromEvent, interval, merge } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NOTIFICATION_REFRESH_INTERVAL } from '@app/shared/utils/Constants';

export type UpdateState = 'idle' | 'downloading' | 'ready' | 'failed' | 'unrecoverable';

@Injectable({ providedIn: 'root' })
export class AppUpdateService {
  private readonly updates = inject(SwUpdate);
  private readonly destroyRef = inject(DestroyRef);

  /** État exposé au bandeau et à la modal. */
  readonly state = signal<UpdateState>('idle');
  /** Numéro de version lisible, issu de appData du manifeste. */
  readonly availableVersion = signal<string | null>(null);
  /** Vrai quand le back exige une version de front plus récente (voir 8.3). */
  readonly forced = signal(false);

  start(): void {
    if (!this.updates.isEnabled) {
      return; // ng serve, Karma, Playwright
    }

    this.updates.versionUpdates
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(evt => this.onVersionEvent(evt));

    this.updates.unrecoverable
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.state.set('unrecoverable'));

    merge(
      interval(NOTIFICATION_REFRESH_INTERVAL),
      fromEvent(document, 'visibilitychange').pipe(filter(() => document.visibilityState === 'visible'))
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.checkForUpdate());
  }

  checkForUpdate(): void {
    if (!this.updates.isEnabled) {
      return;
    }
    this.updates.checkForUpdate().catch(() => this.state.set('failed'));
  }

  /** Déclenché par le bouton Actualiser, par le mode inactivité ou par le mode forcé. */
  activate(): void {
    this.updates
      .activateUpdate()
      .then(() => document.location.reload())
      .catch(() => this.state.set('failed'));
  }

  /** Cache corrompu : purge des caches ngsw, désenregistrement, rechargement. */
  async reinstall(): Promise<void> {
    const registration = await navigator.serviceWorker?.getRegistration();
    await registration?.unregister();
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('ngsw:')).map(k => caches.delete(k)));
    document.location.reload();
  }

  /** Appelé par ApiInterceptor quand le back signale une incompatibilité. */
  requireUpdate(): void {
    this.forced.set(true);
    this.checkForUpdate();
  }

  private onVersionEvent(evt: VersionEvent): void {
    switch (evt.type) {
      case 'VERSION_DETECTED':
        this.state.set('downloading');
        break;
      case 'VERSION_READY':
        this.availableVersion.set((evt.latestVersion.appData as { version?: string })?.version ?? null);
        this.state.set('ready');
        if (this.forced()) {
          this.activate();
        }
        break;
      case 'VERSION_INSTALLATION_FAILED':
        this.state.set('failed');
        break;
      case 'NO_NEW_VERSION_DETECTED':
        // Rien à faire : la vérification a eu lieu et le serveur sert la même version.
        break;
    }
  }
}
```

Démarrage dans `AppComponent.ngOnInit`, à côté des autres services périodiques :

```ts
this.appUpdateService.start();
```

Rechargement automatique à l'inactivité : `InactivityLogoutService` connaît déjà la date de dernière activité. Un second seuil, `updateIdleReloadDelay` dans `configuration.json` (proposé : 10 minutes), déclenche `appUpdateService.activate()` si `state() === 'ready'`. Ce seuil est volontairement plus court que la déconnexion (3 h) et plus long qu'une pause café.

### 8.2 Bandeau et modal (front, lot 2)

Composant `app-update-banner`, placé dans `container.component.html` juste avant le fil d'Ariane, hors du `router-outlet` pour rester visible sur tous les écrans.

```html
@switch (updateService.state()) {
  @case ('ready') {
    <div class="alert alert-info d-flex align-items-center mb-0" role="status">
      <span class="flex-grow-1">
        Une nouvelle version de POSDOC{{ updateService.availableVersion() ? ' (' + updateService.availableVersion() + ')' : '' }} est disponible.
      </span>
      <button type="button" class="btn btn-primary btn-sm me-2" (click)="actualiser()">Actualiser</button>
      <button type="button" class="btn btn-link btn-sm" (click)="plusTard()">Plus tard</button>
    </div>
  }
  @case ('failed') {
    <div class="alert alert-warning d-flex align-items-center mb-0" role="alert">
      <span class="flex-grow-1">La nouvelle version n'a pas pu être installée.</span>
      <button type="button" class="btn btn-outline-primary btn-sm" (click)="updateService.checkForUpdate()">Réessayer</button>
    </div>
  }
}
```

- `actualiser()` vérifie d'abord le composant courant : si la route active expose `canDeactivate()` (les écrans protégés par `CanDesactivateGuard`), on appelle cette méthode et on n'active qu'en cas d'accord. Sinon `updateService.activate()` directement.
- `plusTard()` masque le bandeau jusqu'au prochain événement `NavigationEnd`.
- L'état `unrecoverable` ouvre une modal `NgbModal` bloquante (`backdrop: 'static'`) avec le seul bouton **Réinstaller** qui appelle `updateService.reinstall()`.
- Le mode `forced()` ouvre une modal bloquante avec compte à rebours de 30 s puis appelle `activate()`. Si aucune version n'est prête au terme du délai, le message devient « Le back a été mis à jour mais la nouvelle IHM n'est pas encore disponible, contactez l'exploitation » et aucun rechargement en boucle n'est tenté.

### 8.3 Extension d'`ApiInterceptor` (front, lot 3)

```ts
private readonly appUpdateService = inject(AppUpdateService);
private backVersion: string | null = null;

// dans intercept(), à la place du tap actuel :
return next.handle(request).pipe(
  tap({
    next: event => {
      if (event instanceof HttpResponse && request.url.includes('/api/v1')) {
        this.onBackHeaders(event.headers);
      }
    },
    error: err => console.error(`Erreur lors de l'envoi de la requête, code = ${err.status}`),
  })
);

private onBackHeaders(headers: HttpHeaders): void {
  const beVersion = headers.get('X-Posdoc-Be-Version');
  if (beVersion && this.backVersion && beVersion !== this.backVersion) {
    this.appUpdateService.checkForUpdate(); // le back a été redéployé
  }
  this.backVersion = beVersion ?? this.backVersion;

  const minFront = headers.get('X-Posdoc-Fe-Min-Version');
  if (minFront && compareSemver(version, minFront) < 0) {
    this.appUpdateService.requireUpdate();
  }
}
```

`version` est l'import de `package.json` déjà utilisé dans `nav.component.ts`. `compareSemver` est une fonction utilitaire de quelques lignes dans `shared/utils` (découpage sur `.`, comparaison numérique, suffixe `-SNAPSHOT` ignoré) : pas de dépendance supplémentaire.

### 8.4 Filtre d'en-têtes (back, lot 3)

```java
package fr.acoss.posdoc.ws.configuration;

@Component
public class VersionHeadersFilter extends OncePerRequestFilter {

    public static final String BE_VERSION_HEADER = "X-Posdoc-Be-Version";
    public static final String FE_MIN_VERSION_HEADER = "X-Posdoc-Fe-Min-Version";

    private final String frontMinVersion;

    public VersionHeadersFilter(@Value("${posdoc.front.min-version:0.0.0}") String frontMinVersion) {
        this.frontMinVersion = frontMinVersion;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().contains("/api/v1");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        response.setHeader(BE_VERSION_HEADER, VersionService.getProperties().getProperty("version"));
        response.setHeader(FE_MIN_VERSION_HEADER, frontMinVersion);
        chain.doFilter(request, response);
    }
}
```

Dans `application.yml` :

```yaml
posdoc:
  front:
    # Version minimale de l'IHM compatible avec ce back. À remonter uniquement en cas de rupture du contrat GraphQL.
    min-version: "0.0.0"
```

Si la configuration CORS est portée par le reverse proxy ou par Prisme plutôt que par Spring, les deux en-têtes doivent être ajoutés à `Access-Control-Expose-Headers`, sinon le front ne les lira pas.

### 8.5 `update-date.js` (lot 1)

```js
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const now = new Date();
const dateLabel = now.toISOString().replace('T', ' ').replace('Z', '');
packageJson.date = dateLabel.substring(0, dateLabel.length - 4);
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

// Propagation dans le manifeste du service worker : la version lisible est exposée
// au front dans evt.latestVersion.appData.
const ngswConfig = JSON.parse(fs.readFileSync('ngsw-config.json', 'utf8'));
ngswConfig.appData = { version: packageJson.version, date: packageJson.date };
fs.writeFileSync('ngsw-config.json', JSON.stringify(ngswConfig, null, 2));
```

### 8.6 `angular.json`, `.htaccess`, `AppModule` (lot 1)

`angular.json`, cible `build`, options `assets` (et miroir dans la configuration `production`) :

```json
{ "glob": "safety-worker.js", "input": "node_modules/@angular/service-worker", "output": "/" }
```

Même cible, option `serviceWorker` à `true` et `ngswConfigPath` à `ngsw-config.json` uniquement dans la configuration `production`.

`.htaccess`, à ajouter :

```apache
<FilesMatch "^(ngsw-worker|safety-worker)\.js$">
  Header set Cache-Control "no-store, must-revalidate"
  Header set Pragma "no-cache"
  Header set Expires "0"
</FilesMatch>
# ngsw.json ne doit jamais être réécrit vers index.html, même absent pendant un déploiement
RewriteRule ^ngsw\.json$ - [L]
```

`AppModule` :

```ts
ServiceWorkerModule.register('ngsw-worker.js', {
  enabled: environment.production,
  registrationStrategy: 'registerWhenStable:30000',
}),
```

### 8.7 Tests (lot 2 et 3)

- `AppUpdateService` : `SwUpdate` mocké avec `isEnabled: true`, `versionUpdates` et `unrecoverable` fournis par des `Subject`, `checkForUpdate` et `activateUpdate` en `jasmine.createSpy().and.resolveTo(true)`. Cas à couvrir : passage à `ready` avec lecture de `appData.version`, passage à `failed`, passage à `unrecoverable`, `start()` sans effet quand `isEnabled` est faux, activation automatique en mode `forced`.
- `ApiInterceptor` : `HttpTestingController`, deux réponses avec `X-Posdoc-Be-Version` différentes déclenchent `checkForUpdate` une seule fois ; `X-Posdoc-Fe-Min-Version` supérieure à la version embarquée déclenche `requireUpdate`.
- `VersionHeadersFilter` : `MockMvc` sur une requête `/api/v1/graphql`, présence des deux en-têtes ; absence sur `/health`.
- Playwright : scénario optionnel qui, après chargement en production locale (`ng build` puis serveur statique), modifie `ngsw.json` sur le disque, déclenche `visibilitychange` et attend le bandeau. À réserver au lot 4 si le temps le permet.

## 9. Risques et points ouverts

| # | Risque ou point ouvert | Impact | Action proposée |
|---|------------------------|--------|-----------------|
| 1 | La règle `RewriteRule . /posdoc-ihm-fe/index.html` du `.htaccess` ne correspond pas au base-href de production `/posdoc_fe_ihm/`. | La portée du service worker et le fallback de navigation peuvent être faux dès le lot 1. | Vérifier la configuration Apache réelle sur DEV avant de démarrer. Corriger `.htaccess` ou documenter l'écart. |
| 2 | La livraison Hawai (`install.sh`) copie-t-elle `.htaccess` et respecte-t-elle les en-têtes ? Le proxy intranet laisse-t-il passer l'enregistrement d'un service worker ? | Si non, le plan A est impossible et il faut basculer sur le plan B. | Prototype de 1 jour sur DEV avant d'engager le lot 2 : déployer un build avec service worker et vérifier dans les outils de développement que `ngsw-worker.js` s'enregistre et que `ngsw.json` est servi en `no-cache`. |
| 3 | Interaction avec Prisme : redirection avec fragment `wait_token`, iframe `iframeJobPartBoFe` de renouvellement de jeton, chargement de `prismeKit.js` depuis `pss.gidn.recouv`. | L'iframe et la redirection chargent l'application dans la portée du service worker. Un comportement inattendu bloquerait la connexion. | Couvert par le même prototype. Si besoin, restreindre `navigationUrls` dans `ngsw-config.json` pour exclure les URLs de retour Prisme. |
| 4 | Pendant un déploiement, un `ngsw.json` momentanément absent serait réécrit vers `index.html` par Apache. Le service worker recevrait du HTML et pourrait passer en mode dégradé. | Utilisateurs connectés pendant la fenêtre de déploiement. | Règle `RewriteRule ^ngsw\.json$ - [L]` (8.6) pour renvoyer un vrai 404, que le service worker traite correctement. |
| 5 | Première livraison avec service worker : les utilisateurs encore sur l'ancienne version ne bénéficient d'aucun mécanisme et subissent une dernière fois le risque de plantage sur chunk manquant. | Une fois, à la première mise en production. | Communication utilisateur pour cette livraison et choix d'un créneau de faible activité. |
| 6 | Fenêtres détachées (`angular-popout-window`) : chaque fenêtre est un client distinct. Si l'onglet principal se recharge sur la nouvelle version et pas la fenêtre détachée, les deux exécutent des versions différentes et leurs échanges peuvent se désynchroniser. | Écrans d'administration qui utilisent le popout. | Dans `actualiser()`, fermer les fenêtres détachées ouvertes avant `activate()`, ou refuser l'activation tant qu'une fenêtre détachée est ouverte, avec un message explicite. À trancher avec le métier. |
| 7 | Les navigateurs ne revérifient le script `ngsw-worker.js` lui-même qu'au chargement de page. La détection en cours de session repose entièrement sur `checkForUpdate()`, qui relit `ngsw.json`. | Aucun si le polling est en place. | Garder l'intervalle de 15 minutes et le déclenchement sur `visibilitychange`. |
| 8 | `CanDesactivateGuard` est pensé pour la navigation du routeur, pas pour un rechargement complet. Le mode inactivité peut recharger pendant une saisie laissée ouverte. | Perte de saisie non enregistrée après 10 minutes d'inactivité. | Le mode inactivité consulte aussi `canDeactivate()` du composant courant et reporte le rechargement si une saisie est en cours. |
| 9 | Pas de bibliothèque semver dans le projet. | Comparaison fausse sur des versions non numériques (`0.19.0-SNAPSHOT`, `1.0.0-rc1`). | Fonction maison documentée en 8.3, qui ignore tout suffixe après `-`, avec tests unitaires sur ces cas. |
| 10 | Estimations posées sans prototype. | Le lot 1 peut doubler si les points 1 à 3 posent problème. | Le prototype du point 2 sert de jalon de décision avant d'engager les lots 2 et 3. |
| 11 | Quality gate Sonar et revue sécurité : le service worker est un script exécuté hors du contexte de la page, et la purge de cache (`reinstall()`) manipule l'API `caches`. | Remarques possibles en revue. | Le script est généré par Angular, non modifié. `reinstall()` ne purge que les caches préfixés `ngsw:`. À mentionner dans le dossier de livraison. |
| 12 | `release-notes.json` exclu du cache : il est relu à chaque ouverture de la popup. | Négligeable, fichier petit, déjà le cas aujourd'hui. | Confirmer le choix (décision 4 de la section 7). |

Le point 2 est le jalon à passer en premier : un jour de prototype sur DEV lève ou confirme les risques 1 à 4 et décide entre le plan A et le plan B.
