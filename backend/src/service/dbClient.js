let AWS = require('aws-sdk');

const table = process.env.DYNAMODB_RECALLS_TABLE || 'aaa';
const aws_region = process.env.AWS_REGION || 'eu-west-1';

AWS.config.update({region: aws_region});

class dbClient {
  constructor(database) {
      this.database = database || dbClient.createDynamoDBClient();
      this.tableName = table;
  }

  /**
	 * @private
	 */
	static createDynamoDBClient() {
		return new AWS.DynamoDB.DocumentClient({
			params: { TableName: table },
			service: new AWS.DynamoDB()
		});
	}
}

module.exports = dbClient;
