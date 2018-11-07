const TEMPLATES_PATH = './views';

const express = require('express');
const nunjucks = require('nunjucks');
const helmet = require('helmet');
const hsts = require('hsts');
const indexRouter = require('./routes');

const app = express();

const HSTS_MAX_AGE = 15768000;

app.use(helmet());
app.use(hsts({
  maxAge: HSTS_MAX_AGE,
  preload: true,
  includeSubDomains: true,
}));

nunjucks.configure(TEMPLATES_PATH, {
  autoescape: true,
  express: app,
});

app.set('view engine', 'nunjucks');
app.use('/', indexRouter);

module.exports = app;
