const { logger } = require('cvr-common/src/logger/loggerFactory');
const ModelDbRecordDto = require('cvr-common/src/dto/modelDbRecord');

class ModelsResource {
  constructor(recallsRepository) {
    this.recallsRepository = recallsRepository;
  }

  static mapModelsListToDbRecordDto(resultList) {
    return resultList.map(result => new ModelDbRecordDto(
      result.type_make,
      result.models,
    ));
  }

  getAllModels(callback) {
    this.recallsRepository.getAllModels((err, data) => {
      if (err) {
        logger.error('Error while retrieving all models', err);
        callback(err);
      } else {
        logger.info(`Mapping all models. Number of fetched items: ${data.Items.length}`);
        const retrievedModels = this.constructor.mapModelsListToDbRecordDto(data.Items);
        callback(null, retrievedModels);
      }
    });
  }

  getAllModelsByTypeAndMake(type, make, callback) {
    this.recallsRepository.getAllModelsByTypeAndMake(type, make, (err, data) => {
      if (err) {
        logger.error(`Error while retrieving models for make=${make}`, err);
        callback(err);
      } else {
        const retrievedItem = data.Item;
        // retrievedModels remains undefined if no models exist
        const retrievedModels = (retrievedItem || {}).models;
        logger.info(`Models retrieved for make=${make}`);
        callback(null, retrievedModels || []);
      }
    });
  }

  updateModels(models, callback) {
    if (models == null || models.length === 0) {
      logger.info('Received data contains no models. Skipping the DB update process.');
      callback(null);
    } else {
      const modelsList = this.constructor.mapModelsListToDbRecordDto(models);
      this.recallsRepository.updateModels(modelsList, (err) => {
        if (err) {
          logger.error('Unable to update make and type in models table. Error JSON:', err);
          callback(err);
        } else {
          logger.info('Models uploaded successfully in models table');
          callback(null);
        }
      });
    }
  }

  deleteModels(modelsPrimaryKeys, callback) {
    this.recallsRepository.deleteModels(modelsPrimaryKeys, (err, data) => {
      if (err) {
        logger.error('Unable to delete models. Error JSON:', err);
        callback(err);
      } else {
        logger.info(`Models deleted successfully from recalls table: ${JSON.stringify(data)}`);
        callback(null);
      }
    });
  }
}

module.exports = ModelsResource;
