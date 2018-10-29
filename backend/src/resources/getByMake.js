const RecallDto = require('cvr-common/dto/recall');
const RecallsRepository = require('../repositories/recalls');

const recallsRepository = new RecallsRepository();

function mapToRecallList(resultList) {
  const recallList = [];
  for (let i = 0; i < resultList.length; i += 1) {
    const recall = new RecallDto(
      resultList[i].make,
      resultList[i].model,
      resultList[i].recall_number,
      resultList[i].defect,
      resultList[i].launch_date,
      resultList[i].concern,
      resultList[i].remedy,
      resultList[i].vehicle_number,
    );
    recallList.push(recall);
  }

  return recallList;
}

function getByMake(make, callback) {
  recallsRepository.getByMake(make, (err, data) => {
    if (err) {
      console.error(err);
      callback(err);
    } else {
      console.log(data);
      const recalls = mapToRecallList(data.Items);
      console.log(recalls);
      callback(null, recalls);
    }
  });
}

module.exports = getByMake;
