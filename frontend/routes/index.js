const express = require('express');

const router = express.Router();
const landingPageController = require('../controllers/landingPageController');
const makeController = require('../controllers/makeController');
const modelController = require('../controllers/modelController');
const ResultsController = require('../controllers/resultsController');
const YearController = require('../controllers/yearController');
const envVariables = require('../config/environmentVariables');

const yearController = new YearController();
const resultsController = new ResultsController();

router.get('/cookies', (req, response) => {
  landingPageController.cookies(response);
});

router.get('/terms-and-conditions', (req, response) => {
  landingPageController.termsAndConditions(response);
});

router.get('/', (req, response) => {
  response.redirect(`${envVariables.baseUrl}/recalls`);
});

router.get('/recalls', (req, response) => {
  landingPageController.homePage(null, response);
});

router.post('/recalls', (req, response) => {
  const recallType = req.body.recallType;
  landingPageController.submitRecallType(response, recallType);
});

router.get('/vehicle-make', (req, response) => {
  const recallType = req.query.recallType;
  makeController.makesList(null, response, recallType);
});

router.post('/vehicle-make', (req, response) => {
  const recallType = req.query.recallType;
  const make = req.body.make;

  makeController.submitMake(response, recallType, make);
});

router.get('/vehicle-model', (req, response) => {
  const recallType = req.query.recallType;
  const make = req.query.make;

  modelController.modelsList(null, response, recallType, make);
});

router.post('/vehicle-model', (req, response) => {
  const recallType = req.query.recallType;
  const make = req.query.make;
  const model = req.body.model;

  modelController.submitModel(response, recallType, make, model);
});

router.get('/vehicle-year', (req, response) => {
  const recallType = req.query.recallType;
  const make = req.query.make;
  const model = req.query.model;

  yearController.enterYear(null, response, recallType, make, model);
});

router.post('/vehicle-year', (req, response) => {
  const recallType = req.query.recallType;
  const make = req.query.make;
  const model = req.query.model;
  const year = req.body.year;

  yearController.submitYear(response, recallType, make, model, year);
});

router.get('/results-page', (req, response) => {
  const make = req.query.make;
  const model = req.query.model;
  const year = req.query.year;
  const recallType = req.query.recallType;

  resultsController.resultsPage(response, recallType, make, model, year);
});

module.exports = router;
