const AWS = require('aws-sdk');
const envVariables = require('../config/environmentVariables');

const RECALLS_TABLE_NAME = `cvr-${envVariables.environment}-recalls`;
const MAKES_TABLE_NAME = `cvr-${envVariables.environment}-makes`;
const MODELS_TABLE_NAME = `cvr-${envVariables.environment}-models`;
const AWS_REGION = envVariables.awsRegion;

AWS.config.update({ region: AWS_REGION });

class DbClient {
  constructor(database) {
    this.database = database || DbClient.createDynamoDBClient();
    this.recallsTable = RECALLS_TABLE_NAME;
    this.makesTable = MAKES_TABLE_NAME;
    this.modelsTable = MODELS_TABLE_NAME;
  }

  // private
  static createDynamoDBClient() {
    return new AWS.DynamoDB.DocumentClient();
  }
}

module.exports = DbClient;
