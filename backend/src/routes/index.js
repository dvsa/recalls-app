const express = require('express');
const logger = require('cvr-common/logger/loggerFactory').create();
const RecallsRepository = require('../repositories/recalls');
const RecallsResource = require('../resources/recalls');
const MakesResource = require('../resources/makes');
const ModelsResource = require('../resources/models');

const router = express.Router();
const recallsRepository = new RecallsRepository();
const recallsResource = new RecallsResource(recallsRepository);

function returnApiResponse(err, res, data) {
  if (err) {
    logger.error('Error while retrieving resource:', err);
    res.status(500).json(err).end();
  } else {
    logger.debug('Returning response:', data);
    res.status(200).json(data).end();
  }
}

router.get('/*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

/** All makes of a given type */
router.get('/recall-type/:type/make', (req, res) => {
  const makesResource = new MakesResource(recallsRepository);
  const { type } = req.params;
  logger.info(`Requesting makes by type ${type}`);
  makesResource.getAllMakes(type, (err, data) => {
    returnApiResponse(err, res, data);
  });
});

/** All models of a given type and make */
router.get('/recall-type/:type/make/:make/model', (req, res) => {
  const { type } = req.params;
  const make = decodeURIComponent(req.params.make);

  logger.info(`Requesting models by type ${type} and make ${make}`);
  const modelsResource = new ModelsResource(recallsRepository);
  modelsResource.getAllModels(type, make, (err, data) => {
    returnApiResponse(err, res, data);
  });
});

/** All recalls for a given type, make and model */
router.get('/recall-type/:type/make/:make/model/:model/recalls', (req, res) => {
  const { type } = req.params;
  const make = decodeURIComponent(req.params.make);
  const model = decodeURIComponent(req.params.model);

  logger.info(`Requesting recalls for type ${type}, make ${make} and model ${model}`);
  recallsResource.getByMakeAndModel(type, make, model, (err, data) => {
    returnApiResponse(err, res, data);
  });
});

/** All recalls for a given type, make, model and year */
router.get('/recall-type/:type/make/:make/model/:model/year/:year/recalls', (req, res) => {
  const { type, year } = req.params;
  const make = decodeURIComponent(req.params.make);
  const model = decodeURIComponent(req.params.model);

  logger.info(`Requesting recalls for type ${type}, make ${make}, model ${model} and year ${year}`);
  recallsResource.getByMakeModelAndYear(type, make, model, year, (err, data) => {
    returnApiResponse(err, res, data);
  });
});

module.exports = router;
