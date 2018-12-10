# Recalls App

## Local Setup

1. Clone this repo

2. Ensure you have node v8.12 installed (currently used on jenkinsnode builder)

3. Go to *frontend* and/or *backend* directory and install dependencies using NPM

```javascript
npm install
```

4. Set additional env vars:
    * ASSETS_BASE_URL for frontend app. Set it to an assets url of an existing env or to your local running dev server of https://github.com/dvsa/front-end assets repo (http://localhost:3002 by default)
    * ENVIRONMENT for the backend app. Set it to the name of a existing, deployed environment that you have access to via aws cli, for example `int`. Note that you must have your aws cli set up to use the account that has this environment deployed.

5. Start application

```javascript
npm start
```
Frontend app will be avaliable under http://localhost:3000/, backend under http://localhost:4000/

## Running unit tests

Execute unit tests from *test* directory and check test coverage using istanbul.js

```javascript
npm test
```

## Running lint

Check code quality using eslint

```javascript
npm run lint 
```

## Creating application zip for development

Install dependencies, check the code quality and run tests before creating cvr-frontend.zip archive with *frontend* contents (without *test* catalog)

```javascript
npm run build 
```

## Creating application zip for production

Install dependencies (without dev-dependencies) and create cvr-frontend.zip archive with lambda contents (without *test* catalog)

```javascript
npm run build 
```

## Development notes

Assets are deployed based on [assets.verison file](./frontend/assets.version). More on recalls can be found in *Recalls home* internal wiki