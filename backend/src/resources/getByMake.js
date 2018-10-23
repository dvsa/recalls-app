const Recalls = require('../repositories/recalls');

const recalls = new Recalls();

function getByMake(make, callback) {
  recalls.getByMake(make, (err, data) => {
    if (err) {
      console.error(err);
      callback(err);
    } else {
      // recalls = data.Items;
      // later we're going to use actuall data from db, now we're returning a dummy recall
      console.log('success');
      console.log(data);

      const response = {
        make,
        model: 'super cool model',
        recallNumber: 'R/2016/098',
        recallDescription: 'Really bad recall',
        reason: 'nothing works',
        remedy: 'repair it',
        vehiclesAffected: 10,
      };

      callback(null, response);
    }
  });
}

module.exports = getByMake;
