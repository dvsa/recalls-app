const RecallDto = require('cvr-common/dto/recall');

class RecallsResource {
  constructor(recallsRepository) {
    this.recallsRepository = recallsRepository;
  }

  mapToRecallList(resultList) {
    return resultList.map((result) => {
      return new RecallDto(
        result.make,
        result.model,
        result.recall_number,
        result.defect,
        result.launch_date,
        result.concern,
        result.remedy,
        result.vehicle_number,
      );
    });
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
