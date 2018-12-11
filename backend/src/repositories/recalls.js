const logger = require('cvr-common/logger/loggerFactory').create();
const DbClient = require('../db/dbClient');

class RecallsRepository {
  constructor() {
    this.dbClient = new DbClient();
  }

  getByMakeAndModel(recallType, make, model, callback) {
    const params = {
      TableName: this.dbClient.recallsTable,
      IndexName: this.dbClient.recallsSecondaryIndexName,
      KeyConditionExpression: 'type_make_model = :typeMakeModel',
      ExpressionAttributeValues: {
        ':typeMakeModel': `${recallType}-${make}-${model}`,
      },
    };

    logger.debug(`DB request params: ${JSON.stringify(params)}`);

    this.dbClient.database.query(params, callback);
  }

  getByMakeModelAndYear(recallType, make, model, year, callback) {
    const params = {
      TableName: this.dbClient.recallsTable,
      IndexName: this.dbClient.recallsSecondaryIndexName,
      KeyConditionExpression: 'type_make_model = :typeMakeModel',
      FilterExpression: 'build_start <= :yearEnd AND build_end >= :yearStart',
      ExpressionAttributeValues: {
        ':typeMakeModel': `${recallType}-${make}-${model}`,
        ':yearStart': `${year}-01-01`,
        ':yearEnd': `${year}-12-31`,
      },
    };

    logger.debug(`DB request params: ${JSON.stringify(params)}`);

    this.dbClient.database.query(params, callback);
  }

  getAllMakes(type, callback) {
    const params = {
      TableName: this.dbClient.makesTable,
      Key: {
        type,
      },
    };

    this.dbClient.database.get(params, callback);
  }

  getAllModels(type, make, callback) {
    const params = {
      TableName: this.dbClient.modelsTable,
      Key: {
        type_make: `${type}-${make}`,
      },
    };

    this.dbClient.database.get(params, callback);
  }
}

module.exports = RecallsRepository;
