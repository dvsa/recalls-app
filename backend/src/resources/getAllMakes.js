const RecallsRepository = require('../repositories/recalls');

const recallsRepository = new RecallsRepository();

function getAllMakes(type, callback) {
  recallsRepository.getAllMakes(type, (err, data) => {
    if (err) {
      console.error(err);
      callback(err);
    } else {
      const retrievedItem = data.Item;
      console.log(data);
      console.log(retrievedItem.makes);
      callback(null, retrievedItem.makes);
    }
  });
}

module.exports = getAllMakes;
