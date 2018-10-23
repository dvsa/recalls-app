const AWS = require('aws-sdk');
const envVariables = require('../config/environmentVariables');

const TABLE_NAME = envVariables.tableName;
const AWS_REGION = envVariables.awsRegion;

AWS.config.update({ region: AWS_REGION });

class DbClient {
  constructor(database) {
    this.database = database || DbClient.createDynamoDBClient();
    this.tableName = TABLE_NAME;
  }

  // private
  static createDynamoDBClient() {
    return new AWS.DynamoDB.DocumentClient();
  }
}

module.exports = DbClient;
