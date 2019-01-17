const { logger } = require('cvr-common/src/logger/loggerFactory');
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

  getAllRecalls(callback) {
    const params = {
      TableName: this.dbClient.recallsTable,
    };

    this.dbClient.database.scan(params, callback);
  }

  getAllMakes(callback) {
    const params = {
      TableName: this.dbClient.makesTable,
    };

    this.dbClient.database.scan(params, callback);
  }

  getAllModels(callback) {
    const params = {
      TableName: this.dbClient.modelsTable,
    };

    this.dbClient.database.scan(params, callback);
  }

  getAllMakesByType(type, callback) {
    const params = {
      TableName: this.dbClient.makesTable,
      Key: {
        type,
      },
    };

    this.dbClient.database.get(params, callback);
  }

  getAllModelsByTypeAndMake(type, make, callback) {
    const params = {
      TableName: this.dbClient.modelsTable,
      Key: {
        type_make: `${type}-${make}`,
      },
    };

    this.dbClient.database.get(params, callback);
  }

  async updateRecalls(recalls, callback) {
    const promises = recalls.map((record) => {
      const recallsParams = {
        TableName: this.dbClient.recallsTable,
        Key: {
          make_model_recall_number: record.make_model_recall_number,
        },
        UpdateExpression: 'set concern=:concern, defect=:defect, launch_date=:launch_date, make=:make, model=:model, recall_number=:recall_number, remedy=:remedy, #type=:type, type_make_model=:type_make_model, vehicle_number=:vehicle_number, build_range=:build_range, vin_range=:vin_range',
        ExpressionAttributeNames: {
          '#type': 'type',
        },
        ExpressionAttributeValues: {
          ':concern': record.concern,
          ':defect': record.defect,
          ':launch_date': record.launch_date,
          ':make': record.make,
          ':model': record.model,
          ':recall_number': record.recall_number,
          ':remedy': record.remedy,
          ':type': record.type,
          ':type_make_model': record.type_make_model,
          ':vehicle_number': record.vehicle_number,
          ':build_range': record.build_range,
          ':vin_range': record.vin_range,
        },
      };

      logger.debug(`Updating recall with make_model_recall_number : ${record.make_model_recall_number}`);

      return this.dbClient.database.update(recallsParams, callback);
    });

    Promise.all(promises);
  }

  async deleteRecalls(recallsPrimaryKeys, callback) {
    const promises = recallsPrimaryKeys.map((primaryKey) => {
      const recallsParams = {
        TableName: this.dbClient.recallsTable,
        Key: {
          make_model_recall_number: primaryKey,
        },
      };

      logger.debug(`Deleting recall with make_model_recall_number : ${primaryKey}`);

      return this.dbClient.database.delete(recallsParams, callback);
    });

    Promise.all(promises);
  }

  async deleteMakes(makesPrimaryKeys, callback) {
    const promises = makesPrimaryKeys.map((primaryKey) => {
      const makesParams = {
        TableName: this.dbClient.makesTable,
        Key: {
          type: primaryKey,
        },
      };

      logger.debug(`Deleting makes for: ${primaryKey}`);

      return this.dbClient.database.delete(makesParams, callback);
    });

    Promise.all(promises);
  }

  async deleteModels(modelsPrimaryKeys, callback) {
    const promises = modelsPrimaryKeys.map((primaryKey) => {
      const modelsParams = {
        TableName: this.dbClient.modelsTable,
        Key: {
          type_make: primaryKey,
        },
      };

      logger.debug(`Deleting models for: ${primaryKey}`);

      return this.dbClient.database.delete(modelsParams, callback);
    });

    Promise.all(promises);
  }

  async updateModels(models, callback) {
    const promises = models.map((record) => {
      const modelsParams = {
        TableName: this.dbClient.modelsTable,
        Key: {
          type_make: record.type_make,
        },
        UpdateExpression: 'set models=:models',
        ExpressionAttributeValues: {
          ':models': record.models,
        },
      };

      logger.debug(`Updating model with type_make : ${record.type_make}`);

      return this.dbClient.database.update(modelsParams, callback);
    });

    Promise.all(promises);
  }

  updateMakes(makes, callback) {
    for (const record of makes) {
      const makesParams = {
        TableName: this.dbClient.makesTable,
        Key: {
          type: record.type,
        },
        UpdateExpression: 'set makes=:makes',
        ExpressionAttributeValues: {
          ':makes': record.makes,
        },
      };

      logger.debug(`Updating make with type : ${record.type}`);

      this.dbClient.database.update(makesParams, callback);
    }
  }
}

module.exports = RecallsRepository;
