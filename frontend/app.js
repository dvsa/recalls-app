const TEMPLATES_PATH = './views';

const express = require('express');
const nunjucks = require('nunjucks');
const helmet = require('helmet');
const hsts = require('hsts');
const indexRouter = require('./routes');
const envVariables = require('./config/environmentVariables');

const app = express();

const HSTS_MAX_AGE = 15768000;

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

env.addGlobal('ASSETS_BASE_URL', envVariables.assetsBaseUrl);
env.addGlobal('BASE_URL', envVariables.baseUrl);

app.set('view engine', 'nunjucks');
app.use('/', indexRouter);

module.exports = app;
