const TEMPLATES_PATH = './views';

const bodyParser = require('body-parser');
const express = require('express');
const nunjucks = require('nunjucks');
const indexRouter = require('./routes');
const envVariables = require('./config/environmentVariables');

const app = express();

app.use(bodyParser.urlencoded({
  extended: true,
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
