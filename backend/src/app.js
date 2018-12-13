const express = require('express');
const httpContext = require('express-http-context');
const loggerFactory = require('cvr-common/logger/loggerFactory');
const bodyParser = require('body-parser');
const envVariables = require('./config/environmentVariables');
const packagesJson = require('../package.json');

const app = express();

app.use(bodyParser.urlencoded({
  extended: true,
}));
loggerFactory.initialize(app, httpContext, {
  logLevel: envVariables.logLevel,
  appName: packagesJson.name,
});

const indexRouter = require('./routes');

app.use(bodyParser.json());
app.use('/', indexRouter);

const logger = loggerFactory.create();
logger.info(`Init ver ${packagesJson.version}`);
// TODO: requestId pass via headers
// TODO: better common compilation solution, this takes long? (Locally, on build is okay-ish)

module.exports = app;
