const TEMPLATES_PATH = './views';

const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const sessionStorageConstants = require('cvr-common/src/constants/sessionStorageKeys');
const loggerFactory = require('cvr-common/src/logger/loggerFactory');
const bodyParser = require('body-parser');
const express = require('express');
const httpContext = require('express-http-context');
const nunjucks = require('nunjucks');
const helmet = require('helmet');
const hsts = require('hsts');
const envVariables = require('./config/environmentVariables');
const packagesJson = require('./package.json');

const app = express();

const HSTS_MAX_AGE = 15768000;

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
app.use(helmet());
app.use(hsts({
  maxAge: HSTS_MAX_AGE,
  preload: true,
  includeSubDomains: true,
}));

const env = nunjucks.configure(TEMPLATES_PATH, {
  autoescape: true,
  express: app,
});
const { logger } = loggerFactory;
logger.info(`Init ver ${packagesJson.version}`);

env.addGlobal('ASSETS_BASE_URL', envVariables.assetsBaseUrl);
env.addGlobal('BASE_URL', envVariables.baseUrl);
env.addGlobal('VERSION', packagesJson.version);

const indexRouter = require('./routes');

app.set('view engine', 'nunjucks');
app.use('/', indexRouter);

module.exports = app;
