const express = require('express');

const router = express.Router();
const frontendController = require('../controllers/frontendController');

router.get('/recalls', (req, response) => {
  frontendController.homePage(response);
});

router.get('/vehicle-make', (req, response) => {
  frontendController.vehicleMake(response);
});

router.post('/results-page', (req, response) => {
  const make = req.body.make;
  frontendController.resultsPage(make, response);
});

module.exports = router;
