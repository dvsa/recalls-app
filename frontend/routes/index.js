const express = require('express');

const router = express.Router();
const landingPageController = require('../controllers/landingPageController');
const vehicleMakeController = require('../controllers/vehicleMakeController');
const resultsController = require('../controllers/resultsController');

router.get('/recalls', (req, response) => {
  landingPageController.homePage(null, response);
});

router.post('/recalls', (req, response) => {
  const recallType = req.body.recallType;
  landingPageController.submitRecallType(req, response, recallType);
});

router.get('/vehicle-make', (req, response) => {
  const recallType = req.query.recallType;
  vehicleMakeController.makesList(null, response, recallType);
});

router.post('/vehicle-make', (req, response) => {
  const recallType = req.query.recallType;
  const make = req.body.make;
  vehicleMakeController.submitMake(make, recallType, response);
});

router.get('/results-page', (req, response) => {
  const make = req.query.make;
  const recallType = req.query.recallType;
  resultsController.resultsPage(make, recallType, response);
});

router.get('/cookies', (req, response) => {
  frontendController.cookies(response);
});

router.get('/terms-and-conditions', (req, response) => {
  frontendController.termsAndConditions(response);
});

module.exports = router;
