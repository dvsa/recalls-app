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
  response.redirect(`${envVariables.baseUrl}/recall-types`);
});

router.get('/recall-types', (req, response) => {
  landingPageController.homePage(null, response);
});

router.post('/recall-types', (req, response) => {
  const recallType = req.body.recallType;
  landingPageController.submitRecallType(response, recallType);
});

router.get('/recall-types/:recallType/makes', (req, response) => {
  const recallType = req.params.recallType;
  makeController.makesList(null, response, recallType);
});

router.post('/recall-types/:recallType/makes', (req, response) => {
  const recallType = req.params.recallType;
  const make = req.body.make;

  makeController.submitMake(response, recallType, make);
});

router.get('/recall-types/:recallType/makes/:make/models', (req, response) => {
  const recallType = req.params.recallType;
  const make = req.params.make;

  modelController.modelsList(null, response, recallType, make);
});

router.post('/recall-types/:recallType/makes/:make/models', (req, response) => {
  const recallType = req.params.recallType;
  const make = req.params.make;
  const model = req.body.model;

  modelController.submitModel(response, recallType, make, model);
});

router.get('/recall-types/:recallType/makes/:make/models/:model/years', (req, response) => {
  const recallType = req.params.recallType;
  const make = req.params.make;
  const model = req.params.model;

  yearController.enterYear(null, response, recallType, make, model);
});

router.post('/recall-types/:recallType/makes/:make/models/:model/years', (req, response) => {
  const recallType = req.params.recallType;
  const make = req.params.make;
  const model = req.params.model;
  const year = req.body.year;

  yearController.submitYear(response, recallType, make, model, year);
});

router.get([
  '/recall-types/:recallType/makes/:make/models/:model/recalls',
  '/recall-types/:recallType/makes/:make/models/:model/years/:year/recalls',
], (req, response) => {
  const make = req.params.make;
  const model = req.params.model;
  const year = req.params.year;
  const recallType = req.params.recallType;

  resultsController.resultsPage(response, recallType, make, model, year);
});

module.exports = router;
