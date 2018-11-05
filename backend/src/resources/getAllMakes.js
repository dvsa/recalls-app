const _ = require('lodash');
const Recalls = require('../repositories/recalls');

const recallsRepository = new Recalls();

function getAllMakes(type, callback) {
  recallsRepository.getAllMakes(type, (err, data) => {
    if (err) {
      console.error(err);
      callback(err);
    } else {
      console.log(data);
      const makes = data.Item.makes;
      console.log('Filtered makes:');
      console.log(makes);
      callback(null, makes);
    }
  });
}

module.exports = getAllMakes;
