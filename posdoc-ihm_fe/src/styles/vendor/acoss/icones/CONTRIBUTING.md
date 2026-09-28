[![Fulstack2](http://gitlab.altair.recouv/sded/bureau-technique/architecture-expertise-applicative/zone-ressources/images-bt/raw/master/Fullstacklarge.png)](https://recouv.sharepoint.com/sites/bureautechniquedsi-sded/SitePages/Socle-FullStack.aspx)

[![Normes et docs](http://gitlab.altair.recouv/sded/bureau-technique/architecture-expertise-applicative/zone-ressources/images-bt/raw/master/sharepoint-35.png)](https://recouv.sharepoint.com/:f:/r/sites/bureautechniquedsi-sded/Documents%20partages/Architecture%20et%20Expertise%20Applicative/Norme%20Frontend%20Angular%20-%20Bootstrap)    [![Sources Fullstack](http://gitlab.altair.recouv/sded/bureau-technique/architecture-expertise-applicative/zone-ressources/images-bt/raw/master/gitlab-35.png)](http://gitlab.altair.recouv/sded/bureau-technique/architecture-expertise-applicative/fullstack/fullstack-spa-intranet)   [![Redmine Fullstack](http://gitlab.altair.recouv/sded/bureau-technique/architecture-expertise-applicative/zone-ressources/images-bt/raw/master/redmine-35.png)](http://redmine.altair.recouv/projects/devintrafront/issues)   [![Yammer](http://gitlab.altair.recouv/sded/bureau-technique/architecture-expertise-applicative/zone-ressources/images-bt/raw/master/yammer-35.png)](https://www.yammer.com/recouv.fr/#/threads/inGroup?type=in_group&feedId=16003777&view=all)   [![Contact](http://gitlab.altair.recouv/sded/bureau-technique/architecture-expertise-applicative/zone-ressources/images-bt/raw/master/email-35.png)](mailto:saul-fullstack@acoss.fr)

# Comment contribuer à ce projet

Tout d’abord nous tenons à vous remercier pour prendre du temps pour lire cette documentation et de proposer votre contribution à ce projet. N'oubliez pas que nous avons besoins de vos idées et contributions pour que ce projet puisse répondre à vos besoins.

# Eléments à connaitre avant de commencer ?

-   Pour commencer à utiliser le projet vous pouvez consulter le fichier [README.md](/README.md) qui décrit la procédure à suivre.
-   Le répertoire [doc](/doc) contient une série de howto documentant certains éléments spécifiques du projet.
-   La documentation détaillée ainsi que les normes associées au projet sont disponibles sous [Sharepoint](https://recouv.sharepoint.com/sites/bureautechniquedsi-sded).
-   Le fichier [CHANGELOG.md](/CHANGELOG.md) contient la liste des principales modifications effectuées au cours des différentes versions du projet.
-   Les différentes décisions d’architecture mises en place sur le projet sont décrites dans le fichier [Decision Record Log.md](/doc/%20Decision%20Record%20Log.md).
-   Un projet [Redmine](http://redmine.altair.recouv/projects/archapp/issues) a été mis en place pour les signalements de bugs, les propositions d’évolutions et les demandes de support.
-   Vous pouvez nous contacter via le [Yammer](https://www.yammer.com/recouv.fr/#/threads/inGroup?type=in_group&feedId=16003777&view=all) du Bureau Technique ou directement en utilisant [notre mailing list](mailto:saul-fullstack@acoss.fr).

**Ce projet est géré par l'équipe du Bureau Technique merci de vous reporter à la section [contribuer à un projet/librairie du BT](#contribuer-%C3%A0-un-projet-une-librairie-du-bureau-technique)**

# Comment contribuer ?

## Sur quoi peut-on contribuer ?

1. Les librairies et les projets maintenus par le Bureau Technique (ex fullstack, prisme-angular et librairies graphiques)
2. Les librairies communautaires non maintenues par le Bureau Technique mais "suivies" par le BT et gérées par un pôle de contributeurs. Ce cas concerne les librairies développées par une MOE dans le cadre d'un projet et qui pourraient être mises à disposition pour d'autres projets. Ici le BT participera à l’élaboration des roadmaps afin de vérifier la cohérence des évolutions pour garantir le bon fonctionnement de la librairie aux MOEs utilisatrices. Ensuite le BT interviendra à la fin des développements des roadmaps pour s’assurer que les exigences de l’ACOSS ont bien été respectées.

Le fichier CONTRIBUTING.md vous précisera si vous êtes dans le cas d'une librairie communautaire ou un projet du Bureau Technique.

## Qui peut contribuer ?

Tout le monde à partir du moment où ils se sont fait connaitre auprès du Bureau Technique notamment pour ajouter les droits sur GitLab et Redmine

## Signaler un bug

Merci de nous remonter les anomalies dans un [ticket Redmine](http://redmine.altair.recouv/projects/archapp/issues) décrivant en détail le problème rencontré ainsi que les logs applicatifs et l’environnement ou nous pourrons reproduire l’erreur.

## Suggérer une amélioration

Vous pouvez faire des demandes d’évolution du projet par l’intermédiaire d’un [ticket Redmine](http://redmine.altair.recouv/projects/archapp/issues). Les tickets seront étudiés par un membre du Bureau Technique qui vous ferra un retour sur les suites à donner au ticket.

## Contribuer à un projet / une librairie du Bureau technique

Le contributeur ou le Bureau Technique crée le ticket redmine décrivant la modification. Le Bureau Technique étudie la demande et si elle est acceptée passe le ticket de "nouveau" à "ouvert" et fixe la version de livraison dans une roadmap. Le contributeur crée une branche feature (ou hotfix) pour réaliser sa modification. Une fois le développement terminé le contributeur fait un merge request. Le Bureau Technique validera ensuite le merge request et assurera la livraison de la modification en fonction des plannings de releases prévus dans les roadmaps Redmine

## Contribuer à un projet / une librairie communautaire

Le pôle contributeur (PC) et un membre du Bureau Technique réalisent une réunion de kick off pour construire et valider la roadmap . Chaque membre du PC crée et gère son ticket redmine. Les membres du PC réalisent les modifications en créant des features (ou hotfix) branchs et ensuite un merge request est créé. Les membres du PC valident les merges requests. Le Bureau Technique et les contributeurs font une revue de livraison (roll out) Le PC gère la release

# Style guides

## Modèle de branches GIT

Le Bureau Technique utilise pour ces projets un modèle de branches basé sur [Git Flow](https://www.occitech.fr/blog/2014/12/un-modele-de-branches-git-efficace/). Une documentation complète de ce modèle est disponible dans le document [SDED - BT - FullStack - Workflow de développement](https://recouv.sharepoint.com/:b:/r/sites/bureautechniquedsi-sded/Documents%20partages/Architecture%20et%20Expertise%20Applicative/Fullstack/Process%20%26%20aide/SDED%20-%20BT%20-%20FullStack%20-%20Workflow%20de%20d%C3%A9veloppement%20v1.1.0.pdf?csf=1&e=SzqcaV)

**En résumé tout développement doit être réalisé sur une branche spécifique (feature/hotfix) dérivant de la branche develop (la branche master est utilisée uniquement pour les livraisons).**

## Messages de commit GIT

Afin de faciliter l’utilisation et la compréhension de l’historique de GIT nous avons mis en place des préconisations sur les messages de commit basés sur ce qui est en place sur des projets Open Source. Les messages de commit sont obligatoires et doivent être explicites sur la modification effectuée. Voici la norme que nous utilisons pour les messages de commit :

      type(scope) : sujet
      Description détaillée

-   Type : décrit le type de modification
-   feat : une nouvelle fonctionnalité
-   fix : pour une correction de bug
-   doc : pour une modification de la documentation du projet
-   style : modification sur formatage
-   perf : pour les modifications concernant la performance
-   test : pour l'ajout de tests
-   chore : modifications dans le processus de build (JenkinsFile)

Scope : la cible des modifications, un service, une fonctionalité, un fichier de configuration

Sujet : Une courte description des changements effectués

Description détaillée : optionnel contient des précisions sur la modification effectuée. **La description doit aussi contenir un lien vers le ticket Redmine lié à la modification**

Exemple :

    fix(EntrepriseService) : encodage
    Correction d'un problème d'encodage des données #1234567

## Merge request

Lorsque votre développement est terminé sur votre branche vous devez le réintégrer sur la branche de développement du projet (branch develop).

Pour cela vous devez créer un merge request, cela va permettre de regrouper vos commits avant de les intégrer dans le projet. Il sera ensuite possible de faire une revue du merge request, une fois validée la modification sera alors reportée sur la branche de développement commune aux différents contributeurs du projet.

Lors de la modification d'une une librairie du Bureau technique votre merge request sera validé et appliqué par un membre du Bureau Technique. Dans le cas d'une librairie communautaire, c'est un membre du pôle contributeur de la librairie qui validera et appliquera votre merge request

## Gestion des versions d'un projet ou d'une librairie

Les différentes versions des projets et librairies utilisent une [Gestion sémantique de version](https://semver.org/lang/fr/). Vous trouverez le contenu ainsi que les dates de livraison prévisionnelles au niveau des roadmaps des projets sous Redmine.

## Intégration continue et Qualité de code

Les différents projets gérés par le Bureau Technique sont intégrés dans la plateforme d’intégration continue (PIC) de l’ACOSS. Avant de soumettre pour validation un merge request vous devez vous assurer que votre branche passe bien toutes les étapes du [processus de build du projet](/Jenkinsfile).

Lors de la construction du projet avec [Jenkins](http://jenkins.urssaf.recouv/) une analyse de la qualité du code est réalisée avec [Sonar](http://sonarqube.urssaf.recouv/sessions/new?return_to=%2F). Avant de créer un merge request vous devez vous assurez que votre branche n’introduit pas de nouveaux défauts dans la qualité du code via Sonar.
