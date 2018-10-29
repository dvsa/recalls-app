const DbClient = require('../db/dbClient');

class Recalls {
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

  getAllMakes(callback) {
    const params = {
      TableName: this.dbClient.tableName,
    };

    this.dbClient.database.scan(params, callback);
  }
}

module.exports = Recalls;
