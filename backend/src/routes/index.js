const express = require('express');
const getByMake = require('../resources/getByMake');
const getAllMakes = require('../resources/getAllMakes');

const router = express.Router();

router.get('/*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

router.get('/search-by-make', (req, res) => {
  getByMake(req.query.make, (err, data) => {
    if (err) {
      console.error(`Error when searching by make for the following data: ${data}`);
      console.error(err);
      res.status(500).json(err).end();
    } else {
      res.status(200).json(data).end();
    }
  });
});

router.get('/fetch-all-makes', (req, res) => {
  getAllMakes(req.query.type, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json(err).end();
    } else {
      res.status(200).json(data).end();
    }
  });
});

module.exports = router;
