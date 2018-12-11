const logger = require('cvr-common/logger/loggerFactory').create();

class MakesResource {
  constructor(recallsRepository) {
    this.recallsRepository = recallsRepository;
  }

  getAllMakes(type, callback) {
    this.recallsRepository.getAllMakes(type, (err, data) => {
      if (err) {
        logger.error(`An error occurred for type=${type}`, err);
        callback(err);
      } else {
        const retrievedItem = data.Item;
        const retrievedMakes = (retrievedItem || {}).makes;
        logger.info(`Makes retrieved for type=${type}`);
        callback(null, retrievedMakes || []);
      }
    });
  }
}

module.exports = MakesResource;
