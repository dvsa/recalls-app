const Recalls = require('../service/recalls');
const createResponse = require('../service/createResponse');

const recalls = new Recalls();

module.exports = function(params) {
  return recalls.getByMake(params, function(error) {
  return error;
});
};
