const _ = require('lodash');
const Recalls = require('../repositories/recalls');

const recallsRepository = new Recalls();

function getAllMakes(callback) {
  recallsRepository.getAllMakes((err, data) => {
    if (err) {
      console.error(err);
      callback(err);
    } else {
      console.log(data);
      const makes = retrieveMakes(data.Items);
      console.log('Filtered makes:');
      console.log(makes);
      callback(null, makes);
    }
  });
}

function retrieveMakes(resultList) {
  let makes = [];
  for (var i = 0; i < resultList.length; i++) {
    makes.push(resultList[i].make);
  }

  return filterMakes(makes);
}

function filterMakes(makes) {
  return _.orderBy(_.uniq(makes), [make => make.toLowerCase()]);
}

module.exports = getAllMakes;
