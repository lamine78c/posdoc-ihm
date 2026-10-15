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

Les onglets multiples et les fenêtres détachées (`angular-popout-window` est utilisé) sont gérés nativement : le service worker continue de servir l'ancienne version aux clients qui ne se sont pas encore rechargés.

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
- **Kill switch** : Angular livre `safety-worker.js`. En cas de problème en production, le déployer sous le nom `ngsw-worker.js` désinstalle le service worker chez tous les utilisateurs au prochain chargement, sans action de leur part.
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
