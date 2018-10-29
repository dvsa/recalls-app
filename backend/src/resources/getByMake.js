const Recalls = require('../repositories/recalls');
const RecallDto = require('../../../common/dto/recall');

const recallsRepository = new Recalls();

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

function mapToRecallList(resultList) {
  let recallList = [];
  for (var i = 0; i < resultList.length; i++) {
    const recall = new RecallDto(
      resultList[i].make,
      resultList[i].model,
      resultList[i].recalls_number,
      resultList[i].defect,
      resultList[i].launch_date,
      resultList[i].concern,
      resultList[i].reemedy,
      resultList[i].vehicle_number
    );
    recallList.push(recall);
  }

  return recallList;
}

module.exports = getByMake;
