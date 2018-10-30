const TEMPLATES_PATH = './views';

const bodyParser = require('body-parser');
const express = require('express');
const nunjucks = require('nunjucks');
const indexRouter = require('./routes');

const app = express();

app.use(bodyParser.urlencoded({
  extended: true,
}));

nunjucks.configure(TEMPLATES_PATH, {
  autoescape: true,
  express: app,
});

app.set('view engine', 'nunjucks');
app.use('/', indexRouter);

module.exports = app;
