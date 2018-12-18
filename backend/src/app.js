const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const express = require('express');
const httpContext = require('express-http-context');
const sessionStorageConstants = require('cvr-common/constants/sessionStorageKeys');
const loggerFactory = require('cvr-common/logger/loggerFactory');
const bodyParser = require('body-parser');
const envVariables = require('./config/environmentVariables');
const packagesJson = require('../package.json');

const app = express();

app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(awsServerlessExpressMiddleware.eventContext());
app.use(httpContext.middleware);
app.use((req, res, next) => {
  const functionName = req.apiGateway && req.apiGateway.context ? req.apiGateway.context.functionName : 'N/A';
  httpContext.set(sessionStorageConstants.FUNCTION_NAME, functionName);
  next();
});
loggerFactory.initialize(app, httpContext, {
  logLevel: envVariables.logLevel,
  appName: packagesJson.name,
});

const indexRouter = require('./routes');

app.use(bodyParser.json());
app.use('/', indexRouter);

const logger = loggerFactory.create();
logger.info(`Init ver ${packagesJson.version}`);
// TODO: callerName not showing
// TODO: better common compilation solution, this takes long? (Locally, on build is okay-ish)

module.exports = app;
