# Recalls App

## Local Setup

1. Clone this repo

2. Go to *frontend* directory and install dependencies using NPM

```javascript
npm install
```
3. Start application

```javascript
npm start
```
Application will be avaliable under http://localhost:3000/

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

Install dependencies (without dev-dependencies) and create cvr-frontend.zip archive with *frontend* contents (without *test* catalog)

```javascript
npm run prod 
```
