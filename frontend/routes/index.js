const express = require('express');
const { logger } = require('cvr-common/src/logger/loggerFactory');

const router = express.Router({ strict: true });
const landingPageController = require('../controllers/landingPageController');
const makeController = require('../controllers/makeController');
const modelController = require('../controllers/modelController');
const ResultsController = require('../controllers/resultsController');
const YearController = require('../controllers/yearController');
const envVariables = require('../config/environmentVariables');

const yearController = new YearController();
const resultsController = new ResultsController();

router.get('/cookie-policy', (req, response) => {
  logger.info('Request to render cookie policy received');
  landingPageController.cookiePolicy(response);
});

router.get('/cookie-preferences', (req, response) => {
  logger.info('Request to render cookie preferences received');
  landingPageController.cookiePreferences(response);
});

router.get('/terms-and-conditions', (req, response) => {
  logger.info('Request to render TOS received');
  landingPageController.termsAndConditions(response);
});

router.get('/', (req, response) => {
  response.redirect(`${envVariables.baseUrl}/recall-type`);
});

router.get('/recall-type', (req, response) => {
  logger.info('Request to render home page received');
  landingPageController.homePage(null, response);
});

router.post('/recall-type', (req, response) => {
  const recallType = req.body.recallType;
  logger.info(`User submitted type=${recallType}`);
  landingPageController.submitRecallType(response, recallType);
});

router.get('/recall-type/:recallType/make', (req, response) => {
  const recallType = req.params.recallType;
  logger.info(`Request to render make page received for type=${recallType}`);
  makeController.makesList(null, response, recallType);
});

router.post('/recall-type/:recallType/make', (req, response) => {
  const recallType = req.params.recallType;
  const make = req.body.make;
  logger.info(`User submitted make=${make}`);

  makeController.submitMake(response, recallType, make);
});

router.get('/recall-type/:recallType/make/:make/model', (req, response) => {
  const recallType = req.params.recallType;
  const make = req.params.make;
  logger.info(`Request to render model page received for type=${recallType}, make=${make}`);

  modelController.modelsList(null, response, recallType, make);
});

router.post('/recall-type/:recallType/make/:make/model', (req, response) => {
  const recallType = req.params.recallType;
  const make = req.params.make;
  const model = req.body.model;
  logger.info(`User submitted model=${model}`);

  modelController.submitModel(response, recallType, make, model);
});

router.get('/recall-type/:recallType/make/:make/model/:model/year', (req, response) => {
  const recallType = req.params.recallType;
  const make = req.params.make;
  const model = req.params.model;
  logger.info(`Request to render year page received for type=${recallType}, make=${make}, model=${model}`);

  yearController.enterYear(null, response, recallType, make, model);
});

router.post('/recall-type/:recallType/make/:make/model/:model/year', (req, response) => {
  const recallType = req.params.recallType;
  const make = req.params.make;
  const model = req.params.model;
  const year = req.body.year;
  logger.info(`User submitted year=${year}`);

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
  logger.info(`Request to render recalls page received for type=${recallType}, make=${make}, model=${model}, year=${year}`);

  resultsController.resultsPage(response, recallType, make, model, year);
});

router.get([
  '/recall-type/:recallType/make-not-listed',
  '/recall-type/:recallType/make/:make/model-not-listed',
], (req, response) => {
  const recallType = req.params.recallType;
  const make = req.params.make;
  logger.info('User entered recall not listed page');
  landingPageController.recallNotListed(response, recallType, make);
});

module.exports = router;
