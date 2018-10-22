var dbClient = require('./dbClient');
var createResponse = require('./createResponse');

class Recalls {
  constructor() {
    this.dbClient = new dbClient();
  }

  getByMake(make, callback) {
    let error;
    let response;

    const params = {
      TableName: this.dbClient.tableName,
      Key: {
        Make: make
      },
    };

    console.log("error");

    return new this.dbClient.database.get(params, (err, data) => {

    if (err) {
      error = createResponse({
        body: {
          err,
        },
        statusCode: 500,
      });

     callback(error);
    } else {
      const recalls = data.Items;
      response = createResponse({
        body: {
          recalls,
        },
      });
      callback(null, response);
    }
  });
  }
}

module.exports = Recalls;
