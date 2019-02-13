# Recalls App

## Modules

### Common package

A package containing set of common functionality like logger or DTO shared between two or more other modules. It should build before any module that is using it.

### Frontend

Module that handles user interaction when presenting recalls. Uses the Common module.

### Backend

Module that handles data interactions. Used by Frontend and Data-update module to respectively read and update recalls data stored in DynamoDB. Uses the Common module.

### Data-update

Module used to parse updated recalls data snapshots uploaded in a CSV format. It validates and parses that data, updates the DynamoDB and also uploads the whole dataset in a CSV format so it can be downloaded via the frontend.

### Database

Module used to load test data that can be used on development environments. It is a small node app that will parse a recalls csv file and load it directly to DynamoDB

### Selenium

Module used to carry out e2e tests on a fully working environment. Uses test data uploaded by the Database module to carry out its tests.

## Local Setup

1. Clone this repo

2. Ensure you have node v8.12 installed (currently used on jenkinsnode builder)

3. Run `npm install` to be able to run the following commands

4. Run `npm run install:all` to install dependencies for all projects or `npm run install:module:<module_name>` to work only with one module.

5. Set additional env vars:
    * ASSETS_BASE_URL for frontend app. Set it to an assets url of an existing env or to your local running dev server of https://github.com/dvsa/front-end assets repo (for example http://localhost:3002)
    * ENVIRONMENT for the backend app. Set it to the name of a existing, deployed environment that you have access to via aws cli, for example `int`. Note that you must have your aws cli set up to use the account that has this environment deployed! This will be used to derive DynamoDB table names that the app should use. 
    * Optionally if you want your document downloads to work locally set DOCUMENTS_BASE_URL to a documents path of a deployed environment

5. Start application

```javascript
npm start
```
Frontend app will be avaliable under http://localhost:3000/, backend under http://localhost:4000/

Alternatively you can start a specific app using either `npm run start:frontend` or `npm run start:backend`

## Running unit tests

You can execute unit tests from *test* directory and check test coverage using istanbul.js. Run `npm test` to run all tests or `npm run test:<module_name>` to test a specific module

## Running lint

Check code quality using eslint in all modules with `npm run lint` or with `npm run lint:<module_name>` to check a specific module

## Checking dependencies for vulnerabilities
You can run `npm run retire` to scan all modules for vulnerable NPM packages. Use `npm run retire:<module_name>` to scan a single module. This action is performed automatically during "build" and "validate" scripts - known vulnerabilities will be detected by pre-push checks or when the application is being built.

## Updating package-lock
You can update the package lockfile in all modules via `npm run update-package-lock`. This should ensure all modules/packages use newest versions of compatible dependencies.

## Running full validation
To simplify things you can run all checks on all modules by running `npm run validate`. This should ensure all module tests and code quality checks pass. It will also find known NPM package vulnerabilities.

## Creating application zip for production

Install dependencies (without dev-dependencies) and create cvr-frontend.zip archive with lambda contents (without *test* catalog)

```javascript
npm run build:<module_name>
```

## Development notes

* Assets are deployed based on [assets.verison file](./frontend/assets.version). More on recalls can be found in *Recalls home* internal wiki. 
* You can push a feature branch without passing lint/tests by adding `--no-verify` to your `git push` command
* You can run `npm run clean` if you need all node_module folders deleted should you need it
