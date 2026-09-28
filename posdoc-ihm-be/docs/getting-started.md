Getting Started
=================

Tools
----------

The tools that you'll need for developping on this project are :

* **Git** : https://git-scm.com/
* **Jdk 11** (we won't be doing JEE)
* **Maven** : you should use this maven folder : posdoc-ihm-be/docs/apache-maven-3.3.9.rar (copy this folder to [C:\] and extract it, we will use it later).
* Your favorite IDE. If you don't have any idea :
  * **IntelliJ** (recommended) : https://www.jetbrains.com/idea/
  * **Eclipse** : https://www.eclipse.org/downloads/eclipse-packages/ (latest version is recommended)
    * *Recommended plugins* :
      * For correct handling of SpringBoot apps : **Spring Tool Suite** : http://marketplace.eclipse.org/content/spring-tool-suite-sts-eclipse
      * For easier project browsing outside the IDE : **EasyShell** : http://marketplace.eclipse.org/content/easyshell
      * For coverage analysis : **EclEmma** : http://marketplace.eclipse.org/content/eclemma-java-code-coverage
      * For (partial) .editorconfig integration : **editorconfig-eclipse** : http://marketplace.eclipse.org/content/editorconfig-eclipse
      * (*beware, NOT RECOMMENDED over VSCode, only try it if you dare experience an unfinished Eclipse plugin [This plug-in is no longer in development]*) For Angular integration : **Angular2 Eclipse** : https://marketplace.eclipse.org/content/angular-ide
  * You also need to install **Lombok** on your IDE (by double-clicking on Lombok Maven JAR dependency).
  * **VSCode** : https://code.visualstudio.com/
    * *Recommended plugins* :
      * Prettier - Code formatter : **Code Formatter** : https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
      * Beautify - HTML formatter : **HTML Formatter** : https://marketplace.visualstudio.com/items?itemName=HookyQR.beautify
      * Eclipse keyboard shortcuts : **Eclipse Keymap** : https://marketplace.visualstudio.com/items?itemName=alphabotsec.vscode-eclipse-keybindings
      * See issues in your TypeScript code : **TSLint** : https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-tslint-plugin
      * NgBootstrap Snippets for VS Code : **NgBootstrap Snippets** : https://marketplace.visualstudio.com/items?itemName=ktriek.ng-bootstrap-snippets
      * Icon Pack for VS Code : **vscode-icons** : https://marketplace.visualstudio.com/items?itemName=robertohuertasm.vscode-icons
  * **Atom** : https://atom.io/

* An instance of **Postgres** or for more convenience **docker** : https://www.docker.com/, using the **docker-compose.yml** in **posdoc-ihm-be**

* A browser, we highly recommend using Google Chrome.

* activate (format and remove useless imports) on save in your IDE.

Git Workflow
----------

On posdoc project, all developers should follow the Git Workflow branching model, because it is very well suited to parallel development, collaboration, release staging area and emergency fixes.

### Git Flow

You'll find a good cheat sheet and a tool that can help you (git-flow) :  https://danielkummer.github.io/git-flow-cheatsheet/

But, the basics are :
* **develop** contains the release delivered to Client
* **develop** contains the fully developed features and fixes (this branch is deployed on the integration platform)
* When you start developing a new feature, you should create a new branch from **develop** named "EDT-<ID_JIRA>" (please use the id of JIRA ticket for <ID_JIRA>)
* When you start fixing anomalies on a released version, you should create a new branch from **develop** named "hotfix/EDT-<ID_JIRA>"
* When you start fixing anomalies on a developed (non-released version), you should update the corresponding feature branch
* When you are done developing a **feature**, it should be merged on the **develop** branch
* When you are done developing a single **fix**, hotfix branch can be merge on the **develop** branch
* When we are done developping all the fixes, hotfix branch can be merged on the **develop** branch
* When we are done developping all the feature, a release can be started
* When we are done developping the release, the release can be delivered


### Commit messages

We will use the semantic of the karma and Angular project with is simple and very effective
http://karma-runner.github.io/1.0/dev/git-commit-msg.html

The reasons for these conventions:
- automatic generating of the changelog
- simple navigation through git history (e.g. ignoring style changes)

#### Format of the commit message:
```bash
<type>(<scope>): <subject>

<body>

<footer>
```

#### Example commit message:

```bash
fix(connexion): change dynamic after a valid login

... whatever you've done

Fixes #2310
```

#### Message subject (first line)
The first line should simply describe what have been done, the second line is always blank and
other lines are optional for us (but the more detail it has, the better it is). The type and scope should
always be lowercase as shown below.

##### Allowed `<type>` values:

* **feat** (new feature for the user, not a new feature for build script)
* **fix** (bug fix for the user, not a fix to a build script)
* **docs** (changes to the documentation)
* **style** (formatting, missing semi colons, etc; no production code change)
* **refactor** (refactoring production code, eg. renaming a variable)
* **test** (adding missing tests, refactoring tests; no production code change)
* **chore** (updating grunt tasks etc; no production code change)

##### Example `<scope>` values:

The `<scope>` should be the business or technical part on which you are working on

Definition Of Done
------------------

I can change the status of my functionality/issue to "done" when :

* I have checked that every rules and scenarios are implemented and validated
* I have removed every temporary debug log :
  * server side unclean debug log and useless for future devs (and usefull clean debug log should also have proper **debug** level to be deactivated)
* I have cleaned useless imports (also in unit tests)
* I have pushed the code for Jenkins to build it, it built it, and it's green !
* I have solved all Sonar Issues and coverage problems
* I updated the documentation if necessary
* I am keeping track of changes which will require special update procedure for next delivery, and will provide information when that delivery is being produced

Additional information
------------------

* **Port forwarding :**

**NB** : if you are using windows 10 pro. it's recommended to use Docker for windows. else you can still use Docker ToolBox with the configuration below.

After installing Docker ToolBox, the user must configure port forwarding on Virtualbox running instance as :

For postgres

```
- Nom : postgres
- Protocole : TCP
- IP hote : 127.0.0.1
- Port hote : 5432
- IP invité : -
- Port invité : 5432
```
for pgadmin

```
- Nom : pgadmin
- Protocole : TCP
- IP hote : 127.0.0.1
- Port hote : 5050
- IP invité : -
- Port invité : 5050
```

**NB** : Please reboot the virtualbox instance called "default" so changes can take place

Starting application
------------------

## Starting Database service:

To start project locally. first thing to do is to start postgres/pgadmin containers.

To do so, go to the posdoc-ihm-be folder, start a terminal, and launch the command `docker-compose up`.

**NB** : if you are using Docker ToolBox, make sure you are using Docker QuickStart Terminal.

This command will start both services, to access/manage database, go to `localhost:5050`, where you can log in, with credentials present in docker-compose.yml.

Or : You can use directly Database tool if you are using IntelliJ

**Properties :**

| Host          | Port   | Database   | User      | Password    |
|---------------|--------|------------|-----------|-------------|
| 10.207.89.197 | 5432   | posdoc_dev | pgposdoc  | pg_posdoc?  |


## Starting POSDOC API service:

First of all change in you IDE the **Maven home path** and put the path of your maven folder => C:\apache-maven-3.3.9 (If you skipped the Tools section, you won't be able to understand this step).

To start POSDOC API service, you can start it from you IDE, by running the MAIN SpringBoot class (posdoc-ihm-be/posdoc-ihm-be-ws/src/main/java/fr/acoss/posdoc/ws/PosdocIhmBeApplication.java).

Or if you use IntelliJ IDE you can use the **Services** to create a new service **(Run Configuration Type > Spring Boot)** and run the application from this service.

**NB** : you must lunch the application with "dev" profile.

once all done. you can access GraphiQL Service on `http://localhost:8080/graphiql`.