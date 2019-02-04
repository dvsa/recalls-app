const express = require('express');
const { logger } = require('cvr-common/src/logger/loggerFactory');
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

/** endpoints for fetching data required for data-update process */
router.get('/recalls', (req, res) => {
  logger.debug(`Exclusive start key: ${req.query.exclusiveStartKey}`);
  recallsResource.getAllRecalls(req.query.exclusiveStartKey, (err, data) => {
    returnApiResponse(err, res, data);
  });
});

router.get('/makes', (req, res) => {
  logger.debug(`Exclusive start key: ${req.query.exclusiveStartKey}`);
  const makesResource = new MakesResource(recallsRepository);
  makesResource.getAllMakes(req.query.exclusiveStartKey, (err, data) => {
    returnApiResponse(err, res, data);
  });
});

router.get('/models', (req, res) => {
  logger.debug(`Exclusive start key: ${req.query.exclusiveStartKey}`);
  const modelsResource = new ModelsResource(recallsRepository);
  modelsResource.getAllModels(req.query.exclusiveStartKey, (err, data) => {
    returnApiResponse(err, res, data);
  });
});

/** endpoints for patching data required for data-update process */
router.patch('/recalls', (req, res) => {
  const recalls = req.body;
  logger.debug(`PATCH /recalls - Received recall data: ${JSON.stringify(recalls)}`);
  recallsResource.updateRecalls(recalls, (err, data) => {
    returnApiResponse(err, res, data);
  });
});

router.patch('/makes', (req, res) => {
  const makesResource = new MakesResource(recallsRepository);
  const makes = req.body;
  logger.debug(`PATCH /makes - Received makes data: ${JSON.stringify(makes)}`);
  makesResource.updateMakes(makes, (err, data) => {
    returnApiResponse(err, res, data);
  });
});

router.patch('/models', (req, res) => {
  const modelsResource = new ModelsResource(recallsRepository);
  const models = req.body;
  logger.debug(`PATCH /models- Received models data: ${JSON.stringify(models)}`);
  modelsResource.updateModels(models, (err, data) => {
    returnApiResponse(err, res, data);
  });
});

/** endpoints for deleting data (required by data-update process) */
router.delete('/recalls', (req, res) => {
  const recalls = req.body;
  logger.debug(`DELETE /recalls - Received recall keys: ${JSON.stringify(recalls)}`);
  recallsResource.deleteRecalls(recalls, (err, data) => {
    returnApiResponse(err, res, data);
  });
});

router.delete('/makes', (req, res) => {
  const makesResource = new MakesResource(recallsRepository);
  const makes = req.body;
  logger.debug(`DELETE /makes - Received keys: ${JSON.stringify(makes)}`);
  makesResource.deleteMakes(makes, (err, data) => {
    returnApiResponse(err, res, data);
  });
});

router.delete('/models', (req, res) => {
  const modelsResource = new ModelsResource(recallsRepository);
  const models = req.body;
  logger.debug(`DELETE /models - Received keys: ${JSON.stringify(models)}`);
  modelsResource.deleteModels(models, (err, data) => {
    returnApiResponse(err, res, data);
  });
});

/** All makes of a given type */
router.get('/recall-type/:type/make', (req, res) => {
  const makesResource = new MakesResource(recallsRepository);
  const { type } = req.params;
  logger.info(`Requesting makes by type ${type}`);
  makesResource.getAllMakesByType(type, (err, data) => {
    returnApiResponse(err, res, data);
  });
});

/** All models of a given type and make */
router.get('/recall-type/:type/make/:make/model', (req, res) => {
  const { type } = req.params;
  const make = decodeURIComponent(req.params.make);

  logger.info(`Requesting models by type ${type} and make ${make}`);
  const modelsResource = new ModelsResource(recallsRepository);
  modelsResource.getAllModelsByTypeAndMake(type, make, (err, data) => {
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
