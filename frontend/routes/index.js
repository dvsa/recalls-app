const express = require('express');

const router = express.Router();
const frontendController = require('../controllers/frontendController');

router.get('/recalls', (req, response) => {
  frontendController.homePage(response);
});

router.get('/vehicle-make', (req, response) => {
  const recallType = req.body.recallType;
  frontendController.vehicleMake(recallType, response);
});

router.post('/results-page', (req, response) => {
  const make = req.body.vehicleMake;
  frontendController.resultsPage(make, response);
});

module.exports = router;
