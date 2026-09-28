Getting Started
=================

Tools
----------

The tools that you'll need for developping on this project are :

* **Git** : https://git-scm.com/
* **Node.js** (requires version is 14.2.13 or higher) : https://nodejs.org/en/
* Choose one package manager among :
  * **Yarn** (use the latest version of Yarn) : https://yarnpkg.com/en/
  * **Npm** (any version of npm that is greater than or equal to 6.14.17) : https://www.npmjs.com/
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
  * client side output on console (but can be cleanly commented if useful for future dev)
* I have checked that no error is shown in the JavaScript console (F12) while using my functionnality
* I have cleaned useless imports (also in unit tests)
* I have pushed the code for Jenkins to build it, it built it, and it's green !
* I updated the documentation if necessary
* I am keeping track of changes which will require special update procedure for next delivery, and will provide information when that delivery is being produced

Starting application
------------------

## Starting The BackEnd App (see the posdoc-ihm-be project):

To start project locally. first thing to do is to start the backend project and to do that you must see the getting-started file on posdoc-ihm-be folder.

## Starting POSDOC FRONT service:

To start POSDOC front APP, go to posdoc-ihm-fe folder, open a terminal and install required packages by runnnig : `npm install` or `yarn install`.

once packages are installed, you can start the local DEV server with the command `npm start` or `yarn start` or if 
you use IntelliJ IDE you can use the **Services** to create a new service **(Run Configuration Type > npm)** and run the application from this service.

once all done. you can access application on `localhost:4200`.


Additional information
------------------

#### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

#### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

#### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

#### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

#### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

#### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
