const DbClient = require('../db/dbClient');

class RecallsRepository {
  constructor() {
    this.dbClient = new DbClient();
  }

  getByMake(make, callback) {
    const params = {
      TableName: this.dbClient.tableName,
      FilterExpression: 'make = :make',
      ExpressionAttributeValues: { ':make': make },
    };

    this.dbClient.database.scan(params, callback);
  }
}

module.exports = RecallsRepository;
