const express = require('express');
const RecallsRepository = require('../repositories/recalls');
const RecallsResource = require('../resources/recalls');
const MakesResource = require('../resources/makes');

const router = express.Router();
const recallsRepository = new RecallsRepository();

router.get('/*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

router.get('/search-by-make', (req, res) => {
  const recallsResource = new RecallsResource(recallsRepository);
  recallsResource.getByMake(req.query.make, (err, data) => {
    if (err) {
      console.error(`Error when searching by make for the following data: ${req.query.make}`);
      console.error(err);
      res.status(500).json(err).end();
    } else {
      res.status(200).json(data).end();
    }
  });
});

router.get('/fetch-all-makes', (req, res) => {
  const makesResource = new MakesResource(recallsRepository);
  makesResource.getAllMakes(req.query.type, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json(err).end();
    } else {
      res.status(200).json(data).end();
    }
  });
});

module.exports = router;
