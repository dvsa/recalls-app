const RecallDto = require('cvr-common/dto/recall');

class RecallsResource {
  constructor(recallsRepository) {
    this.recallsRepository = recallsRepository;
  }

  mapToRecallList(resultList) {
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
        resultList[i].vehicle_number
      );
      recallList.push(recall);
    }

    return recallList;
  }

  getByMake(make, callback) {
    this.recallsRepository.getByMake(make, (err, data) => {
      if (err) {
        console.error(err);
        callback(err);
      } else {
        const recalls = this.mapToRecallList(data.Items);
        callback(null, recalls);
      }
    });
  }
}

module.exports = RecallsResource;
