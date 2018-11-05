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

  getAllMakes(type, callback) {
    const params = {
      TableName: this.dbClient.tableName,
      Key: {
        HashKey: type
      }
    };

    this.dbClient.database.get(params, callback);
  }
}

module.exports = Recalls;
