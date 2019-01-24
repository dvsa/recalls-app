const { logger } = require('cvr-common/src/logger/loggerFactory');
const MakeDbRecordDto = require('cvr-common/src/dto/makeDbRecord');
const ResponseDbRecordDto = require('cvr-common/src/dto/responseDbRecord');

class MakesResource {
  constructor(recallsRepository) {
    this.recallsRepository = recallsRepository;
  }

  static mapMakesListToDbRecordDto(resultList) {
    return resultList.map(result => new MakeDbRecordDto(
      result.type,
      result.makes,
    ));
  }

  getAllMakesByType(type, callback) {
    this.recallsRepository.getAllMakesByType(type, (err, data) => {
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

  getAllMakes(exclusiveStartKey, callback) {
    this.recallsRepository.getAllMakes(exclusiveStartKey, (err, data) => {
      if (err) {
        logger.error('Error while retrieving all makes', err);
        callback(err);
      } else {
        logger.info(`Mapping all makes. Number of fetched items: ${data.Items.length}`);
        const retrievedMakes = this.constructor.mapMakesListToDbRecordDto(data.Items);
        const responseDbRecordDto = new ResponseDbRecordDto(data.LastEvaluatedKey, retrievedMakes);
        callback(null, responseDbRecordDto);
      }
    });
  }

  updateMakes(makes, callback) {
    if (makes == null || makes.length === 0) {
      logger.info('Received data contains no makes. Skipping the DB update process.');
      callback(null);
    } else {
      const makesList = this.constructor.mapMakesListToDbRecordDto(makes);
      this.recallsRepository.updateMakes(makesList, (err) => {
        if (err) {
          logger.error('Unable to update type and make in makes table. Error JSON:', JSON.stringify(err, null, 2));
          callback(err);
        } else {
          logger.info('Makes uploaded successfully in makes table');
          callback(null);
        }
      });
    }
  }

  deleteMakes(makesPrimaryKeys, callback) {
    this.recallsRepository.deleteMakes(makesPrimaryKeys, (err, data) => {
      if (err) {
        logger.error('Unable to delete makes. Error JSON:', err);
        callback(err);
      } else {
        logger.info(`Makes deleted successfully from recalls table: ${JSON.stringify(data)}`);
        callback(null);
      }
    });
  }
}

module.exports = MakesResource;
