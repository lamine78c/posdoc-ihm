[![Fulstack2](http://gitlab.altair.recouv/sded/bureau-technique/architecture-expertise-applicative/zone-ressources/images-bt/raw/master/Fullstacklarge.png)](https://recouv.sharepoint.com/sites/bureautechniquedsi-sded/SitePages/Socle-FullStack.aspx)

[![Normes et docs](http://gitlab.altair.recouv/sded/bureau-technique/architecture-expertise-applicative/zone-ressources/images-bt/raw/master/sharepoint-35.png)](https://recouv.sharepoint.com/:f:/r/sites/bureautechniquedsi-sded/Documents%20partages/Architecture%20et%20Expertise%20Applicative/Norme%20Frontend%20Angular%20-%20Bootstrap)     [![Sources Fullstack](http://gitlab.altair.recouv/sded/bureau-technique/architecture-expertise-applicative/zone-ressources/images-bt/raw/master/gitlab-35.png)](https://gitlab.altair.recouv/sdat/act/saul/fullstack/frontend/fullstack-spa-intranet)    [![Yammer](http://gitlab.altair.recouv/sded/bureau-technique/architecture-expertise-applicative/zone-ressources/images-bt/raw/master/yammer-35.png)](https://www.yammer.com/recouv.fr/#/threads/inGroup?type=in_group&feedId=16003777&view=all)    [![Contact](http://gitlab.altair.recouv/sded/bureau-technique/architecture-expertise-applicative/zone-ressources/images-bt/raw/master/email-35.png)](mailto:saul-fullstack@acoss.fr)

# Librarie acoss-icones

Ce composant contient les icônes de la branche.

## Démarrage rapide

1. Récuperation des sources du projet

```
http://gitlab.altair.recouv/sdat/act/saul/fullstack/frontend/fullstack-spa-intranet.git

```

2. Utilisation (dans un projet angular-cli)

Pour installer les icones dans votre application

```
npm install @acoss/icones
```

Si vous utiliser la librairie @acoss/composants-library, il n'est pas nécessaire d'installer @acoss/icones dans votre application . Ensuite il faut déclarer les icônes et images dans la configuration du projet dans le fichier `angular.json`

```
"styles": [
    "node_modules/@acoss/icones/style.scss"
],
"assets": [
  {
    "glob": "**/*",
    "input": "./node_modules/@acoss/icones/assets",
    "output": "/assets/"
  }
]
```

Les icônes sont maintenant accessibles dans votre projet. Il existe deux types d'icônes :

-   Les icônes svg se trouvant dans node_modules\@acoss\icones\assets et qui peuvent être utilisées de la manière suivante : (Utilisation de la librairie: [**svg-icon**](https://www.npmjs.com/package/svg-icon))
    ```
    <svg-icon src="assets/icones-showcase/widget_datepicker_green.svg"></svg-icon>
    ```
-   Les icônes provenant de la police peuvent utiliser la manière suivante:
    ```
    <i class="icon-b_cancel" aria-hidden="true"></i>.
    ```

Vous pouvez consulter les icônes disponibles via l'application [**fullstack-spa-intranet**](http://fullstackfe-latest-release-gidn.dev.k8s.recouv/icones)

## Documentation

La documentation sur les normes et autres bonnes pratiques est disponible sous : [**Documents/Norme Frontend Angular - Bootstrap**](https://recouv.sharepoint.com/:f:/r/sites/bureautechniquedsi-sded/Documents%20partages/Architecture%20et%20Expertise%20Applicative/Norme%20Frontend%20Angular%20-%20Bootstrap 'Sharepoint BT')

L'ensemble des travaux mis à disposition par le BT AeA sont disponibles sous le [**sharepoint du BT**](https://recouv.sharepoint.com/sites/bureautechniquedsi-sded/SitePages/AEA%20-%20Fullstack.aspx)

Les différentes modifications réalisées sont documentées dans les fichiers suivants :

-   [CHANGELOG.md](CHANGELOG.md) ce fichier contient la liste des principales modifications par version de l'application

## Not-Published

C'est une sauvegarde des icônes qui étaient utilisées dans l'ancienne charte et qui peuvent être demandées par des MOE.
