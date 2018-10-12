const express = require('express');

const router = express.Router();
const envVariables = require('../config/environmentVariables');

const ASSETS_BASE_URL = envVariables.assetsBaseUrl;

router.get('/recalls', (req, res) => {
  res.render('type-of-recall.njk', { assetsBaseUrl: ASSETS_BASE_URL });
});

module.exports = router;
