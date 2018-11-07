const DbClient = require('../db/dbClient');

class RecallsRepository {
  constructor() {
    this.dbClient = new DbClient();
  }

  getByMake(make, callback) {
    const params = {
      TableName: this.dbClient.recallsTable,
      FilterExpression: 'make = :make',
      ExpressionAttributeValues: { ':make': make },
    };

    console.log(`DB request params: ${params}`);

    this.dbClient.database.scan(params, callback);
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
}

module.exports = RecallsRepository;
