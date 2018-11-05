const express = require('express');

const router = express.Router();
const frontendController = require('../controllers/frontendController');

router.get('/recalls', (req, response) => {
  const make = req.query.make; // TODO: amend it in BL-8752; it does not belong to the home page
  frontendController.homePage(make, response);
});

router.get('/cookies', (req, response) => {
  frontendController.cookies(response);
});

router.get('/terms-and-conditions', (req, response) => {
  frontendController.termsAndConditions(response);
});

module.exports = router;
