const DbClient = require('../db/dbClient');

class Recalls {
  constructor() {
    this.dbClient = new DbClient();
  }

  getByMake(make, callback) {
    const params = {
      TableName: this.dbClient.recallsTable,
      FilterExpression: 'make = :make',
      ExpressionAttributeValues: { ':make': make },
    };

    this.dbClient.database.scan(params, callback);
  }

  getAllMakes(type, callback) {
    const params = {
      TableName: this.dbClient.makesTable,
      Key: {
        HashKey: type
      }
    };

    this.dbClient.database.get(params, callback);
  }
}

module.exports = Recalls;
