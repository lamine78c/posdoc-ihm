# Proposition : garantir que chaque utilisateur exécute la dernière version déployée de l'IHM POSDOC

## 1. Le problème

Après un déploiement, certains utilisateurs continuent d'exécuter l'ancienne version de l'IHM, comme si une copie périmée était servie depuis un cache. Des règles de cache ont déjà été ajoutées (balises `meta` dans `index.html`, en-têtes dans `.htaccess`) sans résoudre le problème.

Les trois besoins exprimés en découlent :

| # | Besoin | Ce que cela signifie techniquement |
|---|--------|------------------------------------|
| 1 | Être informé qu'une nouvelle version existe, pour déclencher l'actualisation. | Détecter dans le navigateur qu'une version plus récente est déployée, la télécharger, prévenir l'utilisateur. |
| 2 | Quand la version est opérationnelle, elle doit s'activer. | N'activer que lorsque tous les fichiers sont présents et intègres, puis recharger sans casser une saisie en cours. |
| 3 | Être informé d'un problème d'installation, pour relancer le téléchargement. | Détecter un cache corrompu ou une installation incomplète, l'afficher, proposer une réinstallation propre. |

## 2. Mécanisme probable

Les bundles JavaScript sont construits avec `outputHashing: all` : chaque build produit des noms de fichiers uniques. Le seul fichier dont le nom ne change pas et qui peut être servi périmé est `index.html`. Or c'est lui qui référence les bundles. Un utilisateur qui reçoit un vieil `index.html` charge toute l'ancienne application.

Pourquoi le navigateur garde un vieil `index.html` :

- Si le serveur n'envoie pas de `Cache-Control` explicite, le navigateur applique le **cache heuristique** : Apache envoie un `Last-Modified`, et le navigateur considère le fichier frais pendant environ 10 % du temps écoulé depuis cette date. Un `index.html` déployé il y a trois semaines reste réputé frais pendant deux jours. Pendant ce délai, une ouverture par favori, par lien ou par le retour de connexion Prisme utilise la copie en cache **sans interroger le serveur**. Cela touche « certains » utilisateurs : ceux qui ont chargé l'application peu avant le déploiement.
- Un onglet gardé ouvert ne recharge jamais `index.html`. Le renouvellement de jeton passe par une iframe et la déconnexion d'inactivité n'intervient qu'après trois heures sans activité. Une session active peut durer plusieurs jours sur l'ancienne version.
- Un intermédiaire (reverse proxy, répartiteur de charge avec accélération web, `mod_expires` dans le virtual host) peut ajouter ou ignorer des en-têtes de cache.

Pourquoi les tentatives précédentes n'ont pas suffi :

- **Balises `meta http-equiv="Cache-Control"`** dans `index.html` : ignorées par les navigateurs modernes pour les décisions de cache HTTP.
- **Règles du `.htaccess`** : correctes et bien présentes dans l'archive livrée (le script `publish-dist` utilise `ls -A`, qui inclut les fichiers cachés). Mais elles ne s'appliquent que si le virtual host Apache autorise `.htaccess` sur ce répertoire et charge `mod_headers`. Indice fort qu'il n'est pas lu : sa règle de réécriture cible `/posdoc-ihm-fe/index.html`, un chemin différent du base-href de production `/posdoc_fe_ihm/`. Si ce fichier était actif, un rafraîchissement sur une URL profonde échouerait.
- **Hash sur les bundles** : nécessaire, mais ne protège pas `index.html`.
- **Délai avant effet** : même quand les bons en-têtes sont enfin envoyés, les copies déjà en cache restent utilisées jusqu'à expiration de leur fraîcheur heuristique. Un test juste après la correction conclut à tort qu'elle ne marche pas.

## 3. Diagnostic à réaliser avant de développer

Une demi-journée, depuis un poste qui atteint la production :

```
curl -sI "https://<hôte>/posdoc_fe_ihm/index.html"
curl -sI "https://<hôte>/posdoc_fe_ihm/"
curl -sI "https://<hôte>/posdoc_fe_ihm/suivi/production"
```

| Observation | Conclusion |
|-------------|------------|
| Pas de `Cache-Control: no-store` sur les deux premières réponses | Les règles du `.htaccess` ne sont pas appliquées. Cache heuristique confirmé. |
| En-têtes `Expires`, `Age`, `Via`, `X-Cache` présents | Un intermédiaire ajoute ou réécrit les en-têtes. |
| La troisième réponse est un 200 avec le contenu d'`index.html` | La réécriture SPA est assurée par la configuration Apache, pas par le `.htaccess`. |
| La troisième réponse est un 404 | Le `.htaccess` est actif mais sa règle de réécriture est fausse. |

