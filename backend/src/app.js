const express = require('express');
const indexRouter = require('./routes');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use('/', indexRouter);

module.exports = app;
