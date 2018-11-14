const express = require('express');
const RecallsRepository = require('../repositories/recalls');
const RecallsResource = require('../resources/recalls');
const MakesResource = require('../resources/makes');
const ModelsResource = require('../resources/models');

const router = express.Router();
const recallsRepository = new RecallsRepository();

router.get('/*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

/** All makes of a given type */
router.get('/recall-types/:type/makes', (req, res) => {
  const makesResource = new MakesResource(recallsRepository);
  const type = req.params.type;
  makesResource.getAllMakes(req.params.type, (err, data) => {
    if (err) {
      console.error(`An error occurred for type=${type}`);
      console.error(err);
      res.status(500).json(err).end();
    } else {
      res.status(200).json(data).end();
    }
  });
});

/** All models of a given type and make */
router.get('/recall-types/:type/makes/:make/models', (req, res) => {
  const type = req.params.type;
  const make = decodeURIComponent(req.params.make);

  const modelsResource = new ModelsResource(recallsRepository);
  modelsResource.getAllModels(type, make, (err, data) => {
    if (err) {
      console.error(`An error occurred for type=${type}, make=${make}`);
      console.error(err);
      res.status(500).json(err).end();
    } else {
      res.status(200).json(data).end();
    }
  });
});

/** All recalls for a given type, make and model */
router.get('/recall-types/:type/makes/:make/models/:model/recalls', (req, res) => {
  const recallsResource = new RecallsResource(recallsRepository);
  const type = req.params.type;
  const make = decodeURIComponent(req.params.make);
  const model = decodeURIComponent(req.params.model);


  recallsResource.getByMakeAndModel(type, make, model, (err, data) => {
    if (err) {
      console.error(`An error occurred for type=${type}, make=${make}, model=${model}`);
      console.error(err);
      res.status(500).json(err).end();
    } else {
      res.status(200).json(data).end();
    }
  });
});

module.exports = router;