Sans curl, la même information se lit dans les outils de développement du navigateur, onglet Réseau, case « Désactiver le cache » décochée, en ouvrant l'application par un favori : une ligne `index.html` marquée « from disk cache » confirme le cache navigateur.

Compléter auprès de l'exploitation : nombre de nœuds frontaux derrière le répartiteur et ordre de livraison. Des nœuds mis à jour à des moments différents produisent le même symptôme.

## 4. Réponse en trois niveaux

Les trois niveaux sont complémentaires. Le premier soulage immédiatement, le deuxième protège l'application même si l'infrastructure est mal configurée, le troisième est la solution de fond.

### 4.1 Niveau 1 : en-têtes côté serveur (exploitation, une heure)

Faire envoyer réellement `Cache-Control: no-store, must-revalidate` pour `index.html` et `no-cache` pour les JSON de configuration, dans le virtual host Apache si `.htaccess` n'est pas honoré. Corriger au passage la règle de réécriture pour qu'elle cible `/posdoc_fe_ihm/index.html`.

Couvre : l'utilisateur qui ouvre l'application. Ne couvre pas : l'onglet gardé ouvert, un intermédiaire qui ignore les en-têtes, les copies déjà en cache avant la correction.

### 4.2 Niveau 2 : auto-contrôle au démarrage (front, une demi-journée)

Au démarrage, l'application relit `index.html` avec un paramètre anti-cache, compare le nom du bundle principal avec celui qu'elle exécute et, s'ils diffèrent, recharge la page une seule fois. Un rechargement explicite envoie une requête de revalidation que le navigateur et tout proxy conforme doivent honorer, contrairement à une navigation ordinaire qui se sert dans le cache sans demander.

```ts
// src/app/shared/utils/verifier-version-deployee.ts
export async function verifierVersionDeployee(): Promise<void> {
  const DEJA_RECHARGE = 'posdoc.version-check';
  if (sessionStorage.getItem(DEJA_RECHARGE)) {
    sessionStorage.removeItem(DEJA_RECHARGE); // évite une boucle si le serveur sert encore l'ancien fichier
    return;
  }
  const scriptCourant = Array.from(document.scripts)
    .map(s => s.src)
    .find(src => /main\.[a-f0-9]+\.js$/.test(src));
  if (!scriptCourant) {
    return;
  }
  const html = await fetch(`index.html?nocache=${Date.now()}`, { cache: 'no-store' }).then(r => r.text());
  const scriptServeur = html.match(/main\.[a-f0-9]+\.js/)?.[0];
  if (scriptServeur && !scriptCourant.endsWith(scriptServeur)) {
    sessionStorage.setItem(DEJA_RECHARGE, '1');
    window.location.reload();
  }
}
```

Appelée dans `main.ts` avant `bootstrapModule`, en production uniquement. Couvre : l'ouverture de l'application avec un `index.html` périmé, quelle que soit la configuration serveur. Ne couvre pas : l'onglet gardé ouvert. Devient inutile une fois le niveau 3 en place.

### 4.3 Niveau 3 : service worker Angular (front, solution de fond)

Le service worker Angular n'est pas seulement un mécanisme de notification. C'est une défense contre les caches qu'on ne maîtrise pas :

- Il vérifie la version en relisant `ngsw.json` avec un paramètre de requête aléatoire, ce qui contourne tout cache HTTP intermédiaire.
- Chaque fichier téléchargé est vérifié par hash. Si un cache sert un fichier périmé, le hash ne correspond pas et le fichier est retéléchargé avec un paramètre anti-cache. Une version incohérente n'est jamais activée, ce qui répond au besoin 2.
- Une fois la nouvelle version installée, le service worker sert lui-même `index.html` depuis son propre cache. Un vieil `index.html` dans le cache navigateur ou dans un proxy devient sans effet.
- La vérification périodique et le bandeau couvrent l'onglet gardé ouvert, ce qui répond au besoin 1. Les événements d'échec et de cache irrécupérable répondent au besoin 3.
- Pendant la fenêtre de déploiement, ou si des nœuds frontaux sont désynchronisés, un `ngsw.json` et des bundles de versions différentes donnent un hash incohérent : l'installation est marquée en échec et l'ancienne version reste servie sans plantage jusqu'à la vérification suivante.

Un point à ne pas négliger : le service worker couvre aussi la **version minimale commune** de tous ces cas sans dépendre d'une configuration Apache, Hawai ou proxy qui échappe à l'équipe.

## 5. Mise en œuvre du service worker

### 5.1 Installation

- `ng add @angular/service-worker` sur Angular 19.2. Dans `AppModule` :

```ts
ServiceWorkerModule.register('ngsw-worker.js', {
  enabled: environment.production,
  registrationStrategy: 'registerWhenStable:30000',
}),
```

