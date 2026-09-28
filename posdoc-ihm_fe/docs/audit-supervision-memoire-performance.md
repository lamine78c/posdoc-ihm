# Audit qualité & performance — Module Supervision

> **Périmètre** : `src/app/supervision/**` (actions, cereus, document-dematerialise, production, service) + `src/app/suivi/**` (bon-travail, edition, facturation, massification, production, volume-traite) + `src/app/exploitation-editique/**` (bon-travail-manuel, consolidation-facturation)
> **Contexte** : plaintes utilisateurs sur des lenteurs, surtout lors des changements d'onglet
> **Date** : 15/09/2026 — **Statut** : fuites mémoire corrigées et validées ; optimisations performance analysées, **en attente de décision** avant correction

---

## 1. Synthèse

| Axe | État |
|---|---|
| Fuites mémoire (subscriptions) | ✅ **Corrigées** — 22 fichiers modifiés, 5 dossiers audités |
| Cause n°1 des lenteurs au switch d'onglet | 🔴 Analysée — destruction/remontée des onglets + refetch systématique |
| Mauvaises pratiques de performance | 🟠 Analysées — 5 constats documentés (§4) |
| Corrections performance appliquées | ✅ 1 seule (DatePipe par cellule, cereus) |

**Validation globale** : `tsc --noEmit` 0 erreur + suites de tests Karma passées à chaque lot de corrections (actions 11/11, document-dematerialise 19/19, production 52/52, service 9/9).

---

## 2. Fuites mémoire corrigées (terminé)

### 2.1 Problème structurel identifié
- Les services API utilisent systématiquement `apollo.watchQuery(...).valueChanges` : cet observable **ne se termine jamais** (contrairement à `apollo.query()`/`apollo.mutate()`).
- Sans désinscription explicite, chaque subscription retient l'instance du composant (closure sur `this`) et un `QueryRef` Apollo ouvert, **indéfiniment**.
- Les onglets étant rendus avec `*ngIf` (détruits/recréés à chaque switch), les fuites étaient **cumulatives à chaque navigation**.

### 2.2 Corrections appliquées par dossier

