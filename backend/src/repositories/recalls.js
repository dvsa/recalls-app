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

    console.log(`DB request params: ${JSON.stringify(params)}`);

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