- Désactivé en `ng serve`, Karma et Playwright. Prérequis : HTTPS (déjà le cas) et portée `/posdoc_fe_ihm/` cohérente avec le base-href.

### 5.2 `ngsw-config.json`

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
      "resources": { "files": ["/favicon.ico", "/index.html", "/*.css", "/*.js"] }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": { "files": ["/assets/**", "!/assets/configuration/**"] }
    }
  ]
}
```

- `installMode: prefetch` sur le groupe `app` : la version n'est annoncée prête qu'une fois tous les bundles téléchargés et vérifiés.
- **`assets/configuration/**` doit rester exclu.** Ces fichiers sont modifiés après le build par le remplacement des tokens `@POSDOC.…@` au déploiement Hawai. Pris en charge par le service worker, leur hash ne correspondrait plus et la version serait considérée comme corrompue. Ils restent servis par le réseau.
- Les appels `/api/v1`, les endpoints Prisme et `prismeKit.js` ne sont pas listés et passent directement au réseau. Aucun `dataGroups`.
- `appData` est alimenté au build avec la version et la date de `package.json` (5.5), pour afficher un numéro lisible dans le bandeau.

### 5.3 `AppUpdateService`

Service racine démarré une seule fois depuis `AppComponent.ngOnInit`, à côté des autres services périodiques.

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

  readonly state = signal<UpdateState>('idle');
  readonly availableVersion = signal<string | null>(null);

  start(): void {
    if (!this.updates.isEnabled) {
      return; // ng serve, Karma, Playwright
    }
    this.updates.versionUpdates.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(evt => this.onVersionEvent(evt));
    this.updates.unrecoverable.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.state.set('unrecoverable'));

    merge(
      interval(NOTIFICATION_REFRESH_INTERVAL),
      fromEvent(document, 'visibilitychange').pipe(filter(() => document.visibilityState === 'visible'))
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.checkForUpdate());
  }

  checkForUpdate(): void {
    if (this.updates.isEnabled) {
      this.updates.checkForUpdate().catch(() => this.state.set('failed'));
    }
  }

  /** Bouton Actualiser, ou rechargement à l'inactivité. Toujours recharger après activation. */
  activate(): void {
    this.updates.activateUpdate().then(() => document.location.reload()).catch(() => this.state.set('failed'));
  }

  /** Cache corrompu : purge des caches ngsw, désenregistrement, rechargement. */
  async reinstall(): Promise<void> {
    const registration = await navigator.serviceWorker?.getRegistration();
    await registration?.unregister();
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('ngsw:')).map(k => caches.delete(k)));
    document.location.reload();
  }

  private onVersionEvent(evt: VersionEvent): void {
    switch (evt.type) {
      case 'VERSION_DETECTED':
        this.state.set('downloading');
        break;
      case 'VERSION_READY':
        this.availableVersion.set((evt.latestVersion.appData as { version?: string })?.version ?? null);
        this.state.set('ready');
        break;
      case 'VERSION_INSTALLATION_FAILED':
        this.state.set('failed');
        break;
      case 'NO_NEW_VERSION_DETECTED':
        break; // vérification faite, rien de nouveau : ce n'est pas une erreur
    }
  }
}
```

### 5.4 Interface et activation

Composant `app-update-banner` dans `container.component.html`, avant le fil d'Ariane, hors du `router-outlet`.

```html
@switch (updateService.state()) {
  @case ('ready') {
    <div class="alert alert-info d-flex align-items-center mb-0" role="status">
      <span class="flex-grow-1">Une nouvelle version de POSDOC{{ updateService.availableVersion() ? ' (' + updateService.availableVersion() + ')' : '' }} est disponible.</span>
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

Deux modes d'activation, tous deux nécessaires si l'objectif est que plus personne ne reste sur l'ancienne version :

1. **Sur action** : clic sur Actualiser. Si le composant de la route active expose `canDeactivate()` (écrans protégés par `CanDesactivateGuard`), on l'appelle d'abord et on n'active qu'en cas d'accord.
2. **Automatique à l'inactivité** : `InactivityLogoutService` connaît la date de dernière activité. Un second seuil `updateIdleReloadDelay` dans `configuration.json` (proposé : 10 minutes) déclenche `activate()` si une version est prête et si `canDeactivate()` du composant courant ne s'y oppose pas.

L'état `unrecoverable` ouvre une modal `NgbModal` bloquante (`backdrop: 'static'`) avec le seul bouton **Réinstaller**, qui appelle `reinstall()`.

### 5.5 Build et déploiement

`update-date.js`, après la mise à jour de `package.json` :

```js
const ngswConfig = JSON.parse(fs.readFileSync('ngsw-config.json', 'utf8'));
ngswConfig.appData = { version: packageJson.version, date: packageJson.date };
fs.writeFileSync('ngsw-config.json', JSON.stringify(ngswConfig, null, 2));
```

`angular.json`, cible `build` : `serviceWorker: true` et `ngswConfigPath` dans la configuration `production` uniquement, et copie du kill switch dans les `assets` :

```json
{ "glob": "safety-worker.js", "input": "node_modules/@angular/service-worker", "output": "/" }
```

`.htaccess` (ou virtual host) :

```apache
<FilesMatch "^(ngsw-worker|safety-worker)\.js$">
  Header set Cache-Control "no-store, must-revalidate"
</FilesMatch>
# ngsw.json ne doit jamais être réécrit vers index.html, même absent pendant un déploiement
RewriteRule ^ngsw\.json$ - [L]
```

`ngsw.json` est déjà couvert par la règle `no-cache` sur les JSON.

**Kill switch** : en cas de problème en production, déployer `safety-worker.js` sous le nom `ngsw-worker.js`. Il désinstalle le service worker chez tous les utilisateurs au prochain chargement.

### 5.6 Mesure

Pour prouver que le problème est résolu, `ApiInterceptor` ajoute l'en-tête `X-Posdoc-Fe-Version` (valeur de `package.json`) sur les requêtes `/api/v1`, et le back le journalise avec le login. L'exploitation voit quels utilisateurs exécutent quelle version, avant et après la mise en place. Une demi-journée, les deux côtés compris.

### 5.7 Tests

- `AppUpdateService` : `SwUpdate` mocké (`isEnabled: true`, `versionUpdates` et `unrecoverable` sur des `Subject`, `checkForUpdate` et `activateUpdate` en `resolveTo(true)`). Cas : passage à `ready` avec lecture de `appData.version`, `failed`, `unrecoverable`, `start()` sans effet quand `isEnabled` est faux.
- Recette sur DEV : déployer deux versions successives et vérifier le bandeau, l'activation, le multi-onglets, puis supprimer un bundle du serveur pour déclencher `unrecoverable`.

## 6. Risques et points ouverts

| # | Point | Action |
|---|-------|--------|
| 1 | Le `.htaccess` n'est probablement pas lu en production, et sa règle de réécriture est incohérente avec le base-href. | Diagnostic de la section 3. Porter les en-têtes dans le virtual host si nécessaire. |
| 2 | Proxy intranet ou répartiteur qui ignorerait le paramètre anti-cache de `ngsw.json`. | Prototype d'une journée sur DEV avec un build service worker : vérifier dans les outils de développement que `ngsw-worker.js` s'enregistre et que `ngsw.json` arrive à jour après un redéploiement. |
| 3 | Interaction avec Prisme : redirection avec fragment `wait_token`, iframe de renouvellement de jeton, `prismeKit.js` externe. | Couvert par le même prototype. Si besoin, restreindre `navigationUrls` dans `ngsw-config.json`. |
| 4 | Première livraison avec service worker : les utilisateurs encore sur l'ancienne version n'en bénéficient pas. | Le niveau 2 (auto-contrôle au démarrage) livré avant couvre cette transition. Choisir un créneau de faible activité. |
| 5 | Fenêtres détachées (`angular-popout-window`) : chaque fenêtre est un client distinct et peut rester sur l'ancienne version après rechargement de l'onglet principal. | Ne pas recharger automatiquement tant qu'une fenêtre détachée est ouverte ; le bouton Actualiser les ferme avant d'activer. |
| 6 | Rechargement à l'inactivité pendant une saisie laissée ouverte. | Consulter `canDeactivate()` du composant courant avant de recharger. |

## 7. Découpage

| Lot | Contenu | Charge |
|-----|---------|--------|
| 0 | Diagnostic (section 3), correction des en-têtes et de la réécriture côté Apache avec l'exploitation | 0,5 à 1 j |
| 1 | Auto-contrôle au démarrage (4.2) et en-tête de mesure `X-Posdoc-Fe-Version` (5.6) | 1 j |
| 2 | Prototype service worker sur DEV, levée des risques 2 et 3 | 1 j |
| 3 | Service worker complet : configuration, `AppUpdateService`, bandeau, activation, build, tests | 3 à 4 j |
| 4 | Recette multi-versions sur DEV, documentation exploitation (kill switch), CHANGELOG | 1 j |

Les lots 0 et 1 soulagent le problème en deux jours. Le lot 2 décide si le lot 3 est engagé tel quel ou si un ajustement de configuration est nécessaire.

## 8. Décisions à prendre

1. Délai d'inactivité avant rechargement automatique (proposé : 10 minutes, configurable).
2. Comportement avec une fenêtre détachée ouverte : bloquer le rechargement automatique, ou fermer la fenêtre.
3. Qui porte la correction Apache : l'équipe via `.htaccess` si celui-ci est honoré, ou l'exploitation via le virtual host.
