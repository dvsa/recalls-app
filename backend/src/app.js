const express = require('express');
const loggerFactory = require('cvr-common/logger/loggerFactory');
const bodyParser = require('body-parser');
const envVariables = require('./config/environmentVariables');
const packagesJson = require('../package.json');

const app = express();

app.use(bodyParser.urlencoded({
  extended: true,
}));
loggerFactory.initialize(app, {
  logLevel: envVariables.logLevel,
  functionName: envVariables.functionName,
  appName: packagesJson.name,
});

const indexRouter = require('./routes');

app.use(bodyParser.json());
app.use('/', indexRouter);

const logger = loggerFactory.create();
logger.info(`Init ver ${packagesJson.version}`);
// TODO: check year parsing (missing recalls when on end of year?)
// TODO: requestId pass via headers

module.exports = app;
