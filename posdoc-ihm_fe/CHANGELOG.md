# POSDOC - Changelog
Ce fichier liste les changements effectués lors des différentes versions de l'application.

# Version en dev
0.19.0

## Mise à jour des librairies :
Angular                                         v19.2.10
Material                                        v19.2.15
apollo-angular                                  v10.0.3
@apollo/client                                  v3.13.8
ag-grid-angular                                 v33.2.4
ag-grid-community                               v33.2.4
ag-grid-enterprise                              v33.2.4
@ng-bootstrap/ng-bootstrap                      v18.0.0
@ng-select/ng-select                            v14.7.0
graphql                                         v16.11.0
angular-svg-icon                                v19.1.1

## reste à faire:
fullstack-spa-intranet                          v19
@acoss/communication-spa-angular                v19.0.0
@acoss/communication-spa-core                   v1.6.0
@acoss/composants-library                       v4.0.0
@acoss/prisme-angular-intranet                  v19.0.0
eslint                                          v9.x
@angular-eslint/schematics@19 @ngrx/store@19

@acoss/breadcrumb-angular-intranet              v14.2.x
@acoss/double-liste-angular-intranet            v14.2.x
@acoss/icones                                   v2.8.x
@acoss/theme-intranet                           v5.x

### Changement de dépendances
rxjs                                            v6.6.3
zone.js                                         v0.15.0
typescript                                      v5.8.3
bootstrap                                       v5.3.2

### Breaking changes and Deprecations
Voici les changements effectués
* Corrige erreur null permission lors qu'un utilisateur n'est pas connecté
* ag-grid
    https://www.ag-grid.com/angular-data-grid/upgrading-to-ag-grid-29/
    https://www.ag-grid.com/angular-data-grid/upgrading-to-ag-grid-30/
    https://www.ag-grid.com/angular-data-grid/upgrading-to-ag-grid-31/
    https://www.ag-grid.com/angular-data-grid/upgrading-to-ag-grid-32/
    https://www.ag-grid.com/angular-data-grid/upgrading-to-ag-grid-33/
    Renouvellement Licensekey à 28_October_2027
* Apollo, Graphql
    apollo-client, apollo-angular-link-http, apollo-link*, @apollo/link-context, apollo-cache-inmemory, graphql-tag obsolète, Remplacé ou intégré par @apollo/client v3/v4 et graphql v16+
* scss
    Sass @import rules are deprecated and will be removed in Dart Sass 3.0.0.
* angular.json

* tsconfig.json

## reste à faire:

* pb d'affichage global (ag-grid.css et ag-theme-blue.css sont déplacés temporairement dans src/styles)
* ag-grid: à remplacer le fonctionnement des boutons exports par nouveau
* chercher globalement les commentaires avec // TODO à corriger









# Version en dev
0.14.0

## Mise à jour des librairies :
fullstack-spa-intranet                         v14.x
angular                                        v14.x