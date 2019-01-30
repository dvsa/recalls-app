const { logger } = require('cvr-common/src/logger/loggerFactory');
const sequential = require('promise-sequential');
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

  getAllRecalls(exclusiveStartKey, callback) {
    const params = {
      TableName: this.dbClient.recallsTable,
    };

    if (exclusiveStartKey) {
      params.ExclusiveStartKey = exclusiveStartKey;
    }

    this.dbClient.database.scan(params, callback);
  }

  getAllMakes(exclusiveStartKey, callback) {
    const params = {
      TableName: this.dbClient.makesTable,
    };

    if (exclusiveStartKey) {
      params.ExclusiveStartKey = exclusiveStartKey;
    }

    this.dbClient.database.scan(params, callback);
  }

  getAllModels(exclusiveStartKey, callback) {
    const params = {
      TableName: this.dbClient.modelsTable,
    };

    if (exclusiveStartKey) {
      params.ExclusiveStartKey = exclusiveStartKey;
    }

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

  updateRecalls(recalls, callback) {
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

      return () => new Promise((resolve, reject) => {
        this.dbClient.database.update(recallsParams, (err, data) => {
          if (err) {
            logger.error(`Unable to update recall with the following primary key: ${record.make_model_recall_number}`, err);
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    });

    return sequential(promises).then((data) => {
      logger.debug(`Successfully updated ${data.length} recall(s)`);
      callback(null);
    }).catch((err) => {
      logger.error('Error updating recall: ', err);
      callback(err);
    });
  }

  deleteRecalls(recallsPrimaryKeys, callback) {
    const promises = recallsPrimaryKeys.map((primaryKey) => {
      const recallsParams = {
        TableName: this.dbClient.recallsTable,
        Key: {
          make_model_recall_number: primaryKey,
        },
      };
      logger.debug(`Deleting recall with make_model_recall_number : ${primaryKey}`);
      return () => new Promise((resolve, reject) => {
        this.dbClient.database.delete(recallsParams, (err, data) => {
          if (err) {
            logger.error(`Unable to delete recall with the following primary key: ${primaryKey}`, err);
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    });

    return sequential(promises).then((data) => {
      logger.debug(`Successfully deleted ${data.length} recall(s)`);
      callback(null);
    }).catch((err) => {
      logger.error('Error deleting recall: ', err);
      callback(err);
    });
  }

  deleteMakes(makesPrimaryKeys, callback) {
    for (const primaryKey of makesPrimaryKeys) {
      const makesParams = {
        TableName: this.dbClient.makesTable,
        Key: {
          type: primaryKey,
        },
      };

      logger.debug(`Deleting makes for: ${primaryKey}`);

      this.dbClient.database.delete(makesParams, callback);
    }
  }

  deleteModels(modelsPrimaryKeys, callback) {
    const promises = modelsPrimaryKeys.map((primaryKey) => {
      const modelsParams = {
        TableName: this.dbClient.modelsTable,
        Key: {
          type_make: primaryKey,
        },
      };

      logger.debug(`Deleting models for: ${primaryKey}`);

      return () => new Promise((resolve, reject) => {
        this.dbClient.database.delete(modelsParams, (err, data) => {
          if (err) {
            logger.error(`Unable to delete model with the following primary key: ${primaryKey}`, err);
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    });

    return sequential(promises).then((data) => {
      logger.debug(`Successfully deleted ${data.length} model(s)`);
      callback(null);
    }).catch((err) => {
      logger.error('Error deleting model: ', err);
      callback(err);
    });
  }

  updateModels(models, callback) {
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

      return () => new Promise((resolve, reject) => {
        this.dbClient.database.update(modelsParams, (err, data) => {
          if (err) {
            logger.error(`Unable to update model with the following primary key: ${record.type_make}`, err);
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    });

    return sequential(promises).then((data) => {
      logger.debug(`Successfully updated ${data.length} model(s)`);
      callback(null);
    }).catch((err) => {
      logger.error('Error deleting models: ', err);
      callback(err);
    });
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
