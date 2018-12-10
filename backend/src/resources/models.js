const { logger } = require('cvr-common/src/logger/loggerFactory');

class ModelsResource {
  constructor(recallsRepository) {
    this.recallsRepository = recallsRepository;
  }

  getAllModels(type, make, callback) {
    this.recallsRepository.getAllModels(type, make, (err, data) => {
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
}

module.exports = ModelsResource;
