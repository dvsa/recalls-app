const express = require('express');

const router = express.Router();
const landingPageController = require('../controllers/landingPageController');
const makeController = require('../controllers/makeController');
const modelController = require('../controllers/modelController');
const resultsController = require('../controllers/resultsController');

router.get('/cookies', (req, response) => {
  landingPageController.cookies(response);
});

router.get('/terms-and-conditions', (req, response) => {
  landingPageController.termsAndConditions(response);
});

router.get('/recalls', (req, response) => {
  landingPageController.homePage(null, response);
});

router.post('/recalls', (req, response) => {
  const recallType = req.body.recallType;
  landingPageController.submitRecallType(req, response, recallType);
});

router.get('/vehicle-make', (req, response) => {
  const recallType = req.query.recallType;
  makeController.makesList(null, response, recallType);
});

router.post('/vehicle-make', (req, response) => {
  const recallType = req.query.recallType;
  const make = req.body.make;

  makeController.submitMake(make, recallType, response);
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

  modelController.submitModel(make, model, recallType, response);
});

router.get('/results-page', (req, response) => {
  const make = req.query.make;
  const model = req.query.model;
  const recallType = req.query.recallType;

  resultsController.resultsPage(make, model, recallType, response);
});

module.exports = router;
