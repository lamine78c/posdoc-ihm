# Audit de performance du front Angular (`posdoc-ihm_fe`) : DOM nodes, mémoire et CPU

> **Destinataire** : l'agent (ou le développeur) chargé d'appliquer les corrections.
> **Périmètre** : tout `posdoc-ihm_fe/src/app`, soit environ 750 fichiers `.ts` et 275 `.html`, plus `src/main.ts`, `angular.json` et `src/environments/*`.
> **Méthode** : lecture statique complète du code, en lecture seule, répartie sur six analyses (cinq par zone fonctionnelle et une transversale par pattern). Les numéros de ligne correspondent à l'état du dépôt au moment de l'audit ; vérifiez-les avant de modifier, ils ont pu bouger.
> **Stack** : Angular 19.2 (NgModules, pas d'OnPush), ag-grid 33 Enterprise, ng-bootstrap 18, RxJS 7, apollo-angular 10 / @apollo/client 3.

---

## 1. Symptôme observé

Le Performance Monitor de Chrome, sur une session d'environ 3 minutes démarrant sur `/retour_pss`, montre trois courbes :

| Métrique | Évolution | Lecture |
|---|---|---|
| DOM nodes | 0 → **14 629**, en escalier, sans jamais redescendre | Fuite de nœuds DOM détachés, plus du DOM inutilement rendu |
| JS heap | ~20 Mo → **109 Mo** | Composants, grilles et données retenus |
| CPU | pics de plus en plus larges | Travail fait par des composants « morts » et change detection trop fréquente |

### Ce que compte « DOM nodes »

Ce compteur inclut tous les nœuds vivants en mémoire, qu'ils soient **affichés** ou **détachés**. Un nœud détaché a été retiré de la page mais reste référencé depuis JavaScript, par exemple via une subscription, un listener ou un `ViewChild`.

Dans une application saine, la courbe monte à l'ouverture d'une page puis redescend quand on la quitte, après un passage du garbage collector. Une courbe en escalier qui ne redescend jamais est la signature d'une fuite.

### Pourquoi c'est un problème de performance

- **Rendu** : chaque recalcul de style ou de layout porte sur le DOM attaché. Au-delà de quelques milliers de nœuds, chaque interaction coûte plus cher.
- **Mémoire** : les nœuds détachés retiennent leurs composants, `FormGroup`, `gridApi` et jeux de données, ce qui explique les 109 Mo de heap.
- **CPU** : les composants qui ont fui restent abonnés à des événements (`modelUpdated`, `BehaviorSubject`, requêtes Apollo) et **continuent de travailler**. Le coût de chaque action croît avec la durée de la session.

---

## 2. Causes racines, par ordre d'impact

Le mécanisme principal combine un **déclencheur**, qui recrée des composants, et une **rétention**, qui empêche les anciens d'être libérés.

```
Clic « Rechercher » / changement d'onglet / ajout de ligne / effacer filtres
        │
        ▼
AgGridUtil.resetFilterAndColumnSort()  ──►  gridApi.refreshHeader() + resetColumnState()
        │                                   (+ redrawRows(), setGridOption('columnDefs'))
        ▼
ag-grid DÉTRUIT et RECRÉE tous les en-têtes + floating filters (+ cellules)
        │
        ▼
Les anciennes instances restent référencées :
  • FilterSharedDataService (BehaviorSubject root) .subscribe() jamais fermé
  • params.api.addEventListener('modelUpdated', fn.bind(this)) jamais retiré
  • params.selectData.subscribe() (BehaviorSubject de page) jamais fermé
  • watchQuery().valueChanges Apollo (ne se termine jamais) sans take(1)
        │
        ▼
Instance fantôme ─► params.eGridHeader / NgbDropdown / ElementRef ─► arbre DOM détaché conservé
                 ─► params.api ─► grille complète + rowData (jusqu'à 200 000 lignes)
                 ─► continue d'exécuter modelUpddated() (scan de toutes les lignes + FormGroup recréé)
        │
        ▼
DOM nodes ↑ (escalier) · heap ↑ · CPU ↑ à chaque recherche suivante
```

| # | Cause racine | Effet | Détail |
|---|---|---|---|
| **R1** | Abonnements au `BehaviorSubject` root `FilterSharedDataService` jamais fermés, dans 6 composants ag-grid et liste déroulante | Chaque en-tête et filtre créé depuis le démarrage reste en mémoire avec son DOM | FC-C1, CORE-C1, § A1 |
| **R2** | `refreshHeader()`, `resetColumnState()`, `redrawRows()` et `columnDefs` réassignés à chaque recherche (≈ 30 pages) | Multiplie R1, R3 et R4 à chaque clic | FC-H4, FC-H5, SUP-C1, PROD-C2, ADM-H1, PROD-H2 |
| **R3** | Floating filters multi-select : listener `modelUpdated` jamais retiré, `FormGroup` recréé, scan de toutes les lignes | CPU croissant, DOM des cases à cocher recréé en entier | FC-C3, FC-H10, SUP-C2 |
| **R4** | `params.selectData.subscribe()` par cellule et par filtre, jamais fermé ; dans le filtre hiérarchisé, **un nouvel abonnement à chaque `modelUpdated`** | Abonnés illimités, fan-out à chaque `next()` | FC-C2, SUP-C2 |
| **R5** | Apollo `watchQuery().valueChanges` (238 occurrences), qui ne se termine jamais, souscrit sans `take(1)` ni teardown | `ObservableQuery` et composant (grille, modale) retenus par le client Apollo root | CORE-C3, ADM-C1, PROD-C1, PROD-H1, SUP-M3, CORE-H2 |
| **R6** | `ContainerComponent` recréé à chaque changement de section (6 routes) et abonné au `LoaderService` (`ReplaySubject` root) sans teardown | Nav et layout fuient à chaque navigation, callback exécuté N fois par requête HTTP | CORE-C2 |
| **R7** | Listes déroulantes (`ngbDropdownMenu`, `ngbCollapse`) toujours rendues, `*ngFor \| keyvalue` sans `trackBy` | Des milliers de nœuds par grille, même menu fermé | FC-H1, FC-H2, FC-H3, CORE-M4 |
| **R8** | Change detection excessive : `mousemove`/`scroll` capturés dans la zone (inactivité), `detectChanges()` dans `ngAfterContentChecked`/`ngAfterViewChecked` (Container, onglet, arborescence, habilitations), aucun OnPush, méthodes coûteuses dans les templates | Pics CPU à chaque mouvement de souris | CORE-C4, CORE-H1, FC-H7, FC-H8, ADM-H4, CORE-H3, FC-M10 |
| **R9** | Master/detail avec une grille `app-tableau` complète par ligne dépliée (tarif, adresse-retour), sans `keepDetailRows` | Grilles entières recréées et qui fuient via R1 | ADM-H2, PROD-C3 |
| **R10** | `paginationPageSize: 200000` : pagination désactivée de fait | Jeux de données énormes retenus par R1 et R5, scans O(n) partout | FC-M5, CORE-M1 |

---

## 3. Plan de correction pour l'agent

**Règles générales à respecter :**
- Une correction par lot, avec un commit par lot. Après chaque lot, lancer `npm run build` et `npm run test-ci` (ou au minimum `ng build` et les specs des fichiers touchés).
- Ne pas changer le comportement fonctionnel. Les corrections sont des nettoyages de cycle de vie, et la suppression d'appels redondants.
- Pour la libération des abonnements, **suivre la convention du projet, `@AutoUnsubscribe`**, là où elle suffit, et `takeUntilDestroyed()` seulement dans les cas où le décorateur ne peut pas agir. Voir la section 3.0 ci-dessous. Les extraits `takeUntilDestroyed` des annexes ne sont qu'**une** façon d'écrire la correction.
- Composants ag-grid : Angular appelle bien `ngOnDestroy` sur les composants Angular utilisés comme renderer, editor ou filter. Y retirer les listeners avec la **même référence de fonction** (ne pas utiliser `.bind(this)` inline), et vérifier `!api.isDestroyed()` avant `removeEventListener`.

### 3.0 `@AutoUnsubscribe` ou `takeUntilDestroyed` : lequel utiliser ?

Le décorateur du projet (`shared/decorators/auto-unsubscribe.decorator.ts`, utilisé dans 138 fichiers) surcharge `ngOnDestroy`. Au destroy, il appelle `unsubscribe()` sur chaque **propriété** de l'instance qui expose cette méthode, et sur chaque tableau de telles propriétés. L'audit en a tenu compte : les fichiers où il couvre déjà les abonnements sont marqués « vérifié correct » (par exemple `interrupteur-select-editor`, `interrupteur-radio`, `preselection:92`, `ressource:158`, `bon-travail:87`, `imprime-search-component:73`) et ne sont pas signalés.

Les constats restants se répartissent en cinq cas.

| Cas | Exemple | Le décorateur suffit-il ? | Correction recommandée |
|---|---|---|---|
| **A. Fichier sans décorateur** | Tous les composants ag-grid critiques (`column-header`, `input-filter`, `list-floating-filter`, `multi-select-*-floating-filter`, `action-renderer-clear-filter`, `select-editor`, `select-table-editor`, `combobox`, `multi-select-editor`), `liste-deroulante-multiple`, `container.component`, `faq.component`, `popup-aide`, `popup-faq`, `massification-modal`, `simulation-modal`, les onglets de `shared/components/modal/details/onglets/*` | **Oui**, s'il est ajouté **et** si l'abonnement est stocké. Les composants ag-grid Angular reçoivent bien `ngOnDestroy`. | Ajouter `@AutoUnsubscribe` et `subscriptions: Subscription[] = []`, puis `this.subscriptions.push(...subscribe(...))`, pour rester cohérent avec le projet. `takeUntilDestroyed()` est une alternative équivalente. |
| **B. Abonnement non stocké dans une propriété** | `constructor() { service.getData().subscribe(...) }` ; `authentification.component.ts:103` `loadNotifications()` (le fichier **a** le décorateur, mais la souscription n'est pas poussée) ; `liste-deroulante-multiple:109` ; `parametre-edition-colonne:137` | **Non** : le décorateur ne voit que les propriétés. | Pousser dans `subscriptions`, ou bien `pipe(takeUntilDestroyed())`. |
| **C. Accumulation pendant la vie du composant** | `loadNotifications()` rappelé toutes les 15 min et à chaque refresh ; `ngOnChanges` qui empile `valueChanges` ; `orgChangeSubscription` écrasée sans `unsubscribe` ; `modelUpddated()` qui fait un nouveau `selectData.subscribe` à chaque événement ; `push` d'une `watchQuery` à chaque recherche | **Non** : le décorateur n'agit qu'à la destruction, alors que le problème survient **pendant** la vie du composant. Pour un composant de layout, ce moment n'arrive jamais. | `take(1)` sur les requêtes one-shot (ou `apollo.query`), `switchMap` pour les requêtes répétées, `unsubscribe()` de l'ancienne souscription avant réassignation, abonnement unique hors des handlers. |
| **D. Service `providedIn: 'root'`** | `tableau-parametre-edition.service.ts:21` (décoré, mais jamais détruit), `file-upload.service.ts:29` | **Non** : un service root n'est jamais détruit. | `take(1)`, ou laisser l'appelant gérer la souscription. |
| **E. Ressource non-RxJS** | `api.addEventListener('modelUpdated', …)`, `@HostListener('document:click')`, `document.addEventListener`, `setTimeout`, `URL.createObjectURL`, DOM ajouté à `body`, `MutationObserver` | **Non** : le décorateur ne gère que `unsubscribe()`. | Nettoyage explicite dans `ngOnDestroy`, que le décorateur appelle ensuite via `original?.apply(this)`. |

**Précautions si vous ajoutez le décorateur :**
- Il appelle `unsubscribe()` sur **toute** propriété qui en a une, `Subject` et `BehaviorSubject` compris, et les **ferme** définitivement. Ne stockez jamais en propriété un Subject partagé, par exemple `this.data$ = params.selectData` ou `this.x = dataService.getTransferedData()` (qui renvoie le `BehaviorSubject` root lui-même) : le décorateur le fermerait pour toute l'application. Stockez la `Subscription`, pas la source. Aucun cas de ce type n'existe aujourd'hui dans les fichiers signalés (vérifié).
- Les tableaux vides sont ignorés : c'est sans effet, et correct.
- Si la classe a déjà un `ngOnDestroy` (retrait de listeners, par exemple), il est conservé et appelé après le désabonnement.

### Lot 1 : stopper la rétention (gain majeur sur DOM et heap)

| Tâche | Fichiers | Réf. |
|---|---|---|
| 1.1 Fermer les abonnements `FilterSharedDataService` (ajouter `@AutoUnsubscribe` et pousser la souscription dans `subscriptions`, ou `takeUntilDestroyed()`, voir 3.0, cas A et B) | `fullstack-components/tableau/ag-grid-components/column-header/column-header.component.ts:31`, `input-filter/input-filter.component.ts:52`, `list-floating-filter/list-floating-filter.component.ts:33`, `multi-select-hierarchisee-floating-filter/…component.ts:37`, `action-renderer-clear-filter/…component.ts:18`, `fullstack-components/liste-deroulante/components/liste-deroulante-multiple/liste-deroulante-multiple.component.ts:109` | FC-C1 |
| 1.2 Stocker la fonction liée, retirer `modelUpdated` dans `ngOnDestroy`, ne plus recréer le `FormGroup` mais synchroniser ses contrôles, remplacer `[form]="getFormGroup()"` par `[form]="form"` | `multi-select-floating-filter.component.ts:31,51-97` et `.html:2` ; `multi-select-hierarchisee-floating-filter.component.ts:41,59-84` | FC-C3, FC-H10 |
| 1.3 Un seul abonnement `selectData` par instance, avec `takeUntilDestroyed(this.destroyRef)` | `select-table-editor:37`, `select-editor:85`, `combobox:67`, `multi-select-editor:135`, `multi-select-hierarchisee-floating-filter:76` | FC-C2, SUP-C2 |
| 1.4 `select-table-editor` : ajouter `ngOnDestroy` qui appelle `closeDropdown()`, remplacer `@HostListener('document:click')` par un listener enregistré à l'ouverture et retiré à la fermeture, supprimer l'id fixe et `innerHTML` | `select-table-editor.component.ts:88-178` | FC-C4 |
| 1.5 Retirer les listeners ag-grid oubliés | `admin/fabrication/parametre-distribution/details-param-distr/details-param-distr.component.ts:47/71` (mauvais nom d'événement), `multi-select-editor.component.ts:74`, `tableau.component.ts:339-349` | ADM-H3, FC-M7, FC-B1 |
| 1.6 `ContainerComponent` : `takeUntilDestroyed` sur `httpProgress()`, `take(1)` sur `getCodesOrganismesByRegions`, supprimer `ngAfterContentChecked` (remplacer `hasOnglet` par `:has(app-onglet)` en CSS) | `layout/container/container.component.ts:31-61` | CORE-C2, CORE-H1 |
| 1.7 Services root qui gardent des callbacks de composants : passer par `context` ag-grid ou remettre à `null` au destroy | `suivi/production/occurrences-application/service/tableau-occurrence-application.service.ts`, `occurrences-fichiers/service/tableau-occurrences-fichiers.service.ts` | SUP-M4 |

### Lot 2 : supprimer les déclencheurs (recréations massives)

| Tâche | Fichiers | Réf. |
|---|---|---|
| 2.1 `AgGridUtil.resetFilterAndColumnSort` : supprimer `refreshHeader()` et `onFilterChanged()` redondant, garder `setFilterModel(null)` (seulement si `isAnyFilterPresent()`) et `resetColumnState()`, avec une garde `isDestroyed()` | `shared/utils/AgGridUtil.ts:173-178` (≈ 24 appelants, voir SUP-C1 et PROD-C2) | SUP-C1, PROD-C2 |
| 2.2 Même chose dans `tableau.component.ts` `resetSortAndFilters()` (supprimer `refreshHeader` et `refreshCells({force:true})`) et dans `action-renderer-clear-filter` `clearFilter()` | `tableau.component.ts:669-685`, `action-renderer-clear-filter.component.ts:41-46` | FC-H5 |
| 2.3 Supprimer `redrawRows()` dans `onFilterModified` du tableau, et après `applyTransaction` (≈ 45 sites). Si une colonne d'actions doit être rafraîchie : `refreshCells({ columns:[…], rowNodes })` | `tableau.component.ts:359-370`, `tableau-modifiable.service.ts:77,97,148,204`, `tableau-errors.service.ts:160`, plus les listes ADM-H1, PROD-H2 et § A4 | FC-H4, ADM-H1, PROD-H2 |
| 2.4 Ne réassigner `columnDefs` que si les colonnes changent, et ne pas doubler binding et `setGridOption` | `suivi/facturation/facturation-detaillee/facturation-detaillee.component.ts:116-151`, `produit/distribution/parametre-edition/parametre-edition-colonne/…component.ts:128-131`, `compare-modal.component.ts:150` | SUP-C3, PROD-C2 |
| 2.5 Recherche auto sur chaque `valueChanges` : fusionner en un flux `form.valueChanges` avec `debounceTime` et `distinctUntilChanged`, ou déclencher uniquement au bouton | `exploitation-editique/massification/search/search-massification.component.ts:85-101` et 4 autres | PROD-H3 |
| 2.6 Master/detail : `keepDetailRows: true`, `getRowId`, pas de rechargement réseau dans le détail, pas de `redrawRows` du maître | `admin/tarif/*`, `produit/adresse-retour/*` | ADM-H2, PROD-C3 |

### Lot 3 : Apollo, fermer les requêtes

| Tâche | Réf. |
|---|---|
| 3.1 **Correction de fond** : dans `services/**`, remplacer `apollo.watchQuery({...}).valueChanges` par `apollo.query({...})` pour tous les appels one-shot (≈ 238). La signature `Observable<ApolloQueryResult<T>>` est identique, et le flux se termine après une émission. | CORE-C3 |
| 3.2 En attendant, ou pour les cas restants, ajouter `take(1)` ou `takeUntilDestroyed()` aux sites listés : `layout/authentification/authentification.component.ts:102-111` (fusionner timer, refresh et authDataReady en un seul flux `switchMap`), `notifications-list.component.ts:27,41`, `shared/components/modal/details/**` (7 onglets), `admin/contenu/faq/faq.component.ts:128-137`, `popup-aide.component.ts:38-45`, `popup-faq.component.ts:76-83`, `habilitations.component.ts:101,107,174`, `massification-modal.component.ts:52,67`, `simulation-modal.component.ts:30`, `search-bon-travail-manuel.component.ts:90-100`, `parametre-edition-colonne.component.ts:137,227`, `commande.component.ts:447`, `reedition-massification.component.ts:125`, `file-upload.service.ts:29-36`, `search-volume-traite.component.ts:96,160`, `preselection.component.ts:169-192` | CORE-C3, CORE-H2, ADM-C1, ADM-H4, PROD-C1, PROD-H1, SUP-M3, CORE-M5 |
| 3.3 `graphql.module.ts` : brancher `errorLink`, `defaultOptions` en `no-cache` (y compris `mutate`), retirer `apollo-client` v2 et `apollo-link` (types seulement) | CORE-M2 |

### Lot 4 : réduire le DOM rendu

| Tâche | Réf. |
|---|---|
| 4.1 Listes déroulantes (`liste-deroulante-multiple`, `-hierarchisee`, `-hierarchisee-form`, `multi-select-editor`, `combobox`, `select-list-with-input`, `select-from-table-list`) : rendre le contenu seulement si le menu est ouvert (`*ngIf="dd.isOpen()"`) ou déplié (`*ngIf="!isCollapsed"`), ajouter `trackBy: trackByKey`, remplacer le getter `customSort` par une propriété calculée dans `ngOnChanges` | FC-H1, FC-H3, FC-M8, CORE-M4 |
| 4.2 `ngOnChanges` : ne se réabonner que si `changes['form']`, en fermant l'abonnement précédent | FC-H2 |
| 4.3 `paginationPageSize` : passer de 200 000 à 100 (ou la valeur métier voulue), introduire `maxClientRows` pour les seuils « trop de résultats » (`facturation-detaillee:127`, `consultation:125`) | FC-M5, CORE-M1 |
| 4.4 Notes statiques : `(hidden)="notesService.removeStatic(toast)"` ; ne plus faire `note.remove()` sur des hôtes Angular | FC-M1, FC-M2 |
| 4.5 Arborescence : rendre les enfants seulement s'ils sont dépliés, supprimer le double `[formControl]` + `[(ngModel)]` | FC-H8 |
| 4.6 Tooltips par cellule (`ngbPopover` × cellule) : utiliser les tooltips natifs ag-grid (`tooltipShowMode: 'whenTruncated'`, `tooltipValueGetter`) | FC-M9, FC-H6 |

### Lot 5 : change detection et zone

| Tâche | Réf. |
|---|---|
| 5.1 `InactivityLogoutService` : enregistrer les listeners et l'`interval` dans `zone.runOutsideAngular`, et ne revenir dans la zone que pour le logout. Même chose pour `front-token-refresh.service.ts` et `TokenExpirationService.ts` | CORE-C4, CORE-B4 |
| 5.2 Supprimer `detectChanges()` dans `ngAfterViewChecked` et `ngAfterContentChecked` : `onglet.component.ts:140-148`, `arborescence-collapse.component.ts:62-64`, `habilitations.component.ts:163-165`, `container.component.ts:54-57` | FC-H7, FC-H8, ADM-H4, CORE-H1 |
| 5.3 `main.ts` : `bootstrapModule(AppModule, { ngZoneEventCoalescing: true, ngZoneRunCoalescing: true })` | FC-H6 |
| 5.4 `runOutsideAngular` pour `DragPopupDirective` (mousemove), `ResizableColumnDirective`, vis-network, vis-timeline et le listener `wheel` | FC-H9, CORE-B5, SUP-H3 |
| 5.5 Remplacer les méthodes et getters appelés dans les templates par des propriétés mises à jour sur événement (`selectionChanged`, `valueChanges`). **En priorité, celles qui ont des effets de bord** (`setValue` / `patchValue` / `new FormGroup` dans le template) : `search-occurrence-etape.component.html`, `add-reedition-produit-modal`, `add-exemplaire-modal`, `massificationsearch`, `produitsearch`, `modal-add-adress`, `imprime-search-component`, `add-commande-modal` | SUP-H5, PROD-H4, FC-M4, PROD-M2, SUP-M1, SUP-M2, ADM-M4, CORE-H3 |
| 5.6 Passer en `ChangeDetectionStrategy.OnPush` : les renderers et editors ag-grid, les listes déroulantes, le layout (header, nav, authentification) | FC-M10, CORE-H3 |
| 5.7 Renderers « fonction » qui créent du DOM avec listeners et `innerHTML` (`status-column-handler`, `tableau-aide`, `tableau-faq`, `tableau-page-accueil`, `tableau-bon-travail`) : texte précalculé et `onCellClicked`, ou renderer classe avec `destroy()` | ADM-H5, SUP-B4 |

### Lot 6 : divers (mémoire, réseau, build)

| Tâche | Réf. |
|---|---|
| 6.1 `URL.createObjectURL` sans `revokeObjectURL` : `services/generate-file.service.ts:417-422`, `produit/notice/service/file-upload.service.ts:34`, `suivi/bon-travail/service/tableau-bon-travail.service.ts:188` | CORE-M6, PROD-H6, SUP-H4 |
| 6.2 Polling vidéo : `timer(0,5000)` avec `exhaustMap`, `trackBy`, libellés précalculés | SUP-H2 |
| 6.3 Graphe DAG et timeline : réutiliser l'instance (`setData`), index `Map` au lieu d'algorithmes O(n²) | SUP-H6, SUP-B1 |
| 6.4 `AppModule` : retirer `ExploitationEditiqueModule`, `SuiviModule` et `SupervisionModule` des imports eager ; ne plus importer `AdminModule` (avec son routing) dans `produit` et `exploitation-editique`, mais extraire `ConfirmationPopupComponent` dans `SharedModule` ; retirer les `providers` dupliqués (`provideHttpClient`, `provideAngularSvgIcon`) et `QuillModule.forRoot()` des modules lazy | CORE-H4, ADM-M3 |
| 6.5 Bundle : retirer jQuery et `bootstrap.bundle` si inutilisés, n'enregistrer que les modules ag-grid utilisés (pas `AgChartsCommunityModule`), éviter quill et vis en double dans `angular.json`, charger pdfmake et exceljs en `import()` dynamique | CORE-M3 |
| 6.6 Exports PDF et Excel volumineux : Web Worker ou plafond de volume | PROD-M4 |
| 6.7 Modales : `@Output` de modale avec `takeUntil(merge(modalRef.closed, modalRef.dismissed))` au lieu de `subscriptions.push` | PROD-M1 |
| 6.8 `setTimeout` non annulés, tableaux `subscriptions[]` qui grossissent, `MutationObserver` non déconnectés, code mort (`api-adelaide-select-data.service.ts`, `api-adelaide-search.service.ts`, `habilitation.component.ts`, `action-render-clear-filter`, `supervision/cereus`) | lignes B* de chaque partie |
| 6.9 `angular.json` : `defaultConfiguration: "production"` pour `build`, `"development"` pour `serve` ; budgets avec `maximumError`. **Refaire les mesures sur un build prod**, car `ng serve` double la change detection (`checkNoChanges`) | CORE-M7 |

---

## 4. Vérification après correction

1. Build de production (`npm run build-prod-pfs` ou `ng build --configuration production`), servi localement.
2. DevTools > **Performance monitor** : refaire le même parcours (5 recherches sur 3 pages, navigation entre sections, ouverture et fermeture de modales). Les DOM nodes doivent **revenir à un niveau stable** après chaque changement de page.
3. DevTools > **Memory** > Heap snapshot, avant et après 5 recherches, filtre « Detached » : il ne doit plus y avoir d'accumulation de `Detached HTMLDivElement` ni de multiples instances de `ColumnHeaderComponent`, `MultiSelectFloatingFilterComponent`, `ListeDeroulanteMultipleComponent`, `ContainerComponent` ou `ObservableQuery`.
4. DevTools > **Performance** : enregistrer un mouvement de souris sur une page avec une grille. On ne doit plus voir de `ApplicationRef.tick` à chaque `mousemove`.
5. Tests unitaires : adapter les specs des composants modifiés (les mocks de `params.api` doivent exposer `removeEventListener` et `isDestroyed`).

---

## 5. Convention de lecture des annexes

Les parties suivantes reprennent **intégralement** les rapports détaillés de chaque zone. Les identifiants y sont préfixés par zone :

| Préfixe | Zone |
|---|---|
| `FC-` | `fullstack-components/` (tableau et ag-grid-components, listes déroulantes, onglets, arborescence, popup, notes, menu…) |
| `CORE-` | socle : `app.module`, routing, `layout/`, `shared/`, `services/`, `apis/`, `graphql.module`, `main.ts`, `angular.json`, environments |
| `ADM-` | `admin/` |
| `PROD-` | `produit/` et `exploitation-editique/` |
| `SUP-` | `supervision/` et `suivi/` |
| `§ A1…A14` | inventaire transversal par pattern (statistiques et listes exhaustives `fichier:ligne`) |

Dans le corps d'une partie, un renvoi court comme « voir H2 » désigne l'identifiant **de la même partie**. Certains constats apparaissent dans plusieurs parties (par exemple `FilterSharedDataService`) car ils ont été vus depuis plusieurs zones : il suffit de les corriger une fois.

Chemins : sauf mention contraire, ils sont relatifs à `posdoc-ihm_fe/src/app/`.

---

## Partie A : `fullstack-components/` (composants génériques, tableau ag-grid)


J'ai lu tous les `.ts` (hors spec) et `.html` du périmètre. Les chemins sont relatifs à `posdoc-ihm_fe/src/app/`. Les numéros de ligne ont été vérifiés un par un.

### Cause la plus probable de la courbe en escalier

Plusieurs composants ag-grid (en-têtes, floating filters, renderer clear-filter) et `liste-deroulante-multiple` s'abonnent au `BehaviorSubject` root de `FilterSharedDataService` sans jamais se désabonner. La closure `isDisabled => this.isDisabled = …` retient le composant, donc :
- ses `params` : `api`, `column`, et `eGridHeader` / `eGridCell`, qui sont des éléments DOM ;
- via `api`, le `context.componentParent`, c'est-à-dire le composant page (injecté en `tableau.component.ts:309-311`).

Garder un seul élément d'un arbre DOM détaché suffit à garder tout l'arbre. Chaque grille quittée reste donc entière en mémoire (DOM, composants Angular, `BehaviorSubject` `selectData` de la page et leurs abonnés). À chaque `refreshHeader()`, `resetColumnState()` ou scroll horizontal (virtualisation des colonnes), de nouveaux composants d'en-tête et de filtre sont créés et fuient à leur tour. Les listeners `modelUpdated` qui ne sont jamais retirés tournent encore sur les composants morts, ce qui explique des pics CPU de plus en plus larges.

Deux points vérifiés en dehors du périmètre :
- `main.ts` n'active pas `ngZoneEventCoalescing` / `ngZoneRunCoalescing`.
- `selectData` est un `BehaviorSubject` possédé par la page, par exemple `admin/fabrication/ressource/ressource.component.ts:49`.

---

#### [FC-C1] Abonnements `FilterSharedDataService` jamais fermés (en-têtes, filtres, clear-filter, liste multiple)
- **Fichiers** :
  - `fullstack-components/tableau/ag-grid-components/column-header/column-header.component.ts:31`. Le `ngOnDestroy` (L122-125) ne retire que les listeners de colonne.
  - `…/list-floating-filter/list-floating-filter.component.ts:33`. Pas de `ngOnDestroy`.
  - `…/input-filter/input-filter.component.ts:52`. L'abonnement n'est pas stocké ; `ngOnDestroy` (L66-68) ne ferme que `this.subscription` (L35).
  - `…/action-renderer-clear-filter/action-renderer-clear-filter.component.ts:18`. Pas de `ngOnDestroy`. Ce composant sert de floating filter à la colonne de sélection (`tableau-configuration-builder.service.ts:266-273`).
  - `…/multi-select-hierarchisee-floating-filter/multi-select-hierarchisee-floating-filter.component.ts:37`. Pas de `ngOnDestroy`.
  - `fullstack-components/liste-deroulante/components/liste-deroulante-multiple/liste-deroulante-multiple.component.ts:109`. Absent du tableau `subscriptions` vidé en L240-242.
- **Gravité** : Critique
- **Type** : Fuite mémoire / DOM excessif
- **Cause** : `this.filterSharedDataService.getData().subscribe(isDisabled => (this.isDisabled = isDisabled));` sur un `BehaviorSubject` `providedIn: 'root'` (`services/filter-shared-data.service.ts:8`).
- **Impact** : chaque composant détruit reste référencé par le singleton, avec `params`, l'élément DOM, `api` et la page parente. Les DOM nodes ne redescendent jamais, le heap monte à chaque navigation, et chaque `updateData()` (tableau L505, L618, L781, service L180, action-renderer-edit L47) notifie tous les composants morts.
- **Solution** :
```ts
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class ColumnHeaderComponent implements OnDestroy {
  constructor(private filterSharedDataService: FilterSharedDataService) {
    this.filterSharedDataService.getData()
      .pipe(takeUntilDestroyed())            // contexte d'injection = constructeur
      .subscribe(isDisabled => (this.isDisabled = isDisabled));
  }
}
// ou, mieux, dans le template :
// isDisabled$ = inject(FilterSharedDataService).getData();
// [class.disabled-icon]="isDisabled$ | async"
```
Appliquer le même correctif aux 6 fichiers. Pour `input-filter`, déplacer l'abonnement dans le constructeur avec `takeUntilDestroyed()`, ou le pousser dans une `Subscription` fermée en `ngOnDestroy`.

#### [FC-C2] `params.selectData.subscribe()` par cellule ou par filtre, sans désabonnement
- **Fichiers** :
  - `…/select-table-editor/select-table-editor.component.ts:37` (pas de `ngOnDestroy`)
  - `…/select-editor/select-editor.component.ts:85` (non poussé dans `subscriptions`)
  - `…/combobox/combobox.component.ts:67`
  - `…/multi-select-editor/multi-select-editor.component.ts:135`
  - `…/multi-select-hierarchisee-floating-filter/multi-select-hierarchisee-floating-filter.component.ts:76`. C'est le pire cas : un nouvel abonnement est créé **à chaque `modelUpdated`** (L59-84).
  - Vérifié correct : `interrupteur-select-editor.component.ts:67-93`, qui passe par `@AutoUnsubscribe`.
- **Gravité** : Critique
- **Type** : Fuite mémoire / CPU
- **Cause** : `this.params.selectData.subscribe(e => { this.data = e; })` dans `agInit`. `selectData` est un `BehaviorSubject` de la page. ag-grid détruit et recrée les cellules à chaque `redrawRows`, tri, filtre, changement de page ou scroll.
- **Impact** :
  - Le nombre d'abonnés croît sans limite tant que la page vit, et bien au-delà via C1.
  - Chaque `selectData.next()` (par exemple `tableau.component.ts:628`) rejoue N callbacks sur des composants morts.
  - Dans le filtre hiérarchisé, chaque callback reconstruit un `FormGroup` (`SharedUtil.getOrgFormByOrgData`, L81), ce qui cascade sur `ngOnChanges` de `liste-deroulante-hierarchisee` (H2) et reconstruit tout le DOM du menu (H1).
- **Solution** :
```ts
private readonly destroyRef = inject(DestroyRef);
agInit(params) {
  this.params = params;
  params.selectData?.pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(e => (this.data = e));
}
```
Pour le filtre hiérarchisé, s'abonner **une seule fois** :
```ts
private readonly modelUpdated$ = new Subject<void>();
private readonly onModelUpdated = () => this.modelUpdated$.next();
agInit(params) {
  this.params = params;
  params.api.addEventListener('modelUpdated', this.onModelUpdated);
  combineLatest([params.selectData, this.modelUpdated$.pipe(startWith(undefined), debounceTime(50))])
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(([all]) => this.rebuild(all));
}
ngOnDestroy() {
  if (!this.params.api.isDestroyed()) this.params.api.removeEventListener('modelUpdated', this.onModelUpdated);
}
```

#### [FC-C3] Floating filters multi-select : listener `modelUpdated` jamais retiré, `FormGroup` recréé, scan complet des lignes
- **Fichiers** :
  - `…/multi-select-floating-filter/multi-select-floating-filter.component.ts` : L31 (`addEventListener('modelUpdated', this.modelUpddated.bind(this))`), L51-90 (scan de toutes les lignes filtrées avec appels de `filterValueGetter`/`valueGetter` par ligne en L55-82, deux `new Set` en L83-84), L89 (`this.form = this.fb.group(f, …)`). La classe n'a pas de `ngOnDestroy` (L10).
  - `…/multi-select-hierarchisee-floating-filter/multi-select-hierarchisee-floating-filter.component.ts` : L41 (même `bind`), L59-84. Pas de `ngOnDestroy`.
- **Gravité** : Critique
- **Type** : Fuite mémoire / CPU / DOM excessif
- **Cause** :
  - La fonction `.bind(this)` n'est pas conservée, elle est donc impossible à retirer.
  - Les floating filters sont recréés par `refreshHeader()` (`tableau.component.ts:680`, `action-renderer-clear-filter.component.ts:44`), par `resetColumnState()` (clear-filter L45) et par la virtualisation horizontale des colonnes.
  - `modelUpdated` se déclenche aussi sur tri, expand et pagination.
- **Impact** :
  - Chaque recréation ajoute un listener vivant sur un composant mort. Chaque tri ou filtre exécute k scans complets (avec 200 000 lignes par page, voir M6).
  - Le nouveau `FormGroup` change l'`@Input form` de `app-liste-deroulante-multiple`, ce qui déclenche un `ngOnChanges` qui empile un abonnement (H2), puis `keyvalue` fabrique de nouveaux objets et `*ngFor` sans trackBy détruit et recrée toutes les cases à cocher de chaque colonne (H1).
- **Solution** :
```ts
export class MultiSelectFloatingFilterComponent implements IFloatingFilterAngularComp, OnDestroy {
  form = this.fb.group({});
  private readonly onModelUpdated = () => this.syncControls();
  agInit(params) {
    this.params = params;
    params.api.addEventListener('filterChanged', this.onModelUpdated);   // plutôt que modelUpdated
    params.api.addEventListener('rowDataUpdated', this.onModelUpdated);
    this.syncControls();
  }
  ngOnDestroy() {
    if (!this.params.api.isDestroyed()) {
      this.params.api.removeEventListener('filterChanged', this.onModelUpdated);
      this.params.api.removeEventListener('rowDataUpdated', this.onModelUpdated);
    }
  }
  private syncControls() {             // diff au lieu de recréer le FormGroup
    const values = this.collectDistinctValues();
    const existing = new Set(Object.keys(this.form.controls));
    values.forEach(v => existing.delete(v) || this.form.addControl(v, new FormControl(this.selectedItems.includes(v)), { emitEvent: false }));
    existing.forEach(k => this.form.removeControl(k, { emitEvent: false }));
  }
}
```
Dans le template, remplacer `[form]="getFormGroup()"` par `[form]="form"` (voir H10).

#### [FC-C4] `select-table-editor` : DOM injecté dans `body`, listeners document par cellule, aucun nettoyage
- **Fichier** : `…/select-table-editor/select-table-editor.component.ts` :
  - L88-121 : `document.createElement('div')`, `table.innerHTML = this.getTableContent()`, `table.addEventListener('click', …)`, `document.body.appendChild(container)`.
  - L90 : id fixe `custom-dropdown-table`.
  - L165-171 : `closeDropdown` via `getElementById`.
  - L173-178 : `@HostListener('document:click')`.
  - Pas de `ngOnDestroy`. Fuite `selectData` en L37 (C2).
- **Gravité** : Haute
- **Type** : Fuite mémoire / DOM excessif / CPU
- **Cause** : si la cellule est détruite (scroll, redraw, navigation) pendant que le dropdown est ouvert, le conteneur reste dans `body`. Son listener `click` retient le composant, donc `params` et la grille. L'id fixe empêche de fermer le bon conteneur si deux dropdowns existent. Chaque cellule rendue ajoute un listener sur `document` : chaque clic dans l'appli exécute N handlers et déclenche un cycle de change detection. `innerHTML` avec des valeurs non échappées (L143-151) pose aussi un risque XSS.
- **Impact** : nœuds `<table>` orphelins dans `body` à chaque ouverture interrompue, N handlers par clic.
- **Solution** : remplacer par `ngbDropdown container="body"` et un template Angular. À défaut :
```ts
private container?: HTMLElement;
private unlistenDoc?: () => void;
private readonly renderer = inject(Renderer2);
private readonly zone = inject(NgZone);
openDropdown() {
  this.container = this.renderer.createElement('div');
  /* … construire via renderer / textContent, pas innerHTML … */
  this.renderer.appendChild(document.body, this.container);
  this.zone.runOutsideAngular(() => {
    this.unlistenDoc = this.renderer.listen('document', 'click', e => {
      if (!this.triggerRef.nativeElement.contains(e.target)) this.zone.run(() => this.closeDropdown());
    });
  });
}
closeDropdown() { this.unlistenDoc?.(); this.container?.remove(); this.container = undefined; this.dropdownVisible = false; }
ngOnDestroy() { this.closeDropdown(); }
```
Supprimer aussi le `@HostListener('document:click')`.

---

#### [FC-H1] Listes déroulantes : menu toujours rendu, `*ngFor | keyvalue` sans trackBy, collapses rendus fermés
- **Fichiers** :
  - `…/liste-deroulante-multiple/liste-deroulante-multiple.component.html` : L33 (`<div *ngIf="!disabled" ngbDropdownMenu>`), L48 (`*ngFor="let item of form['controls'] | keyvalue: customSort"`).
  - `…/liste-deroulante-hierarchisee/liste-deroulante-hierarchisee.component.html` : L31 (menu), L46 (`*ngFor … | keyvalue` d'`app-liste-deroulante-hierarchisee-form`).
  - `…/liste-deroulante-hierarchisee-form/liste-deroulante-hierarchisee-form.component.html` : L29-30 (`[(ngbCollapse)]`, avec `*ngFor … | keyvalue` rendu même replié).
  - `…/tableau/ag-grid-components/multi-select-editor/multi-select-editor.component.html` : L32, L34, L62-67 (même schéma).
- **Gravité** : Haute
- **Type** : DOM excessif / CPU
- **Cause** : `ngbDropdownMenu` et `ngbCollapse` masquent en CSS mais gardent le contenu dans le DOM. Chaque floating filter porte donc (valeurs distinctes × environ 4 nœuds), même fermé. Sans `trackBy`, et avec un `FormGroup` recréé (C2/C3), `KeyValuePipe` produit de nouveaux objets et tout est détruit puis recréé.
- **Impact** : milliers de nœuds par grille et rebuild complet à chaque tri ou filtre. Contributeur direct aux 14 600 nœuds.
- **Solution** :
```html
<div #dd="ngbDropdown" ngbDropdown container="body" …>
  <div ngbDropdownMenu *ngIf="!disabled">
    <ng-container *ngIf="dd.isOpen()">
      <div class="form-check" *ngFor="let item of form.controls | keyvalue: sortFn; trackBy: trackByKey">…</div>
    </ng-container>
  </div>
</div>
```
```ts
trackByKey = (_: number, item: KeyValue<string, AbstractControl>) => item.key;
```
Dans `hierarchisee-form`, envelopper la liste enfant avec `<ng-container *ngIf="!isCollapsed">`.

#### [FC-H2] `ngOnChanges` empile des abonnements `valueChanges`
- **Fichiers** :
  - `…/liste-deroulante-multiple.component.ts` L163-180 : abonnement poussé à **chaque** `ngOnChanges`, sur n'importe quel input. `ngOnInit` L127-140 ne s'abonne qu'au premier `form`, puis devient obsolète quand le form est remplacé. Le premier `ngOnChanges` patche le `formSelectAll` initial (L94), qui est remplacé ensuite en L114.
  - `…/liste-deroulante-hierarchisee.component.ts` L162-171 et L173-191 : même schéma. `[disabled]` change à chaque `updateData` (C1), ce qui déclenche un nouvel abonnement.
- **Gravité** : Haute
- **Type** : Fuite mémoire / CPU
- **Cause** : pas de test `changes['form']` et aucun abonnement précédent fermé. Le tableau `subscriptions` grossit jusqu'au destroy, et comme ces composants eux-mêmes fuient (C1), jamais.
- **Impact** : k handlers par clic de case, qui parcourent tous les contrôles à chaque fois.
- **Solution** :
```ts
private formSub?: Subscription;
ngOnChanges(changes: SimpleChanges) {
  if (changes['form'] && this.form) {
    this.formSub?.unsubscribe();
    this.formSub = this.form.valueChanges.subscribe(() => this.syncSelectAll());
    this.formState = this.form.getRawValue();
  }
}
ngOnDestroy() { this.formSub?.unsubscribe(); this.subscriptions.forEach(s => s.unsubscribe()); }
```

#### [FC-H3] Getter et méthodes coûteux évalués à chaque change detection dans les listes
- **Fichiers** :
  - `…/liste-deroulante-multiple.component.ts` : L256-264 (le getter `customSort` renvoie une **nouvelle** closure à chaque CD, donc `keyvalue` re-trie à chaque cycle), L244-254 (`getElementToDisplay()`, appelé depuis html L30), L266-268 (`hideSelectAllCheckbox()`, html L34).
  - `…/liste-deroulante-hierarchisee.component.ts` L464-493 : `getElementToDisplay()` aplatit tout le formulaire, appelé depuis html L29.
- **Gravité** : Haute
- **Type** : CPU / Change detection
- **Impact** : tri O(n log n) et parcours O(n) par liste et par cycle, multipliés par le nombre de colonnes filtrées.
- **Solution** :
```ts
sortFn?: (a, b) => number;
displayText = '%';
ngOnChanges(c: SimpleChanges) {
  if (c['isRessourceCustomSort'] || c['isFormatDDMMYYYYCustomSort'])
    this.sortFn = this.isRessourceCustomSort ? (a, b) => StringUtil.compareKeys(a.key, b.key)
               : this.isFormatDDMMYYYYCustomSort ? (a, b) => StringUtil.compareKeysDateFR(a.key, b.key) : undefined;
}
// recalculer displayText / hideSelectAll dans le handler valueChanges (H2), pas dans le template
```

#### [FC-H4] `redrawRows()` à chaque modification de filtre et lors des éditions
- **Fichiers** :
  - `fullstack-components/tableau/components/tableau/tableau.component.ts:359-370` (`onFilterModified` écrase celui du builder et appelle `this.gridApi?.redrawRows()`).
  - `…/tableau/services/tableau-modifiable.service.ts` : L77, L97, L148, L204.
  - `…/tableau/services/tableau-errors.service.ts:160`.
- **Gravité** : Haute
- **Type** : CPU / DOM excessif
- **Cause** : `onFilterModified` se déclenche à chaque interaction avec l'UI de filtre, avant application. `redrawRows()` détruit et recrée toutes les lignes rendues et tous leurs composants Angular. Chaque recréation relance les fuites C2, les `setTimeout` et les listeners (H6).
- **Impact** : pics CPU proportionnels au nombre de cellules rendues, churn DOM et amplification des fuites.
- **Solution** : supprimer `redrawRows()` de `onFilterModified`, ag-grid re-rend déjà après filtrage. Pour les renderers d'action, utiliser `this.gridApi.refreshCells({ columns: ['actions'], force: true })`. Dans `addRow` (service L204), supprimer le redraw, car `applyTransaction` suffit et `turnEditionOn` en fait déjà un.

#### [FC-H5] `refreshHeader()` et `refreshCells({force})` dans le reset tri/filtre et le clear-filter
- **Fichiers** :
  - `…/tableau/components/tableau/tableau.component.ts:669-685` : `applyColumnState`, `setFilterModel(null)`, `refreshHeader()` (L680), `refreshCells({ force: true })` (L683). Appelé par `addRow` (L635-641), puis `tableauModifiableService.addRow` (redraw L204) et `startEditing` (redraw L77).
  - `…/action-renderer-clear-filter/action-renderer-clear-filter.component.ts:41-46` : `setFilterModel(null)`, `onFilterChanged()` redondant, `refreshHeader()`, `resetColumnState()`.
- **Gravité** : Haute
- **Type** : CPU / Fuite mémoire (amplificateur de C1 et C3)
- **Cause** : `refreshHeader` et `resetColumnState` recréent tous les en-têtes et floating filters. Chaque recréation ajoute un abonnement root (C1) et un listener `modelUpdated` (C3).
- **Impact** : un clic sur « Ajouter » donne 1 refreshHeader, 1 refreshCells forcé et 2 redrawRows.
- **Solution** :
```ts
private resetSortAndFilters(): void {
  this.gridApi?.applyColumnState({ defaultState: { sort: null } });
  this.gridApi?.setFilterModel(null);   // déclenche déjà filterChanged → en-têtes mis à jour via leurs listeners
}
clearFilter() { this.params.api.setFilterModel(null); this.params.api.applyColumnState({ defaultState: { sort: null } }); }
```

#### [FC-H6] `setTimeout` et listeners `columnResized` par cellule, provoquant des rafales de change detection
- **Fichiers** :
  - Listener `columnResized` et debounce `setTimeout` par cellule : `…/date-renderer/date-renderer.component.ts:29-30`, `…/text-tooltip-renderer/text-tooltip-renderer.component.ts:26-27`, `…/select-editor/select-editor.component.ts:96-97`, `…/combobox/combobox.component.ts:78-79`, `…/date-editor/date-editor.component.ts:89-90`, `…/input-editor/input-editor.component.ts:108-109`.
  - Debounce : `…/tableau/services/tableau.service.ts:49-58`.
  - `setTimeout` dans `ngAfterViewInit` de chaque cellule : `select-editor.component.ts:173`, `combobox.component.ts:156`, `date-editor.component.ts:180`, `input-editor.component.ts:211`.
  - `…/tableau/services/editor.service.ts:92-103`.
  - Contexte : `onColumnResized` dispatche en continu (`tableau-configuration-builder.service.ts:254-256`), et `main.ts` n'active pas la coalescence de zone.
- **Gravité** : Haute
- **Type** : CPU / Change detection / Fuite mémoire (timers non annulés qui retiennent le composant)
- **Cause** : chaque timer créé dans la zone Angular déclenche un `ApplicationRef.tick()`. N cellules rendues donnent N cycles complets après chaque redraw ou resize. Aucun `clearTimeout` en `ngOnDestroy`. À noter : `enableTooltip` n'est jamais calculé à l'init dans date-renderer et text-tooltip (seulement au resize).
- **Impact** : pics CPU qui s'élargissent avec le nombre de lignes, colonnes et grilles vivantes.
- **Solution** : supprimer la mesure par cellule et utiliser le tooltip natif ag-grid.
```ts
// builder : gridOptions
tooltipShowMode: 'whenTruncated',
// colDef
tooltipValueGetter: p => p.valueFormatted ?? p.value,
```
Si une mesure est conservée, l'exécuter hors zone et annuler le timer :
```ts
private t?: ReturnType<typeof setTimeout>;
ngAfterViewInit() { this.zone.runOutsideAngular(() => this.t = setTimeout(() => this.measure())); }
ngOnDestroy() { clearTimeout(this.t); /* + removeEventListener existant */ }
```
En complément dans `main.ts` : `bootstrapModule(AppModule, { ngZoneEventCoalescing: true, ngZoneRunCoalescing: true })`.

#### [FC-H7] `onglet.component` : `ngAfterViewChecked` avec `detectChanges()` et lectures de layout
- **Fichier** : `fullstack-components/onglets/components/onglet/onglet.component.ts:140-148` (plus L179-182 et L209-220).
- **Gravité** : Haute
- **Type** : Change detection / CPU
- **Cause** : à **chaque** cycle, si `displayNav` : lecture de `scrollWidth` / `clientWidth` (reflow forcé), puis `this.cd.detectChanges()` qui re-vérifie tout le sous-arbre, y compris le contenu d'onglet et donc les grilles.
- **Impact** : double la change detection et impose un layout synchrone à chaque tick.
- **Solution** :
```ts
ngAfterViewInit() { this.updateNav(); }
@HostListener('window:resize') onResize() { this.updateNav(); }
private updateNav() {
  this.setNativeElement(); this.checkLimits(); this.checkCloseButton();
  this.cd.markForCheck();
}
// + appeler updateNav() dans le subscribe inputHeaderComponent.changes (L165) et après scroll
```
Supprimer `ngAfterViewChecked`. Annuler aussi le `setTimeout` en L167 au destroy.

#### [FC-H8] Arborescence : `detectChanges()` par nœud à chaque cycle et arbre entier rendu
- **Fichiers** :
  - `fullstack-components/arborescence/components/arborescence-collapse/arborescence-collapse.component.ts:62-64` (`ngAfterViewChecked() { this.cdRef.detectChanges(); }`).
  - `…/arborescence-collapse.component.html:30-39` (`ngbCollapse` : enfants toujours rendus), L10-11 (`[formControl]` **et** `[(ngModel)]` sur le même input).
  - `…/arborescence-children.component.html:2` (`keyvalue` sans trackBy).
- **Gravité** : Haute
- **Type** : Change detection / DOM excessif
- **Cause** : chaque nœud relance la change detection de son sous-arbre après chaque cycle, soit un coût d'environ profondeur × nœuds. L'arbre complet est dans le DOM même replié. Le double value accessor doublonne les écritures.
- **Solution** : supprimer `ngAfterViewChecked`. Utiliser `<app-arborescence-children *ngIf="tree[index].children && !isCollapsed" …>`. Garder uniquement `[formControl]` et lire `tree[index].value` via `valueChanges`. Ajouter `trackBy`.

#### [FC-H9] `DragPopupDirective` : `mousemove` document dans la zone Angular
- **Fichier** : `fullstack-components/popup/components/directives/drag-popup.directive.ts:52-61` et 64-67.
- **Gravité** : Haute
- **Type** : CPU / Change detection
- **Cause** : `renderer.listen(document, 'mousemove', …)` est enregistré depuis `ngOnInit`, donc dans la zone. Le `runOutsideAngular` à l'intérieur du handler ne sert à rien. Tant qu'une popup est ouverte, chaque mouvement de souris déclenche une change detection globale, grilles en arrière-plan comprises.
- **Solution** :
```ts
ngOnInit() {
  this.host = this.el.nativeElement.offsetParent;
  this.zone.runOutsideAngular(() => {
    this.removeMouseDownFn = this.renderer.listen(this.el.nativeElement, 'mousedown', e => { … });
    this.removeMouseMoveFn = this.renderer.listen('document', 'mousemove', e => { if (this.moving) this.moveTo(e.clientX, e.clientY); });
    this.removeMouseUpFn   = this.renderer.listen('document', 'mouseup', () => (this.moving = false));
  });
}
```

#### [FC-H10] `getFormGroup()` appelée dans le template du floating filter
- **Fichiers** : `…/multi-select-floating-filter/multi-select-floating-filter.component.html:2` (`[form]="getFormGroup()"`) et `.ts:92-97`.
- **Gravité** : Haute
- **Type** : CPU / Change detection
- **Cause** : tant que le form n'a aucun contrôle (grille vide, ou premier rendu avant `modelUpdated`), chaque change detection relance `modelUpddated()`, soit un scan complet et un nouveau `FormGroup`.
- **Solution** : initialiser dans `agInit` (voir C3) et lier `[form]="form"`.

---

#### [FC-M1] Notes statiques jamais retirées après l'auto-hide
- **Fichier** : `fullstack-components/notes/components/note-statique/note-statique.component.html:9`, `(hidden)="notesService.remove(toast)"`.
- **Gravité** : Moyenne
- **Type** : DOM excessif / Fuite mémoire
- **Cause** : `remove()` filtre `toasts` et non `staticToasts` (`notes.service.ts:59-61` contre `73-75`). Le `ngb-toast` masqué reste dans le DOM avec ses `svg-icon`, et `staticToasts` grossit jusqu'à `removeAllStatic()`. Chaque `app-note-statique` itère la liste entière (L1).
- **Solution** : `(hidden)="notesService.removeStatic(toast)"`, et `*ngFor="let toast of notesService.staticToasts; trackBy: trackByTitle"`.

#### [FC-M2] Suppression manuelle d'hôtes de composants Angular
- **Fichier** : `fullstack-components/tableau/services/tableau-errors.service.ts:79-85` et `121-128` (`document.querySelectorAll('app-note-statique')` puis `note.remove()` pour index > 0).
- **Gravité** : Moyenne
- **Type** : Fuite mémoire / DOM excessif
- **Cause** : on retire du DOM des hôtes de composants, **y compris ceux d'autres tableaux ou pages**, sans les détruire. Les vues restent vivantes et continuent de rendre dans un DOM détaché.
- **Solution** : ne plus manipuler le DOM. Dédupliquer dans le service, par exemple avec `showStatic` qui remplace un toast de même catégorie : `this.staticToasts = [...this.staticToasts.filter(t => t.category !== toast.category), toast];`.

#### [FC-M3] `@HostListener('mouseenter')` qui scanne tout le document
- **Fichier** : `…/tableau/components/tableau/tableau.component.ts:28-31`.
- **Gravité** : Moyenne
- **Type** : CPU
- **Cause** : `document.querySelectorAll('.ag-cell-wrapper, .ag-header-select-all')` couvre **toutes** les grilles de la page et écrit `ariaHidden` sur chaque élément à chaque survol, ce qui mute les attributs et force un recalcul de style. S'y ajoute une change detection globale.
- **Solution** : restreindre à `this.elementRef.nativeElement.querySelectorAll(…)`, l'exécuter une fois sur `firstDataRendered` / `modelUpdated` hors zone, ou corriger via un renderer de checkbox.

#### [FC-M4] Appels d'API ag-grid dans le template du tableau
- **Fichier** : `…/tableau/components/tableau/tableau.component.html:17` (`gridApi?.getSelectedNodes()?.length`), L27 et L36 (`isEnableButton()`, qui construit `getSelectedRows()`, `ts:415-418`), L46 (`isEnableCompleteButton()`, `ts:420-422`).
- **Gravité** : Moyenne
- **Type** : Change detection / CPU
- **Cause** : ces appels sont évalués à chaque cycle. Avec « tout sélectionner » sur beaucoup de lignes, un tableau de N lignes est construit à chaque tick.
- **Solution** :
```ts
selectedCount = 0;
// dans onGridReady, remplacer le listener vide L345-349 :
this.gridApi.addEventListener('selectionChanged', () => this.selectedCount = this.gridApi.getSelectedNodes().length);
```
```html
[disabled]="selectedCount <= 1"
```

#### [FC-M5] Taille de page de 200 000 et recomptage complet à chaque `paginationChanged`
- **Fichiers** :
  - `environments/environment.ts:7` et `environments/environment.prod.ts:4` (`paginationPageSize: 200000`), injecté par `…/tableau/services/tableau-configuration-builder.service.ts:188`.
  - `…/tableau/components/pagination/pagination.component.ts:69-72` (abonnement `paginationChanged`), L120-124, L132-163 (`getTotalRows` : `forEachNode` L145, `forEachNodeAfterFilter` L156).
  - Défaut : `tableau.component.ts:107` (`'500'`).
- **Gravité** : Moyenne
- **Type** : CPU
- **Cause** : jusqu'à ce que la pagination applique sa taille, la page fait 200 000 lignes. `getTotalRows` parcourt tous les nœuds à chaque `paginationChanged`, qui suit chaque mise à jour du modèle. Les scans des floating filters (C3) portent sur tout le jeu de données.
- **Point à confirmer à l'exécution** : `[agGrid]="agGrid"` est un `@ViewChild` non statique (`tableau.component.ts:33`). Il est probablement `undefined` au premier `ngOnInit` de `app-pagination`, et dans ce cas le bloc L37-73 ne s'exécute pas.
- **Solution** : `paginationPageSize: 100` dans l'environnement. Pour le comptage, utiliser `this.agGrid.api.getDisplayedRowCount()` pour les cas simples et mettre le total en cache sur `rowDataUpdated` / `filterChanged` plutôt que sur `paginationChanged`. Passer l'API via `(gridReady)` plutôt que via `@ViewChild`.

#### [FC-M6] Comparateur et formateurs coûteux par comparaison ou par cellule
- **Fichiers** :
  - `…/tableau/services/tableau-configuration-builder.service.ts:46-53` et `59-102` : `normalize('NFD')`, regex et `localeCompare(…, 'fr', {…})` à **chaque** comparaison, sur toutes les colonnes (L126), avec en plus `accentedSort: true` (L195).
  - `…/tableau/services/tableau-formatters-comparators.service.ts:25-28` : `new Intl.NumberFormat` par cellule ; L71-84 : `new Map` par comparaison.
- **Gravité** : Moyenne
- **Type** : CPU
- **Solution** :
```ts
private static readonly collator = new Intl.Collator('fr', { numeric: true, sensitivity: 'base' });
private customStringComparator = (a, b) => a == null ? (b == null ? 0 : -1) : b == null ? 1
  : typeof a === 'number' && typeof b === 'number' ? a - b
  : TableauConfigurationBuilderService.collator.compare(String(a), String(b)); // sensitivity 'base' gère accents/casse
private readonly nf = new Map<number, Intl.NumberFormat>(); // cache par minimumFractionDigits
private static readonly MONTHS = new Map([...]);            // hors méthode
```

#### [FC-M7] `multi-select-editor` : listener non retiré, promesse par cellule, abonnement sur un form obsolète, méthodes dans le template
- **Fichiers** :
  - `…/multi-select-editor/multi-select-editor.component.ts` : L74 (`addEventListener('rowDataUpdated')` non retiré dans `ngOnDestroy` L241-243), L208-210 (`getColumnFilterInstance().then` par cellule, résultat ignoré à cause de la course), L166 (`this.form.valueChanges` alors que `this.form` est remplacé en L222 lors de l'émission de `selectData`), L135 (C2).
  - `.html` : L34 et L67 (`keyvalue` sans trackBy), L36-53 (`isDisable(item.value)` appelé 5 fois par item et par cycle), L87 (`isTouchedAndEmpty()`).
- **Gravité** : Moyenne
- **Type** : Fuite mémoire / CPU
- **Solution** : retirer `displayErrorsFn` en `ngOnDestroy`. Supprimer l'appel à `getColumnFilterInstance` et lire `params.api.getFilterModel()[colId]` une fois. Précalculer `isLeaf` par groupe dans `initForm`. Ajouter `trackBy`.

#### [FC-M8] `combobox` : filtre recalculé 2 fois par cycle et menu toujours rendu
- **Fichier** : `…/combobox/combobox.component.html:64` et `67` (`getFiltredData(data)`, `ts:191-196`), L62 (`ngbDropdownMenu` toujours rendu).
- **Gravité** : Moyenne
- **Type** : CPU / DOM excessif
- **Solution** : `filtered$ = this.form.get(key).valueChanges.pipe(startWith(v), map(q => filter(this.data, q)))`, puis `*ngFor="let o of filtered$ | async; trackBy: trackByValue"`, dans un `*ngIf="dd.isOpen()"`.

#### [FC-M9] Un `ngbPopover` par cellule
- **Fichiers** : `date-renderer.component.html:4-8`, `text-tooltip-renderer.component.html:1`, `select-editor.component.html:5-8`, `combobox.component.html:5-8`, `date-editor.component.html:5-8`, `input-editor.component.html:5-8`, `multi-select-editor.component.html:5-8`, plus les icônes d'erreur (`select-editor.html:29-43`, etc.).
- **Gravité** : Moyenne
- **Type** : CPU / Heap
- **Cause** : une instance `NgbPopover` avec ses listeners `mouseenter`/`mouseleave` par cellule rendue, recréée à chaque redraw (H4).
- **Solution** : tooltips ag-grid (`tooltipShowMode: 'whenTruncated'`, `tooltipValueGetter`, voir H6), ou un seul popover au niveau de la grille.

#### [FC-M10] Aucune `ChangeDetectionStrategy.OnPush` dans le périmètre
- **Fichiers** : tout `fullstack-components/`. `grep ChangeDetectionStrategy` ne renvoie aucun résultat.
- **Gravité** : Moyenne
- **Type** : Change detection
- **Cause** : les renderers et éditeurs (des centaines d'instances), les listes déroulantes, l'arborescence et le menu sont vérifiés à chaque tick, avec les appels de template listés en H3, M4, M7 et M8.
- **Solution** : `changeDetection: ChangeDetectionStrategy.OnPush` sur les renderers ag-grid (qui n'évoluent que via `agInit`/`refresh`), `liste-deroulante-*`, `arborescence-*`, `menu-vertical-*` et `wizard-step`. Appeler `cd.markForCheck()` dans les callbacks d'abonnement.

#### [FC-M11] `turnEditionOn` : `setExpanded` sur tous les nœuds
- **Fichier** : `…/tableau/services/tableau-modifiable.service.ts:56-58` (`gridApi.forEachNode(e => … e.setExpanded(true|false))`), suivi de `redrawRows()` en L77.
- **Gravité** : Moyenne
- **Type** : CPU
- **Cause** : un événement `rowGroupOpened` par nœud, même quand il est déjà replié.
- **Solution** : `gridApi.forEachNode(n => { const exp = n.__objectId === rowId; if (n.expanded !== exp) n.setExpanded(exp); });` et supprimer le redraw (H4).

#### [FC-M12] Menu vertical : handlers `mouseover` qui déclenchent la change detection
- **Fichiers** :
  - `fullstack-components/menu-vertical/components/menu-vertical-block/menu-vertical-block.component.html:10-11` (`(mouseover)="('')"`, volontaire pour réévaluer `menuRow.matches(':hover')` en L20, L27, L40).
  - `…/menu-vertical/menu-vertical.component.html:5-8` avec `menu-vertical.component.ts:84-91` (`setTimeout` par `mouseover`).
- **Gravité** : Moyenne
- **Type** : Change detection / CPU
- **Cause** : `mouseover` se déclenche à chaque changement d'élément survolé. Chaque événement lance un tick global, et un `setTimeout` en ajoute un second.
- **Solution** : gérer le survol en CSS (`.menu-row:hover svg { fill: … }`), et remplacer `mouseover` par `mouseenter`, ou l'écouter hors zone.

---

#### [FC-B1] Listeners ag-grid anonymes et code mort dans `tableau.component`
- **Fichier** : `…/tableau/components/tableau/tableau.component.ts:339-343` (`filterChanged` anonyme), L345-349 (`selectionChanged` vide), L764-773 (`modelUpdated()` jamais branché, qui copie toutes les lignes deux fois).
- **Gravité** : Basse
- **Type** : Fuite mémoire (limitée à la vie de la grille) / CPU
- **Solution** : conserver les références et les retirer en `ngOnDestroy` comme `cellEditingStarted` (L778). Supprimer le listener vide et `modelUpdated`.

#### [FC-B2] Événement personnalisé `gridOrColumnResized` dispatché sans aucun listener
- **Fichier** : `…/tableau/services/tableau-configuration-builder.service.ts:249-256`. `grep` confirme l'absence de listener dans `src/app`.
- **Gravité** : Basse
- **Type** : CPU
- **Solution** : supprimer les deux `dispatchEvent`. Débouncer `sizeColumnsToFit`.

#### [FC-B3] `rowClassRules` appelle `getEditingCells()` deux fois par ligne
- **Fichier** : `…/tableau/services/tableau-configuration-builder.service.ts:236-242`.
- **Gravité** : Basse
- **Type** : CPU
- **Solution** : `const e = params.api.getEditingCells(); return e.length > 0 && e[0].rowIndex !== params.rowIndex;`

#### [FC-B4] Timers et abonnements résiduels sans nettoyage
- **Fichiers** : `…/onglets/components/onglet/onglet.component.ts:167` ; `…/tableau/services/editor.service.ts:92-103` (retient `params` et l'`ElementRef`) ; `…/shared/date-picker/date-picker.component.ts:108` et `127-155` (pas de `ngOnDestroy`, abonnement sur un FormGroup interne) ; `…/interrupteur/components/interrupteur-litteral/interrupteur-litteral.component.ts:45-49` ; `…/liste-deroulante/components/liste-deroulante/liste-deroulante.component.ts:110-122` ; `…/liste-deroulante-hierarchisee.component.ts:420`.
- **Gravité** : Basse
- **Type** : Fuite mémoire (courte durée) / Change detection
- **Solution** : stocker les handles, faire `clearTimeout` / `unsubscribe` en `ngOnDestroy`, et exécuter hors zone quand il n'y a pas d'effet sur l'UI.

#### [FC-B5] `action-render-clear-filter` : composant mort et incohérent
- **Fichier** : `…/action-render-clear-filter/action-render-clear-filter.component.ts:38-40` (retire `handleFocusFn`, qui est `undefined`) ; `.html:7-8` (appelle `clearFilter()`, qui n'existe pas dans la classe). Aucun import ailleurs dans `src/app`.
- **Gravité** : Basse
- **Type** : Code mort
- **Solution** : supprimer le composant.

#### [FC-B6] Méthodes dans les templates et `*ngFor` sans trackBy (petits volumes)
- **Fichiers** : `…/champ-de-saisie-date-intervalle.component.html:14` et `31` (`isTodayDisplayedForFromField()` / `…ToField()`, qui créent une date du jour à chaque cycle, `ts:105-113`) ; `…/liste-deroulante/liste-deroulante.component.html:29-35` (`isColoredOptionsTemplate(option)` et `ngStyle` par option, sans trackBy) ; `select-editor.component.html:26` et `interrupteur-select-editor.component.html:5` (options sans trackBy, par cellule) ; `…/wizard/components/wizard/wizard.component.ts:67-69` (`visited.push` sans dédoublonnage, `visited.includes` en html L25-26 et L34).
- **Gravité** : Basse
- **Type** : Change detection
- **Solution** : précalculer dans `ngOnChanges`, ajouter `trackBy`, et utiliser un `Set` pour `visited`.

---

### Tableau récapitulatif

| ID | Titre | Fichier principal (lignes) | Gravité | Type |
|---|---|---|---|---|
| FC-C1 | Abonnements FilterSharedDataService non fermés | column-header L31 ; list-floating-filter L33 ; input-filter L52 ; action-renderer-clear-filter L18 ; multi-select-hierarchisee-ff L37 ; liste-deroulante-multiple L109 | Critique | Fuite mémoire / DOM |
| FC-C2 | `selectData.subscribe` par cellule ou filtre | select-table-editor L37 ; select-editor L85 ; combobox L67 ; multi-select-editor L135 ; multi-select-hierarchisee-ff L76 | Critique | Fuite mémoire / CPU |
| FC-C3 | Listener `modelUpdated` jamais retiré, FormGroup recréé, scan complet | multi-select-ff L31, L51-90 ; multi-select-hierarchisee-ff L41, L59-84 | Critique | Fuite / CPU / DOM |
| FC-C4 | DOM dans `body` et `document:click` par cellule | select-table-editor L88-121, L173-178 | Haute | Fuite / DOM / CPU |
| FC-H1 | Menus et collapses toujours rendus, keyvalue sans trackBy | liste-deroulante-multiple.html L33, L48 ; hierarchisee.html L31, L46 ; hierarchisee-form.html L29-30 ; multi-select-editor.html L32-67 | Haute | DOM excessif |
| FC-H2 | `ngOnChanges` empile des abonnements | liste-deroulante-multiple L163-180 ; hierarchisee L162-191 | Haute | Fuite / CPU |
| FC-H3 | Getter `customSort` et méthodes dans le template | liste-deroulante-multiple L244-268 ; hierarchisee L464-493 | Haute | CPU / CD |
| FC-H4 | `redrawRows()` sur `onFilterModified` et les éditions | tableau.component L359-370 ; tableau-modifiable L77, 97, 148, 204 ; tableau-errors L160 | Haute | CPU / DOM |
| FC-H5 | `refreshHeader` et `refreshCells({force})` | tableau.component L669-685 ; action-renderer-clear-filter L41-46 | Haute | CPU / amplifie les fuites |
| FC-H6 | setTimeout et listeners `columnResized` par cellule, sans coalescence | date-renderer L29-30 ; text-tooltip L26-27 ; select-editor L96-97, 173 ; combobox L78-79, 156 ; date-editor L89-90, 180 ; input-editor L108-109, 211 ; tableau.service L49-58 | Haute | CPU / CD |
| FC-H7 | `ngAfterViewChecked` avec `detectChanges` | onglet.component L140-148 | Haute | CD / CPU |
| FC-H8 | `detectChanges` par nœud, arbre entier rendu | arborescence-collapse L62-64 ; .html L10-11, L30-39 | Haute | CD / DOM |
| FC-H9 | `mousemove` document dans la zone | drag-popup.directive L52-67 | Haute | CPU / CD |
| FC-H10 | `getFormGroup()` dans le template | multi-select-ff.html L2, .ts L92-97 | Haute | CPU |
| FC-M1 | Notes statiques jamais retirées | note-statique.html L9 | Moyenne | DOM / Fuite |
| FC-M2 | `note.remove()` sur des hôtes Angular | tableau-errors L79-85, L121-128 | Moyenne | Fuite / DOM |
| FC-M3 | `mouseenter` qui scanne tout le document | tableau.component L28-31 | Moyenne | CPU |
| FC-M4 | API ag-grid appelée dans le template | tableau.component.html L17, 27, 36, 46 | Moyenne | CD |
| FC-M5 | Page de 200 000 et recomptage par `paginationChanged` | environment(.prod).ts L7/L4 ; builder L188 ; pagination L69-72, L132-163 | Moyenne | CPU |
| FC-M6 | Comparateur, Intl et Map par appel | builder L46-102 ; formatters-comparators L25-28, L71-84 | Moyenne | CPU |
| FC-M7 | multi-select-editor : listener, promesse, form obsolète, template | multi-select-editor.ts L74, 166, 208-210 ; .html L34-87 | Moyenne | Fuite / CPU |
| FC-M8 | combobox : filtre x2 par cycle, menu rendu | combobox.html L62-67 | Moyenne | CPU / DOM |
| FC-M9 | Un ngbPopover par cellule | 7 templates de renderers et éditeurs | Moyenne | CPU / Heap |
| FC-M10 | Aucune stratégie OnPush | tout le périmètre | Moyenne | CD |
| FC-M11 | `setExpanded` sur tous les nœuds | tableau-modifiable L56-58 | Moyenne | CPU |
| FC-M12 | `mouseover` qui déclenche la CD | menu-vertical-block.html L10-11 ; menu-vertical.html L5-8, .ts L84-91 | Moyenne | CD |
| FC-B1 | Listeners anonymes et code mort | tableau.component L339-349, L764-773 | Basse | Fuite (bornée) |
| FC-B2 | Événement `gridOrColumnResized` sans listener | builder L249-256 | Basse | CPU |
| FC-B3 | `getEditingCells()` x2 par ligne | builder L236-242 | Basse | CPU |
| FC-B4 | Timers et abonnements résiduels | onglet L167 ; editor.service L92-103 ; date-picker L108, 127 ; interrupteur-litteral L45 ; liste-deroulante L110 ; hierarchisee L420 | Basse | Fuite courte |
| FC-B5 | Composant mort `action-render-clear-filter` | .ts L38-40 ; .html L7-8 | Basse | Code mort |
| FC-B6 | Méthodes dans les templates et ngFor sans trackBy (petits volumes) | date-intervalle.html L14, 31 ; liste-deroulante.html L29-35 ; wizard L67-69 | Basse | CD |

**Ordre de correction conseillé** : C1, C2, C3 (supprime la rétention des grilles détruites), puis H4 et H5 (qui multiplient les fuites), H1, H2, H3 (DOM des filtres), H6 (tempêtes de change detection), H7, H8, H9, et enfin la coalescence de zone dans `main.ts`.

**Vérifié sans problème** : `interrupteur-radio` et `interrupteur-select-editor` (abonnements fermés via `@AutoUnsubscribe`), `pagination.component` (abonnements et timeout nettoyés en L165-168 du fichier), `date-filter`, `menu-vertical` (abonnement `router.events` fermé), les listeners de `drag-popup` (retirés en `ngOnDestroy`), les listeners `focus` et `columnResized` des renderers (retirés en `ngOnDestroy`).

---

## Partie B : socle (layout, shared, services, Apollo, build)


Aucun fichier modifié. Les chemins sont relatifs à `posdoc-ihm_fe/src/app/`, sauf `src/main.ts`, `src/index.html`, `angular.json` et `src/environments/*`.

**Limites de vérification :**
- `node_modules` est absent. Je n'ai donc pas pu lire le code interne de `@acoss/prisme-angular-intranet` (CallbackComponent, `hasAccessTokenBackInStorage`, RefreshService). Je n'ai pas pu mesurer la taille des bundles non plus.
- `fullstack-components/` est hors périmètre. J'y ai quand même lu les fichiers abonnés à FilterSharedDataService, comme demandé.

**Ce qui explique le plus probablement l'escalier de DOM nodes et le heap (20 à 109 Mo) :**
1. FilterSharedDataService (**C1**) : chaque en-tête, filtre flottant et renderer ag-grid s'y abonne sans jamais se désabonner. Chaque grille affichée reste donc en mémoire, avec ses données et son DOM.
2. ContainerComponent (**C2**) : il est recréé à chaque changement de section de premier niveau, et chaque ancienne instance reste attachée au LoaderService.
3. Les ~238 `watchQuery().valueChanges` souscrits sans teardown (**C3**) : chaque ObservableQuery reste enregistrée dans le client Apollo avec son dernier résultat.

**Ce qui explique les pics CPU de plus en plus larges :**
- Les listeners `mousemove` / `scroll` (capture) de l'inactivité, dans la zone Angular (**C4**).
- Le `detectChanges()` appelé dans `ngAfterContentChecked` (**H1**).
- L'absence totale d'OnPush, avec des fonctions appelées dans les templates (**H3**).

---

#### [CORE-C1] FilterSharedDataService : abonnés ag-grid jamais désabonnés, les grilles restent en mémoire
- **Fichiers :**
  - Le service : `services/filter-shared-data.service.ts:8-16` (BehaviorSubject racine).
  - Abonnés qui **ne se désabonnent pas** :
    - `fullstack-components/tableau/ag-grid-components/column-header/column-header.component.ts:31` : son `ngOnDestroy` (l.122) ne retire que les listeners de colonne. Il est déclaré comme `agColumnHeader`, donc il remplace l'en-tête de **toutes** les colonnes de toutes les grilles (`tableau-configuration-builder.service.ts:156`).
    - `.../input-filter/input-filter.component.ts:52` : le `ngOnDestroy` (l.66-67) ne désabonne que `this.subscription`.
    - `.../list-floating-filter/list-floating-filter.component.ts:33` : pas de `ngOnDestroy`.
    - `.../multi-select-hierarchisee-floating-filter/multi-select-hierarchisee-floating-filter.component.ts:37` : pas de `ngOnDestroy`. En plus, `params.api.addEventListener('modelUpdated', this.modelUpddated.bind(this))` (l.41) n'est jamais retiré.
    - `.../action-renderer-clear-filter/action-renderer-clear-filter.component.ts:18` : pas de `ngOnDestroy`. C'est le floating filter de la colonne actions (`tableau-configuration-builder.service.ts:272`, `services/tableau-util.service.ts:45`).
    - `fullstack-components/liste-deroulante/.../liste-deroulante-multiple.component.ts:109` : la souscription n'est pas ajoutée à `subscriptions` (le `ngOnDestroy` l.240 ne la voit pas).
  - Abonnés corrects (via `@AutoUnsubscribe` et `subscriptions.push`) :
    - `shared/preselection/preselection.component.ts:92`
    - `admin/fabrication/ressource/ressource.component.ts:158`
    - `produit/fond-page/reference/search/imprime-search-component.ts:73`
    - `suivi/bon-travail/bon-travail.component.ts:87`
  - Émetteurs de `updateData` :
    - `tableau.component.ts:505, 618, 781`
    - `tableau-modifiable.service.ts:180`
    - `action-renderer-edit.component.ts:47`
    - `tableau-ressource.service.ts:72, 103`
    - `popup-formulaire-creation:51`, `modal-add-adress:62`, `add-commande-modal:283`, `modal-imprime:58`, `modal-component (param-edition):206`
    - `tableau-massification.component.ts:247`
- **Gravité :** Critique
- **Type :** Fuite mémoire / DOM excessif
- **Cause :** abonnement dans le constructeur, sans teardown :
  ```ts
  constructor(private filterSharedDataService: FilterSharedDataService) {
    this.filterSharedDataService.getData().subscribe(isDisabled => (this.isDisabled = isDisabled));
  }
  ```
  L'observer garde `this`, qui garde `params`, puis `params.api`, puis tout le contexte de la grille (row model, données, éléments DOM). ag-grid recrée les en-têtes et les filtres à chaque changement de colonnes, de visibilité ou de `setColumnDefs`, et à chaque grille ouverte.
- **Impact :**
  - Chaque grille visitée, y compris dans les modales, reste en mémoire définitivement, avec son DOM détaché et ses lignes (jusqu'à 200 000, voir M1). C'est l'escalier de DOM nodes et de heap observé.
  - Chaque `updateData()` réveille des centaines d'observers morts.
- **Solution :** dans chacun des 6 composants :
  ```ts
  import { DestroyRef, inject } from '@angular/core';
  import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

  constructor(private filterSharedDataService: FilterSharedDataService) {
    this.filterSharedDataService.getData()
      .pipe(takeUntilDestroyed())            // contexte d'injection : pas besoin de DestroyRef
      .subscribe(isDisabled => (this.isDisabled = !!isDisabled));
  }
  ```
  Côté service, typer le flux et éviter les émissions redondantes :
  ```ts
  private readonly dataSubject = new BehaviorSubject<any>(null);
  getData() { return this.dataSubject.asObservable().pipe(distinctUntilChanged()); }
  ```
  Attention : `ressource.component` y fait aussi passer des objets `{sujet,node}`. À terme, séparer en deux services (`isEditing$: boolean` et un bus ressource).

#### [CORE-C2] ContainerComponent : abonnement au LoaderService jamais libéré et recréation à chaque section
- **Fichiers :**
  - `layout/container/container.component.ts:31` (`activatedRoute.data`), `:43-51` (`httpProgress().subscribe`), `:61` (`getCodesOrganismesByRegions().subscribe`)
  - `services/loaderServeice/loader.service.ts:9` (ReplaySubject racine)
  - `app-routing.module.ts:20-63` : chaque section (`home`, `admin`, `produit`, `exploitation-editique`, `suivi`, `supervision`) déclare son propre `component: ContainerComponent`
- **Gravité :** Critique
- **Type :** Fuite mémoire / DOM excessif / CPU
- **Cause :**
  ```ts
  this.loaderService.httpProgress().subscribe((status: boolean) => {
    this.loading = status;
    this.cdref.detectChanges();
    ...renderer.addClass(document.body, 'cursor-loader')
  });
  ```
  - Comme la config de route diffère d'une section à l'autre, Angular **détruit et recrée** ContainerComponent (avec `<app-nav>` et ses ~35 `mat-list-item` + `routerLinkActive`) à chaque passage de /admin vers /produit, /suivi, etc.
  - L'ancienne instance reste référencée par le ReplaySubject racine : l'instance, sa `ChangeDetectorRef`/LView et les nœuds DOM détachés de la nav et du wrapper restent en mémoire.
  - Le callback de **chaque** container mort s'exécute encore à chaque requête HTTP (deux fois : début et fin).
  - `ngAfterViewInit` relance en plus une `watchQuery` jamais libérée à chaque création (voir C3), et appelle `sendAuthDataReady()`, ce qui recharge les notifications (fuite C3 dans AuthentificationComponent).
- **Impact :** fuite proportionnelle au nombre de navigations entre sections. Le coût CPU par requête HTTP augmente au fil de la session.
- **Solution :**
  ```ts
  private readonly destroyRef = inject(DestroyRef);
  ngOnInit(): void {
    this.loaderService.httpProgress()
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((status: boolean) => {
        this.loading = status;
        this.cdref.markForCheck();
        status ? this.renderer.addClass(document.body, 'cursor-loader')
               : this.renderer.removeClass(document.body, 'cursor-loader');
      });
  }
  ngAfterViewInit() {
    ...
    this.api.getCodesOrganismesByRegions(regions).pipe(take(1)).subscribe(...);
  }
  ```
  Côté structure, un seul ContainerComponent parent de toutes les sections, pour que la nav ne soit jamais recréée :
  ```ts
  { path: '', component: ContainerComponent, canActivate: [AuthImplicitGuard], resolve: { perms: InitResolver },
    children: [
      { path: 'home', loadChildren: () => import('./accueil/accueil.module').then(m => m.AccueilModule) },
      { path: 'admin', data: {...}, canMatch: [PermissionGuard], loadChildren: ... },
      { path: 'produit', ... }, { path: 'exploitation-editique', ... }, { path: 'suivi', ... }, { path: 'supervision', ... },
    ] },
  ```
  Les routes `''` / `accueil` (RedirectHomeGuard) sont à conserver avant, avec `pathMatch: 'full'`.

#### [CORE-C3] Apollo : `watchQuery().valueChanges` partout, souscrit sans teardown
- **Fichiers :**
  - 238 occurrences de `watchQuery` dans `services/**` (+6 hors `services/`), 248 `fetchPolicy: 'no-cache'`, une seule `apollo.query(`.
  - Sites de souscription sans teardown dans le périmètre (vérifiés) :
    - `layout/authentification/authentification.component.ts:102-111` (`loadNotifications`), déclenché par l'`interval` de 15 min (l.91), par chaque `authDataReady$` (l.79, donc chaque création de Container, voir C2) et par chaque `refresh$` (l.98)
    - `layout/authentification/notifications-list/notifications-list.component.ts:27, 41`
    - `layout/container/container.component.ts:61`
    - `shared/components/modal/details/details-modal.component.ts:58-81`
    - onglets de la modale (voir H2)
    - `shared/preselection/preselection.component.ts:169-183, 192, 222, 250` (voir M5)
    - `layout/nav/nav.component.ts:42, 47` : via `VersionService` avec `shareReplay(1)`. C'est un singleton, donc acceptable.
  - Heuristique sur toute l'app : 106 appels `.subscribe(` sans `take(1)` / `push` / `takeUntil` à proximité.
- **Gravité :** Critique
- **Type :** Fuite mémoire / Réseau
- **Cause :**
  ```ts
  return this.apollo.watchQuery<GetNotificationInterface>({ query: gql`...`, fetchPolicy: 'no-cache' }).valueChanges;
  ```
  - `valueChanges` ne se termine **jamais**. Tant qu'un observer est abonné, l'`ObservableQuery` reste dans le QueryManager d'Apollo (Map `queries`) avec son dernier résultat (tableaux complets).
  - Quand le callback capture `this` (composant, `gridApi`), le composant détruit et son DOM restent aussi en mémoire.
- **Impact :**
  - Le heap croît à chaque recherche, navigation, ouverture de modale et rafraîchissement de notifications.
  - Toute future utilisation de `refetchQueries` / `resetStore` relancerait aussi toutes les requêtes mortes.
- **Solution :**
  1. Pour tous les appels one-shot, remplacer mécaniquement `watchQuery(...).valueChanges` par `query(...)` : l'Observable émet une fois puis se termine, et le type `ApolloQueryResult` ne change pas.
     ```ts
     private static readonly GET_NOTIFICATIONS = gql`query getNotification { getNotification { id recipientId faq { id path question } createdAt } }`;
     getNotificationsCount() {
       return this.apollo.query<GetNotificationInterface>({ query: ApiAdelaideFaqService.GET_NOTIFICATIONS, fetchPolicy: 'no-cache' });
     }
     ```
  2. Dans AuthentificationComponent, un seul flux, annulable :
     ```ts
     merge(of(null).pipe(filter(() => !!sessionStorage.getItem('user.login'))),
           this.authentificationVerificationService.authDataReady$,
           interval(NOTIFICATION_REFRESH_INTERVAL),
           this.notificationsRefreshService.refresh$)
       .pipe(switchMap(() => this.apiAdelaideFaqService.getNotificationsCount().pipe(catchError(() => EMPTY))),
             takeUntilDestroyed(this.destroyRef))
       .subscribe(r => { this.notifications = r.data.getNotification; this.notifsCount = this.notifications.length; });
     ```
  3. Tant que `watchQuery` reste utilisé : `.pipe(take(1))` ou `takeUntilDestroyed()` à chaque souscription.

#### [CORE-C4] InactivityLogoutService : `mousemove` / `scroll` en capture dans la zone Angular
- **Fichiers :** `shared/services/inactivity-logout.service.ts:39, 54-56`. Démarrage par `app.component.ts:41`.
- **Gravité :** Critique
- **Type :** CPU / Change detection
- **Cause :**
  ```ts
  private readonly activityEvents = ['click', 'keydown', 'scroll', 'mousemove', 'touchstart'];
  this.activityEvents.forEach(e => document.addEventListener(e, this.onActivity, { passive: true, capture: true }));
  ```
  - L'enregistrement se fait dans la zone (appelé depuis `ngOnInit`). Le throttle de 30 s ne limite **que** l'écriture en sessionStorage.
  - Zone.js déclenche quand même un `ApplicationRef.tick()` complet à **chaque** mousemove.
  - `scroll` en `capture: true` intercepte aussi le scroll interne des viewports ag-grid, qu'ag-grid-angular fait volontairement tourner hors zone.
- **Impact :** détection de changements globale à chaque frame de souris ou de scroll de grille. Multipliée par H1 (double CD) et H3 (fonctions dans les templates), elle donne les pics CPU.
- **Solution :**
  ```ts
  private readonly zone = inject(NgZone);
  private readonly activityEvents = ['pointerdown', 'keydown', 'wheel', 'mousemove', 'touchstart'];
  start(): void {
    this.stop();
    if (this.isInactivityExpired(Date.now())) { this.logout(); return; }
    this.recordActivity();
    this.zone.runOutsideAngular(() => {
      this.activityEvents.forEach(e => document.addEventListener(e, this.onActivity, { passive: true, capture: true }));
      document.addEventListener('visibilitychange', this.onVisibilityChange);
      this.checkSubscription = interval(INACTIVITY_CHECK_INTERVAL).subscribe(() => this.check());
    });
  }
  private logout(): void {
    this.zone.run(() => { this.stop(); this.logoutService.logout(this.router.url); });
  }
  ```
  Même chose (`runOutsideAngular`) pour les `interval` de `front-token-refresh.service.ts:44` et `TokenExpirationService.ts:26`, en ne repassant dans la zone qu'au moment d'agir.

#### [CORE-H1] ContainerComponent : `detectChanges()` dans `ngAfterContentChecked` + requête DOM globale
- **Fichiers :** `layout/container/container.component.ts:54-57`
- **Gravité :** Haute
- **Type :** Change detection / CPU
- **Cause :**
  ```ts
  ngAfterContentChecked() {
    this.cdref.detectChanges();
    this.hasOnglet = !!document.getElementsByTagName('app-onglet').length;
  }
  ```
  À chaque tick, tout le sous-arbre (nav et page routée avec ses grilles) est vérifié une seconde fois, et le document entier est parcouru.
- **Impact :** coût de chaque cycle de CD doublé sur toutes les pages. Combiné avec C4, c'est à chaque mouvement de souris.
- **Solution :** supprimer le hook et passer par du CSS pur :
  ```scss
  // container.component.scss
  .default-screen-padding:has(app-onglet) { /* styles actuels de .hasOnglet */ }
  ```
  Retirer `[class.hasOnglet]` du template et supprimer `ngAfterContentChecked`.

#### [CORE-H2] Modale « détails occurrence » : chaque changement d'onglet laisse une grille en mémoire
- **Fichiers :** `shared/components/modal/details/onglets/` :
  - `notices/notices.component.ts:69`
  - `fichiers-produits/fichiers-produits.component.ts:66`
  - `commandes-fichiers/commandes-fichiers.component.ts:61`
  - `massification/details-massification.component.ts:56`
  - `facturation/details-facturation.component.ts:58`
  - `incidents/incidents.component.ts:47`
  - `generalites/generalites.component.ts:27`
  - Le conteneur `details-modal.component.ts:96-105`, où `createComponent` et `clear()` sont corrects.
- **Gravité :** Haute
- **Type :** Fuite mémoire / DOM excessif
- **Cause :** `loadComponent()` fait bien `clear()` puis `createComponent()`, mais chaque onglet souscrit une `watchQuery` sans teardown (`this.apiNoticesService.getDetailsNotices(...).subscribe(...)`). Les onglets gardent aussi `this.gridApi = params.api` (l.61-64), donc le composant détruit et sa grille ag-grid restent en mémoire via l'ObservableQuery.
- **Impact :** N changements d'onglets correspondent à N grilles détachées conservées. Idem à chaque ouverture de la modale (`details-modal.component.ts:66`).
- **Solution :** dans chaque onglet :
  ```ts
  private readonly destroyRef = inject(DestroyRef);
  getDetailsNotices(): void {
    this.apiNoticesService.getDetailsNotices(this.paramData)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(r => { this.detailNotices = r.data.getDetailsNotices; this.totalNotice = this.detailNotices.length; });
  }
  ```
  Même `pipe(take(1), takeUntilDestroyed(...))` dans `details-modal.component.ts:60`. Pour les tableaux HTML non virtualisés (`incidents.component.html:16-17`, `details-facturation.component.html:16-17`), ajouter `trackBy` / `@for (...; track row.id)`.

#### [CORE-H3] Aucun OnPush dans l'application + fonctions appelées dans les templates du layout
- **Fichiers :**
  - `grep ChangeDetectionStrategy.OnPush` renvoie 0 fichier, et `runOutsideAngular` n'est utilisé que 3 fois dans tout `src/app`.
  - `layout/authentification/authentification.component.html:1, 5` (`isConnecte()` ×2, qui lit sessionStorage et peut lancer `verifyUserProfileAndPermission`), `:15` (`getUtilisateur()`)
  - `layout/header/header.component.html:4` (`isConnected()`)
  - `layout/nav/nav.component.html:2, 18, 126, 210, 270, 333` (`isPanelOpen()` ×6)
  - `shared/preselection/preselection.component.html:100` (`isFormValid()`, qui fait `includes` sur les options)
  - `shared/components/select-list-with-input/select-list-with-input.component.html:55, 58` (`getFiltredData(options)` ×2, filtre complet à chaque CD)
  - `shared/components/select-from-table-list/select-from-table-list.component.html:44` (`getHeaderColumns()`)
  - `layout/authentification/notifications-list/notifications-list.component.html:6` (`getPathLabel()`)
- **Gravité :** Haute
- **Type :** Change detection / CPU
- **Cause :**
  - Le header et la nav sont rendus en permanence et réévalués à chaque tick, sous C4 et H1.
  - `hasAccessTokenBackInStorage()` vient de la lib Prisme ; son coût (lecture et parse de sessionStorage probables) n'est pas vérifiable sans node_modules.
- **Impact :** CPU proportionnel au nombre de ticks, qui est énorme à cause de C4.
- **Solution :**
  - Passer en OnPush les composants du layout (`HeaderComponent`, `AuthentificationComponent`, `NavComponent`, `SpinnerComponent`, `NotificationsListComponent`) et mettre en cache les valeurs dérivées :
    ```ts
    @Component({ ..., changeDetection: ChangeDetectionStrategy.OnPush })
    export class NavComponent {
      openPanel = '';
      constructor() {
        inject(Router).events.pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed())
          .subscribe((e: NavigationEnd) => { this.openPanel = '/' + e.urlAfterRedirects.split('/')[1]; this.cdr.markForCheck(); });
      }
    }
    ```
    Dans le template : `[expanded]="openPanel === '/admin'"`. Même principe pour `connected` / `utilisateur` dans l'authentification (calculés dans `ngOnInit` et à la connexion).
  - Pour `select-list-with-input`, calculer `filteredOptions` dans un `valueChanges` plutôt qu'en template.

#### [CORE-H4] Modules de fonctionnalités importés en eager dans AppModule alors qu'ils sont aussi lazy
- **Fichiers :**
  - `app.module.ts:34-36, 99-101` : `ExploitationEditiqueModule`, `SuiviModule`, `SupervisionModule` dans `imports`.
  - `exploitation-editique/exploitation-editique.module.ts:54` et `produit/produit.module.ts:93` importent `AdminModule`, qui importe `AdminRoutingModule` (`admin/admin.module.ts:121`).
- **Gravité :** Haute
- **Type :** Build / Fuite mémoire (heap initial)
- **Cause :** ces modules importent leur `RoutingModule.forChild`. Importés en eager :
  - leur code (et celui d'AdminModule) part dans le bundle initial ;
  - leurs routes sont enregistrées **à la racine** (`/production`, `/edition`, `/massification`, les routes admin…) en plus des routes lazy ;
  - via `AdminModule`, les routes admin sont aussi ajoutées comme enfants de `/produit` et `/exploitation-editique` une fois ces modules chargés.
- **Impact :** heap initial gonflé (probablement une bonne partie des 20 Mo de départ), parsing plus long, routes fantômes.
- **Solution :**
  ```ts
  // app.module.ts : retirer ExploitationEditiqueModule, SuiviModule, SupervisionModule des imports
  ```
  Extraire les composants d'AdminModule réutilisés par Produit et Exploitation dans un `AdminSharedModule` sans `AdminRoutingModule`.

#### [CORE-M1] `paginationPageSize: 200000` : pagination désactivée de fait, jeux de données énormes en mémoire
- **Fichiers :**
  - `src/environments/environment.ts` et `environment.prod.ts` (`paginationPageSize: 200000`)
  - `fullstack-components/tableau/services/tableau-configuration-builder.service.ts:188`
  - Utilisé comme seuil « trop de résultats » : `suivi/facturation/facturation-detaillee/facturation-detaillee.component.ts:127`, `supervision/document-dematerialise/consultation/consultation.component.ts:125`
- **Gravité :** Moyenne
- **Type :** Fuite mémoire / CPU
- **Cause :** la virtualisation limite le DOM, mais jusqu'à 200 000 lignes sont chargées en mémoire et parcourues (`forEachNode`, lignes épinglées dans `shared/utils/AgGridUtil.ts:42-48, 95-107, 125-132`). Avec C1, ces jeux de données restent en mémoire.
- **Impact :** heap multiplié par le nombre de grilles conservées ; tris et filtres lents.
- **Solution :**
  ```ts
  export const environment = { ..., paginationPageSize: 100, maxClientRows: 200000 };
  ```
  Utiliser `maxClientRows` pour les seuils « trop de résultats », et envisager le Server-Side Row Model pour les volumes au-delà de 50 000 lignes.

#### [CORE-M2] Apollo : cache et configuration
- **Fichiers :** `graphql.module.ts:8-17` (`onError(...)` créé mais jamais branché dans `ApolloLink.from`), `:40-42` (`addTypename: false`), 155 `.mutate` dont ~82 sans `fetchPolicy`
- **Gravité :** Moyenne
- **Type :** Fuite mémoire / Réseau
- **Cause :**
  - Les mutations sans `no-cache` écrivent leurs résultats dans `ROOT_MUTATION` de l'InMemoryCache, avec une clé par jeu d'arguments, donc le cache grossit.
  - Le lien d'erreur n'est jamais utilisé.
  - Un seul client est instancié : `apollo-client` 2 / `apollo-link` ne servent qu'aux types (`ApolloQueryResult`, `FetchResult`, 16 imports), donc pas de double client à l'exécution. Ce sont des dépendances inutiles.
- **Impact :** croissance lente du cache, erreurs GraphQL non centralisées.
- **Solution :**
  ```ts
  const errorLink = onError(({ graphQLErrors, networkError }) => { ... });
  return {
    link: ApolloLink.from([errorLink, new RetryLink({...}), httpLink.create({ uri: appConfig.apiBaseUrl() })]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { fetchPolicy: 'no-cache' },
      query: { fetchPolicy: 'no-cache' },
      mutate: { fetchPolicy: 'no-cache' },
    },
  };
  ```
  Remplacer `import { ApolloQueryResult } from 'apollo-client'` par `'@apollo/client/core'`, puis retirer `apollo-client` et `apollo-link` du `package.json`.

#### [CORE-M3] Bundle initial : librairies en double ou inutilisées
- **Fichiers :**
  - `src/main.ts:7-8` : jquery.slim et bootstrap.bundle.js. Aucun `$` dans `src/app`. `data-bs-toggle` n'apparaît que dans `ui-components/nav-menu` (non utilisé) et 2 templates produit.
  - `src/main.ts:10-13` : `AllEnterpriseModule.with(AgChartsCommunityModule)`, alors qu'aucune utilisation de graphiques ag-grid n'a été trouvée.
  - `angular.json:43-51` : quill en script global **et** `import Quill from 'quill'` (`shared/config/quill-editor.config.ts:1`) ; CSS quill en double avec `src/styles.scss:22-24` ; `vis-timeline-graph2d.min.js` en script global, alors que `vis-network` est déjà importé en ESM dans supervision.
  - `services/generate-file.service.ts:2-5` : pdfmake, vfs_fonts, exceljs et le logo en base64 (110 Ko, `acoss-logo.service.ts`) chargés en eager par un service racine.
  - `angular.json:97-101` : budgets en simple avertissement (2 Mo), sans `maximumError`.
- **Gravité :** Moyenne
- **Type :** Build
- **Cause et impact :** plusieurs Mo de JS parsés au démarrage et gardés en heap. bootstrap.js ajoute des listeners délégués sur `document` en parallèle de ng-bootstrap.
- **Solution :**
  ```ts
  // main.ts
  ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule, MasterDetailModule, SetFilterModule,
    ExcelExportModule, PaginationModule, /* …modules réellement utilisés… */]);
  // retirer jquery / bootstrap.bundle si les 2 templates data-bs-* passent en ngbDropdown/ngbCollapse
  ```
  - Retirer les `scripts` quill et vis d'`angular.json`.
  - Charger pdfmake et exceljs en `await import('pdfmake/build/pdfmake')` au moment de l'export.
  - Ajouter `"maximumError": "4mb"` aux budgets.

#### [CORE-M4] Composants de sélection partagés : DOM rendu en permanence et listeners globaux par instance
- **Fichiers :**
  - `shared/components/select-list-with-input/select-list-with-input.component.html:53-60` : le contenu `ngbDropdownMenu` est rendu même fermé, avec la liste complète.
  - `shared/components/select-from-table-list/select-from-table-list.component.ts:13-19` (`@HostListener('document:click')` et `document:contextmenu` sur chaque instance), `:90-113` (`window:resize` avec `document.querySelector('.table-selector')` global : chaque instance repositionne le **premier** sélecteur du document), `:117` (`form.valueChanges` sans teardown)
  - `select-from-table-list.component.html:44-60` : table options × colonnes rendue avec `display:none`.
  - `shared/components/multi-select-section/multi-select-section.component.ts:63` (`valueChanges` sans teardown)
- **Gravité :** Moyenne
- **Type :** DOM excessif / CPU
- **Solution :**
  ```html
  <div ngbDropdownMenu>
    <ng-template ngbDropdownItem ...> <!-- ou -->
    @if (dropdown.isOpen()) { @for (option of filteredOptions; track option) { ... } }
  </div>
  ```
  ```ts
  // select-from-table-list
  constructor(private host: ElementRef<HTMLElement>) {}
  adjustPosition() { const el = this.host.nativeElement.querySelector('.table-selector') as HTMLElement; ... }
  ngOnInit() { this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(...); }
  ```
  Rendre la table seulement quand elle est ouverte (`@if (displayTable.display === 'block')`).

#### [CORE-M5] PreselectionComponent : souscriptions qui s'accumulent
- **Fichiers :** `shared/preselection/preselection.component.ts:169-183` (souscription `formEnv.valueChanges` non stockée), `:192` (un `push` de plus à chaque changement d'organisme), `:139-144` et `:209` (`setTimeout` non annulés)
- **Gravité :** Moyenne
- **Type :** Fuite mémoire / Réseau
- **Cause :** chaque changement d'organisme ajoute une nouvelle `watchQuery` vivante au tableau `subscriptions`, sans annuler la précédente.
- **Solution :**
  ```ts
  private readonly orgChange$ = new Subject<{selectedEnvs: string[]; selectedOrgs: string[]}>();
  // ngOnInit
  this.subscriptions.push(this.orgChange$.pipe(
    switchMap(p => this.apiAdelaideFichierService.getDistAppsByEnvOrg(this.apiAdelaideFichierService.getSearchFichierFilterQuery(p.selectedEnvs, p.selectedOrgs)))
  ).subscribe(r => { this.applicationOptions = r.data.getDistAppByEnvOrgFromFichier; this.formApp.reset(this.distributionOldSelectedApplication); }));
  this.subscriptions.push(this.formEnv.valueChanges.pipe(switchMap(...)).subscribe(...));
  // distributionValueChangeOrg : this.orgChange$.next({ selectedEnvs, selectedOrgs: event.selectedOrgs });
  ```

#### [CORE-M6] URL de blob jamais révoquée (ouverture de PDF)
- **Fichiers :** `services/generate-file.service.ts:417-422`
- **Gravité :** Moyenne
- **Type :** Fuite mémoire
- **Cause :** `const blobUrl = URL.createObjectURL(blob); window.open(blobUrl, '_blank');` sans `revokeObjectURL` : le PDF reste en mémoire jusqu'au rechargement.
- **Solution :**
  ```ts
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, '_blank');
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  ```

#### [CORE-M7] La configuration par défaut du build est le mode dev
- **Fichiers :** `angular.json:53-56` (`sourceMap: true`, `optimization: false`), `:109` (`"defaultConfiguration": ""`), `src/environments/environment.ts` (`production: false`), `src/main.ts:19-21`
- **Gravité :** Moyenne (Basse si la mesure a été faite sur le build Jenkins)
- **Type :** Build
- **Cause :** `ng serve` et `npm run build` produisent un build dev (ngDevMode, passe `checkNoChanges` qui double la CD, sourcemaps). Jenkins utilise bien `build-prod` (`Jenkinsfile:73`).
- **Impact :** une mesure Performance Monitor faite en local sur `ng serve` gonfle fortement le CPU et le heap.
- **Solution :** `"defaultConfiguration": "production"` pour `build`, `"development"` pour `serve`, et refaire les mesures sur un build prod.

#### [CORE-B1] PermissionService.hasPermission : `JSON.parse` et `map` à chaque appel
- **Fichiers :** `services/permission/permission.service.ts:20-23`
- **Gravité :** Basse
- **Type :** CPU
- **Cause :** `if (this.profilePermissions.length == 0) this.profilePermissions = JSON.parse(sessionStorage.getItem('permissions'))`. Pour un profil sans permission, le parse est refait à chaque appel. `map(e => e.id)` est aussi recalculé à chaque appel.
- **Solution :**
  ```ts
  private permIds: Set<number> | null = null;
  hasPermission(perm): boolean {
    this.permIds ??= new Set((this.profilePermissions.length ? this.profilePermissions : JSON.parse(sessionStorage.getItem('permissions') ?? '[]')).map(e => e.id));
    return this.permIds.has(perm);
  }
  setPermissions(p) { if (p == null) return; this.profilePermissions = p; this.permIds = null; sessionStorage.setItem('permissions', JSON.stringify(p)); }
  ```
  La directive `appCheckPermission` (`fullstack-components/shared/directives/check-permission.directive.ts:17-23`) ne fait qu'un seul `createEmbeddedView` en `ngOnInit`. Pas de fuite de ce côté.

#### [CORE-B2] Décorateur `@AutoUnsubscribe` et DataService
- **Fichiers :** `shared/decorators/auto-unsubscribe.decorator.ts:9-20`, `shared/utils/data.service.ts:23-25`
- **Gravité :** Basse
- **Type :** Fuite mémoire (risque latent)
- **Cause :**
  - Le décorateur appelle `.unsubscribe()` sur **toute** propriété qui l'expose, Subjects compris (il les ferme). Il ignore les souscriptions non stockées dans une propriété.
  - `getTransferedData()` renvoie le BehaviorSubject racine lui-même. Si un composant décoré le stockait dans une propriété, il fermerait le Subject pour toute l'application.
  - État actuel : les 5 abonnés à DataService sont correctement gérés (`commande:115`, `distribution-parametre-edition:134`, `affectation-notice:77`, `affectation-notice/search:81`, `search-suivi-au-pli:54`). Les autres Subjects racine le sont aussi : `TableauModifiableService.onStartEditing` (`tableau.component.ts:331`), `AuthentificationVerificationService`, `NotificationsRefreshService`, `CommunicationAdresseRetourService` (`adresse-retour.component.ts:88`) et `TableauNoticeService` (`tableau-notice.component.ts:239`).
- **Solution :** migrer progressivement vers `takeUntilDestroyed()`, et renvoyer `this.dataTransfer.asObservable()`.

#### [CORE-B3] Code mort porteur de fuites latentes
- **Fichiers :**
  - `services/api-adelaide-select-data.service.ts` (aucun consommateur ; 12 méthodes qui souscrivent des `watchQuery` sans teardown depuis un service racine)
  - `services/api-adelaide-search.service.ts:30, 44, 47` (aucun consommateur)
  - `core/components/layout/breadcrumb/breadcrumb.component.ts:28` (`router.events` jamais libéré ; jamais instancié car `showNavigationBar = false`)
  - `ui-components/nav-menu/side-nav/side-nav.component.ts:25` (non utilisé)
  - `services/toast.service.ts` (non utilisé)
- **Gravité :** Basse
- **Type :** Fuite mémoire (latente) / Build
- **Solution :** supprimer ces fichiers, ou corriger avec `takeUntilDestroyed()` avant toute réutilisation.

#### [CORE-B4] Timers d'authentification : pas de double démarrage, mais deux propriétaires
- **Fichiers :** `app.component.ts:40-42`, `layout/authentification/authentification.component.ts:57-59, 179-181`, `shared/services/TokenExpirationService.ts:21-31`, `shared/services/front-token-refresh.service.ts:40-53`
- **Gravité :** Basse
- **Type :** CPU
- **Cause :**
  - `startTokenExpirationCheck` est appelé par AppComponent **et** par AuthentificationComponent. `stop()` est appelé avant, donc il n'y a pas de double `interval`.
  - Les `start()` sont idempotents (`this.stop()` en premier) et `stop()` retire bien les listeners.
  - Les `interval` (16 min, 15 min, 1 min) tournent dans la zone : un tick global par intervalle.
- **Solution :** ne démarrer TokenExpirationService que depuis AppComponent, et appliquer le `runOutsideAngular` de C4.

#### [CORE-B5] Directives partagées : observers et listeners
- **Fichiers :** `shared/directives/session-data-search.directive.ts:147-148, 179-180, 215-216`, `shared/directives/resizable-column.directive.ts:58-59`
- **Gravité :** Basse
- **Type :** CPU / Fuite mémoire (mineure)
- **Cause :**
  - Les `MutationObserver` ne sont déconnectés que si la liste finit par se remplir (résultat vide : l'observer reste actif tant que le nœud vit). Pas de `ngOnDestroy`.
  - Le `mousemove` pendant un redimensionnement de colonne tourne dans la zone, donc une CD par pixel de drag.
- **Solution :**
  ```ts
  private observers: MutationObserver[] = [];
  // après new MutationObserver(...) : this.observers.push(observer);
  ngOnDestroy() { this.observers.forEach(o => o.disconnect()); }
  ```
  Enregistrer `mousemove` / `mouseup` via `zone.runOutsideAngular` dans `ResizableColumnDirective`.

---

### Tableau récapitulatif

| ID | Titre | Gravité | Type | Fichier principal |
|---|---|---|---|---|
| CORE-C1 | FilterSharedDataService : abonnés ag-grid non désabonnés | Critique | Fuite / DOM | `fullstack-components/tableau/ag-grid-components/*` (6 composants), `services/filter-shared-data.service.ts` |
| CORE-C2 | ContainerComponent : fuite via LoaderService, recréé à chaque section | Critique | Fuite / DOM / CPU | `layout/container/container.component.ts:43`, `app-routing.module.ts` |
| CORE-C3 | `watchQuery().valueChanges` généralisé, souscrit sans teardown | Critique | Fuite / Réseau | `services/**` (238), `layout/authentification/*.ts` |
| CORE-C4 | Listeners mousemove/scroll d'inactivité dans la zone | Critique | CPU / CD | `shared/services/inactivity-logout.service.ts:54` |
| CORE-H1 | `detectChanges` dans `ngAfterContentChecked` | Haute | CD / CPU | `layout/container/container.component.ts:54` |
| CORE-H2 | Onglets de la modale détails : grilles conservées | Haute | Fuite / DOM | `shared/components/modal/details/onglets/*` |
| CORE-H3 | Zéro OnPush, fonctions dans les templates | Haute | CD / CPU | header, authentification, nav, preselection, select-* |
| CORE-H4 | Modules de fonctionnalités en eager + routes dupliquées | Haute | Build / Heap | `app.module.ts:99-101` |
| CORE-M1 | `paginationPageSize` 200000 | Moyenne | Mémoire / CPU | `src/environments/*` |
| CORE-M2 | Cache Apollo (mutations), onError non branché, apollo-client v2 | Moyenne | Fuite / Réseau | `graphql.module.ts` |
| CORE-M3 | Bundle : jQuery, bootstrap.js, AgCharts, quill ×2, vis, pdfmake/exceljs eager | Moyenne | Build | `src/main.ts`, `angular.json` |
| CORE-M4 | Composants select : DOM permanent, listeners globaux | Moyenne | DOM / CPU | `shared/components/select-*` |
| CORE-M5 | Preselection : souscriptions qui s'accumulent | Moyenne | Fuite / Réseau | `shared/preselection/preselection.component.ts:169, 192` |
| CORE-M6 | Blob URL non révoquée | Moyenne | Fuite | `services/generate-file.service.ts:421` |
| CORE-M7 | Build dev par défaut (ng serve / ng build) | Moyenne | Build | `angular.json:53-56, 109` |
| CORE-B1 | `hasPermission` : parse et map à chaque appel | Basse | CPU | `services/permission/permission.service.ts:20` |
| CORE-B2 | `@AutoUnsubscribe` ferme les Subjects ; DataService expose le Subject | Basse | Risque de fuite | `shared/decorators/auto-unsubscribe.decorator.ts` |
| CORE-B3 | Code mort avec fuites latentes | Basse | Fuite / Build | `services/api-adelaide-select-data.service.ts`, `api-adelaide-search.service.ts`, breadcrumb, side-nav |
| CORE-B4 | Timers d'authentification (deux propriétaires, dans la zone) | Basse | CPU | `TokenExpirationService.ts`, `authentification.component.ts:58` |
| CORE-B5 | MutationObserver non déconnectés, drag dans la zone | Basse | CPU / Fuite | `shared/directives/*.ts` |

**Ordre de correction recommandé :** C1, C2 et H1, C4, C3 (commencer par AuthentificationComponent, ContainerComponent et la modale détails), puis H4. Refaire ensuite une mesure (heap snapshot : « Detached HTMLDivElement », `ObservableQuery`) sur un build prod.

---

## Partie C : `admin/`


J'ai tout lu en lecture seule : les 127 fichiers `.ts` et `.html` (hors spec), `admin.module.ts` et le routing. `git status` est vide, aucun fichier n'a été modifié. Les chemins sont relatifs à `posdoc-ihm_fe/src/app`.

**Cause la plus probable des paliers de DOM qui ne redescendent jamais : C1.** Trois souscriptions Apollo `watchQuery` ne se ferment jamais. Chacune garde en mémoire un écran FAQ détaché avec toute sa grille, ou une modale Quill fermée.

**Deux pièges du code, utiles pour lire les constats :**
- 46 méthodes d'API utilisées par l'admin passent par `apollo.watchQuery(...).valueChanges`, qui ne se termine jamais. La plupart des appels sont protégés par `take(1)` (vérifié). Ceux qui ne le sont pas sont listés en C1 et H4.
- Le décorateur `@AutoUnsubscribe` ne désabonne qu'à la destruction du composant. Il ne protège ni les souscriptions non stockées dans un attribut, ni les modales.

---

#### [ADM-C1] Souscriptions Apollo `watchQuery` jamais fermées : grille FAQ et modales Quill gardées en mémoire après fermeture
- **Fichier(s) :**
  - `admin/contenu/faq/faq.component.ts:128-137`. `loadFaqNotifications()` est appelée à la ligne 83, puis à chaque `refresh$` (ligne 84). Ce flux est déclenché par `notifyRefresh()` dans `faq.component.ts:215, 263, 299`, `popup-faq.component.ts:105, 142` et `answer-question.component.ts:75`.
  - `admin/contenu/aide/popup/popup-aide.component.ts:38-45`
  - `admin/contenu/popup-help/onglets/faq/popup/popup-faq.component.ts:76-83`
  - (`getNotificationsCount`, `getAllPathComplet` et `searchAllFaq` sont des `watchQuery`, voir `services/api-adelaide-faq.service.ts:238` et `services/api-adelaide-contenu.service.ts:203`.)
- **Gravité :** Critique
- **Type :** Fuite mémoire / DOM excessif
- **Cause :**
  ```ts
  this.apiAdelaideFaqService.getNotificationsCount().subscribe(result => {   // aucun take/takeUntil
    this.faqNotifications = result.data.getNotification;
    if (this.gridApi) this.gridApi.redrawRows();
  });
  this.apiAdelaideContenuService.getAllPathComplet().subscribe(result => { this.pathOptions = ... }); // popups
  ```
  Chaque souscription maintient une `ObservableQuery` enregistrée dans l'`ApolloClient` racine. Sa fonction de rappel capture `this`, donc le composant, son LView et son DOM restent en mémoire.
- **Impact :**
  - Après avoir quitté l'onglet FAQ, `FaqComponent` reste en mémoire avec `gridApi`, toute l'instance ag-grid, ses renderers et ses nœuds DOM détachés.
  - Chaque `notifyRefresh()` (création, édition, suppression, message) ajoute une `ObservableQuery` de plus. Une suppression de N lignes en ajoute N.
  - Chaque ouverture de `PopupAide` ou `PopupFaq` laisse en mémoire une modale complète (éditeur Quill, barre d'outils, accordéons), soit des centaines de nœuds par ouverture.
  - C'est cohérent avec la montée en escalier des DOM nodes et du heap.
- **Solution :**
  ```ts
  // faq.component.ts – remplace les l.83-84 et la méthode l.128-137
  this.notificationsRefreshService.refresh$.pipe(
    startWith(undefined),
    switchMap(() => this.apiAdelaideFaqService.getNotificationsCount().pipe(take(1))),
    takeUntilDestroyed(this.destroyRef)
  ).subscribe(result => {
    this.faqNotifications = result.data.getNotification;
    this.notifiedIds = new Set(this.faqNotifications.map(n => n.faq.id));
    this.gridApi?.redrawRows();
  });

  // popup-aide.component.ts / popup-faq.component.ts
  private readonly destroyRef = inject(DestroyRef);
  private loadPathOptions() {
    this.apiAdelaideContenuService.getAllPathComplet()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => { this.pathOptions = result.data.getAllPathComplet.map(i => ({ value: i.path, text: i.libelle })); });
  }
  ```
  Correction de fond : dans les services, remplacer `watchQuery(...).valueChanges` par `apollo.query(...)`, qui se termine après une émission. Pour `getAllPathComplet`, ajouter aussi un cache :
  ```ts
  private pathComplet$ = this.apollo.query<PathCompletInterface>({ query: Q, fetchPolicy: 'no-cache' }).pipe(shareReplay({ bufferSize: 1, refCount: false }));
  getAllPathComplet() { return this.pathComplet$; }
  ```

#### [ADM-H1] `redrawRows()` sur toute la grille après chaque `applyTransaction` ou rafraîchissement
- **Fichier(s) :**
  - `environnement/environnement.component.ts:145`
  - `moteur-adelaide/moteur-adelaide.component.ts:159`
  - `fabrication/serveur/serveur.component.ts:156`
  - `fabrication/gamme/gamme.component.ts:172`
  - `fabrication/verrou/verrou.component.ts:91`
  - `fabrication/parametre-distribution/parametre-distribution.component.ts:102`
  - `fabrication/ressource/ressource.component.ts:287`
  - `organisme/organismes/organismes.component.ts:189`
  - `organisme/regions/regions.component.ts:150`
  - `organisme/sites/sites.component.ts:169`
  - `application/definition/application-definition/application-definition.component.ts:234`
  - `service/service.component.ts:136`
  - `tarif/tarif.component.ts:217`
  - `tarif/tarif-details/tarif-details.component.ts:177`
  - `client/client.component.ts:147`
  - `specification-fichier/compositions/compositions.component.ts:153`, `formats/formats.component.ts:149`, `multifs/multifs.component.ts:145`, `supports/supports.component.ts:147`, `echantillons/echantillons.component.ts:153`, `reeditions/reeditions.component.ts:169`
  - `contenu/page-accueil/page-accueil.component.ts:153, 206`
  - `contenu/aide/aide.component.ts:373`
  - `contenu/faq/faq.component.ts:134, 171, 298`
- **Gravité :** Haute
- **Type :** CPU / DOM excessif
- **Cause :**
  ```ts
  this.gridApi.applyTransaction({ remove: event });
  this.gridApi.redrawRows();   // détruit puis recrée toutes les lignes rendues
  ```
  Presque toutes les cellules sont des composants Angular (InputEditor, SelectEditor, MultiSelectEditor, DateEditor, InterrupteurRadio, chacun avec son FormControl et ses souscriptions). En master/detail (ressource, paramètre-distribution, tarif), cela recrée aussi tous les détails ouverts. Pour tarif, cela recrée des grilles `app-tableau` entières, avec les headers et floating filters qui fuient via `FilterSharedDataService` (déjà connu).
- **Impact :** pics CPU proportionnels au nombre de lignes × colonnes rendues. Chaque redraw multiplie aussi les fuites de headers et floating filters et des renderers mal nettoyés (voir H3).
- **Solution :** supprimer ces appels ; la transaction suffit. Si seule la colonne d'actions doit être mise à jour :
  ```ts
  this.gridApi.applyTransaction({ remove: event });
  this.gridApi.refreshCells({ columns: ['<colId colonne actions>'], force: true });
  ```

#### [ADM-H2] Tarif master/detail : une grille `app-tableau` complète par ligne dépliée, recréée et rechargée par le réseau
- **Fichier(s) :** `tarif/tarif.component.ts:71-78, 217` ; `tarif/tarif-details/tarif-details.component.ts:56-93, 124, 149, 177` ; `tarif/tarif-details/tarif-details.component.html:3-17`
- **Gravité :** Haute
- **Type :** DOM excessif / Réseau / Fuite mémoire
- **Cause :**
  - `detailCellRenderer = TarifDetailsComponent` instancie une grille ag-grid entière par détail.
  - `agInit` reçoit déjà `params.data.detail`, mais `onGridReady` relance `getTarifByType` (réseau).
  - Chaque création ou mise à jour relance `getData()` et réaffecte tout `rowData` (pas de `getRowId`).
  - `keepDetailRows` n'est pas activé : un détail qui sort du viewport, un repli puis dépliage ou un `redrawRows` du maître détruisent et reconstruisent la grille complète.
- **Impact :** des milliers de nœuds par détail. Chaque reconstruction ré-instancie les headers et floating filters qui fuient, et lance une requête supplémentaire.
- **Solution :**
  ```ts
  // tarif.component.ts
  this.gridOptions.keepDetailRows = true;
  this.gridOptions.keepDetailRowsCount = 5;
  delete this.gridOptions.detailCellRendererParams; // le spread d'un tableau l.76-78 ne sert à rien
  // tarif-details.component.ts
  onGridReady(p) { this.gridApi = p.api; /* plus d'appel réseau : rowData = params.data.detail */ }
  // après create/update : this.gridApi.applyTransaction({ add/update: [tarif] }); this.params.data.detail = ...;
  ```

#### [ADM-H3] Détails ressource / paramètre-distribution : listener ag-grid jamais retiré
- **Fichier(s) :** `fabrication/parametre-distribution/details-param-distr/details-param-distr.component.ts:47` et `:71`
- **Gravité :** Haute
- **Type :** Fuite mémoire
- **Cause :**
  ```ts
  this.params.api.addEventListener('rowDataUpdated', this.displayErrorsFn);   // l.47
  ...
  this.params.api.removeEventListener('cellEditingStarted', this.displayErrorsFn); // l.71 : mauvais événement
  ```
- **Impact :** chaque instance de détail (dépliage, défilement, `redrawRows` de H1) reste référencée par l'EventService de la grille, avec son FormGroup, ses `params` et son LView/DOM. Les instances « zombies » continuent aussi d'exécuter `markAllAsTouched` à chaque `rowDataUpdated`. `ressource/details/details.component.ts:87/291` fait la paire correctement.
- **Solution :**
  ```ts
  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    if (!this.params.api.isDestroyed()) this.params.api.removeEventListener('rowDataUpdated', this.displayErrorsFn);
  }
  ```

#### [ADM-H4] Habilitations : `detectChanges()` dans `ngAfterViewChecked` et `watchQuery` sans `take(1)`
- **Fichier(s) :** `habilitations/habilitations.component.ts:163-165` ; `:101, 107, 174`
- **Gravité :** Haute (CPU), Moyenne (souscriptions)
- **Type :** Change detection / CPU / Fuite mémoire
- **Cause :**
  ```ts
  ngAfterViewChecked() { this.cdRef.detectChanges(); }            // 2e passe de CD à CHAQUE cycle de l'appli
  this.apiProfileService.getProfileById(codeProfile).subscribe({...}) // watchQuery, +1 ObservableQuery vivante par changement de profil
  ```
- **Impact :**
  - Chaque événement Zone (clic, XHR, timer, toast) re-vérifie deux fois tout l'arbre, y compris `app-arborescence` et ses centaines de nœuds.
  - Les requêtes `getProfileList`/`getProfileById` restent actives jusqu'à la sortie de la page, et une nouvelle s'ajoute à chaque changement de profil.
- **Solution :**
  ```ts
  // supprimer ngAfterViewChecked ; appeler this.cdRef.markForCheck() à la fin des handlers si besoin
  this.apiProfileService.getProfileById(code).pipe(take(1)).subscribe(...);
  this.apiProfileService.getProfileList().pipe(take(1)).subscribe(...);
  ```

#### [ADM-H5] Cell renderers « fonction » qui créent du DOM : listeners jamais retirés, `innerHTML` actif, HTML non assaini
- **Fichier(s) :**
  - `contenu/services/status-column-handler.service.ts:32, 49-97`
  - `contenu/aide/service/tableau-aide.service.ts:106, 127-137, 192-206, 219-220`
  - `contenu/faq/service/tableau-faq.service.ts:118-128, 149-166, 244-245`
  - `contenu/page-accueil/service/tableau-page-accueil.service.ts:38-55, 131-134`
- **Gravité :** Haute
- **Type :** DOM excessif / CPU / Réseau (et sécurité)
- **Cause :**
  ```ts
  statusCol.cellRenderer = (params) => this.statusCellRenderer(params, context, config); // select + addEventListener
  link.addEventListener('click', e => { params.context.componentParent.onPageClick(...) });
  const tempDiv = document.createElement('div'); tempDiv.innerHTML = processedHtml;      // à chaque rendu de cellule
  cellRenderer: params => '<div class="overflow-auto" style="height:114px;">' + params.value + '</div>'
  const nodeRegions = params.value.sort(...); JSON.stringify(allRegions) === JSON.stringify(nodeRegions)
  ```
  - Un renderer fonction n'a ni `destroy()` ni `refresh()` : tout rafraîchissement recrée le DOM, et les closures capturent `params` et le composant.
  - `innerHTML` sur un élément du document principal parse le HTML riche Quill à chaque rendu. Il charge les `<img>`, y compris les images base64 volumineuses et les URL distantes, ce qui génère des requêtes réseau. Il exécute aussi les attributs `on*` : risque XSS, idem pour les renderers chaîne de page-accueil.
  - Le renderer régions trie `params.value` en place, donc modifie les données.
- **Impact :** CPU et GC à chaque défilement, tri ou filtre ; requêtes réseau parasites ; nœuds recréés sans réutilisation.
- **Solution :**
  ```ts
  // 1) Texte pré-calculé une fois dans mapAidesToRowData / mapFaqsToRowData, colonne sans cellRenderer
  private static readonly parser = new DOMParser();          // document inerte : pas d'images, pas de scripts
  private toPlainText(html: string, max = 150) {
    if (!html) return '';
    const t = (Cls.parser.parseFromString(html.replace(/<(br|\/p|\/div|\/li)\s*\/?>/gi, ' '), 'text/html').body.textContent || '')
      .replace(/\s+/g, ' ').trim();
    return t.length > max ? t.slice(0, max) + '...' : t;
  }
  // colDef : { field: 'messageText', cellStyle: { overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }

  // 2) Lien : pas de listener par cellule
  { field: 'pathLabel', cellClass: 'link-cell', onCellClicked: p => p.context.componentParent.onPageClick(p.data.id) }

  // 3) Statut : renderer classe avec destroy()
  export class StatusCellRenderer implements ICellRendererComp {
    private eGui!: HTMLDivElement; private select!: HTMLSelectElement;
    private onChange = (e: Event) => this.params.onChange(e, this.params);
    constructor(private params?: any) {}
    init(p: any) { this.params = p; /* créer eGui/select */ this.select.addEventListener('change', this.onChange); }
    getGui() { return this.eGui; }
    refresh(p: any) { this.params = p; this.select.value = p.data.status; return true; }
    destroy() { this.select.removeEventListener('change', this.onChange); }
  }

  // 4) page-accueil : [...params.value].sort(), clé "Tous" calculée une fois ; message via composant Angular [innerHTML] (assaini)
  ```

#### [ADM-M1] FAQ : `getRowClass` en O(lignes × notifications) et `redrawRows` complet à chaque notification
- **Fichier(s) :** `contenu/faq/faq.component.ts:133-135, 153-158, 170-172`
- **Gravité :** Moyenne
- **Type :** CPU
- **Cause :** `this.faqNotifications.some(...)` est évalué à chaque rendu de ligne ; un `redrawRows()` global suit chaque rafraîchissement, plus un `setTimeout(() => this.gridApi.redrawRows(), 100)` non annulé qui s'exécute même si la grille est détruite.
- **Impact :** re-rendu complet de la grille FAQ à chaque échange ou notification (combiné avec C1).
- **Solution :**
  ```ts
  notifiedIds = new Set<number>();
  this.gridOptions.rowClassRules = { 'notified-row': p => this.notifiedIds.has(p.data?.id) };
  // après mise à jour du Set : redessiner seulement les lignes concernées
  const nodes = [...this.notifiedIds].map(id => this.gridApi.getRowNode(String(id))).filter(Boolean);
  this.gridApi.redrawRows({ rowNodes: nodes });
  ```

#### [ADM-M2] Appels réseau dupliqués, dans des boucles, et rechargements complets de `rowData`
- **Fichier(s) :**
  - `getAllPathComplet` rechargé à chaque instanciation : `aide.component.ts:94`, `faq.component.ts:118`, `popup-aide.component.ts:39` (chaque ouverture), `popup-faq.component.ts:77` (chaque ouverture), `popup-help/onglets/faq/faq.component.ts:55`, `onglets/conversation/conversation.component.ts:102`. `popup-help.component.ts:63-72` recrée l'onglet (`clear()` + `createComponent`) à chaque changement, donc recharge tout.
  - Boucles d'appels : `aide.component.ts:360-385` et `faq.component.ts:282-310` font `forEach(delete)`, soit N mutations, N `redrawRows` et N `notifyRefresh` (qui, combinés à C1, donnent N `watchQuery` en fuite).
  - Rechargements complets : `faq.component.ts:111` (changement de statut → `searchAllFaq`), `:262` et `:278` (même si la modale est fermée sans enregistrer) ; `tarif-details.component.ts:124, 149`.
  - `service/service.component.ts:98, 115` remplacent tout `rowData` sans `getRowId`, donc toutes les cellules sont recréées.
- **Gravité :** Moyenne
- **Type :** Réseau / CPU / DOM excessif
- **Solution :**
  - Pour les chemins : cache `shareReplay` dans le service (voir C1).
  - Pour la suppression : un seul appel groupé.
    ```ts
    forkJoin(event.map(a => this.api.deleteAide(a.id))).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.gridApi.applyTransaction({ remove: event });
      this.notificationsRefreshService.notifyRefresh();
    });
    ```
    (ou mieux, une mutation qui accepte une liste d'ids).
  - Pour le statut : `param.node.setDataValue('status', newStatus)` au lieu de `loadFaqData()`.
  - Pour Service : `this.gridOptions.getRowId = p => String(p.data.id)`.

#### [ADM-M3] `AdminModule` importé en eager par d'autres modules lazy : routes et providers dupliqués
- **Fichier(s) :** `admin/admin.module.ts:121, 128, 131` ; importé par `produit/produit.module.ts:93` et `exploitation-editique/exploitation-editique.module.ts:54`, uniquement pour `ConfirmationPopupComponent`
- **Gravité :** Moyenne
- **Type :** Fuite mémoire / Réseau
- **Cause :** l'import embarque trois choses :
  - `AdminRoutingModule` et son `RouterModule.forChild(routes)` : les routes admin sont fusionnées dans les ROUTES de ces modules.
  - `QuillModule.forRoot()`.
  - `providers: [provideHttpClient(...), provideAngularSvgIcon()]` : un nouvel `HttpClient` et un nouveau `SvgIconRegistryService` dans chaque injecteur lazy. Ces providers existent aussi déjà dans `layout.module.ts:57` et `fullstack-components.module.ts:173`.
- **Impact :** cache SVG dupliqué par module, donc les icônes sont re-téléchargées et gardées plusieurs fois en mémoire ; tout le code admin est embarqué dans les chunks produit et exploitation ; routes admin accessibles sous `/produit/...`.
- **Solution :** déplacer `ConfirmationPopupComponent` dans `SharedModule` (ou le rendre `standalone`) et retirer `AdminModule` de ces imports. Dans `AdminModule` : `providers: []` et `QuillModule` sans `forRoot()`, qui n'est à fournir qu'une fois à la racine.

#### [ADM-M4] Calculs coûteux dans les templates et les données
- **Fichier(s) :**
  - `contenu/popup-help/onglets/conversation/answer-question/answer-question.component.html:9-19` : `isCurrentUser()` appelée 5 fois par échange à chaque CD, et elle lit `sessionStorage` (`.ts:91-94`).
  - `popup-faq.component.html:41-59` (idem).
  - `list-question.component.html:10, 17` : `hasNotification()` en `.some`, `getPathLabel()` en `.find`.
  - `onglets/faq/faq.component.html:29`.
  - `fabrication/ressource/details/details.component.html:20-50` : `getTectByValue` × 4, par détail.
  - `habilitations/habilitations.component.ts:139, 147` : `currentHabilitations.map(e=>e.id).includes()` à l'intérieur d'un `map`, soit O(n²) ; `:111-113, 253-255` : `JSON.parse(JSON.stringify())` par habilitation.
  - `application-definition.component.ts:108-111` et `ressource.component.ts:104-106, 124-127` : `filter(...)[0]` par ligne, soit O(lignes × organismes).
  - `specification-fichier/echantillons/service/tableau-echantillon.service.ts:87-94` : `valueGetter` avec effet de bord, qui alloue un tableau `canEdit` à chaque appel (rendu, tri, filtre, export).
- **Gravité :** Moyenne
- **Type :** Change detection / CPU
- **Solution :**
  ```ts
  readonly currentUser = sessionStorage.getItem('user.login');   // lu une fois
  // mapper une fois : exchanges.map(e => ({...e, mine: e.author === this.currentUser}))
  pathLabelMap = new Map(pathOptions.map(o => [o.value, o.text]));   // puis pathLabelMap.get(faq.path)
  const orgRegion = new Map(organWithRegion.map(o => [o.code, o.codeRegion]));
  this.rowData = rows.map(e => ({ ...e, codeRegion: orgRegion.get(e.codeOrganisation) }));
  const ids = new Set(this.currentHabilitations.filter(Boolean).map(e => e.id)); e.value = ids.has(e.id);
  // canEdit : le calculer dans onCellValueChanged / au chargement, pas dans valueGetter
  ```

#### [ADM-B1] Tableaux `subscriptions[]` qui grossissent pendant toute la vie de l'écran
- **Fichier(s) :** tous les composants CRUD qui font `this.subscriptions.push(...)` dans `onSaveEdition` / `onDeleteRow`. Exemples : `environnement.component.ts:94, 119, 140`, `habilitations.component.ts:173, 219, 429, 462`, `aide.component.ts:128, 149, 211, 269, 320, 339, 362`, `page-accueil.component.ts:131, 192, 196`, `ressource.component.ts:223, 257, 283`, `tarif.component.ts:140, 165, 205`. Même pattern dans les autres composants de tableau.
- **Gravité :** Basse
- **Type :** Fuite mémoire (bornée par la vie du composant)
- **Cause :** les souscriptions terminées (mutations) restent référencées avec leurs closures (`errors`, lignes éditées) jusqu'à `ngOnDestroy`.
- **Solution :** `this.api.updateX(x).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(...)` sans `push`.

#### [ADM-B2] `setTimeout` jamais annulés
- **Fichier(s) :** `contenu/aide/aide.component.ts:327` (rouvre une modale même après destruction), `contenu/faq/faq.component.ts:171`, `answer-question.component.ts:51`, `popup-faq.component.ts:64, 139, 152`
- **Gravité :** Basse
- **Type :** CPU / Fuite mémoire (courte)
- **Solution :** `const id = setTimeout(...); this.destroyRef.onDestroy(() => clearTimeout(id));` ou `timer(100).pipe(takeUntilDestroyed(this.destroyRef))`.

#### [ADM-B3] `*ngFor` sans `trackBy` sur des listes recréées à chaque clic
- **Fichier(s) :** `habilitations/habilitations.component.html:19, 76, 89`. `actions` et `authorisations` sont recréés via `Object.assign({}, e)` à chaque clic (`.ts:140, 148`), donc tout le DOM des interrupteurs est recréé.
- **Gravité :** Basse
- **Type :** DOM excessif
- **Solution :** `*ngFor="let action of actions; trackBy: trackById"` avec `trackById = (_: number, e: any) => e.id;`

#### [ADM-B4] Code mort et calculs inutiles
- **Fichier(s) :**
  - `habilitations/habilitation/habilitation.component.ts` : démo ag-grid treeData déclarée dans le module, avec le même sélecteur `app-habilitation` que `HabilitationsComponent`.
  - `tarif/tarif.component.ts:76-78` : `detailCellRendererParams = {...getDetailColumnDefs()}` étale un tableau dans un objet, jamais utilisé.
  - `fabrication/ressource/ressource.component.ts:157-168` : abonnement au `BehaviorSubject` root `FilterSharedDataService`, qui rejoue la dernière valeur et retient le `RowNode` jusqu'au reset fait par `tableau.component.ts:780`.
- **Gravité :** Basse
- **Type :** CPU / Mémoire
- **Solution :** supprimer `HabilitationComponent` et `detailCellRendererParams` ; pour Ressource, passer par un `Subject` local à la page, ou par `context` de la grille, plutôt que par le singleton.

---

**Hors périmètre admin, vus en passant (liés aux symptômes) :**
- `fullstack-components/tableau/components/tableau/tableau.component.ts:357-369` : `onFilterModified` appelle `redrawRows()` à chaque frappe dans un filtre, sur toutes les grilles admin.
- `environments/environment*.ts` : `paginationPageSize: 200000`, donc la pagination est de fait désactivée.

**Non vérifiable ici :** `quill-image-resize-module` (enregistré dans `shared/config/quill-editor.config.ts`) est réputé laisser un listener `keyup` sur `document` si la modale se ferme avec une image sélectionnée. Je n'ai pas pu le confirmer, faute de `node_modules`.

#### Tableau récapitulatif

| ID | Titre | Gravité | Type | Fichiers principaux |
|---|---|---|---|---|
| ADM-C1 | `watchQuery` jamais fermées (FAQ, modales Quill) | Critique | Fuite mémoire / DOM | `contenu/faq/faq.component.ts:128`, `popup-aide.component.ts:39`, `popup-faq.component.ts:77` |
| ADM-H1 | `redrawRows()` global après transaction (27 occurrences) | Haute | CPU / DOM | 23 composants listés |
| ADM-H2 | Tarif : grille complète par détail, recréée et rechargée | Haute | DOM / Réseau | `tarif.component.ts:71-78`, `tarif-details.component.ts:56-93` |
| ADM-H3 | Listener `rowDataUpdated` jamais retiré | Haute | Fuite mémoire | `details-param-distr.component.ts:47/71` |
| ADM-H4 | `detectChanges` dans `ngAfterViewChecked` + `watchQuery` profils | Haute | CD / CPU / Fuite | `habilitations.component.ts:163, 101, 107, 174` |
| ADM-H5 | Renderers fonction : DOM, listeners, `innerHTML` actif | Haute | DOM / CPU / Réseau | `status-column-handler.service.ts`, `tableau-aide`, `tableau-faq`, `tableau-page-accueil` |
| ADM-M1 | FAQ : `getRowClass` O(n·m) + `redrawRows` global | Moyenne | CPU | `faq.component.ts:133, 153, 171` |
| ADM-M2 | Appels dupliqués, en boucle, rechargements complets | Moyenne | Réseau / CPU | aide, faq, popups, service, tarif-details |
| ADM-M3 | `AdminModule` importé en eager (routes et providers dupliqués) | Moyenne | Mémoire / Réseau | `admin.module.ts:121-131`, `produit.module.ts:93`, `exploitation-editique.module.ts:54` |
| ADM-M4 | Méthodes dans les templates, boucles O(n²) | Moyenne | CD / CPU | answer-question, list-question, popup-faq, details, habilitations, application-definition, ressource, echantillon |
| ADM-B1 | `subscriptions[]` qui grossissent | Basse | Mémoire | tous les composants CRUD |
| ADM-B2 | `setTimeout` non annulés | Basse | CPU | aide, faq, answer-question, popup-faq |
| ADM-B3 | `ngFor` sans `trackBy` | Basse | DOM | `habilitations.component.html` |
| ADM-B4 | Code mort, param inutile, `BehaviorSubject` partagé | Basse | CPU / Mémoire | `habilitation.component.ts`, `tarif.component.ts:76`, `ressource.component.ts:157` |

**Ordre de correction :**
1. C1 et H3 (vraies rétentions de DOM).
2. H1, H2 et H5 (multiplicateurs des fuites de headers déjà connues).
3. H4, puis M1 à M4.

---

## Partie D : `produit/` et `exploitation-editique/`


J'ai lu, en lecture seule, les 172 fichiers `.ts` (hors spec) et `.html` du périmètre, modules et routing compris. Je n'ai modifié aucun fichier.

Pour juger certains constats, j'ai aussi ouvert quelques fichiers hors périmètre, sans les auditer :
- `shared/decorators/auto-unsubscribe.decorator.ts`
- `shared/utils/AgGridUtil.ts`
- `services/*` (les services Apollo)
- `services/generate-file.service.ts`
- `services/filter-shared-data.service.ts`
- `fullstack-components/tableau/*`

### Faits établis qui conditionnent les constats

- **Toutes les requêtes Apollo du périmètre passent par `apollo.watchQuery(...).valueChanges`.** Ce flux ne se termine jamais.
  - C'est vrai pour `api-adelaide-fichier`, `-commande`, `-distribution`, `-parametre`, `api-massification`, `api-notices`, `api-adelaide-premas`, etc. Presque toutes sont en `fetchPolicy: 'no-cache'`.
  - Un `subscribe` sans `take(1)` laisse donc un `ObservableQuery` vivant dans le `QueryManager`, qui est un singleton global.
  - Cet `ObservableQuery` retient le dernier résultat et la closure (`this` → `gridApi` → arbre DOM ag-grid détaché).
  - Les `apollo.mutate` se terminent, eux : ils ne sont pas concernés.
- **`@AutoUnsubscribe` fonctionne.** Il surcharge `prototype.ngOnDestroy` et appelle `unsubscribe()` sur toute propriété, ou tout tableau de propriétés, qui a cette méthode.
  - Il ne ferme ni les souscriptions non stockées, ni celles écrasées par réassignation.
  - Les composants qui ne l'ont pas ne sont pas couverts.
- **Aucun `FileUploader` (ng2-file-upload), aucun `HostListener` et aucun `addEventListener` sur `window` ou `document` dans le périmètre.**
- **Les pages à onglets ne gardent pas tous les contenus instanciés.** `reedition`, `distribution`, `fond-page` et `notice` utilisent `*ngIf` sur `labelActif`, donc seul l'onglet actif est instancié.
  - En contrepartie, chaque changement d'onglet recrée une grille, donc de nouveaux headers qui fuient.

---

#### [PROD-C1] Requêtes Apollo `watchQuery` jamais terminées qui survivent au composant
- **Fichier(s)** :
  - `exploitation-editique/massification/massification-modal/massification-modal.component.ts:52` et `:67` (ni `@AutoUnsubscribe` ni `ngOnDestroy`)
  - `exploitation-editique/massification/simulation-modal/simulation-modal.component.ts:30` (idem)
  - `exploitation-editique/bon-travail-manuel/search/search-bon-travail-manuel/search-bon-travail-manuel.component.ts:90-100` (`orgChangeSubscription` réassignée à chaque changement d'organisme sans `unsubscribe`, seule la dernière est fermée)
  - `produit/distribution/parametre-edition/parametre-edition-colonne/parametre-edition-colonne/parametre-edition-colonne.component.ts:137` (`getCodeOrgOGUR().subscribe(...)`, non stockée)
  - `produit/notice/service/file-upload.service.ts:29-36` (`getPdfFilePath` : `getNoticePdf` est un `watchQuery`, sans `take`, dans un service root ; appelée à chaque clic sur un lien PDF de notice)
- **Gravité** : Critique
- **Type** : Fuite mémoire
- **Cause** :
  ```ts
  this.apiMassificationService.getMassificationMessage(...).subscribe({ next: r => { this.validationMessage = ...; } });
  this.orgChangeSubscription = this.apiAdelaideFichierService.getDistAppsByEnvOrg(...).subscribe(...); // écrasée à chaque appel
  ```
  Le `QueryManager` global garde une référence vers l'observer, donc vers le composant détruit, son `gridApi` et le DOM de la modale ou de la grille.
- **Impact** :
  - Chaque ouverture de modale Massifier ou Simuler et chaque changement d'organisme ajoute des objets jamais collectés, avec des nœuds DOM détachés (grille de la modale massification).
  - Chaque clic sur un PDF garde le PDF en base64, en plus du blob (voir [H6]).
  - Cela correspond à la croissance en escalier du heap et des nœuds DOM.
- **Solution** :
  ```ts
  // modales
  this.subscriptions.push(
    this.apiMassificationService.getMassificationMessage(...).pipe(take(1)).subscribe({...}));
  // + ajouter @AutoUnsubscribe et `subscriptions: Subscription[] = []` sur MassificationModalComponent et SimulationModalComponent
  // recherche bon de travail
  this.orgChangeSubscription?.unsubscribe();
  this.orgChangeSubscription = this.api.getDistAppsByEnvOrg(q).pipe(take(1)).subscribe(...);
  // parametre-edition-colonne
  this.subscriptions.push(this.apiParametresService.getCodeOrgOGUR().pipe(take(1)).subscribe(r => this.genericOrg = r.data.getCodeOrgOGUR));
  // file-upload.service
  return this.apiNoticesService.getNoticePdf(codnot).pipe(take(1), map(...));
  ```
  À terme, pour du one-shot, exposer `apollo.query()` au lieu de `watchQuery().valueChanges` dans les services API.

#### [PROD-C2] Recréation des headers et floating filters à chaque recherche : amplification de la fuite connue via `FilterSharedDataService`
- **Fichier(s)** :
  - Appels à `AgGridUtil.resetFilterAndColumnSort` (qui fait `refreshHeader()`) :
    - `produit/fond-page/reference/distribution-reference/distribution-reference.component.ts:83`
    - `produit/distribution/parametre-edition/parametre-edition-colonne/parametre-edition-colonne/parametre-edition-colonne.component.ts:256`
    - `produit/distribution/parametre-edition/distribution-parametre-edition/distribution-parametre-edition.component.ts:221`, `:418`
    - `produit/distribution/exemplaires/distribution-exemplaires/distribution-exemplaires.component.ts:185`
    - `produit/notice/affectation-notice/affectation-notice.component.ts:161`
    - `produit/fichier/fichiers.component.ts:258`
    - `exploitation-editique/controle-integrite-prod/controle-integrite-prod.component.ts:81`
    - `exploitation-editique/bon-travail-manuel/bon-travail-manuel.component.ts:89`
    - `exploitation-editique/reedition/reedition-massification/reedition-massification.component.ts:193`
    - `exploitation-editique/reedition/reedition-ressource/reedition-ressource.component.ts:259`
    - `exploitation-editique/reedition/reedition-produit/reedition-produit.component.ts:155`
    - `exploitation-editique/consolidation-facturation/consolidation-facturation.component.ts:260`
    - `exploitation-editique/massification/massification.component.ts:153`
  - `columnDefs` réassignées à chaque recherche (reconstruction complète des headers) :
    - `produit/distribution/parametre-edition/parametre-edition-colonne/parametre-edition-colonne/parametre-edition-colonne.component.ts:128-131`
    - `produit/commande/modal/compare-modal/compare-modal/compare-modal.component.ts:150-151`
  - `updateData(false)` émis sur le BehaviorSubject root à la destruction :
    - `produit/destinataire/popup/popup-formulaire-creation/popup-formulaire-creation.component.ts:50-52`
    - `produit/adresse-retour/modal/modal-add-adress/modal-add-adress.component.ts:61-63`
    - `produit/commande/modal/add-modal/add-commande-modal/add-commande-modal.component.ts:282-284`
    - `produit/fond-page/reference/popup/modal-component/modal-imprime.component.ts:57-59`
    - `produit/distribution/parametre-edition/popup/modal-component/modal-component.component.ts:205-207`
    - `exploitation-editique/massification/service/tableau/components/tableau-massification.component.ts:245-248`
- **Gravité** : Critique
- **Type** : Fuite mémoire / DOM excessif / CPU
- **Cause** :
  ```ts
  static resetFilterAndColumnSort(gridApi) { gridApi.setFilterModel(null); gridApi.onFilterChanged(); gridApi.refreshHeader(); gridApi.resetColumnState(); }
  ```
  - Chaque recherche recrée tous les headers et floating filters, qui restent abonnés à `FilterSharedDataService`.
  - Chaque `updateData(false)` réveille ensuite tous les abonnés accumulés, y compris ceux des grilles déjà détruites.
- **Impact** :
  - Les nœuds DOM croissent par paliers à chaque recherche : c'est le « escalier » observé.
  - La fermeture d'une modale coûte de plus en plus cher en CPU (pics qui s'élargissent).
  - Sur Massification et Paramètres par ressource, le phénomène se déclenche à chaque changement de sélection (voir [H3]).
- **Solution** : côté appelants (périmètre), ne réinitialiser que si nécessaire et sans `refreshHeader`.
  ```ts
  private resetGrid(): void {
    const api = this.gridApi;
    if (!api || api.isDestroyed()) { return; }
    if (api.isAnyFilterPresent()) { api.setFilterModel(null); }   // déclenche déjà onFilterChanged
    api.resetColumnState();                                        // pas de refreshHeader()
  }
  ```
  - Supprimer `refreshHeader()` de `AgGridUtil`.
  - Dans les floating filters et headers (hors périmètre), utiliser `takeUntilDestroyed()` et `destroy()`.
  - Pour `parametre-edition-colonne`, ne réassigner `columnDefs` que si la liste des ressources a changé :
  ```ts
  tap(data => { const key = resources.join('|'); if (key !== this.lastResKey) { this.lastResKey = key; this.columnDefs = ...; } })
  ```

#### [PROD-C3] Master/detail avec une grille ag-grid complète imbriquée par ligne dépliée, recréée à chaque redraw ou rechargement
- **Fichier(s)** :
  - `produit/adresse-retour/adresse-retour.component.ts:80-85` (`masterDetail` + `detailCellRenderer = DetailAdresseRetourComponent`), `:89-91` (`triggerMethod$` → `appelServiceApi()`), `:327-328` (`redrawRows`), `:349-354`, `:366` (`rowData` entièrement réassignée), `:395-399`
  - `produit/adresse-retour/detail-adresse-retour/detail-adresse-retour.component.html:3-17` (`<app-tableau>` dans chaque ligne de détail)
  - `produit/adresse-retour/detail-adresse-retour/detail-adresse-retour.component.ts:57-68`, `:124`, `:140-144` (pas de `ngOnDestroy`)
- **Gravité** : Haute
- **Type** : DOM excessif / Fuite mémoire / CPU
- **Cause** :
  - Chaque ligne dépliée instancie une grille complète : headers, colonnes d'action et composants du tableau.
  - Sans `keepDetailRows`, et à chaque `redrawRows()` ou réassignation de `rowData`, ag-grid détruit puis recrée toutes ces grilles.
  - Chaque action dans un détail appelle `callOtherComponentMethod()`, ce qui recharge toute la liste.
- **Impact** : chaque dépliage, scroll ou suppression produit N grilles neuves, et leurs headers fuient selon le mécanisme de [C2].
- **Solution** :
  ```ts
  this.gridOptions = { ...cfg, masterDetail: true, keepDetailRows: true, keepDetailRowsCount: 5,
                       getRowId: p => `${p.data.code}|${p.data.codeOrganisme}` };
  // après suppression :
  this.gridApi.applyTransaction({ remove: event });   // sans redrawRows()
  // après une action dans un détail : mettre à jour la seule ligne maître
  this.gridApi.applyTransaction({ update: [updatedRow] });
  ```
  Pour la grille de détail : `floatingFilter: false` sur `defaultColDef` et pas de colonnes d'action inutiles.

#### [PROD-H1] Souscriptions `watchQuery` qui s'accumulent tant que la page est ouverte (une par action)
- **Fichier(s)** :
  - `produit/commande/commande.component.ts:447-465` (`getPreselectedData(...).subscribe(...)` sans `take`, à chaque « Valider »)
  - `exploitation-editique/reedition/reedition-massification/reedition-massification.component.ts:125-127` (`getAllParamsAdelaide()` sans `take`, à chaque clic « Valider »)
  - `produit/distribution/parametre-edition/parametre-edition-colonne/parametre-edition-colonne/parametre-edition-colonne.component.ts:227` (`getAsyncAPIsForParametreEdition()` sans `take`)
- **Gravité** : Haute
- **Type** : Fuite mémoire
- **Cause** : ces souscriptions sont poussées dans `subscriptions[]`, donc libérées seulement à la destruction. D'ici là, chaque `ObservableQuery` garde son résultat complet (toute la liste des commandes, par exemple).
- **Impact** : le heap croît proportionnellement au nombre de recherches sur la page.
- **Solution** :
  ```ts
  this.apiAdelaideCommandeService.getPreselectedData(envs, orgs, app).pipe(take(1)).subscribe(...)
  this.apiService.parametreService.getAllParamsAdelaide().pipe(take(1), map(...), switchMap(...)).subscribe(...)
  ```

#### [PROD-H2] `redrawRows()` complet et systématique : destruction et recréation de tous les renderers Angular
- **Fichier(s)** :
  - `exploitation-editique/massification/massification.component.ts:143` (à chaque clic sur une ligne), `:149`, `:259`
  - `produit/notice/affectation-notice/affectation-notice.component.ts:202`, `:253-254`, `:343-344` (`refreshCells({force:true})` + `redrawRows()` à chaque recherche)
  - `produit/fond-page/reference/distribution-reference/distribution-reference.component.ts:158` (appelé dans une boucle `forEachNode` à `:200-211`)
  - `exploitation-editique/reedition/reedition-ressource/reedition-ressource.component.ts:294`, `:299` (appelé avant même l'arrivée des données)
  - `produit/destinataire/destinataire.component.ts:137`
  - `produit/adresse-retour/adresse-retour.component.ts:328`
  - `produit/adresse-retour/modal/modal-add-adresse-fichier/modal-add-adresse-fichier.component.ts:265`
  - `produit/commande/commande.component.ts:327`
  - `produit/papaad/papaad.component.ts:171`
  - `produit/fond-page/imprime/distribution-imprime/distribution-imprime.component.ts:150`
  - `produit/notice/tableau-notice/tableau-notice.component.ts:114`
  - `produit/fichier/fichiers.component.ts:390`
  - `exploitation-editique/bon-travail-manuel/bon-travail-manuel.component.ts:191`
  - `exploitation-editique/bon-travail-manuel/modal/creation-bon-travail-manuel-modal/creation-bon-travail-manuel-modal.component.ts:112`
  - `exploitation-editique/reedition/reedition-massification/reedition-massification.component.ts:147`
- **Gravité** : Haute
- **Type** : CPU / DOM excessif
- **Cause** :
  ```ts
  onRowClicked(e) { ...; this.gridApi.redrawRows(); }            // massification
  this.gridApi.applyTransaction({ remove: event }); this.gridApi.redrawRows();
  ```
  - Dans ces grilles, chaque cellule est un composant Angular (`InputEditorComponent`, `InterrupteurRadioComponent`, `SelectEditorComponent`, soit 22 colonnes sur Papaad).
  - `applyTransaction` rafraîchit déjà ce qu'il faut, donc le `redrawRows()` ajouté est redondant.
- **Impact** : longues tâches sur le thread principal, ramasse-miettes (GC) intensif, et churn de composants qui alimente les fuites des renderers.
- **Solution** :
  ```ts
  // suppression : applyTransaction suffit
  this.gridApi.applyTransaction({ remove: event });
  // massification : ne redessiner que les 2 lignes concernées
  const prev = this.lastClickedNode; this.lastClickedNode = event.node;
  this.gridApi.redrawRows({ rowNodes: [prev, event.node].filter(Boolean) });
  // affectation-notice : refreshCells ciblé, sans redrawRows
  this.gridApi.refreshCells({ rowNodes: modifiedNodes, force: true });
  ```

#### [PROD-H3] Recherche automatique à chaque changement de champ : requête et reset des headers à chaque sélection
- **Fichier(s)** :
  - `exploitation-editique/massification/search/search-massification.component.ts:85-101`, `:157`, `:249-252` (7 `valueChanges` → `buildMasutiOptionsAndValid()` → `valider()`)
  - `exploitation-editique/bon-travail-manuel/search/search-bon-travail-manuel/search-bon-travail-manuel.component.ts:160`
  - `exploitation-editique/reedition/reedition-massification/search/massificationsearch/massificationsearch.component.ts:100`
  - `exploitation-editique/reedition/reedition-produit/search/produitsearch/produitsearch.component.ts:72`
  - `exploitation-editique/reedition/reedition-ressource/search/search/search.component.ts:73`
- **Gravité** : Haute
- **Type** : Réseau / CPU / Fuite mémoire (via [C2])
- **Cause** :
  ```ts
  this.subscriptions.push(this.formApp.valueChanges.pipe(debounceTime(DELAI_VALUE_CHANGE)).subscribe(() => this.buildMasutiOptionsAndValid()));
  // ... idem pour com, fic, periode, codcli, codsit → this.isFormValid() && this.valider();
  ```
  - Chaque contrôle a son propre `debounce`. Une cascade de `reset(..., {emitEvent:true})` (env → app → …) déclenche donc plusieurs recherches.
  - Chaque recherche passe par `resetFilterAndColumnSort`.
- **Impact** : rafales de requêtes et une recréation complète des headers par clic dans les listes déroulantes.
- **Solution** : fusionner les flux et dédupliquer.
  ```ts
  this.subscriptions.push(
    this.form.valueChanges.pipe(debounceTime(DELAI_VALUE_CHANGE),
      map(() => this.form.getRawValue()),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      filter(() => this.form.valid))
    .subscribe(() => this.valider()));
  ```
  Autre option : ne lancer la recherche que sur le bouton « Rechercher ».

#### [PROD-H4] Méthodes de template qui modifient le formulaire (`patchValue`) à chaque cycle de détection de changements
- **Fichier(s)** :
  - `exploitation-editique/reedition/reedition-produit/add-modal/add-reedition-produit-modal.component.html:32,48,64` → `.ts:131-150` (`patchValue` avec `emitEvent` par défaut à `true`)
  - `exploitation-editique/reedition/reedition-ressource/add-exemplaire-modal/add-exemplaire-modal.component.html:25,41` → `.ts:103-115`
  - `exploitation-editique/reedition/reedition-massification/search/massificationsearch/massificationsearch.component.html:70` → `.ts:199-208`
  - `exploitation-editique/reedition/reedition-produit/search/produitsearch/produitsearch.component.html:89` → `.ts:240-251`
  - `produit/adresse-retour/modal/modal-add-adress/modal-add-adress.component.html:79,93-94` → `.ts:189-200` (3 appels par cycle, avec une clé `organisme` qui n'existe pas)
  - `produit/fond-page/reference/search/imprime-search-component.component.html:17,29` → `imprime-search-component.ts:158-170`
  - `produit/commande/modal/add-modal/add-commande-modal/add-commande-modal.component.html:59,71` → `.ts:127-132` (renvoie un `new FormGroup({})` à chaque cycle), `:196-201`
- **Gravité** : Haute
- **Type** : Change detection / CPU
- **Cause** :
  ```html
  [form]="getSitesControl()"
  ```
  ```ts
  getSitesControl() { if (this.codeSite) { this.formGroup.patchValue({ site: ... }); } return this.formGroup.get('site'); }
  getOrganismesControl() { if (!this.codeEnvironnement || !this.codeApplication) { return new FormGroup({}); } ... }
  ```
- **Impact** :
  - Validation, émission de `valueChanges` et risque d'`ExpressionChangedAfterItHasBeenChecked` à chaque cycle (souris, clavier, timers).
  - Avec `new FormGroup({})`, l'`@Input` change à chaque cycle, donc l'arbre hiérarchisé enfant se reconstruit en boucle.
- **Solution** : calculer la valeur sur l'événement et lier le contrôle stable.
  ```ts
  onChangeSite(code) { this.codeSite = code;
    this.formGroup.get('site').setValue(this.sites.some(s => s.value == code) ? code : '', { emitEvent: false });
    this.refreshRessources(); }
  ```
  ```html
  [form]="formGroup.get('site')"
  ```
  ```ts
  private readonly emptyOrgGroup = new FormGroup({});                        // add-commande-modal
  get orgControl() { return this.codeEnvironnement && this.codeApplication ? this.orgGroup : this.emptyOrgGroup; }
  ```

#### [PROD-H5] Paramètres d'édition par ressource : colonnes dynamiques lourdes et recalcul O(lignes × ressources × recherches)
- **Fichier(s)** :
  - `produit/distribution/parametre-edition/parametre-edition-colonne/service/tableau-parametre-edition-colonne.service.ts:139-146` (4 colonnes par ressource), `:151-309` (`cellRendererParams`, `valueGetter` et `cellClass` qui appellent tous `getResourceFromExemplaire`), `:383-385` (`.find`), `:279-281` (un floating filter par ressource)
  - `produit/distribution/parametre-edition/parametre-edition-colonne/parametre-edition-colonne/parametre-edition-colonne.component.ts:264-284` (`refreshCells` appelé une fois par nœud dans `forEachNode`)
- **Gravité** : Haute
- **Type** : DOM excessif / CPU
- **Cause** :
  ```ts
  cellRendererParams: params => { const resource = this.getResourceFromExemplaire(params.data.ressources, codres, codsit, codgam); ... }
  this.gridApi.forEachNode(node => { ...; this.gridApi.refreshCells({ rowNodes: [node], force: true, columns: [colId] }); });
  ```
  Chaque cellule est un composant Angular (`CheckboxComponent`, `InterrupteurRadioComponent`, `SelectTableEditorComponent`).
- **Impact** : des milliers de composants et de `.find()` par rendu, et N rafraîchissements pour une seule case à cocher d'en-tête.
- **Solution** :
  ```ts
  // indexer une fois par ligne (dans le map de rowData$)
  row.resByKey = new Map(row.ressources.map(r => [`${r.codres}|${r.codsit}|${r.codgam}`, r]));
  const res = params.data.resByKey.get(`${codres}|${codsit}|${codgam}`);
  // toggle : un seul refresh
  const nodes: IRowNode[] = []; this.gridApi.forEachNode(n => { if (...) { this.checkboxStates[key] = checked; nodes.push(n); } });
  this.gridApi.refreshCells({ rowNodes: nodes, columns: [colId], force: true, suppressFlash: true });
  ```
  Réassigner `columnDefs` seulement si les ressources changent (voir [C2]).

#### [PROD-H6] URL de blob (`URL.createObjectURL`) jamais révoquées
- **Fichier(s)** :
  - `produit/notice/service/file-upload.service.ts:34`
  - `exploitation-editique/massification/massification.component.ts:440` et `:504`, qui appellent `generateFileService.downloadPdfFromBase64` (`services/generate-file.service.ts:421`, hors périmètre, non révoquée)
- **Gravité** : Haute
- **Type** : Fuite mémoire
- **Cause** :
  ```ts
  const blob = new Blob([byteArray], { type: 'application/pdf' }); return URL.createObjectURL(blob);
  ```
- **Impact** : chaque PDF ouvert (notice, bilan de massification ou de simulation) reste en mémoire jusqu'au rechargement de la page.
- **Solution** :
  ```ts
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  ```
  Dans `getPdfFilePath`, ajouter `take(1)` (voir [C1]). Dans `downloadPdfFromBase64`, ne garder que `FileSaver.saveAs` ou révoquer l'URL.

#### [PROD-M1] Émetteurs `@Output` de modales abonnés dans `subscriptions[]` : chaque modale fermée reste retenue
- **Fichier(s)** :
  - `produit/distribution/parametre-edition/distribution-parametre-edition/distribution-parametre-edition.component.ts:386-390`, `:399-414`, `:470-489` (4 souscriptions par ouverture de modale)
  - `produit/notice/affectation-notice/affectation-notice.component.ts:146-150`
  - `produit/fond-page/reference/distribution-reference/distribution-reference.component.ts:169-185`
- **Gravité** : Moyenne
- **Type** : Fuite mémoire
- **Cause** :
  ```ts
  this.subscriptions.push(modalRef.componentInstance.updateMasse.subscribe(d => this.updateMasseExemplaire(d, modalRef)));
  ```
  Le tableau parent garde le subscriber, dont la closure garde `modalRef`, qui garde le `ComponentRef` et le DOM détaché de la modale. Cela dure jusqu'à la destruction de la page.
- **Impact** : les nœuds DOM augmentent à chaque ouverture de modale sur ces pages.
- **Solution** :
  ```ts
  const end$ = merge(modalRef.closed, modalRef.dismissed);
  modalRef.componentInstance.updateMasse.pipe(takeUntil(end$)).subscribe(d => this.updateMasseExemplaire(d, modalRef));
  ```
  Ne pas pousser ces souscriptions dans `subscriptions[]`.

#### [PROD-M2] Getters de template coûteux évalués à chaque cycle de détection de changements
- **Fichier(s)** :
  - `exploitation-editique/massification/service/tableau/components/tableau-massification.component.html:26,31,48,51,55` → `.ts:250-277` (`getSelectedNodes()`, `Set`, `map`, 5 fois par cycle)
  - `exploitation-editique/reedition/reedition-massification/reedition-massification.component.html:24` / `.ts:165`
  - `exploitation-editique/reedition/reedition-produit/reedition-produit.component.html:21` / `.ts:184`
  - `exploitation-editique/reedition/reedition-ressource/reedition-ressource.component.html:21` / `.ts:187`
  - `exploitation-editique/controle-integrite-prod/controle-integrite-prod.component.html:26` / `.ts:105`
  - `produit/adresse-retour/modal/modal-add-adresse-fichier/modal-add-adresse-fichier.component.html:79` / `.ts:269`
  - `produit/notice/affectation-notice/modal/modal-ajout/modal-ajout.component.html:40` / `.ts:206`
  - `produit/notice/affectation-notice/affectation-notice.component.html:45` / `.ts:347`
  - `produit/distribution/parametre-edition/parametre-edition-colonne/parametre-edition-colonne/parametre-edition-colonne.component.html:9` / `.ts:153`
  - `produit/commande/modal/compare-modal/compare-modal/compare-modal.component.html:8` (`gridHeight()`)
  - `produit/fichier/details/details.component.html:38,67,96` (`getTectByValue`, dans chaque ligne de détail)
  - `produit/fichier/modal/step-exemplaire/step-exemplaire.component.html:5,13`
  - `produit/fichier/modal/step-generalite/step-generalite.component.html:5,13`
- **Gravité** : Moyenne
- **Type** : Change detection / CPU
- **Cause** :
  ```html
  [disableValiderBtn]="isValiderDisabled()"
  ```
  → `!this.gridApi?.getSelectedRows().length`
- **Impact** : travail répété à chaque événement (ag-grid en génère beaucoup), qui croît avec la sélection.
- **Solution** :
  ```ts
  gridOptions.onSelectionChanged = e => { this.selectedCount = e.api.getSelectedNodes().length; this.groupsSelected = ...; };
  ```
  ```html
  [disableValiderBtn]="!selectedCount"
  ```

#### [PROD-M3] Recherches linéaires imbriquées dans le mapping des lignes et dans les exports
- **Fichier(s)** :
  - `produit/fichier/fichiers.component.ts:456`, `:657` (`this.allOrgReg.filter(n => n.code == e.codeOrg)[0]` pour chaque ligne)
  - `produit/destinataire/destinataire.component.ts:91`
  - `produit/distribution/exemplaires/distribution-exemplaires/distribution-exemplaires.component.ts:177`, `:204`
  - `produit/distribution/parametre-edition/distribution-parametre-edition/distribution-parametre-edition.component.ts:442`, `:456-458`
  - `produit/commande/commande.component.ts:257-259`, `:423`
  - `produit/distribution/parametre-edition/parametre-edition-colonne/parametre-edition-colonne/parametre-edition-colonne.component.ts:121`, `:142-144`
  - `produit/fond-page/imprime/distribution-imprime/distribution-imprime.component.ts:108-109`, `:135-136`
  - `produit/adresse-retour/adresse-retour.component.ts:383`
- **Gravité** : Moyenne
- **Type** : CPU
- **Cause** : un `filter()` sur tout le référentiel des organismes pour chaque ligne, soit O(n×m).
- **Impact** : longues tâches sur les gros jeux de données (recherche et export).
- **Solution** :
  ```ts
  const regByOrg = new Map(this.allOrgReg.map(o => [o.code, o.codeRegion]));
  this.rowData = data.map(e => ({ ...e, codeRegion: regByOrg.get(e.codeOrg), collapse: '' }));
  ```

#### [PROD-M4] Génération PDF (pdfmake) et Excel (exceljs) sur le thread principal, sur de gros volumes
- **Fichier(s)** :
  - `produit/fichier/fichiers.component.ts:427-480` (refait en plus toute la requête `preselectedData` à `:453-455`)
  - `exploitation-editique/consolidation-facturation/consolidation-facturation.component.ts:392-423` (`getCellValue` pour chaque cellule)
  - `exploitation-editique/reedition/reedition-produit/reedition-produit.component.ts:348-376`
  - `exploitation-editique/reedition/reedition-ressource/reedition-ressource.component.ts:307-348`
  - `produit/adresse-retour/adresse-retour.component.ts:225-299`
  - `produit/commande/commande.component.ts:352-382`
  - `produit/destinataire/destinataire.component.ts:165-178`
  - `produit/distribution/exemplaires/distribution-exemplaires/distribution-exemplaires.component.ts:117-155`
  - `produit/distribution/parametre-edition/distribution-parametre-edition/distribution-parametre-edition.component.ts:323-336`
  - `produit/fond-page/imprime/distribution-imprime/distribution-imprime.component.ts:81-94`
  - `produit/papaad/papaad.component.ts:203-216`
  - `produit/commande/modal/compare-modal/compare-modal/compare-modal.component.ts:180-190`
- **Gravité** : Moyenne
- **Type** : CPU
- **Cause** : `this.generateFileService[fileServiceMap[event.type]](data, headers, title)`. pdfmake (`createPdf`) et exceljs (`addRow` puis `writeBuffer`) sont synchrones jusqu'à 130 000 lignes (limite fixée dans `generate-file.service.ts:236`).
- **Impact** : l'interface se fige pendant plusieurs secondes, avec des pics CPU et mémoire.
- **Solution** :
  - Déporter la génération dans un Web Worker :
  ```ts
  const worker = new Worker(new URL('./export.worker', import.meta.url), { type: 'module' });
  worker.postMessage({ type: event.type, data, headers, title });
  worker.onmessage = ({ data: blob }) => { FileSaver.saveAs(blob, name); worker.terminate(); };
  ```
  - Pour Fichiers, réutiliser les nœuds de la grille (`forEachNodeAfterFilterAndSort`) au lieu de relancer la requête.
  - Plafonner le volume PDF, par exemple à environ 5 000 lignes.

#### [PROD-M5] Appels réseau redondants ou en cascade
- **Fichier(s)** :
  - `produit/fond-page/imprime/distribution-imprime/distribution-imprime.component.ts:125-139` (recharge tous les imprimés pour filtrer côté client)
  - `produit/fichier/fichiers.component.ts:140-218`, `:666-705` (cascade `reset(..., {emitEvent:true})` sur env → org → app → commande → fichier, soit jusqu'à 4 requêtes pour une seule action)
  - `produit/distribution/parametre-edition/distribution-parametre-edition/distribution-parametre-edition.component.ts:511`, `:541`, `:553`, `:637` (`validerPreselection()`, qui recharge toute la grille après une modification d'une seule cellule)
  - `produit/notice/tableau-notice/tableau-notice.component.ts:192` (recherche complète après chaque mise à jour d'une notice)
  - `produit/adresse-retour/adresse-retour.component.ts:89-91`, `:395-399` (rechargement complet, voir [C3])
- **Gravité** : Moyenne
- **Type** : Réseau / CPU
- **Cause** : l'application recharge des listes entières là où une mise à jour locale suffirait, et enchaîne des `emitEvent: true` qui déclenchent des requêtes en cascade.
- **Impact** : latence, et reconstruction complète des nœuds de lignes à chaque fois (pas de `getRowId`).
- **Solution** :
  ```ts
  // imprimés : filtrer localement
  lister(f: string) { this.gridApi.setGridOption('quickFilterText', f); }   // ou filtrer this.allImprimes en cache
  // mise à jour d'une cellule : transaction ciblée
  this.gridApi.applyTransaction({ update: [row] });
  // dans createGridConfiguration : getRowId pour des mises à jour delta lors des réassignations de rowData
  getRowId: p => p.data.id ?? [p.data.codenv, p.data.codorg, p.data.codapp, p.data.codcom, p.data.codfic].join('|')
  ```
  Dans les cascades de formulaires, utiliser `emitEvent: false` et appeler explicitement l'étape suivante.

#### [PROD-M6] Consolidation facturation : recalculs complets à chaque filtre
- **Fichier(s)** : `exploitation-editique/consolidation-facturation/consolidation-facturation.component.ts:169-210` (`onFilterChanged` et `onRowDataUpdated` → `getDynamicColumnFields()` avec `reduce` et `includes` sur toutes les lignes, plus la ligne épinglée), `:249-250` (`rowData` et `facturation`, deux copies des données), `:58`, `:138-144` (`editedCells` garde des `IRowNode` d'une recherche à l'autre, vidé seulement après une validation réussie)
- **Gravité** : Moyenne
- **Type** : CPU / Fuite mémoire
- **Cause** :
  ```ts
  this.gridOptions.onFilterChanged = this.updateRowData.bind(this);
  ```
  Chaque frappe dans un filtre refait un parcours O(n×k) de toutes les lignes.
- **Impact** : saisie de filtre lente sur les gros volumes, et nœuds de l'ancienne recherche retenus.
- **Solution** : calculer `dynamicFields` une seule fois dans le `subscribe` de la recherche, et faire `this.editedCells = []` au début de `listConsolidationFacturation`.
  ```ts
  this.dynamicFields = [...new Set(this.facturation.flatMap(r => Object.keys(r).filter(k => (k.startsWith('cout') || k.startsWith('plis')) && r[k] !== null)))];
  ```

#### [PROD-M7] Effets de bord (`setValue`) dans des `tap` d'observables consommés par le pipe `async`
- **Fichier(s)** :
  - `exploitation-editique/consolidation-facturation/search/search-consolidation-facturation.component.ts:127-133`, `:145-151` (`optionsApp$`, `optionsPer$`)
  - `produit/distribution/parametre-edition/parametre-edition-colonne/search/search-parametre-edition-colonne/search-parametre-edition-colonne.component.ts:142-148`, `:162-168`, `:195-202`
- **Gravité** : Moyenne
- **Type** : Change detection / Réseau
- **Cause** :
  ```ts
  tap(opts => this.formApp.setValue(..., { emitEvent: true }))
  ```
  Ce `tap` s'exécute pendant le rendu du template (souscription du pipe `async`) et déclenche la requête suivante de la chaîne.
- **Impact** : passes de détection de changements supplémentaires, cascades de requêtes et risque d'`ExpressionChanged…`.
- **Solution** : souscrire explicitement dans `ngOnInit` (avec `takeUntilDestroyed`), stocker les options dans des champs, et limiter le template à un binding pur.

#### [PROD-M8] `TableauNoticeService` : réassignation complète de `rowData` à partir des seuls nœuds rendus, et `rowDataUpdated` émis sur chaque modification de cellule
- **Fichier(s)** : `produit/notice/service/tableau-notice.service.ts:352-356`, `:258`, `:293`
- **Gravité** : Moyenne
- **Type** : CPU / DOM excessif
- **Cause** :
  ```ts
  const rowsData = [...param.api.getRenderedNodes()].filter(...);
  param.api.setGridOption('rowData', rowsData.map(n => n.data));
  ```
  ```ts
  params.api.dispatchEvent({ type: 'rowDataUpdated' })
  ```
- **Impact** : la grille est entièrement recréée. Avec la virtualisation, les lignes non affichées sont en plus perdues (bug fonctionnel). Tous les listeners `rowDataUpdated` s'exécutent à chaque modification de cellule.
- **Solution** :
  ```ts
  param.api.applyTransaction({ remove: [param.node.data] });
  // et appeler this.tableauModifiableService / l'état du formulaire au lieu de dispatchEvent('rowDataUpdated')
  ```

#### [PROD-B1] Sélecteur de fichier créé dynamiquement sans gestion de l'annulation : l'Observable ne se termine jamais
- **Fichier(s)** : `produit/notice/service/file-upload.service.ts:18-27`, `:83-102` (et `:62-78`, `:105-120` : `throw` dans `catchError` sans gestionnaire d'erreur)
- **Gravité** : Basse
- **Type** : Fuite mémoire
- **Cause** : un `document.createElement('input')` avec seulement `onchange`. Si l'utilisateur annule, `fileSubject` ne se termine jamais et l'appelant reste abonné.
- **Impact** : souscriptions pendantes, et erreurs non gérées en console.
- **Solution** :
  ```ts
  inputFile.addEventListener('cancel', () => observer.complete(), { once: true });
  return () => { inputFile.onchange = null; };           // teardown
  ```
  Dans `uploadToServer`, remplacer `throw error` par `return EMPTY`.

#### [PROD-B2] `setTimeout` non nettoyés
- **Fichier(s)** :
  - `exploitation-editique/reedition/reedition-ressource/reedition-ressource.component.ts:274-282` (300 ms, utilise `gridApi` qui peut avoir été détruit entre-temps)
  - `produit/adresse-retour/modal/modal-add-adress/modal-add-adress.component.ts:111-116`
- **Gravité** : Basse
- **Type** : CPU / Fuite mémoire
- **Cause** :
  ```ts
  setTimeout(() => { this.gridApi.forEachNode(...); this.nombreRessourceTotal = countLigne; }, 300);
  ```
- **Solution** :
  ```ts
  gridOptions.onRowDataUpdated = e => { let n = 0; e.api.forEachNode(r => r.hasChildren() && n++); this.nombreRessourceTotal = n; };
  ```

#### [PROD-B3] Service root décoré `@AutoUnsubscribe` avec un tableau `subscriptions` qui ne fait que grossir
- **Fichier(s)** : `produit/distribution/parametre-edition/service/tableau-parametre-edition.service.ts:21-29`, `:421-442`
- **Gravité** : Basse
- **Type** : Fuite mémoire
- **Cause** : un service `providedIn: 'root'` n'est jamais détruit. Chaque mise à jour de cellule pousse une souscription dans le tableau, jamais vidé. Les closures sont libérées quand la mutation se termine, mais les objets subscriber restent.
- **Solution** : supprimer le tableau et le décorateur ; `this.apiAdelaideService.updateExemplaire(dto).subscribe({...})` suffit, puisque les mutations se terminent seules.

#### [PROD-B4] Réinitialisation manuelle de `app-tableau` à chaque recherche
- **Fichier(s)** : `produit/notice/affectation-notice/affectation-notice.component.ts:178` (`this.tableauComponent.ngOnInit()`)
- **Gravité** : Basse
- **Type** : CPU
- **Cause** : l'appel réaffecte les handlers de `gridOptions` et recalcule les boutons. J'ai vérifié : c'est une affectation, pas un cumul.
- **Solution** : supprimer l'appel. S'il faut rafraîchir les boutons, exposer une méthode dédiée `refreshButtons()`.

#### [PROD-B5] Onglets Bootstrap cachés mais rendus, et `*ngFor` + `keyvalue` sans `trackBy`
- **Fichier(s)** :
  - `produit/distribution/parametre-edition/popup/modal-update/modal-update.component.html:67-201` (4 panneaux rendus et 3 `*ngFor` sur `adminExemplaires`)
  - `produit/fichier/modal/edit-modal/edit-modal/edit-modal.component.html:50-232`
  - `produit/fond-page/reference/popup/modal-component/modal-imprime.component.html:3`, `edit-modal.component.html:216`, `produit/fichier/modal/organisme-client-modal/organisme-client-modal.component.html:7` (`form.controls | keyvalue`)
- **Gravité** : Basse
- **Type** : DOM excessif / Change detection
- **Cause** : `data-bs-toggle` sans `*ngIf`. `keyvalue` recrée un tableau trié à chaque cycle.
- **Solution** :
  ```html
  <div *ngIf="isOngletSiteActif" class="tab-pane show active">...</div>
  <div *ngFor="let item of form.controls | keyvalue; trackBy: trackByKey">
  ```
  ```ts
  trackByKey = (_: number, i: KeyValue<string, AbstractControl>) => i.key;
  ```

---

### Tableau récapitulatif

| ID | Titre | Gravité | Type | Fichiers principaux |
|---|---|---|---|---|
| PROD-C1 | `watchQuery` jamais terminées qui survivent au composant | Critique | Fuite mémoire | massification-modal:52,67 ; simulation-modal:30 ; search-bon-travail-manuel:90 ; parametre-edition-colonne:137 ; file-upload.service:29-36 |
| PROD-C2 | `resetFilterAndColumnSort`/`refreshHeader` et `columnDefs` réassignées à chaque recherche, `updateData(false)` qui réveille les abonnés fuités | Critique | Fuite / DOM / CPU | 14 appels à `resetFilterAndColumnSort` (13 fichiers) + 2 réassignations de `columnDefs` + 6 `ngOnDestroy` de modales |
| PROD-C3 | Master/detail avec grille ag-grid imbriquée recréée à chaque fois | Haute | DOM / Fuite / CPU | adresse-retour:80-85,328,366 ; detail-adresse-retour |
| PROD-H1 | `watchQuery` sans `take(1)` qui s'accumulent pendant la vie de la page | Haute | Fuite mémoire | commande:447 ; reedition-massification:125 ; parametre-edition-colonne:227 |
| PROD-H2 | `redrawRows()` complet et systématique | Haute | CPU / DOM | massification:143 (clic sur ligne) + 16 autres appels |
| PROD-H3 | Recherche automatique à chaque changement de champ | Haute | Réseau / CPU | search-massification:85-101 ; 4 autres recherches |
| PROD-H4 | `patchValue` ou `new FormGroup` dans des méthodes de template | Haute | Change detection | 7 composants (modales reedition, adresses retour, commande, recherches) |
| PROD-H5 | Colonnes dynamiques par ressource, `find()` par cellule, `refreshCells` en boucle | Haute | DOM / CPU | tableau-parametre-edition-colonne.service ; parametre-edition-colonne:264 |
| PROD-H6 | `createObjectURL` jamais révoqué | Haute | Fuite mémoire | file-upload.service:34 ; massification:440,504 |
| PROD-M1 | `@Output` de modales poussés dans `subscriptions[]`, modales retenues | Moyenne | Fuite mémoire | distribution-parametre-edition:386,399,470-489 ; affectation-notice:146 ; distribution-reference:169 |
| PROD-M2 | Getters coûteux dans les templates (`getSelectedNodes`, etc.) | Moyenne | Change detection | tableau-massification + 12 autres |
| PROD-M3 | Recherches O(n×m) dans le mapping des lignes | Moyenne | CPU | fichiers:456,657 + 7 fichiers |
| PROD-M4 | PDF/Excel générés sur le thread principal | Moyenne | CPU | 12 méthodes `export()` |
| PROD-M5 | Rechargements complets et requêtes en cascade | Moyenne | Réseau | distribution-imprime:125 ; fichiers:140-218 ; distribution-parametre-edition:511… |
| PROD-M6 | Consolidation : recalcul à chaque filtre, `editedCells` retenu | Moyenne | CPU / Fuite | consolidation-facturation:169-210,249 |
| PROD-M7 | Effets de bord dans des `tap` consommés par `async` | Moyenne | Change detection | search-consolidation-facturation ; search-parametre-edition-colonne |
| PROD-M8 | `setGridOption('rowData', getRenderedNodes)` et `rowDataUpdated` manuel | Moyenne | CPU / DOM | tableau-notice.service:258,293,352 |
| PROD-B1 | Sélecteur de fichier dynamique sans gestion de l'annulation | Basse | Fuite mémoire | file-upload.service:83-102 |
| PROD-B2 | `setTimeout` non nettoyés | Basse | CPU / Fuite | reedition-ressource:274 ; modal-add-adress:111 |
| PROD-B3 | Service root `@AutoUnsubscribe` avec tableau qui grossit | Basse | Fuite mémoire | tableau-parametre-edition.service:21,421 |
| PROD-B4 | Appel manuel de `tableauComponent.ngOnInit()` | Basse | CPU | affectation-notice:178 |
| PROD-B5 | Onglets Bootstrap rendus cachés, `keyvalue` sans `trackBy` | Basse | DOM / Change detection | modal-update, edit-modal, modal-imprime, organisme-client-modal |

**Priorités** : C2 et C1 expliquent directement la courbe en escalier des nœuds DOM et du heap. H3 et H2 en multiplient la fréquence. C3 et H5 produisent les plus gros volumes de DOM par action.

---

## Partie E : `supervision/` et `suivi/`


J'ai lu tous les `.ts` (hors spec) et `.html` des deux périmètres (~18 800 lignes), ainsi que les modules et le routing. Pour relier les constats à leurs causes, j'ai aussi lu quelques fichiers hors périmètre : `shared/utils/AgGridUtil.ts`, `shared/decorators/auto-unsubscribe.decorator.ts`, `services/filter-shared-data.service.ts`, `shared/utils/data.service.ts`, les floating filters `fullstack-components/tableau/ag-grid-components/*` et les services Apollo appelés.

**Conclusion.** La montée en escalier des DOM nodes et du heap a surtout deux causes, combinées : [C1] et [C2]. À chaque recherche, les headers et floating filters ag-grid sont recréés, et les anciens restent retenus par des BehaviorSubject (un service root, plus les `organismeData$` des composants). [C2] explique aussi les pics CPU de plus en plus larges : le nombre d'abonnés actifs grossit à chaque recherche sur 4 pages.

**Rappels utiles.**
- `@AutoUnsubscribe` désabonne bien, au `ngOnDestroy`, toute propriété qui a une méthode `unsubscribe` (Subscription, tableaux, Subjects). Il ne couvre ni les abonnements non stockés dans une propriété, ni les services root.
- Toutes les requêtes Apollo lues sont des `watchQuery(...).valueChanges` en `fetchPolicy: 'no-cache'`. Le cache ne grossit donc pas, mais une souscription sans `take(1)` garde une ObservableQuery vivante jusqu'au désabonnement.

---

#### [SUP-C1] `resetFilterAndColumnSort()` → `refreshHeader()` à chaque recherche (10 appels)
- **Fichiers** :
  - `shared/utils/AgGridUtil.ts:173-178` (cause, hors périmètre)
  - Appels dans le périmètre :
    - `supervision/actions/action/action.component.ts:73`
    - `supervision/actions/action-utilisateur/action-utilisateur.component.ts:70`
    - `supervision/document-dematerialise/consultation/consultation.component.ts:74`
    - `suivi/volume-traite/volume-traite.component.ts:76`
    - `suivi/massification/massification.component.ts:102`
    - `suivi/facturation/facturation-detaillee/facturation-detaillee.component.ts:116`
    - `suivi/edition/suivi-au-pli/suivi-au-pli.component.ts:78`
    - `suivi/edition/expedition/distribution-expedition/distribution-expedition.component.ts:107`
    - `suivi/bon-travail/bon-travail.component.ts:120` (appel absent de la liste initiale)
  - Fuite côté floating filters :
    - `fullstack-components/.../input-filter/input-filter.component.ts:52`
    - `.../list-floating-filter/list-floating-filter.component.ts:33`
    - `.../multi-select-hierarchisee-floating-filter/...component.ts:37`
    - Ces abonnements (`filterSharedDataService.getData().subscribe(...)`) ne sont jamais stockés ni fermés. Le `ngOnDestroy` de `input-filter` ne ferme que `this.subscription`.
- **Gravité** : Critique
- **Type** : Fuite mémoire / DOM excessif
- **Cause** : l'appel a lieu **une fois par clic sur Rechercher** (et, dans action, action-utilisateur et suivi-au-pli, à chaque réponse réseau) :
  ```ts
  gridApi.setFilterModel(null); gridApi.onFilterChanged(); gridApi.refreshHeader(); gridApi.resetColumnState();
  ```
  `refreshHeader()` détruit puis recrée tous les headers et floating filters. Chaque floating filter détruit reste abonné au `BehaviorSubject` du service root `FilterSharedDataService` (`services/filter-shared-data.service.ts:8`). Le composant et son sous-arbre DOM détaché ne sont donc jamais libérés.
- **Impact** : par recherche, entre 3 et 18 floating filters sont perdus selon la page (consultation 18, expédition 13, suivi-au-pli 11, massification et facturation 10, action-utilisateur et volume-traite 8, action 6, bon-travail 3). Leur DOM n'est jamais rendu et s'accumule sur toute la session : c'est l'escalier des DOM nodes.
- **Solution** :
  1. Supprimer le `refreshHeader()`. `setFilterModel(null)` notifie déjà les floating filters via `onParentModelChanged` et déclenche lui-même le filtrage :
     ```ts
     static resetFilterAndColumnSort(gridApi: GridApi): void {
       if (!gridApi || gridApi.isDestroyed()) return;
       gridApi.setFilterModel(null);   // met à jour les floating filters + refiltre
       gridApi.resetColumnState();     // remet le tri initial
     }
     ```
  2. Fermer les abonnements dans chaque floating filter :
     ```ts
     private readonly destroyRef = inject(DestroyRef);
     constructor(...) {
       this.filterSharedDataService.getData()
         .pipe(takeUntilDestroyed(this.destroyRef))
         .subscribe(isDisabled => (this.isDisabled = isDisabled));
     }
     ```
  3. Appeler le reset **avant** la requête, et une seule fois. Dans action, action-utilisateur et suivi-au-pli, le déplacer hors du `next`.

#### [SUP-C2] `selectData = organismeData$` + nouvel abonnement à chaque `modelUpdated` → explosion d'abonnés et CPU croissant
- **Fichiers** :
  - Déclencheurs dans le périmètre :
    - `supervision/document-dematerialise/consultation/consultation.component.ts:52` (selectData), `:62` et `:135` (`next` à chaque recherche)
    - `suivi/edition/expedition/distribution-expedition/distribution-expedition.component.ts:59`, `:74`, `:142` (`next` à chaque recherche)
    - `suivi/edition/suivi-au-pli/suivi-au-pli.component.ts:60`, `:68`
    - `suivi/volume-traite/volume-traite.component.ts:51`, `:66`
  - Cause (hors périmètre) : `fullstack-components/tableau/ag-grid-components/multi-select-hierarchisee-floating-filter/multi-select-hierarchisee-floating-filter.component.ts:41` et `:76-82`
- **Gravité** : Critique
- **Type** : Fuite mémoire / CPU
- **Cause** :
  ```ts
  agInit(params) { params.api.addEventListener('modelUpdated', this.modelUpddated.bind(this)); ... }  // jamais retiré
  modelUpddated() { ... this.params.selectData!.subscribe(e => { ... this.form = SharedUtil.getOrgFormByOrgData(...) }); } // nouvel abonnement à CHAQUE modelUpdated
  ```
  Chaque recherche, filtre ou tri déclenche plusieurs `modelUpdated`, et chacun ajoute un abonné à `organismeData$`. Avec [C1], chaque instance fantôme de filtre continue d'écouter `modelUpdated` sur la grille vivante. Ensuite, `organismeData$.next(...)` (consultation:135, expédition:142) rejoue **tous** les abonnés accumulés, et chacun reconstruit un FormGroup complet d'organismes.
- **Impact** : le coût d'une recherche est proportionnel au nombre total de recherches, filtres et tris déjà faits sur la page, ce qui donne des pics CPU de plus en plus larges. Tout reste retenu jusqu'à la destruction de la page (`@AutoUnsubscribe` ferme alors `organismeData$`).
- **Solution** : s'abonner une seule fois dans le floating filter et mémoriser la dernière valeur.
  ```ts
  private allOrganismes: any[] = [];
  private readonly destroyRef = inject(DestroyRef);
  private onModelUpdated = () => this.modelUpddated();
  agInit(params) {
    this.params = params;
    params.api.addEventListener('modelUpdated', this.onModelUpdated);
    params.selectData?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(orgs => { this.allOrganismes = orgs; this.modelUpddated(); });
  }
  modelUpddated() { /* ...calcul uniqueDataFromGrid... */ this.form = SharedUtil.getOrgFormByOrgData(this.form, orgs, this.allOrganismes, isFilter); }
  destroy() { if (!this.params.api.isDestroyed()) this.params.api.removeEventListener('modelUpdated', this.onModelUpdated); }
  ```
  Côté périmètre, ne plus ré-émettre la même liste à chaque recherche (consultation:135, expédition:142). Les organismes sont déjà chargés dans `onGridReady`. Si besoin, émettre seulement quand la liste change réellement.

#### [SUP-C3] facturation-détaillée : headers recréés 2 à 3 fois et rowData posé 2 fois par recherche
- **Fichiers** : `suivi/facturation/facturation-detaillee/facturation-detaillee.component.ts:116, 138, 144, 149-151` et `.html:16-17`
- **Gravité** : Haute
- **Type** : DOM excessif / CPU / Fuite
- **Cause** : sur une même recherche, on a `resetFilterAndColumnSort()` (refreshHeader), puis `this.columnDefs = newDefs` (binding `[columnDefs]`), puis `gridApi.setGridOption('columnDefs', ...)`. De même, `this.facturationDetaillee = resultData` (binding `[rowData]`) s'ajoute à `gridApi.setGridOption('rowData', ...)`. Les colonnes dynamiques sont recalculées même quand elles n'ont pas changé.
- **Impact** : chaque recréation de header fait fuir ses floating filters ([C1]), avec un double rendu des lignes et double déclenchement de `onRowDataUpdated`.
- **Solution** : passer uniquement par les bindings et ne changer les colonnes que si leur liste diffère.
  ```ts
  private columnKey = '';
  afterSearchFacturationDetaillee(resultData) {
    const defs = this.tableauFacturationDetailleeService.getColumnDefs(resultData);
    const key = defs.map((c: ColDef) => c.field).join('|');
    if (key !== this.columnKey) { this.columnKey = key; this.columnDefs = defs; } // binding => 1 seule recréation
    this.facturationDetaillee = resultData;                                      // pas de setGridOption('rowData')
    if (!this.nbTotalFacturationDetaillee) this.tableauConfigurationBuilderService.getNoDataMessage(this.gridApi);
  }
  ```
  Et remplacer `AgGridUtil.resetFilterAndColumnSort` (ligne 116) par `this.gridApi?.setFilterModel(null)`.

#### [SUP-H1] Recherche expédition : un nouvel abonnement `combineLatest` à chaque changement d'organisme
- **Fichiers** : `suivi/edition/expedition/distribution-expedition/search/search-distribution-expedition/search-distribution-expedition.component.ts:103, 109-130` et `.html:47`
- **Gravité** : Haute
- **Type** : Fuite mémoire / CPU / Change detection
- **Cause** :
  ```ts
  onChangeOrganisme(e) {
    this.selectedOrgs$.next(...);
    this.optionsApp$ = this.getEnvAndOrgsSelection().pipe(map(...));      // nouvel Observable
    this.subscriptions.push(this.optionsApp$.subscribe(o => this.formApp.reset(..., { emitEvent: true }))); // + 1 abonné
  }
  ```
  La méthode est aussi appelée à chaque changement d'environnement (l.103). Tous les abonnements restent vivants sur `selectedEnv$` et `selectedOrgs$`, et le template se réabonne au nouvel `optionsApp$ | async`.
- **Impact** : après N clics sur les organismes, chaque clic lance N `formApp.reset(emitEvent:true)`, donc N `valueChanges` et N `selectedApp$.next`. Coût quadratique, retenu jusqu'à la sortie de la page.
- **Solution** : construire le flux une seule fois.
  ```ts
  ngOnInit() { ...; this.optionsApp$ = this.getEnvAndOrgsSelection().pipe(
      map(([env, orgs]) => env !== '' && orgs.length ? this.getFilteredApps(env, orgs) : []),
      shareReplay({ bufferSize: 1, refCount: true }));
    this.subscriptions.push(this.optionsApp$.subscribe(apps => {
      const app = this.selectedApp$.getValue();
      this.formApp.reset(apps.includes(app) ? app : '', { emitEvent: true });
    }));
  }
  onChangeOrganisme(e) { this.selectedOrgs$.next(Object.values(e).map((o: any) => o.title)); }
  ```

#### [SUP-H2] Vidéo documents dématérialisés : polling `setInterval` 5 s sans garde, table entièrement re-rendue
- **Fichiers** : `supervision/document-dematerialise/video/video.component.ts:101-141, 116, 218-235, 248-252` et `video.component.html:95-104`
- **Gravité** : Haute
- **Type** : CPU / Réseau / DOM / Change detection
- **Cause** :
  - `setInterval(() => this.lister(), 5000)` tourne dans la zone Angular (CD globale à chaque tick) et n'attend pas la réponse précédente : les requêtes se chevauchent si le serveur dépasse 5 s.
  - Chaque `lister()` fait `this.subscriptions.push(...)` : le tableau grossit de 720 entrées par heure, jusqu'à la sortie de la page.
  - `docType` est reconstruit avec de nouveaux objets et rendu par `*ngFor` **sans trackBy** : jusqu'à 100 `<tr>` et 300 `<td>` détruits puis recréés toutes les 5 s.
  - `formatDocument(...)` est appelé 3 fois par ligne à chaque CD.
  - Le nettoyage au destroy est correct (`ngOnDestroy` → `startStop()` → `clearInterval`).
- **Impact** : dents de scie DOM toutes les 5 s, CPU permanent tant que la vidéo tourne, requêtes empilées.
- **Solution** :
  ```ts
  private readonly destroyRef = inject(DestroyRef);
  private pollSub?: Subscription;
  startStop() {
    if (this.pollSub) { this.pollSub.unsubscribe(); this.pollSub = undefined; this.textStartStop = 'Démarrer'; this.isIntervalStart = false; return; }
    this.textStartStop = 'Arrêter'; this.isIntervalStart = true;
    this.pollSub = timer(0, 5000).pipe(
      exhaustMap(() => this.apiAdelaideDocumentDematerialiseVideoService.getDocsDematerialisesVideo(this.buildQuery()).pipe(take(1))),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => this.applyResult(data));   // applyResult = corps actuel du subscribe, avec labels pré-calculés
  }
  trackByIndex = (i: number) => i;
  ```
  ```html
  <tr *ngFor="let item of docType; trackBy: trackByIndex">
    <td (click)="openPopup(item.documentTypeD)" ...>{{ item.labelD }}</td> ...
  ```
  `labelD`, `labelT` et `labelS` sont calculés une fois dans `applyResult`.

#### [SUP-H3] vis-network et vis-timeline instanciés dans la zone Angular, listeners `wheel`/`mousemove` aussi
- **Fichiers** :
  - `supervision/production/occurrence-etape/dag-network/dag-network.component.ts:68` (wheel), `:168` (`new Network`), `:185-193, 211-246, 465-474` (handlers vis), `:355-356` (mousemove/mouseup sur document)
  - `supervision/production/occurrence-application/timeline/timeline.component.ts:118-120` (`new Timeline`), `:135-149`, `:246-249`
  - `@HostListener('document:click')` dans `timeline.component.ts:52-55` et `occurrence-etape/menu/occurrence-etape-menu.component.ts:19-22`
  - Aucune utilisation de `NgZone.runOutsideAngular` dans le périmètre (vérifié).
- **Gravité** : Haute
- **Type** : CPU / Change detection
- **Cause** : tous les listeners internes des bibliothèques vis (souris, hover, redraw, `autoResize: true` en l.427) et les listeners ajoutés à la main sont patchés par zone.js. Chaque molette, survol de nœud ou mouvement pendant un drag déclenche une CD de toute l'application.
- **Impact** : CD à haute fréquence pendant toute interaction avec le graphe ou la timeline. Le coût croît avec la taille de l'app (tableaux et formulaires présents).
- **Solution** :
  ```ts
  private readonly zone = inject(NgZone);
  // dag-network
  this.zone.runOutsideAngular(() => {
    this.visWrapper.nativeElement.addEventListener('wheel', this.boundOnWheel, { passive: false, capture: true });
  });
  this.network = this.zone.runOutsideAngular(() => new Network(this.networkContainer.nativeElement, data, this.networkOptions()));
  this.network.on('doubleClick', p => { const [id] = p.nodes; if (id) this.zone.run(() => this.networkDoubleClick.emit({ id, position: { x: p.event.clientX, y: p.event.clientY } })); });
  // idem 'oncontext' -> zone.run(() => this.networkRightClick.emit(...)) ; onThumbMouseDown: addEventListener dans runOutsideAngular
  // timeline
  this.timeline = this.zone.runOutsideAngular(() => new Timeline(el, items, groups, options));
  this.timeline.on('contextmenu', p => this.zone.run(() => { ... }));
  onInitialDrawComplete: () => this.zone.run(() => (this.toShowStatus = true)),
  ```

#### [SUP-H4] `URL.createObjectURL` jamais révoqué (PDF bon de travail)
- **Fichiers** : `suivi/bon-travail/service/tableau-bon-travail.service.ts:185-191` (l.188)
- **Gravité** : Haute
- **Type** : Fuite mémoire
- **Cause** : `const url = window.URL.createObjectURL(blob); window.open(url, '_blank');` sans `revokeObjectURL`. S'y ajoute la conversion base64 → `new Array(n)` → `Uint8Array` (copie en double).
- **Impact** : chaque PDF ouvert reste en mémoire jusqu'au rechargement de l'onglet.
- **Solution** :
  ```ts
  private openPdfInNewTab(base64Pdf: string | null): void {
    if (!base64Pdf) return;
    const bytes = Uint8Array.from(atob(base64Pdf), c => c.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: TableauBonTravailService.MIME_TYPE_PDF }));
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000); // laisser le nouvel onglet charger
  }
  ```

#### [SUP-H5] Méthodes de template avec effets de bord (`setValue`) à chaque CD — recherche des occurrences d'étapes
- **Fichiers** :
  - `supervision/production/occurrence-etape/search/search-occurrence-etape.component.html:68, 80, 85, 91, 95, 102, 107, 117`
  - `.ts:242-277`
- **Gravité** : Haute
- **Type** : Change detection / CPU
- **Cause** : `*ngIf="isCommandeToShow()"`, `isGammeToShow()` et `isStatutToShow()` exécutent chacun 1 à 2 `setValue(...)` par cycle, soit 3 à 6 `updateValueAndValidity` remontant jusqu'au FormGroup à chaque CD. `isAnnexSearchDisabled()` est évaluée 5 fois par cycle. Cette page cohabite avec le DAG (CD fréquentes, cf. [H3]).
- **Impact** : validations de formulaire en boucle à chaque souris, molette ou poll.
- **Solution** : déplacer la logique dans `valueChanges` et n'exposer que des propriétés.
  ```ts
  filtre = '';
  ngOnInit() { ...
    this.subscriptions.push(this.form.get('filtre').valueChanges.subscribe(f => {
      this.filtre = f;
      const reset = (k: string) => this.form.get(k).setValue('', { emitEvent: false });
      if (f !== 'commande') reset('commande');
      if (f !== 'gamme') reset('gamme');
      if (f !== 'statut') reset('statut');
    }));
  }
  ```
  ```html
  <div class="col-2 p-0" *ngIf="filtre === 'commande'">...
  ```
  Transformer `isAnnexSearchDisabled` en propriété recalculée sur `form.statusChanges` et dans `ngOnChanges` (`isIntervalStart`).

#### [SUP-H6] Occurrences d'étapes : graphe détruit/recréé à chaque poll modifié, algorithmes O(n²), tooltips DOM
- **Fichiers** :
  - `supervision/production/occurrence-etape/occurrence-etape.component.ts:100-102` (`of(...)`, un nouvel Observable à chaque fois), `:338-375` (`document.createElement` par nœud), `:449-455`, `:457-516`, `:518-525`, `:527-548` (poll 10 s)
  - `dag-network/dag-network.component.ts:52-62, 167-168`
- **Gravité** : Moyenne
- **Type** : CPU / DOM
- **Cause** :
  - Quand la signature change, `drawNetwork()` passe un nouvel Observable, puis `network.destroy()` et `new Network(...)` recréent canvas, boutons de navigation et handlers.
  - `getNumberOfChildren` (filter imbriqués), `setLinks` (`staticNodes.find` dans `flatMap`) et `generateRandomNodeId` (`nodes.find` récursif) sont O(n²).
  - Chaque nœud crée 2 à 3 éléments DOM détachés pour son tooltip, retenus par `nodes` et `cachedNodes`.
  - Côté positif : le polling via `setTimeout` est bien annulé dans `ngOnDestroy` (l.550-559).
- **Impact** : pics CPU et churn DOM toutes les 10 s en temps réel sur les gros graphes.
- **Solution** :
  ```ts
  // dag-network: réutiliser l'instance
  if (this.network) { this.network.setData(data); this.moveTo(prev.x, prev.y); } else { this.createNetwork(data); }
  // occurrence-etape: index parent->enfants une fois par lister()
  const byParent = new Map<number, VideoStep[]>();
  for (const s of this.videoSteps) { const l = byParent.get(s.idpere) ?? []; l.push(s); byParent.set(s.idpere, l); }
  private getNumberOfChildren(s: VideoStep) {
    const kids = byParent.get(s.idetap) ?? [];
    return s.typetp === 'IDT' ? kids.reduce((n, k) => n + (byParent.get(k.idetap)?.length ?? 0), 0) : kids.length;
  }
  // setLinks : const nodeById = new Map(staticNodes.map(n => [n.id, n])); ids générés par compteur (let next = 100000; next++)
  // tooltip : title en string ('ligne1\nscript') au lieu d'un HTMLElement
  ```

#### [SUP-M1] `isFormValid() | async` crée un nouvel Observable à chaque CD
- **Fichiers** : `suivi/bon-travail/search/search-bon-travail/search-bon-travail.component.html:192` et `.ts:125-133, 240-246`
- **Gravité** : Moyenne
- **Type** : Change detection / CPU
- **Cause** : `[disabled]="!(isFormValid() | async)"` renvoie `this.optionsApp$.pipe(map(...))`, une nouvelle référence à chaque passage. Le pipe async se désabonne puis se réabonne à `combineLatest` à chaque CD, et `markForCheck` est rappelé en synchrone.
- **Solution** :
  ```ts
  isFormValid$!: Observable<boolean>;
  ngOnInit() { ...; this.initAppOptions();
    this.isFormValid$ = combineLatest([this.optionsApp$, this.form.valueChanges.pipe(startWith(null))])
      .pipe(map(([apps]) => this.hasRequiredFields(apps)), shareReplay({ bufferSize: 1, refCount: true }));
  }
  ```
  ```html
  [disabled]="!(isFormValid$ | async)"
  ```
  Et à la l.129 : `switchMap(() => this.isFormValid$.pipe(take(1)))`.

#### [SUP-M2] `gridApi.getSelectedNodes()` appelé depuis le template à chaque CD
- **Fichiers** :
  - `suivi/bon-travail/bon-travail.component.html:50, 74` → `.ts:441-450`
  - `supervision/production/gestion-occurrence-etape/modal/gestion-occurrence-etape-modal.component.html:32` → `.ts:194-198`
- **Gravité** : Moyenne
- **Type** : Change detection / CPU
- **Cause** : parcours complet des nœuds sélectionnés, 2 à 3 fois par cycle. Bon-travail est sans pagination.
- **Solution** :
  ```ts
  nbSelected = 0;
  gridOptions = { ..., onSelectionChanged: e => (this.nbSelected = e.api.getSelectedNodes().length) };
  isAppliqueEnMasseInfosAuthorised = () => this.nbSelected > 0 && !this.isSingleChangeNotSubmited; // ou propriétés
  ```

#### [SUP-M3] Volume traité (recherche) : watchQuery sans `take(1)` accumulées à chaque changement d'organisme, appels en double
- **Fichiers** : `suivi/volume-traite/search/search-volume-traite/search-volume-traite.component.ts:96, 139-153, 155-169` (l.160-163)
- **Gravité** : Moyenne
- **Type** : Fuite mémoire / Réseau
- **Cause** : `this.subscriptions.push(api.getGamSitResByEnvOrgs(...).subscribe(...))` sans `take(1)` à chaque changement d'organisme. Chaque ObservableQuery reste enregistrée dans le QueryManager d'Apollo jusqu'à la sortie de la page. Un changement d'environnement déclenche aussi `onChangeEnv` puis, via la reconstruction du formulaire organismes, un second appel identique.
- **Solution** :
  ```ts
  private ressSub?: Subscription;
  onChangeOrganisme(elements) { ...
    this.ressSub?.unsubscribe();
    this.ressSub = this.apiAdelaideVolumeTraiteService.getGamSitResByEnvOrgs(setEnvOrgsInput(env, orgs))
      .pipe(take(1)).subscribe(d => this.initFormRessources(d.data.getGamSitResByEnvOrgs));
  }
  ```
  Ajouter aussi `take(1)` à la l.96. `ressSub` est fermé par `@AutoUnsubscribe`.

#### [SUP-M4] Services root qui retiennent des callbacks vers des composants détruits
- **Fichiers** :
  - `suivi/production/occurrences-application/service/tableau-occurrence-application.service.ts:15-16, 85-87, 134-136` ← `occurrences-application.component.ts:110-117`
  - `suivi/production/occurrences-fichiers/service/tableau-occurrences-fichiers.service.ts:17, 77-79` ← `occurrences-fichiers.component.ts:45-47`
- **Gravité** : Moyenne
- **Type** : Fuite mémoire
- **Cause** : `setCommandeModalCallback(() => this.openCommandeDetailsModal(...))` stocke une closure sur `this` dans un singleton root, jamais remise à zéro.
- **Impact** : le dernier composant détruit reste en mémoire avec `gridApi`, `rowData` et `rowData$`, jusqu'à la prochaine visite.
- **Solution** : passer par le `context` ag-grid plutôt que par le service.
  ```ts
  this.gridOptions = { ..., context: { openCommande: (e, o, a) => this.openCommandeDetailsModal(e, o, a),
                                       openDetails: (p) => this.openDetailsOccurrenceModal(p) } };
  // colDef : onCellClicked: p => p.context.openCommande(codenv, codorg, codapp)
  ```
  À défaut : `ngOnDestroy() { this.service.setCommandeModalCallback(null); this.service.setDetailsOccurrenceModalCallback(null); }`

#### [SUP-M5] `DataService` (BehaviorSubject root) rejoue le dernier compte → recherche relancée à chaque retour sur l'onglet
- **Fichiers** :
  - `suivi/edition/suivi-au-pli/search/search-suivi-au-pli/search-suivi-au-pli.component.ts:53-59, 62-69`
  - `shared/utils/data.service.ts:9, 23`
  - `suivi/edition/suivi-au-pli/service/compte-renderer.component.ts:31-34`
- **Gravité** : Moyenne
- **Type** : Réseau / Fuite (via [C1])
- **Cause** : `getTransferedData()` renvoie le BehaviorSubject lui-même. Après un clic sur un compte, chaque recréation de `SearchSuiviAuPliComponent` (changement d'onglet Édition) rejoue la valeur et exécute `lister()`. Cela relance la requête et `resetFilterAndColumnSort`, donc une nouvelle fuite de headers.
- **Solution** :
  ```ts
  this.dataService.getTransferedData().pipe(filter(isTransferCompteToSearch)).subscribe(data => {
    this.dataService.setDataToTransfer(null);   // consommer l'évènement
    this.searchWithCompteTransfered(data);
  });
  ```

#### [SUP-B1] Timeline des occurrences d'application : DataSet et DOM des groupes recréés à chaque poll de 10 s
- **Fichiers** :
  - `supervision/production/occurrence-application/timeline/timeline.component.ts:122-155` (l.152-153), `:250-269` (`innerHTML` l.258)
  - `occurrence-application.component.ts:54-75`
  - `timeline.component.html:2` (timeline masquée en CSS mais conservée)
- **Gravité** : Basse
- **Type** : CPU / DOM
- **Cause** : `setData({ items: new DataSet(...), groups })` et `setOptions(...)` à chaque poll. `groupTemplate` recrée un `div`, un `span` (`innerHTML`) et un `img` par groupe. Côté positif : `destroy()` est bien appelé (l.65-73) et le poll est annulé au destroy (l.77-83).
- **Solution** : garder deux `DataSet` membres et faire `items.update(...)` / `items.remove(idsDisparus)` (idem pour les groupes). Remplacer `label.innerHTML` par `label.textContent`, et `[ngClass]="hide-timeline"` par `*ngIf` quand la liste est vide.

#### [SUP-B2] Tableaux `subscriptions[]` qui grossissent avec des souscriptions terminées
- **Fichiers** :
  - `supervision/actions/action/action.component.ts:70`
  - `supervision/actions/action-utilisateur/action-utilisateur.component.ts:67`
  - `supervision/document-dematerialise/consultation/consultation.component.ts:79`
  - `supervision/production/gestion-occurrence-application/gestion-occurrence-application.component.ts:84`
  - `supervision/production/gestion-occurrence-etape/search/search-gestion-occurrence-etape.component.ts:124`
  - `supervision/production/occurrence-etape/search/search-occurrence-etape.component.ts:124, 164`
  - `supervision/service/service.component.ts:53`
  - `supervision/production/gestion-occurrence-application/search/search-gestion-occurrence-application/...component.ts:127`
  - `suivi/bon-travail/bon-travail.component.ts:124`
  - `suivi/edition/expedition/distribution-expedition/distribution-expedition.component.ts:119`
  - `suivi/edition/suivi-au-pli/suivi-au-pli.component.ts:75`
  - `suivi/facturation/facturation-detaillee/facturation-detaillee.component.ts:118`
  - `suivi/volume-traite/volume-traite.component.ts:91`
  - `suivi/production/occurrences-fichiers/occurrences-fichiers.component.ts:68`
  - (vidéo : voir [H2])
- **Gravité** : Basse
- **Type** : Fuite mémoire (faible)
- **Cause** : `this.subscriptions.push(api.x().pipe(take(1)).subscribe(...))` à chaque action. Les souscriptions sont terminées, mais le tableau et leurs closures restent jusqu'au destroy.
- **Solution** : une propriété unique par requête « dernière recherche » (`this.searchSub?.unsubscribe(); this.searchSub = ...`), ou `takeUntilDestroyed(this.destroyRef)` sans stockage.

#### [SUP-B3] Appels réseau dupliqués
- **Fichiers** :
  - `suivi/production/modal/fichier-details/fichier-details.component.html:4` + `.ts:47-64` : `onglets$` est souscrit deux fois (`| async` et `combineLatest`), donc `getValueDocDematerialises` part 2 fois par ouverture de modale.
  - `supervision/production/gestion-occurrence-etape/search/search-gestion-occurrence-etape.component.ts:269-309` : `getOccurrenceEtapeData` est appelé à chaque changement d'application pour remplir les options, puis rappelé au clic sur Rechercher (l.119-155).
- **Gravité** : Basse
- **Type** : Réseau
- **Solution** : `onglets$ = ... .pipe(first(), shareReplay(1))`, et n'utiliser que `onglets$` dans le template. Pour gestion-occurrence-etape, garder la réponse de chargement des options si les critères sont identiques, ou prévoir un endpoint « options » léger.

#### [SUP-B4] cellRenderer fonctionnel avec `createElement` + `addEventListener`
- **Fichiers** : `suivi/bon-travail/service/tableau-bon-travail.service.ts:104-112`
- **Gravité** : Basse
- **Type** : CPU / Mémoire
- **Cause** : un élément et une closure (`params.data`, service root) sont créés à chaque rendu de cellule. Ils sont libérés avec la cellule (pas une vraie fuite), mais c'est incohérent avec les autres colonnes qui utilisent `onCellClicked`.
- **Solution** :
  ```ts
  cellRenderer: p => `<a href="javascript:void(0)" class="link-codbon">${p.value ?? ''}</a>`,
  onCellClicked: p => (p.event.target as HTMLElement)?.classList.contains('link-codbon') && this.onCodbonClick(p.data, isBonTravailManuel),
  ```

#### [SUP-B5] Pipes impurs dans le template de la page Service
- **Fichiers** : `supervision/service/service.component.html:82, 88, 100` (`keyvalue` deux fois, `json`)
- **Gravité** : Basse
- **Type** : Change detection
- **Cause** : `JSON.stringify` et le tri `keyvalue` sont réexécutés à chaque CD pour chaque service déplié.
- **Solution** : pré-calculer `service.components = Object.entries(details).map(([k, v]) => ({ key: k, status: v.status, json: JSON.stringify(v.details, null, 2) }))` à la réception (`service.component.ts:57`).

---

#### Vérifié sans anomalie
- **Onglets** : les pages à onglets (Actions, Documents dématérialisés, Production supervision/suivi, Édition, Facturation) utilisent `*ngIf` / `@if`, donc pas de contenu caché rendu.
- **Modales** : les modales `NgbModal` et le `createComponent` dynamique (`details-modal-occurrence-etape.component.ts:80-81`, `fichier-details.component.ts:78-79`, `gestion-occurrence-application-modal.component.ts:28`) vident leur `ViewContainerRef` ou sont détruits avec la modale.
- **dag-network** : `network.destroy()` et le retrait des listeners wheel, mousemove et zoom sont corrects au destroy.
- **Timers** : ceux de vidéo, occurrence-etape et occurrence-application sont correctement annulés au destroy.
- **Timeline** : `destroy()` est bien appelé.
- **Apollo** : toutes les requêtes du périmètre sont en `no-cache` (pas de croissance du cache).
- **Cereus** : `supervision/cereus/*` n'est déclaré dans aucun module ni route. Code mort, sans impact runtime.

#### Tableau récapitulatif

| ID | Titre | Gravité | Type | Fichier principal |
|---|---|---|---|---|
| SUP-C1 | `refreshHeader()` à chaque recherche + floating filters abonnés au BehaviorSubject root | Critique | Fuite / DOM | AgGridUtil.ts:176 + 10 appels |
| SUP-C2 | `selectData` : nouvel abonnement par `modelUpdated`, fan-out à chaque `next` | Critique | Fuite / CPU | consultation, expédition, suivi-au-pli, volume-traite |
| SUP-C3 | Facturation : headers recréés 2-3 fois et rowData posé 2 fois par recherche | Haute | DOM / CPU | facturation-detaillee.component.ts:116-151 |
| SUP-H1 | `combineLatest` réabonné à chaque changement d'organisme | Haute | Fuite / CPU | search-distribution-expedition.component.ts:109-130 |
| SUP-H2 | Polling vidéo 5 s sans garde, sans trackBy, push infini | Haute | CPU / Réseau / DOM | video.component.ts:218-235 |
| SUP-H3 | vis-network / vis-timeline et listeners dans la zone Angular | Haute | CPU / CD | dag-network:68,168 ; timeline:118 |
| SUP-H4 | `createObjectURL` non révoqué | Haute | Fuite | tableau-bon-travail.service.ts:188 |
| SUP-H5 | `setValue` dans des méthodes de template | Haute | CD / CPU | search-occurrence-etape.html:80-117 |
| SUP-H6 | Graphe recréé à chaque poll, O(n²), tooltips DOM | Moyenne | CPU / DOM | occurrence-etape.component.ts:100-525 |
| SUP-M1 | `isFormValid() \| async` (nouvel Observable par CD) | Moyenne | CD | search-bon-travail.html:192 |
| SUP-M2 | `getSelectedNodes()` dans le template | Moyenne | CD | bon-travail.html:50,74 ; gestion-occ-etape-modal.html:32 |
| SUP-M3 | watchQuery sans `take(1)` accumulées, appels doublés | Moyenne | Fuite / Réseau | search-volume-traite.component.ts:96,160 |
| SUP-M4 | Callbacks de composants retenus par des services root | Moyenne | Fuite | tableau-occurrence-application / -fichiers services |
| SUP-M5 | Rejeu du `DataService` → recherche relancée à chaque retour | Moyenne | Réseau / Fuite | search-suivi-au-pli.component.ts:53-59 |
| SUP-B1 | Timeline : `setData` complet et DOM des groupes à chaque poll | Basse | CPU / DOM | timeline.component.ts:152,250-269 |
| SUP-B2 | Tableaux `subscriptions[]` croissants | Basse | Fuite faible | 15 fichiers listés |
| SUP-B3 | Requêtes dupliquées | Basse | Réseau | fichier-details ; search-gestion-occurrence-etape |
| SUP-B4 | cellRenderer `createElement` + `addEventListener` | Basse | CPU | tableau-bon-travail.service.ts:104-112 |
| SUP-B5 | Pipes impurs `keyvalue` / `json` | Basse | CD | service.component.html:82-100 |

**Ordre de correction recommandé** : C1 et C2 d'abord (causes directes de l'escalier DOM/heap et des pics CPU croissants), puis C3, H1, H2, H3, H4, H5.

Les corrections de C1 et C2 portent aussi sur des fichiers hors périmètre : `shared/utils/AgGridUtil.ts` et les floating filters de `fullstack-components/tableau/ag-grid-components/`. Aucun fichier n'a été modifié.

---

## Partie F : inventaire transversal par pattern (§ A1 à A14)


Aucun fichier n'a été modifié. Les chemins partent de `src/app`. Les comptages viennent de grep, de scripts Python (analyse des parenthèses pour retrouver le début de chaque instruction `.subscribe`) et d'une relecture manuelle des cas à risque.

### § A0. Synthèse : causes probables de la hausse en escalier (DOM 14 600, heap 20→109 Mo, CPU)

1. **Composants ag-grid retenus par un BehaviorSubject root.** `FilterSharedDataService.getData()` est abonné sans libération dans le constructeur ou `ngOnInit` de `ColumnHeaderComponent` (tous les en-têtes de toutes les grilles, via l'override `agColumnHeader`), `InputFilterComponent` (181 colDefs), `ListeDeroulanteMultipleComponent` (contenu dans chaque `multiSelectFloatingFilter`, 137 colDefs, plus 28 templates), `ListFloatingFilterComponent` (25), `MultiSelectHierarchiseeFloatingFilterComponent` (14) et `ActionRendererClearFilterComponent`.
   - Chaque instance reste référencée à vie par le subject root. Elle garde avec elle `params` (dont `eGridHeader`, un HTMLElement), `@ViewChild` ElementRef ou NgbDropdown : l'arbre DOM détaché de la grille est donc conservé.
   - Ces composants sont recréés à chaque `refreshHeader()`, `resetColumnState()` ou changement de `columnDefs`, et à chaque nouvelle grille. Le compteur « DOM nodes » ne redescend donc jamais.
2. **Apollo `watchQuery(...).valueChanges` ne se termine jamais** (Apollo 3.13, 238 occurrences, toutes en `fetchPolicy: 'no-cache'`). L'hypothèse « un appel HTTP se termine tout seul » est fausse ici : chaque `subscribe` sans `take(1)` ni unsubscribe laisse un `ObservableQuery` dans le `QueryManager` et garde le composant.
3. **`ContainerComponent` est routé** (6 routes de premier niveau) et donc recréé à chaque changement de section. Il fuit `loaderService.httpProgress()` (ReplaySubject root) et garde son `ChangeDetectorRef` (LView et DOM).
   - Ses enfants fuient aussi : `NavComponent`, via `VersionService.shareReplay(1)` posé sur une watchQuery qui ne se termine jamais, avec son `@ViewChild TemplateRef` ; et `BreadcrumbComponent`, via `router.events`.
4. **Surcharge CPU de la détection de changement.**
   - `InactivityLogoutService` écoute `mousemove`, `scroll`, `keydown`, `click` et `touchstart` sur `document`, dans la zone Angular : chaque mouvement de souris déclenche une détection de changement de toute l'application. Le throttle ne limite que l'écriture en storage.
   - `ContainerComponent.ngAfterContentChecked()` appelle `detectChanges()`, ce qui double chaque cycle.
   - Seuls 9 composants sur 271 sont en OnPush, et les templates contiennent 63 appels de fonctions coûteuses.
5. **Churn ag-grid.**
   - `TableauComponent.onFilterModified` appelle `redrawRows()` à chaque modification de filtre, ce qui recrée tous les renderers Angular.
   - Couplé aux renderers qui fuient (`selectData.subscribe` dans SelectEditor, Combobox, MultiSelectEditor et SelectTableEditor), chaque redraw ajoute des instances retenues.
   - `MultiSelectFloatingFilter` et `MultiSelectHierarchisee` ajoutent un listener `modelUpdated` (`.bind(this)`) jamais retiré. `MultiSelectHierarchisee` s'abonne de nouveau à `selectData` à chaque `modelUpdated`, ce qui cumule les abonnements.

---

### § A1. `.subscribe(` sans mécanisme de libération

**Statistiques globales** : 606 appels `.subscribe(` (569 dans des composants ou directives, 37 dans des services).

| Traitement | Nombre |
|---|---|
| Poussés dans `subscriptions[]` puis unsubscribe en `ngOnDestroy` ou via `@AutoUnsubscribe` | 298 |
| `take(1)` ou `first()` | 184 |
| Assignés à une propriété | 18 |
| `takeUntil` ou `takeUntilDestroyed` | 8 |
| **Non gérés** | **98** (68 composants, 30 services) |

- 27 fichiers composants n'ont aucun mécanisme de libération.
- 145 fichiers utilisent `@AutoUnsubscribe` (`shared/decorators/auto-unsubscribe.decorator.ts`). Ce décorateur patche le prototype et fonctionne avec Ivy, mais il ne couvre que les propriétés Subscription ou les tableaux composés uniquement de Subscription.
- Il y a 238 `watchQuery` (jamais terminées) pour 155 `mutate` (qui se terminent).

#### Risque ÉLEVÉ : source longue durée, ou instance recréée en masse

| fichier:ligne | Source | Problème vérifié |
|---|---|---|
| fullstack-components/tableau/ag-grid-components/column-header/column-header.component.ts:31 | FilterSharedDataService (BehaviorSubject root) | Dans le constructeur, jamais unsubscribe (le `ngOnDestroy` existe mais l'oublie). Une instance par colonne et par grille, recréée par `refreshHeader`. Retient `params.eGridHeader`, donc le DOM de la grille. |
| fullstack-components/tableau/ag-grid-components/input-filter/input-filter.component.ts:52 | idem | `ngOnDestroy` ne libère que `this.subscription` (l.35). 181 colDefs. |
| fullstack-components/tableau/ag-grid-components/list-floating-filter/list-floating-filter.component.ts:33 | idem | Pas de `ngOnDestroy`. |
| fullstack-components/tableau/ag-grid-components/multi-select-hierarchisee-floating-filter/multi-select-hierarchisee-floating-filter.component.ts:37 | idem | Pas de `ngOnDestroy`. |
| même fichier :76 | `params.selectData` (BehaviorSubject de la page) | Abonnement créé **dans le handler `modelUpdated`**, donc N abonnements cumulés. Chaque émission reconstruit N formulaires. |
| fullstack-components/tableau/ag-grid-components/action-renderer-clear-filter/action-renderer-clear-filter.component.ts:18 | FilterSharedDataService | Floating filter de la colonne de sélection de toutes les grilles « permission ». Retient `@ViewChild` ElementRef. |
| fullstack-components/liste-deroulante/components/liste-deroulante-multiple/liste-deroulante-multiple.component.ts:109 | FilterSharedDataService | `ngOnDestroy` l'oublie. Instancié dans chaque `multiSelectFloatingFilter` et dans 28 templates. |
| même fichier :164 (`ngOnChanges`) | `@Input form.valueChanges` | Un nouvel abonnement poussé à chaque ngOnChanges. Le form est remplacé à chaque `modelUpdated` du floating filter, donc accumulation jusqu'au destroy. |
| fullstack-components/tableau/ag-grid-components/select-editor/select-editor.component.ts:85 | `params.selectData` | Non poussé dans `subscriptions`. Un par cellule et par redraw. |
| fullstack-components/tableau/ag-grid-components/combobox/combobox.component.ts:67 | `params.selectData` | idem |
| fullstack-components/tableau/ag-grid-components/multi-select-editor/multi-select-editor.component.ts:135 | `params.selectData` | idem. Chaque émission rappelle `initForm`. |
| fullstack-components/tableau/ag-grid-components/select-table-editor/select-table-editor.component.ts:37 | `params.selectData` | Pas de `ngOnDestroy`. |
| layout/container/container.component.ts:43 | `loaderService.httpProgress()` (ReplaySubject root) | Composant routé et recréé par section. Retient `cdref`, donc le LView et le DOM du layout. Continue d'appeler `detectChanges()` sur la vue détruite. |
| layout/container/container.component.ts:61 | watchQuery `getCodesOrganismesByRegions` | Jamais terminée. |
| core/components/layout/breadcrumb/breadcrumb.component.ts:28 | `router.events` | Enfant du container. Chaque navigation est traitée par toutes les instances périmées. |
| layout/nav/nav.component.ts:42, :47 | `VersionService` : `shareReplay(1)` sur watchQuery | Observers jamais retirés. NavComponent (template de 421 lignes) retenu à chaque recréation du container. |
| layout/authentification/notifications-list/notifications-list.component.ts:27, :41 | watchQuery `getAllPathComplet` | :41 à chaque `openModal()`, donc accumulation. |
| layout/authentification/authentification.component.ts:103 | watchQuery `getNotificationsCount` | `ngOnDestroy` présent mais l'oublie. |
| admin/contenu/faq/faq.component.ts:129 | watchQuery `getNotificationsCount` | idem |
| admin/contenu/popup-help/onglets/faq/popup/popup-faq.component.ts:77 | watchQuery `getAllPathComplet` | idem |
| admin/contenu/aide/popup/popup-aide.component.ts:39 | watchQuery | Modale, pas de destroy. |
| shared/components/modal/details/details-modal.component.ts:66 | watchQuery `getAllTarifs` + `concatMap` | Modale. |
| shared/components/modal/details/onglets/commandes-fichiers/commandes-fichiers.component.ts:61 | watchQuery | Onglet de modale. |
| shared/components/modal/details/onglets/facturation/details-facturation.component.ts:58 | watchQuery | idem |
| shared/components/modal/details/onglets/fichiers-produits/fichiers-produits.component.ts:66 | watchQuery | idem |
| shared/components/modal/details/onglets/generalites/generalites.component.ts:27 | watchQuery | idem |
| shared/components/modal/details/onglets/incidents/incidents.component.ts:47 | watchQuery | idem |
| shared/components/modal/details/onglets/massification/details-massification.component.ts:56 | watchQuery | idem |
| shared/components/modal/details/onglets/notices/notices.component.ts:69 | watchQuery | idem |
| exploitation-editique/massification/massification-modal/massification-modal.component.ts:52, :67 | watchQuery | Modale. |
| exploitation-editique/massification/simulation-modal/simulation-modal.component.ts:30 | watchQuery | Modale. |
| produit/distribution/parametre-edition/parametre-edition-colonne/parametre-edition-colonne/parametre-edition-colonne.component.ts:137 | watchQuery `getCodeOrgOGUR` | |
| fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component.ts:123 | watchQuery `getNoticePdf` | Un par clic, retient la cellule. S'y ajoute un `createObjectURL` jamais révoqué (voir §14). |

#### Risque MOYEN : `@Input` form ou accumulation dans des handlers

- shared/components/multi-select-section/multi-select-section.component.ts:63 : `form.valueChanges`, le form est un `@Input` (appartient au parent) ; pas de destroy.
- shared/components/select-from-table-list/select-from-table-list.component.ts:117 : `form.valueChanges`, même situation.
- shared/preselection/preselection.component.ts:176 : `formEnv.valueChanges` avec `switchMap` vers une watchQuery, non poussé.
- produit/adresse-retour/detail-adresse-retour/detail-adresse-retour.component.ts:117 et :140 : detail renderer ; `subscriptions[]` est rempli mais aucun `ngOnDestroy` ne le vide.
- **Accumulation dans les handlers** : 256 abonnements créés hors hooks d'init, dans 98 fichiers. Ils sont bien poussés dans `subscriptions[]`, mais recréés à chaque appel ; comme la source est souvent une watchQuery, les ObservableQuery restent vivants jusqu'au destroy de la page. Les plus gros :
  - produit/distribution/parametre-edition/distribution-parametre-edition/distribution-parametre-edition.component.ts (12 : 134, 294, 387, 400, 471, 476, 481, 486, 505, 535, 550, 635)
  - exploitation-editique/massification/search/search-massification.component.ts (7)
  - exploitation-editique/consolidation-facturation/search/search-consolidation-facturation.component.ts (6)
  - produit/commande/commande.component.ts, produit/distribution/parametre-edition/popup/modal-ajout-complet/modal-ajout-complet.component.ts, produit/notice/affectation-notice/search/search.component.ts, produit/fichier/fichiers.component.ts, produit/fichier/modal/add-modal/add-modal.component.ts, suivi/volume-traite/search/search-volume-traite/search-volume-traite.component.ts, suivi/edition/expedition/.../search-distribution-expedition.component.ts (5 chacun)
  - admin/habilitations/habilitations.component.ts:174 (`changeProfile`, watchQuery `getProfileById` à chaque clic)
  - La liste complète est dans le script, et le pattern se répète dans les `onChangeEnv`, `onChangeApp` et `onChangeCom` de tous les composants `search-*`.
- supervision/document-dematerialise/video/video.component.ts:117 : `subscriptions.push(...take(1))` toutes les 10 s par `setInterval`. Le tableau grossit sans limite (coquilles de Subscription).

#### Risque FAIBLE : mutations ou EventEmitter de modale, qui se terminent

- exploitation-editique/massification/massification.component.ts:230, 256, 414, 478
- fullstack-components/tableau/ag-grid-components/action-renderer-add-exemplaire/.../action-renderer-add-exemplaire.component.ts:76, 123
- fullstack-components/tableau/ag-grid-components/action-renderer-upload-file/action-renderer-upload-file.component.ts:37, 54
- suivi/bon-travail/bon-travail.component.ts:495
- supervision/production/gestion-occurrence-application/gestion-occurrence-application.component.ts:109, 168
- supervision/production/gestion-occurrence-etape/modal/gestion-occurrence-etape-modal.component.ts:206
- supervision/production/occurrence-etape/modal/modal-validation-etape/modal-validation-etape.component.ts:38 et modal-invalidation-etape/modal-invalidation-etape.component.ts:37
- produit/fond-page/reference/distribution-reference/distribution-reference.component.ts:173
- EventEmitter `passEntry` de modales : produit/destinataire/destinataire.component.ts:184, produit/adresse-retour/adresse-retour.component.ts:395, produit/commande/commande.component.ts:417, produit/fichier/modal/add-modal/add-modal.component.ts:221, exploitation-editique/bon-travail-manuel/bon-travail-manuel.component.ts:167, supervision/production/occurrence-etape/menu/occurrence-etape-menu.component.ts:98, supervision/production/gestion-occurrence-application/modal/gestion-occurrence-application-modal/gestion-occurrence-application-modal.component.ts:31, supervision/production/occurrence-application/service/timeline-occ-app-menu.service.ts:73
- admin/habilitations/habilitations.component.ts:322 (`modalRef.closed`, se termine)
- produit/notice/affectation-notice/affectation-notice.component.ts:130 (`askConfirmation`, se termine)
- Services root, mutations : admin/contenu/services/status-column-handler.service.ts:136, produit/distribution/parametre-edition/parametre-edition-colonne/service/tableau-parametre-edition-colonne.service.ts:235 et 317, produit/notice/service/tableau-notice.service.ts:343, produit/notice/service/file-upload.service.ts:21, 71, 114, fullstack-components/tableau/services/tableau-modifiable.service.ts:132

#### Faux positifs écartés

- produit/commande/modal/add-modal/add-commande-modal/add-commande-modal.component.ts:163 : `of()`, se termine.
- app-config/app-config.service.ts:16/18, app-config/accueil-config/accueil-config.service.ts:16/18, services/application-configuration.service.ts:16 : HttpClient, se termine.
- shared/services/TokenExpirationService.ts:26 : géré par `stop`.
- fullstack-components/menu-vertical/components/menu-vertical/menu-vertical.component.ts:48 : assigné et libéré.
- services/api-adelaide-select-data.service.ts et services/api-adelaide-search.service.ts (16 subscribes vers des watchQuery) : **code mort**, aucun appelant.

**Solution-type**

```ts
private readonly destroyRef = inject(DestroyRef);
constructor() {
  inject(FilterSharedDataService).getData()
    .pipe(takeUntilDestroyed())                 // en contexte d'injection
    .subscribe(v => (this.isDisabled = v));
}
agInit(p) {
  p.selectData?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(e => (this.data = e));
}
// Apollo : requête one-shot
return this.apollo.query<T>({ query, variables, fetchPolicy: 'no-cache' }); // se termine
// ou : watchQuery(...).valueChanges.pipe(take(1))
// Abonnements déclenchés par des handlers répétés : switchMap sur un Subject, pas un subscribe par appel
private search$ = new Subject<Params>();
ngOnInit() { this.search$.pipe(switchMap(p => this.api.search(p)), takeUntilDestroyed(this.destroyRef)).subscribe(...); }
```

Mieux encore pour `isDisabled` : `isDisabled = toSignal(inject(FilterSharedDataService).getData(), { initialValue: false })`.

### § A2. Classes avec `ngOnDestroy` qui oublient des abonnements

| fichier:ligne | Oubli |
|---|---|
| fullstack-components/tableau/ag-grid-components/column-header/column-header.component.ts:31 | `getData()` : le `ngOnDestroy` retire bien les 2 listeners de colonne, mais pas l'abonnement. |
| fullstack-components/tableau/ag-grid-components/input-filter/input-filter.component.ts:52 | `getData()` |
| fullstack-components/liste-deroulante/components/liste-deroulante-multiple/liste-deroulante-multiple.component.ts:109 | `getData()` |
| fullstack-components/tableau/ag-grid-components/select-editor/select-editor.component.ts:85 | `selectData` |
| fullstack-components/tableau/ag-grid-components/combobox/combobox.component.ts:67 | `selectData` |
| fullstack-components/tableau/ag-grid-components/multi-select-editor/multi-select-editor.component.ts:135 | `selectData`. Le listener `rowDataUpdated` (l.74) n'est pas retiré non plus (l.241). |
| fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component.ts:123 | `getNoticePdf` (watchQuery) |
| layout/authentification/authentification.component.ts:103 | watchQuery |
| admin/contenu/faq/faq.component.ts:129 | watchQuery |
| admin/contenu/popup-help/onglets/faq/popup/popup-faq.component.ts:77 | watchQuery |
| shared/components/modal/details/details-modal.component.ts:66 | watchQuery |
| produit/commande/commande.component.ts:417, produit/adresse-retour/adresse-retour.component.ts:395, produit/fichier/modal/add-modal/add-modal.component.ts:221 | `passEntry` (faible) |
| produit/fond-page/reference/distribution-reference/distribution-reference.component.ts:173 | mutation (faible) |
| admin/fabrication/parametre-distribution/details-param-distr/details-param-distr.component.ts:47/71 | Ajoute `rowDataUpdated` sur l'API de la grille **maître** mais retire `cellEditingStarted` : le detail renderer reste retenu par la grille maître à chaque dépliage. |
| fullstack-components/tableau/components/tableau/tableau.component.ts:339, :345 | `filterChanged` et `selectionChanged` en fonctions anonymes jamais retirées (même durée de vie que la grille, faible). |
| produit/distribution/parametre-edition/service/tableau-parametre-edition.service.ts:29/421 | Service **root** avec `subscriptions: Subscription[]` et `@AutoUnsubscribe` : `ngOnDestroy` n'est jamais appelé, le tableau grossit sans fin. |

**Solution-type** : remplacer les tableaux de `Subscription` par `takeUntilDestroyed(this.destroyRef)`, et ne jamais stocker de subscriptions dans un service root.

### § A3. ag-grid : composants enregistrés et nettoyage

La registry est `fullstack-components/tableau/services/tableau-configuration-builder.service.ts:154`. Composants référencés directement par classe dans les colDefs : InputEditorComponent (71, **utilisé comme cellRenderer**, donc une instance par cellule visible), InterrupteurRadioComponent (24), SelectEditorComponent (20), CustomTooltipComponent (8), DateEditorComponent (6), PopupCellRendererComponent (4), MultiSelectEditorComponent (4), InterrupteurSelectEditorComponent (4), PopupFichierCellRendererComponent (2), SelectTableEditorComponent, PopupPeriodeCellRendererComponent, CompteRendererComponent, ComboboxComponent, CheckboxHeaderComponent, CheckboxComponent (1 chacun). Par clé : inputFilter 181, multiSelectFloatingFilter 137, listFloatingFilter 25, multiSelectHierarchiseeFloatingFilter 14, agDateInput 8, actionRendererClearFilter 4 (plus la colonne de sélection).

Aucun composant n'implémente `destroy()`. C'est normal pour des composants Angular : ag-grid-angular déclenche `ngOnDestroy`.

| Composant (ag-grid-components/…) | ngOnDestroy | Listeners ajoutés / retirés | Verdict |
|---|---|---|---|
| column-header | oui | column `sortChanged` et `filterChanged` retirés | **Fuite** via `getData()` |
| multi-select-floating-filter:31 | non | `api.addEventListener('modelUpdated', this.modelUpddated.bind(this))`, **jamais retiré** (référence impossible à retirer) | **Fuite** : chaque instance périmée refait `forEachNodeAfterFilter` et `fb.group` à chaque modelUpdated |
| multi-select-hierarchisee-floating-filter:41 | non | idem, jamais retiré | **Fuite**, cumul d'abonnements (§1) |
| select-table-editor:112 | non | `table.addEventListener('click')` sur un conteneur ajouté à `document.body` | Conteneur retiré seulement via `closeDropdown`. Si la cellule est détruite dropdown ouvert, le DOM reste orphelin sous body. Plus `@HostListener document:click`. |
| multi-select-editor:74 | oui | `rowDataUpdated` ajouté, **non retiré** | **Fuite** (grille) |
| input-editor, select-editor, combobox, date-editor | oui | focus, columnResized, rowDataUpdated : tous retirés | OK (sauf `selectData`, et un `debounce` de `tableau.service.ts:49` non annulé : timer de 300 ms, faible) |
| date-renderer, text-tooltip-renderer | oui | columnResized retiré | OK |
| action-renderer-edit, action-renderer-delete | oui | focus retiré | OK |
| action-render-clear-filter (ancien dossier) | oui | retire un focus jamais ajouté | Mort ou à nettoyer |
| action-renderer-clear-filter | non | aucun | **Fuite** via `getData()`, plus `refreshHeader()` et `resetColumnState()` au clic |
| list-floating-filter, input-filter | non / oui | aucun | **Fuite** via `getData()` |
| interrupteur-radio, interrupteur-select-editor, checkbox | `@AutoUnsubscribe` | aucun | OK. interrupteur-select-editor rend `<option>` × data dans **chaque ligne** (DOM). |
| admin/fabrication/parametre-distribution/details-param-distr | oui | rowDataUpdated ajouté, cellEditingStarted retiré | **Fuite** (grille maître) |
| admin/fabrication/ressource/details, produit/fichier/details | oui | retirés | OK |
| produit/adresse-retour/detail-adresse-retour | non | aucun | `subscriptions[]` jamais vidé |

**Autres `gridApi.addEventListener`**

- produit/commande/modal/compare-modal/compare-modal/compare-modal.component.ts:72 : `paginationChanged` → `sizeColumnsToFit`, jamais retiré.
- exploitation-editique/massification/service/tableau/components/tableau-massification.component.ts:168 : `filterChanged`, non retiré.
- produit/notice/affectation-notice/modal/modal-ajout/modal-ajout.component.ts:75 : OK, retiré l.223.

**Solution-type**

```ts
export class MultiSelectFloatingFilterComponent implements IFloatingFilterAngularComp, OnDestroy {
  private onModelUpdated = () => this.modelUpddated();
  agInit(p) { this.params = p; p.api.addEventListener('modelUpdated', this.onModelUpdated); }
  ngOnDestroy() { if (!this.params.api.isDestroyed()) this.params.api.removeEventListener('modelUpdated', this.onModelUpdated); }
}
```

### § A4. Appels ag-grid coûteux

#### Dans des handlers fréquents (à corriger en priorité)

- fullstack-components/tableau/components/tableau/tableau.component.ts:369 : `redrawRows()` complet dans `onFilterModified`, donc à **chaque frappe ou coche de filtre** sur toutes les grilles. Destruction et recréation de tous les renderers Angular, ce qui amplifie les fuites de §1 et §3.
- tableau.component.ts:680/683 : `refreshHeader()` + `refreshCells({force:true})` dans `resetSortAndFilters`, lui-même appelé par `addRow`.
- fullstack-components/tableau/ag-grid-components/action-renderer-clear-filter/action-renderer-clear-filter.component.ts:44-45 et shared/utils/AgGridUtil.ts:176-177 (`resetFilterAndColumnSort`, appelé à chaque recherche, par exemple exploitation-editique/massification/massification.component.ts:152) : `refreshHeader()` + `resetColumnState()`. En-têtes et floating filters sont recréés, et chaque recréation fuit (§1).
- exploitation-editique/massification/massification.component.ts:143 : `redrawRows()` complet à **chaque `onRowClicked`**, et :149.
- fullstack-components/tableau/services/tableau-configuration-builder.service.ts:251 : `sizeColumnsToFit()` dans `onGridSizeChanged`, et :263 dans `onFirstDataRendered`.
- produit/commande/modal/compare-modal/compare-modal/compare-modal.component.ts:72 : `sizeColumnsToFit` à chaque `paginationChanged`.
- suivi/facturation/facturation-detaillee/facturation-detaillee.component.ts:144/151 : `setGridOption('rowData')` + `setGridOption('columnDefs')` à chaque recherche, avec colonnes dynamiques (recréation des en-têtes, donc fuite).
- produit/notice/affectation-notice/affectation-notice.component.ts:253-254 et 343-344 : `refreshCells({force:true})` **puis** `redrawRows()` (redondant).
- admin/contenu/faq/faq.component.ts:171 : `setTimeout(() => redrawRows(), 100)` à chaque chargement.
- fullstack-components/tableau/services/tableau-modifiable.service.ts:77, 97, 148, 204 et fullstack-components/tableau/services/tableau-errors.service.ts:160 : `redrawRows()` complet à chaque entrée ou sortie d'édition.

#### Après sauvegarde ou suppression (fréquence faible, mais complet au lieu de ciblé)

- admin : moteur-adelaide:159, serveur:156, gamme:172, parametre-distribution:102, ressource:287, verrou:91, environnement:145, organismes:189, sites:169, regions:150, application-definition:234, service:136, tarif:217, tarif-details:177, client:147, contenu/page-accueil:153 et 206, contenu/aide:373
- produit : destinataire:137, adresse-retour:328, modal-add-adresse-fichier:265, commande:327, papaad:171, distribution-reference:158, distribution-imprime:150, affectation-notice:202, tableau-notice:114, fichiers:390
- suivi/bon-travail/bon-travail.component.ts:505, supervision/cereus/cereus.component.ts:94
- exploitation-editique : creation-bon-travail-manuel-modal:112, bon-travail-manuel:191, reedition-massification:147, reedition-ressource:299, massification:259

`redrawRows({rowNodes:[node]})` est déjà ciblé (OK) : aide:135/161, status-column-handler:147, tableau-parametre-edition-colonne.service:261/344, tableau-parametre-edition.service:425/434, tableau-notice.service:360.

#### Réassignation de `this.columnDefs` hors init (en-têtes et floating filters recréés, donc fuites §1/§3)

- produit/commande/modal/compare-modal/compare-modal/compare-modal.component.ts:151
- produit/distribution/parametre-edition/parametre-edition-colonne/parametre-edition-colonne/parametre-edition-colonne.component.ts:130
- suivi/facturation/facturation-detaillee/facturation-detaillee.component.ts:149
- suivi/edition/suivi-au-pli/suivi-au-pli.component.ts:59
- supervision/actions/action/details-action/details-action/details-action.component.ts:67, 80, 85
- supervision/production/gestion-occurrence-etape/modal/gestion-occurrence-etape-modal.component.ts:115
- exploitation-editique/massification/massification.component.ts:156 (via `searchMassification`)
- Detail renderers dans `agInit` : admin/tarif/tarif-details/tarif-details.component.ts:65, produit/adresse-retour/detail-adresse-retour/detail-adresse-retour.component.ts:66 (une grille imbriquée par dépliage).

**Solution-type**

```ts
onFilterModified: e => e.api.getDisplayedRowCount() ? e.api.hideOverlay() : e.api.showNoRowsOverlay(), // pas de redrawRows
// cibler : api.refreshCells({ rowNodes:[node], columns:['actions'] }) ou api.redrawRows({ rowNodes:[node] })
// clear filter : api.setFilterModel(null); api.applyColumnState({ defaultState:{ sort:null } }); // sans refreshHeader/resetColumnState
// colonnes dynamiques : garder la même référence si inchangée, et getRowId + transactions pour les données
```

### § A5. HostListener / listeners globaux

| fichier:ligne | Cible | Retrait | Instanciation en masse |
|---|---|---|---|
| shared/services/inactivity-logout.service.ts:54 | document click, keydown, scroll, **mousemove**, touchstart (capture) | oui (`stop`) | Singleton, mais **dans la zone Angular** : une détection de changement app-wide par mousemove ou scroll. **Élevé (CPU)** |
| shared/services/inactivity-logout.service.ts:55 et shared/services/front-token-refresh.service.ts:44 | document visibilitychange | oui | non |
| fullstack-components/tableau/components/tableau/tableau.component.ts:28 | `mouseenter` sur l'hôte, puis `document.querySelectorAll('.ag-cell-wrapper, .ag-header-select-all')` sur **tout le document** | auto | Une par grille. Coût proportionnel au nombre total de cellules à chaque survol. **Moyen** |
| fullstack-components/tableau/ag-grid-components/select-table-editor/select-table-editor.component.ts:173 | document:click | auto | **Oui (cellule)** : N handlers et une détection de changement par clic |
| supervision/production/occurrence-etape/menu/occurrence-etape-menu.component.ts:19 | document:click | auto | non (1) |
| supervision/production/occurrence-application/timeline/timeline.component.ts:52 | document:click | auto | non |
| shared/components/select-from-table-list/select-from-table-list.component.ts:13, 14, 90 | document contextmenu et click, window:resize | auto | non (preselection) |
| fullstack-components/label-valeur/components/label-valeur/label-valeur.component.ts:53 | window:resize | auto | Moyen : environ 12 par detail renderer ressource |
| fullstack-components/onglets/components/onglet/onglet.component.ts:150 | window:resize | auto | non |
| fullstack-components/wizard/components/wizard/wizard.component.ts:92 | window:resize | auto | non |
| shared/directives/resizable-column.directive.ts:58-59 | document mousemove et mouseup | oui | OK |
| supervision/production/occurrence-etape/dag-network/dag-network.component.ts:355-356 | document | oui | OK |

**Solution-type**

```ts
private zone = inject(NgZone);
start() { this.zone.runOutsideAngular(() =>
  this.activityEvents.forEach(ev => document.addEventListener(ev, this.onActivity, { passive:true, capture:true }))); }
// Cellules : écouter document seulement quand le dropdown est ouvert
open() { this.unlisten = this.renderer.listen('document', 'click', e => ...); }
close() { this.unlisten?.(); }
```

### § A6. setTimeout / setInterval / requestAnimationFrame

- `requestAnimationFrame` : 0.
- `setInterval` : 1, supervision/document-dematerialise/video/video.component.ts:231 (nettoyé via `startStop()` dans `ngOnDestroy`, OK ; mais le `subscriptions[]` grossit, voir §1).
- Polling par `setTimeout` récursif : supervision/production/occurrence-etape/occurrence-etape.component.ts:541 et supervision/production/occurrence-application/occurrence-application.component.ts:69, nettoyés en destroy (OK).
- `setTimeout` non stockés (environ 27 fichiers), tous courts et non récurrents. Faible, mais ils peuvent s'exécuter sur un composant détruit :
  - Renderers : input-editor:211, select-editor:173, combobox:156, date-editor (`checkTooltipDisplay`, un par cellule à chaque redraw).
  - fullstack-components/tableau/services/tableau.service.ts:55 : debounce de columnResized, non annulé en destroy.
  - admin/contenu/faq/faq.component.ts:171 (`redrawRows`), admin/contenu/aide/aide.component.ts, admin/contenu/popup-help/onglets/faq/popup/popup-faq.component.ts (3), shared/preselection/preselection.component.ts (2), fullstack-components/onglets/components/onglet/onglet.component.ts, fullstack-components/menu-vertical/components/menu-vertical/menu-vertical.component.ts, fullstack-components/liste-deroulante/*, fullstack-components/shared/date-picker/date-picker.component.ts, fullstack-components/interrupteur/components/interrupteur-litteral/interrupteur-litteral.component.ts, exploitation-editique/reedition/reedition-ressource/reedition-ressource.component.ts, produit/adresse-retour/modal/modal-add-adress/modal-add-adress.component.ts, services/generate-file.service.ts.
  - Déjà nettoyés : fullstack-components/tableau/components/pagination/pagination.component.ts:59 et produit/commande/search/search-commande-compare-modal/search-commande-compare-modal.component.ts.

**Solution-type**

```ts
const id = setTimeout(fn); this.destroyRef.onDestroy(() => clearTimeout(id));
// ou timer(0).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(fn)
```

### § A7. `*ngFor` / `@for`

- 102 `*ngFor`, **0 trackBy**. 12 `@for`, tous avec `track` ; attention aux `track rowData` sur `rowsToDelete.slice(0,20)` (admin/popup/confirmation-popup/confirmation-popup.component.html:19 et :46), dont le tableau est recréé à chaque CD.

#### Grandes collections ou collections recréées à chaque CD (prioritaires)

| fichier:ligne | Expression | Problème |
|---|---|---|
| fullstack-components/liste-deroulante/components/liste-deroulante-multiple/liste-deroulante-multiple.component.html:48 | `form['controls'] \| keyvalue: customSort` | `customSort` est un **getter qui renvoie une nouvelle fonction à chaque CD**, d'où un re-tri. Le form est remplacé à chaque `modelUpdated`, donc toutes les cases (valeurs uniques de la colonne) sont recréées. Le `ngbDropdownMenu` est rendu même fermé : **principal volume DOM des floating filters**. |
| shared/components/multi-select-section/multi-select-section.component.html:23 | idem (getter `customSort`, l.88) | idem |
| fullstack-components/liste-deroulante/components/liste-deroulante-hierarchisee/liste-deroulante-hierarchisee.component.html:46 et liste-deroulante-hierarchisee-form/liste-deroulante-hierarchisee-form.component.html:30 | `form.controls \| keyvalue` | Organismes, grosse liste |
| fullstack-components/tableau/ag-grid-components/multi-select-editor/multi-select-editor.component.html:34, :67 | `keyvalue` imbriqués | Par cellule en édition, rendus dans un dropdown fermé |
| fullstack-components/tableau/ag-grid-components/combobox/combobox.component.html:64, 67 | `getFiltredData(data)` | `filter` à chaque CD, appelé 2 fois, par cellule |
| fullstack-components/tableau/ag-grid-components/select-editor/select-editor.component.html:26 | `data` | `<option>` × options par cellule en édition |
| fullstack-components/tableau/ag-grid-components/interrupteur-select-editor/interrupteur-select-editor.component.html:5 | `data` | `<option>` × options dans **chaque ligne**, même hors édition |
| fullstack-components/tableau/ag-grid-components/list-floating-filter/list-floating-filter.component.html:6, 9 | Valeurs possibles | Par colonne |
| shared/components/select-list-with-input/select-list-with-input.component.html:58 | `getFiltredData(options)` | `filter` à chaque CD |
| shared/components/select-from-table-list/select-from-table-list.component.html:44, 51, 60 | `getHeaderColumns()` (`map`, nouveau tableau) ; `options` et colonnes | Données serveur |
| shared/components/single-select-hierarchise-list/single-select-hierarchise-list.component.html:34 et single-liste-hierarchise-form/single-liste-hierarchise-form.component.html:30 | `keyvalue` | |
| fullstack-components/arborescence/components/arborescence-children/arborescence-children.component.html:2 | `formGroup.controls \| keyvalue` | Arbre récursif |
| produit/fichier/modal/organisme-client-modal/organisme-client-modal.component.html:7, produit/fichier/modal/edit-modal/edit-modal/edit-modal.component.html:216, produit/fond-page/reference/popup/modal-component/modal-imprime.component.html:3 | `keyvalue` | |
| supervision/service/service.component.html:88 | `healthCheck.details \| keyvalue` | |
| supervision/document-dematerialise/video/video.component.html:95 | `docType` | Réassigné toutes les 10 s, recréation de toutes les lignes |
| Tableaux de données serveur | incidents:16/17, facturation:16/17, generalites:15, facturation-fichier:21, produits-fichier:23, commande-details:22, detail-suivi-au-pli:6/11/16/31, details-action:34/38/39, details-etape:10, details-incidents:12, details-fichier:10, video details:12, modal-update:76/134/163, step-exemplaire:27/30, habilitations:19/76/89, admin/popup/popup-confirmation/popup-confirmation.component.html:13 | Sans trackBy |
| fullstack-components/notes/components/note-statique/note-statique.component.html:1 | `notesService.staticToasts` | Voir bug §13 |
| fullstack-components/tableau/ag-grid-components/multi-select-floating-filter/multi-select-floating-filter.component.html:2 | `[form]="getFormGroup()"` | |

Le reste (`errorMessage` ×9, `onglets` ×14, menus, boutons, breadcrumb) porte sur de petites listes statiques : faible.

**Solution-type**

```html
@for (item of form.controls | keyvalue: sortFn; track item.key) { ... }   <!-- sortFn = propriété readonly, pas un getter -->
@if (dropdown.isOpen()) { <div ngbDropdownMenu>…</div> }               <!-- ne pas rendre les options fermées -->
```

```ts
readonly sortFn = (a, b) => StringUtil.compareKeys(a.key, b.key);
filtered = computed(() => this.data().filter(...));   // signal au lieu de getFiltredData()
```

### § A8. Appels de fonctions ou getters dans les templates

171 appels de méthode résolus dans les bindings, dont 63 coûteux (`filter`, `map`, `Object.keys`, `some`, `getSelected*`).

- **Par cellule ou floating filter** (multiplié en masse) :
  - fullstack-components/tableau/ag-grid-components/combobox/combobox.component.html:64, 67 (`getFiltredData`)
  - fullstack-components/tableau/ag-grid-components/multi-select-editor/multi-select-editor.component.html:38 (×3), 45, 53, 63 (`isDisable`, `Object.keys`)
  - fullstack-components/tableau/ag-grid-components/multi-select-floating-filter/multi-select-floating-filter.component.html:2 (`getFormGroup`, `Object.keys`)
  - fullstack-components/liste-deroulante/components/liste-deroulante-multiple/liste-deroulante-multiple.component.html:30 (`getElementToDisplay`, `Object.keys` + `filter`), :34 (`hideSelectAllCheckbox`), plus le getter `customSort`
  - fullstack-components/liste-deroulante/components/liste-deroulante-hierarchisee/liste-deroulante-hierarchisee.component.html:29 (`getElementToDisplay`)
- **API ag-grid à chaque CD** :
  - fullstack-components/tableau/components/tableau/tableau.component.html:27, 36 (`isEnableButton` → `getSelectedRows`), :46 (`isEnableCompleteButton`), :17 (`gridApi?.getSelectedNodes()` inline)
  - exploitation-editique/massification/service/tableau/components/tableau-massification.component.html:48, 51
  - exploitation-editique/reedition/reedition-massification/reedition-massification.component.html:24, exploitation-editique/reedition/reedition-produit/reedition-produit.component.html:21, exploitation-editique/reedition/reedition-ressource/reedition-ressource.component.html:21
  - exploitation-editique/controle-integrite-prod/controle-integrite-prod.component.html:26
  - produit/adresse-retour/modal/modal-add-adresse-fichier/modal-add-adresse-fichier.component.html:79
  - produit/notice/affectation-notice/affectation-notice.component.html:45, produit/notice/affectation-notice/modal/modal-ajout/modal-ajout.component.html:40
  - suivi/bon-travail/bon-travail.component.html:50, 74
  - supervision/production/gestion-occurrence-etape/modal/gestion-occurrence-etape-modal.component.html:32
- **Autres** :
  - admin/fabrication/ressource/details/details.component.html:20, 26, 34, 50 et produit/fichier/details/details.component.html:38, 67, 96 (`getTectByValue`, `filter`, dans des detail renderers)
  - produit/fichier/modal/step-exemplaire/step-exemplaire.component.html:5 et produit/fichier/modal/step-generalite/step-generalite.component.html:5 (`getEnvironnement`, `forEach` + `keys`)
  - supervision/document-dematerialise/video/video.component.html:97, 100, 103 (`formatDocument`, `filter`)
  - shared/components/select-from-table-list/select-from-table-list.component.html:15, 18, 26, 44, 55, 58
  - shared/components/select-list-with-input/select-list-with-input.component.html:55, 58
  - shared/components/single-select-hierarchise-list/single-select-hierarchise-list.component.html:29, 38
  - produit/distribution/parametre-edition/parametre-edition-colonne/parametre-edition-colonne/parametre-edition-colonne.component.html:9 (`isDeleteButtonActive`, `keys` + `some`)
  - exploitation-editique/reedition/reedition-massification/search/massificationsearch/massificationsearch.component.html:70, exploitation-editique/reedition/reedition-produit/search/produitsearch/produitsearch.component.html:89, exploitation-editique/reedition/reedition-produit/add-modal/add-reedition-produit-modal.component.html:32, 48, 64, exploitation-editique/reedition/reedition-ressource/add-exemplaire-modal/add-exemplaire-modal.component.html:25, 41, produit/commande/modal/add-modal/add-commande-modal/add-commande-modal.component.html:59 (`get*Control().some`)
  - admin/contenu/popup-help/onglets/conversation/list-question/list-question.component.html:10, 17 et admin/contenu/popup-help/onglets/faq/faq.component.html:29
  - layout/nav/nav.component.ts `isPanelOpen()` (`router.url.startsWith`, appelé de nombreuses fois dans les 421 lignes du template)
- Pipes `pure:false` : 0.

**Solution-type** : calculer une fois dans l'événement concerné (`selectionChanged` → `this.selectedCount.set(api.getSelectedRows().length)`), ou utiliser un pure pipe ou `computed()`.

```ts
@Pipe({ name: 'selectedLabel', standalone: true }) export class SelectedLabelPipe implements PipeTransform {
  transform(v: Record<string, boolean>, def: string) { const k = Object.keys(v).filter(x => v[x]); return k.length === 1 ? k[0] : k.length ? `${k.length} sélectionnés` : def; }
}
// {{ formValue | selectedLabel: defaultText }}  où formValue est mis à jour via valueChanges
```

### § A9. Détection de changement

- **OnPush : 9 composants sur 271 (3,3 %)** : produit/adresse-retour/modal/modal-add-adress/modal-add-adress.component.ts, suivi/bon-travail/search/search-bon-travail/search-bon-travail.component.ts, exploitation-editique/consolidation-facturation/consolidation-facturation.component.ts, et 6 petits cell renderers popup (suivi/production/occurrences-fichiers/service/popup-periode-cell-renderer.component.ts, popup-fichier-cell-renderer.component.ts, suivi/edition/suivi-au-pli/service/popup-cell-renderer.component.ts, compte-renderer.component.ts, supervision/actions/action/service/popup-cell-renderer.component.ts, supervision/actions/action-utilisateur/service/popup-cell-renderer.component.ts). Aucun composant de `fullstack-components/tableau` n'est en OnPush.
- `detectChanges()` dans les hooks « Checked » (boucle de détection à chaque cycle) :
  - **layout/container/container.component.ts:54-56** : `ngAfterContentChecked` → `detectChanges()` + `document.getElementsByTagName('app-onglet')` : double chaque détection de l'application. **Élevé.**
  - admin/habilitations/habilitations.component.ts:163-164 (`ngAfterViewChecked`)
  - fullstack-components/arborescence/components/arborescence-collapse/arborescence-collapse.component.ts:62-63 (`ngAfterViewChecked`, **récursif, une instance par nœud d'arbre**)
  - fullstack-components/onglets/components/onglet/onglet.component.ts:140-146 (`ngAfterViewChecked`, avec mesures DOM)
- Autres `detectChanges` : layout/container/container.component.ts:45 (sur une vue potentiellement détruite, voir §1), fullstack-components/label-valeur/components/label-valeur/label-valeur.component.ts:50, fullstack-components/wizard/components/wizard/wizard.component.ts:89, fullstack-components/interrupteur/components/interrupteur-litteral/interrupteur-litteral.component.ts:42, exploitation-editique/consolidation-facturation/consolidation-facturation.component.ts:145, 254, produit/adresse-retour/modal/modal-add-adress/modal-add-adress.component.ts:108, 115.
- `ngDoCheck` : 0.
- main.ts : aucun `ngZoneEventCoalescing` ; jQuery slim et bootstrap.bundle JS sont chargés globalement mais inutilisés dans `src/app` (0 appel `$(`).

**Solution-type**

```ts
@Component({ changeDetection: ChangeDetectionStrategy.OnPush, ... })  // en priorité : cell renderers, floating filters, liste-deroulante-*, label-valeur
// container : supprimer ngAfterContentChecked ; hasOnglet via un @ContentChild ou un service
platformBrowserDynamic().bootstrapModule(AppModule, { ngZoneEventCoalescing: true, ngZoneRunCoalescing: true });
```

### § A10. Manipulation DOM directe

| fichier:ligne | Action | Nettoyage |
|---|---|---|
| fullstack-components/tableau/ag-grid-components/select-table-editor/select-table-editor.component.ts:88-121 | `createElement` div et table, `innerHTML`, `document.body.appendChild`, listener click | Retiré seulement par `closeDropdown` ; **pas de `ngOnDestroy`** : conteneur orphelin sous body si la cellule est détruite dropdown ouvert (redraw, scroll, pagination). `innerHTML` construit avec des données non échappées (XSS). |
| fullstack-components/tableau/services/tableau-errors.service.ts:78-85 et :120-127 | `document.querySelectorAll('app-note-statique')` puis `note.remove()` | **Retire des nœuds gérés par Angular** : les vues ne sont pas détruites et restent attachées au LView, soit du DOM détaché retenu. |
| admin/contenu/services/status-column-handler.service.ts:37-95, admin/contenu/aide/service/tableau-aide.service.ts:130/193, admin/contenu/faq/service/tableau-faq.service.ts:120/151/158, suivi/bon-travail/service/tableau-bon-travail.service.ts:105, exploitation-editique/reedition/reedition-ressource/service/tableau-reedition-ressources.service.ts:85, exploitation-editique/reedition/reedition-produit/service/tableau-reedition-produit.service.ts:96 | cellRenderers vanilla : `createElement` + `addEventListener` sur l'élément créé | Libérés avec l'élément (faible). Les closures capturent `params` et `this` (service root). |
| admin/contenu/aide/service/tableau-aide.service.ts:219 et admin/contenu/faq/service/tableau-faq.service.ts:244 | `tempDiv.innerHTML` (extraction de texte) | Temporaire (faible). |
| supervision/production/occurrence-etape/occurrence-etape.component.ts:365-372, supervision/production/occurrence-application/timeline/timeline.component.ts:253-260 | Nœuds pour vis-network ou vis-timeline | `network.destroy()` et `timeline.destroy()` sont présents (OK). |
| produit/notice/service/file-upload.service.ts:85 | `input[type=file]` non attaché | Faible. |
| shared/directives/session-data-search.directive.ts:147/179/215 | `MutationObserver` | `disconnect()` seulement en cas de match. Sinon il observe jusqu'au GC (moyen-faible ; `subtree:true` à la l.179). |
| jQuery | 0 appel dans `src/app` | jquery.slim est importé dans main.ts pour rien. |

**Solution-type** : utiliser un `NgbDropdown` ou un overlay CDK avec `container="body"` plutôt que `document.body.appendChild` ; sinon `ngOnDestroy(){ this.closeDropdown(); }`. Ne jamais faire `.remove()` sur un nœud Angular : dédoublonner les toasts dans `NotesService` (par exemple `if (!this.staticToasts.some(t => t.title === toast.title)) push`).

### § A11. NgbModal.open

- **79 appels `.open(`**, 14 `.result` (`.then` sans `catch` : rejet non géré au dismiss), 1 `modalRef.closed.subscribe` (se termine), **0 `dismissAll()`**, aucun `NgbModalConfig`.
- Les modales restent ouvertes après une navigation : admin/contenu/aide/aide.component.ts:203 et 283 et admin/contenu/faq/faq.component.ts:201 et 234 sont ouvertes avec `backdrop:false`, ce qui permet de naviguer pendant qu'elles sont affichées.
- Les modales qui contiennent des composants à watchQuery non libérées (onglets de shared/components/modal/details/*, massification-modal, simulation-modal, popup-aide, popup-faq) fuient à chaque ouverture (§1).
- Ouvertes depuis des cell renderers (une instance par ligne, faible) : suivi/production/occurrences-fichiers/service/popup-periode-cell-renderer.component.ts:40, popup-fichier-cell-renderer.component.ts:47, suivi/edition/suivi-au-pli/service/popup-cell-renderer.component.ts:31, supervision/actions/action/service/popup-cell-renderer.component.ts:35, supervision/actions/action-utilisateur/service/popup-cell-renderer.component.ts:35, fullstack-components/tableau/ag-grid-components/action-renderer-upload-file/action-renderer-upload-file.component.ts:48, action-renderer-add-exemplaire.
- Abonnements `passEntry` : listés en §1 (faible).

**Solution-type**

```ts
// AppComponent
inject(Router).events.pipe(filter(e => e instanceof NavigationStart), takeUntilDestroyed()).subscribe(() => inject(NgbModal).dismissAll());
modalRef.result.then(ok, () => {});   // ou modalRef.closed.pipe(take(1))
```

### § A12. ngbPopover / ngbTooltip avec `container="body"`

49 occurrences dans 28 templates, dont 12 templates avec `container="body"`.

- **Instanciés en masse, dans des cellules ag-grid** (une directive NgbPopover par cellule, recréée à chaque `redrawRows`) :

| Template (fullstack-components/tableau/ag-grid-components/…) | ngbPopover / container=body |
|---|---|
| input-editor/input-editor.component.html | 3 / 3 |
| select-editor/select-editor.component.html | 3 / 3 |
| combobox/combobox.component.html | 3 / 4 |
| date-editor/date-editor.component.html | 3 / 4 |
| multi-select-editor/multi-select-editor.component.html | 2 / 3 |
| text-tooltip-renderer/text-tooltip-renderer.component.html | 1 / 1 |
| date-renderer/date-renderer.component.html | 1 / 1 |

  `[disablePopover]` limite l'ouverture, mais pas l'instanciation. La destruction est gérée par NgbPopover (risque de popover orphelin faible en ng-bootstrap 18), mais le coût mémoire et CD est proportionnel au nombre de cellules.
- `ngbDropdown container="body"` dans les floating filters : fullstack-components/liste-deroulante/components/liste-deroulante-multiple/liste-deroulante-multiple.component.html:14 et liste-deroulante-hierarchisee/liste-deroulante-hierarchisee.component.html:14.
- fullstack-components/label-valeur/components/label-valeur/label-valeur.component.html (environ 12 par detail renderer).
- Hors masse : fullstack-components/shared/date-picker/date-picker.component.html, shared/components/select-list-with-input/select-list-with-input.component.html, shared/components/single-select-hierarchise-list/single-select-hierarchise-list.component.html.

**Solution-type** : ne créer le popover que si le texte déborde (`@if (enableTooltip) { <div [ngbPopover]…> } @else { <div> }`), ou utiliser le tooltip natif ag-grid (`tooltipValueGetter` + `tooltipShowMode:'whenTruncated'`) au lieu d'un ngbPopover par cellule.

### § A13. Services root à état non borné

| Service (root) | État | Problème |
|---|---|---|
| **Apollo `InMemoryCache` et `QueryManager`** (graphql.module.ts) | Map des ObservableQuery | Chaque watchQuery non désabonnée y reste ; la clé `no-cache` ne l'empêche pas. **Élevé** (238 watchQuery). |
| services/filter-shared-data.service.ts:8 | `BehaviorSubject` | Observers jamais retirés (§1), liste qui grossit à chaque grille. **Élevé.** |
| services/loaderServeice/loader.service.ts:9 | `ReplaySubject(1)` | Observers des `ContainerComponent` morts. **Élevé.** |
| layout/nav/service/version.service.ts:11, 13 | `shareReplay(1)` sur watchQuery | Observers des `NavComponent` morts. |
| fullstack-components/notes/services/notes.service.ts:40-41 | `toasts[]`, `staticToasts[]` | **Bug** : fullstack-components/notes/components/note-statique/note-statique.component.html:7 appelle `(hidden)="notesService.remove(toast)"` au lieu de `removeStatic`. Les toasts statiques auto-masqués restent dans `staticToasts` (ngb-toast caché, `app-note-template` et svg-icons restent dans le DOM) jusqu'à `removeAllStatic` (destroy de tableau, papaad, tableau-massification). Les erreurs identiques s'empilent. |
| produit/distribution/parametre-edition/service/tableau-parametre-edition.service.ts:29 | `subscriptions: Subscription[]` | Grossit à chaque édition de cellule ; `@AutoUnsubscribe` sur un service root n'est jamais déclenché. |
| fullstack-components/tableau/services/tableau-modifiable.service.ts:18, 27 | 2 BehaviorSubject | Observers poussés et libérés par `TableauComponent` (OK). |
| shared/utils/data.service.ts:9, produit/notice/service/tableau-notice.service.ts:25, produit/adresse-retour/service/communication-adresse-retour.service.ts:8, shared/services/notifications-refresh.service.ts:8, layout/service/authentification-verification.service.ts:8, 11 | Subjects | Abonnés vérifiés gérés (poussés ou `takeUntil`), sauf layout/authentification/authentification.component.ts:154 (assigné). |
| services/permission/permission.service.ts:8, services/toast.service.ts:7, admin/contenu/faq/service/tableau-faq.service.ts:20 | Tableaux | Réassignés (bornés). |
| services/api-adelaide-select-data.service.ts, services/api-adelaide-search.service.ts | Tableaux + watchQuery | Code mort (aucun appelant) : faux positif, à supprimer. |

**Solution-type** : `(hidden)="notesService.removeStatic(toast)"` ; supprimer `subscriptions[]` des services (retourner l'Observable, ou `take(1)`) ; remplacer `watchQuery` one-shot par `apollo.query`.

### § A14. `URL.createObjectURL` sans `revokeObjectURL`

3 occurrences, 0 révocation :

- produit/notice/service/file-upload.service.ts:34 (`getPdfFilePath`, à chaque clic sur un lien PDF de cellule, via input-editor.component.ts:123)
- services/generate-file.service.ts:421 (après `FileSaver.saveAs`, plus `window.open`)
- suivi/bon-travail/service/tableau-bon-travail.service.ts:188 ; `base64ToBlob` y crée en plus un `new Array(n)` de nombres (8 octets par octet de PDF, pic mémoire)

**Solution-type**

```ts
const url = URL.createObjectURL(blob);
window.open(url, '_blank');
setTimeout(() => URL.revokeObjectURL(url), 60_000);
// base64 → Uint8Array.from(atob(b64), c => c.charCodeAt(0))
```

### Ordre de correction recommandé (gain attendu sur DOM et heap)

1. `takeUntilDestroyed` sur les 7 abonnements `FilterSharedDataService.getData()` : column-header, input-filter, list-floating-filter, multi-select-hierarchisee, action-renderer-clear-filter, liste-deroulante-multiple, plus les 4 `selectData.subscribe` (select-editor, combobox, multi-select-editor, select-table-editor).
2. Retirer les listeners `modelUpdated` (multi-select-floating-filter, multi-select-hierarchisee, qui doit aussi sortir le `subscribe` du handler), le `rowDataUpdated` de multi-select-editor et de details-param-distr.
3. Supprimer `redrawRows()` dans `onFilterModified` et les `refreshHeader()` + `resetColumnState()` du clear filter.
4. ContainerComponent : libérer `httpProgress`, supprimer `ngAfterContentChecked` → `detectChanges`. Breadcrumb : `takeUntilDestroyed` sur `router.events`. Nav : `take(1)` ou `toSignal`.
5. Passer les requêtes one-shot de `watchQuery` à `apollo.query` (ou `take(1)`), en commençant par les modales, onglets et handlers listés au §1.
6. `InactivityLogoutService` en `runOutsideAngular` ; activer le coalescing ; passer en OnPush les cell renderers et les floating filters.
7. Ne rendre le contenu des `ngbDropdownMenu` que lorsqu'ils sont ouverts, pour les floating filters et éditeurs ; `track` partout ; `sortFn` stable au lieu du getter `customSort`.
8. Corriger `note-statique` (`removeStatic`) et supprimer les `note.remove()` ; ajouter `revokeObjectURL` ; `dismissAll` à la navigation.

Les scripts d'inventaire sont dans le scratchpad : `/tmp/claude-0/-home-user-posdoc-ihm/60ccb58e-465d-5b5f-b1bd-a5b7cdac16f3/scratchpad/subs2.py` (classification des 606 subscribe, sortie dans `subs2.json`) et `tpl.py` (fonctions appelées dans les templates).