| Dossier | Fichiers corrigés | Nature des fuites |
|---|---|---|
| `actions` | `action.component.ts`, `search-action-utilisateur.component.ts` (+ `take(1)` sur lectures one-shot de 3 autres fichiers) | Import `Subscription` depuis `apollo-angular` (mauvaise classe, empêchait le `push` → subscription jamais enregistrée) ; composant sans `@AutoUnsubscribe` avec 5 subscriptions |
| `cereus` | `cereus.component.ts` | Fuite **latente** (composant non encore routé) : `watchQuery` jamais désinscrite, aucun mécanisme de nettoyage |
| `document-dematerialise` | `consultation.component.ts`, `video.component.ts`, `details.component.ts`, `search-document-dematerialise.component.ts` | ⚠️ Cas critique : `lister()` appelé **toutes les 5 s par `setInterval`** → 1 subscription permanente perdue par tick (720/h). Plus 3 autres subscriptions `watchQuery` non enregistrées |
| `production` | 10 fichiers (composants gestion, recherche, modales d'onglets) | `search()`/`searchOccurrenceEtape()` non enregistrées ; 3 `valueChanges` non poussés ; `getPeriode()` recréait une subscription à chaque frappe (accumulation) ; 5 modales avec `watchQuery` sans aucun nettoyage |
| `service` | `service.component.ts` | Déjà conforme — ajout de `take(1)` par cohérence uniquement |

### 2.3 Conventions désormais respectées
- `@AutoUnsubscribe` sur tout composant souscrivant + `subscriptions: Subscription[]`
- `push` systématique dans le tableau (sécurité : annule la requête si le composant est détruit en cours de vol)
- `take(1)` **uniquement** sur les lectures one-shot (`watchQuery` + `no-cache`), **jamais** sur les flux continus (`valueChanges`, `fragment`, polling)
- Patterns exemplaires préservés tels quels : `occurrence-application` (`listerSub?.unsubscribe()` + poll après complétion), `occurrence-etape` (`destroy$` + `takeUntil`), `dag-network` (retrait listeners DOM + `network.destroy()`)

### 2.4 Recommandation structurelle (à chiffrer)
Migrer les services de `watchQuery()` vers `apollo.query()` pour les lectures ponctuelles éliminerait cette classe de fuites à la source. **Impact** : ces services sont partagés avec d'autres modules → ticket dédié.

---

## 3. Cause n°1 des lenteurs au switch d'onglet 🔴

### 3.1 Mécanisme constaté
1. `app-onglet` (`fullstack-components/onglets`) utilise **NgbNav sans `destroyOnHide="false"`** → le contenu de l'onglet est détruit à chaque switch (comportement ngbNav par défaut).
2. En plus, les composants parents doublent cette destruction avec `*ngIf="labelActif === ..."` sur chaque onglet (`production.component.html`, `actions.component.html`, `document-dematerialise.component.html`).
3. **27 requêtes de "config"** (`getDistinct*`, `getSearchElement*`, `getConfigData`, `getAllServices`…) sont déclenchées au montage des composants, **toutes en `fetchPolicy: 'no-cache'`** → aucun cache nulle part.
4. Re-création complète des grilles ag-grid (columnDefs, floating filters, pagination) et des composants lourds (vis-network, timeline).

**Bilan** : chaque switch d'onglet = 2 à 5 aller-retour GraphQL + reconstruction des grilles → c'est très probablement la cause principale du ressenti utilisateur.

### 3.2 Options de correction (à arbitrer)
- **Option A — onglets vivants (keepAlive)** : `destroyOnHide="false"` sur le ngbNav de `onglet.component.html` + remplacer les `*ngIf` parents par `[hidden]`. Switch instantané, zéro refetch. ⚠️ Contreparties : RAM (grilles des 4 onglets cohabitent), logique `unsavedChange`/`labelActif` à revalider.
- **Option B — cache des configs (recommandé en premier)** : service fourni dans `SupervisionModule` (scope module, pas `root`) mémorisant les listes distinct/env/org/app à la première récupération. Moins invasif, gros gain, compatible avec la destruction des onglets.

---

## 4. Autres mauvaises pratiques de performance 🟠

| # | Constat | Localisation | Impact | Correctif proposé | Priorité |
|---|---|---|---|---|---|
| P1 | ~~`new DatePipe('fr-FR')` dans les `valueFormatter`~~ — une instance recréée **par cellule rendue** (200+/rendu sur 100 lignes × 2 colonnes) | `cereus/service/tableau-cereus.service.ts` | Rendu de grille ralenti | ✅ **Corrigé** : instance unique partagée (`this.datePipe`) | Fait |
| P2 | Polling `setInterval` toutes les 5 s ne respectant pas le temps de réponse : si la requête dépasse 5 s, les requêtes se superposent (charge serveur + réponses hors-ordre écrasant les données) | `document-dematerialise/video/video.component.ts` (`startStop`) | Lenteur perçue, incohérences d'affichage, charge backend | Aligner sur le pattern poll-after-completion déjà utilisé dans `occurrence-application`/`occurrence-etape` (`poll()` + `setTimeout` après résolution) | Haute |
| P3 | `dag-network` détruit et recrée **entièrement** le vis-Network à chaque mise à jour de données (`ngOnChanges` → `destroy` + `createNetwork`), soit toutes les 10 s en mode temps réel | `production/occurrence-etape/dag-network/dag-network.component.ts` | Jank visible, pressions GC | Utiliser `network.setData()` / `moveTo` au lieu de recréer (la position caméra est déjà préservée) | Haute |
| P4 | **Aucun `trackBy` sur les 17 `*ngFor`** du module, dont le mode video (re-rendu toutes les 5 s) ; `formatDocument()` appelé 3×/ligne dans le template (re-exécute `TYPES.find` + joins à chaque cycle de détection) | `document-dematerialise/video/video.component.html` + autres | Re-rendus inutiles massifs en mode temps réel | Ajouter des `trackBy` ; précalculer les libellés formatés dans le modèle (`docType`) | Moyenne |
| P5 | **Aucun `ChangeDetectionStrategy.OnPush`** dans tout le module : chaque tick de polling déclenche une détection complète de l'arbre (grilles, modales, timeline) | Tous les composants | Détection globale lourde | Migration progressive, en commençant par les écrans temps réel | Moyenne |
| P6 | Pipes impures `keyvalue` + `json` recalculées à chaque détection | `service/service.component.html` | Mineur (page peu chargée) | Précalculer côté TS si la page évolue | Basse |

---

## 5. Points déjà sains ✅

- `SupervisionModule` **lazy-loaded** (`loadChildren` dans `app-routing.module.ts`)
- Polling temps réel de `occurrence-application` / `occurrence-etape` : pattern exemplaire (relance uniquement après complétion de la requête précédente + `clearTimeout` en `ngOnDestroy`)
- `dag-network` : listeners DOM (`wheel`, zoom) retirés proprement, timer nettoyé
- Mutations GraphQL (`update`, `termine`, `valideEtape`, `invalideGenEtpEtLiens`, `valideOuInvalideGenEtp`) : observables auto-complétés, sans risque
- Subscriptions sur `EventEmitter` de modales : parent et enfant détruits ensemble → GC

---

## 6. Plan d'action proposé

| Étape | Contenu | Effort | Gain attendu |
|---|---|---|---|
| 1 | ✅ DatePipe par cellule (cereus) — **fait** | — | Rendu grille |
| 2 | Cache des requêtes de config au niveau module (Option B, §3.2) | Faible | **Gros** — ressenti immédiat sur le switch d'onglet |
| 3 | Polling video : alignement sur poll-after-completion (P2) | Faible | Stabilité + charge backend |
| 4 | `destroyOnHide="false"` + retrait des `*ngIf` parents (Option A, §3.2) | Moyen | Gros, à valider après l'étape 2 |
| 5 | `trackBy` + précalculs template (P4) | Moyen | Fluidité mode temps réel |
| 6 | `dag-network` : mise à jour sans recréation (P3) | Moyen | Fluidité temps réel |
| 7 | Migration `OnPush` progressive (P5) | Élevé | Global, à faire incrémentalement |
| 8 | Migration services `watchQuery` → `query` (§2.4) | Élevé | Robustesse structurelle (anti-fuite) |

---

## 7. Fichiers modifiés à ce jour (corrections mémoire + DatePipe)

- `suivi/bon-travail/bon-travail.component.ts`
- `suivi/bon-travail/search/search-bon-travail/search-bon-travail.component.ts`
- `suivi/bon-travail/service/tableau-bon-travail.service.ts` (fuite `openPDFSubscription`)
- `suivi/edition/expedition/distribution-expedition/distribution-expedition.component.ts` (aucun nettoyage + DatePipe par appel)
- `suivi/edition/expedition/distribution-expedition/search/search-distribution-expedition/search-distribution-expedition.component.ts` (décorateur manquant)
- `suivi/edition/suivi-au-pli/suivi-au-pli.component.ts`
- `suivi/edition/suivi-au-pli/detail/detail-suivi-au-pli/detail-suivi-au-pli.component.ts`
- `suivi/edition/suivi-au-pli/search/search-suivi-au-pli/search-suivi-au-pli.component.ts` (valueChanges non poussé)
- `suivi/facturation/facturation-detaillee/facturation-detaillee.component.ts` (aucun nettoyage)
- `suivi/facturation/facturation-detaillee/search-facturation-detaillee/search-facturation-detaillee.component.ts` (aucun nettoyage)
- `suivi/massification/massification.component.ts` (accumulation : réaffectation sans unsubscribe)
- `suivi/massification/massification-search/massification-search.component.ts` (watchQuery config sans take(1))
- `suivi/production/modal/commande-details/commande-details.component.ts` (aucun nettoyage)
- `suivi/production/modal/fichier-details/onglets/facturation-fichier/facturation-fichier.component.ts` (aucun nettoyage)
- `suivi/production/modal/fichier-details/onglets/generalites-fichier/generalites-fichier.component.ts` (aucun nettoyage)
- `suivi/production/modal/fichier-details/onglets/produits-fichier/produits-fichier.component.ts` (aucun nettoyage)
- `suivi/production/occurrences-fichiers/occurrences-fichiers.component.ts` (aucun nettoyage + accumulation)
- `suivi/production/occurrences-application/search/search-occurrence-application/search-occurrence-application.component.ts` (config watchQuery sans take(1))
- `suivi/production/occurrences-fichiers/search/search-occurrences-fichiers/search-occurrences-fichiers.component.ts` (config watchQuery sans take(1))
- `suivi/volume-traite/volume-traite.component.ts` (aucun nettoyage + accumulation)
- `suivi/volume-traite/search/search-volume-traite/search-volume-traite.component.ts` (valueChanges non poussé)
- `exploitation-editique/bon-travail-manuel/bon-travail-manuel.component.ts` (accumulation : réaffectation sans unsubscribe)
- `exploitation-editique/bon-travail-manuel/modal/creation-bon-travail-manuel-modal/creation-bon-travail-manuel-modal.component.ts` (aucun nettoyage, 5 fuites à chaque ouverture de modale)
- `exploitation-editique/bon-travail-manuel/search/search-bon-travail-manuel/search-bon-travail-manuel.component.ts` (watchQuery config sans take(1))
- `exploitation-editique/consolidation-facturation/consolidation-facturation.component.ts` (subscribe non poussé + watchQuery sans take(1))
- `exploitation-editique/consolidation-facturation/search/search-consolidation-facturation.component.ts` (watchQuery config sans take(1))
- `exploitation-editique/controle-integrite-prod/controle-integrite-prod.component.ts` (accumulation légère : watchQuery sans take(1))
- `exploitation-editique/controle-integrite-prod/search/search-controle-integrite-prod/search-controle-integrite-prod.component.ts` (watchQuery config sans take(1))
- `supervision/actions/action/action.component.ts`
- `supervision/actions/action/search/search-action/search-action.component.ts`
- `supervision/actions/action-utilisateur/action-utilisateur.component.ts`
- `supervision/actions/action-utilisateur/details-action-utilisateur/details-action-utilisateur.component.ts`
- `supervision/actions/action-utilisateur/search/search-action-utilisateur/search-action-utilisateur.component.ts`
- `supervision/cereus/cereus.component.ts`
- `supervision/cereus/service/tableau-cereus.service.ts` (DatePipe)
- `supervision/document-dematerialise/consultation/consultation.component.ts`
- `supervision/document-dematerialise/consultation/search/search-document-dematerialise/search-document-dematerialise.component.ts`
- `supervision/document-dematerialise/video/video.component.ts`
- `supervision/document-dematerialise/video/modal/details/details.component.ts`
- `supervision/production/gestion-occurrence-application/gestion-occurrence-application.component.ts`
- `supervision/production/gestion-occurrence-application/search/search-gestion-occurrence-application/search-gestion-occurrence-application.component.ts`
- `supervision/production/gestion-occurrence-etape/modal/gestion-occurrence-etape-modal.component.ts`
- `supervision/production/gestion-occurrence-etape/search/search-gestion-occurrence-etape.component.ts`
- `supervision/production/occurrence-etape/search/search-occurrence-etape.component.ts`
- `supervision/production/occurrence-etape/modal/details/details-modal-occurrence-etape.component.ts`
- `supervision/production/occurrence-etape/modal/details/onglets/fichier/details-fichier-occurrence-etape/details-fichier-occurrence-etape.component.ts`
- `supervision/production/occurrence-etape/modal/details/onglets/incidents/details-incidents-occurrence-etape/details-incidents-occurrence-etape.component.ts`
- `supervision/production/occurrence-etape/modal/details/onglets/massification/details-massification-occurrence-etape/details-massification-occurrence-etape.component.ts`
- `supervision/production/occurrence-etape/modal/modal-consulte-script/modal-consulte-script/modal-consulte-script.component.ts`
- `supervision/service/service.component.ts`

## 8. Hors périmètre mémoire — bugs fonctionnels notés au passage

- `production/occurrence-etape/.../details-fichier-occurrence-etape.component.ts` : `videoStepDetailsFichier.push(...)` jamais réinitialisé dans `ngOnChanges` → doublons d'affichage si `paramData` change.
- Erreurs GraphQL interceptées mais jamais affichées à l'utilisateur (`err` construit et jeté) : `production/gestion-occurrence-application.component.ts` et `cereus.component.ts` (`onDeleteRow`).
- `supervision/cereus` : composant non déclaré dans `supervision.module.ts` (écran WIP) ; `getAllProductionFluxMock()` + fixture de 10 lignes à nettoyer dans `api-adelaide-cereus.service.ts`.

