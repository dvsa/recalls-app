const express = require('express');

const router = express.Router();
const frontendController = require('../controllers/frontendController');

router.get('/recalls', (req, response) => {
  frontendController.homePage(response);
});

router.get('/vehicle-make', (req, response) => {
  const make = req.query.make;
  frontendController.vehicleMake(make, response);
});

router.post('/results-page', (req, response) => {
  const make = req.query.make;
  frontendController.resultsPage(make, response);
});

module.exports = router;
