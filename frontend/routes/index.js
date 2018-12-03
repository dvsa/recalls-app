const express = require('express');

const router = express.Router({ strict: true });
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
  response.redirect(`${envVariables.baseUrl}/recall-type`);
});

router.get('/recall-type', (req, response) => {
  landingPageController.homePage(null, response);
});

router.post('/recall-type', (req, response) => {
  const recallType = req.body.recallType;
  landingPageController.submitRecallType(response, recallType);
});

router.get('/recall-type/:recallType/make', (req, response) => {
  const recallType = req.params.recallType;
  makeController.makesList(null, response, recallType);
});

router.post('/recall-type/:recallType/make', (req, response) => {
  const recallType = req.params.recallType;
  const make = req.body.make;

  makeController.submitMake(response, recallType, make);
});

router.get('/recall-type/:recallType/make/:make/model', (req, response) => {
  const recallType = req.params.recallType;
  const make = req.params.make;

  modelController.modelsList(null, response, recallType, make);
});

router.post('/recall-type/:recallType/make/:make/model', (req, response) => {
  const recallType = req.params.recallType;
  const make = req.params.make;
  const model = req.body.model;

  modelController.submitModel(response, recallType, make, model);
});

router.get('/recall-type/:recallType/make/:make/model/:model/year', (req, response) => {
  const recallType = req.params.recallType;
  const make = req.params.make;
  const model = req.params.model;

  yearController.enterYear(null, response, recallType, make, model);
});

router.post('/recall-type/:recallType/make/:make/model/:model/year', (req, response) => {
  const recallType = req.params.recallType;
  const make = req.params.make;
  const model = req.params.model;
  const year = req.body.year;

  yearController.submitYear(response, recallType, make, model, year);
});

router.get([
  '/recall-type/:recallType/make/:make/model/:model/recalls',
  '/recall-type/:recallType/make/:make/model/:model/year/:year/recalls',
], (req, response) => {
  const make = req.params.make;
  const model = req.params.model;
  const year = req.params.year;
  const recallType = req.params.recallType;

  resultsController.resultsPage(response, recallType, make, model, year);
});

module.exports = router;
