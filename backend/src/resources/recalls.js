const RecallDto = require('cvr-common/dto/recall');

class RecallsResource {
  constructor(recallsRepository) {
    this.recallsRepository = recallsRepository;
  }

  static mapToRecallList(resultList) {
    return resultList.map(result => new RecallDto(
      result.make,
      result.model,
      result.recall_number,
      result.defect,
      result.launch_date,
      result.concern,
      result.remedy,
      result.vehicle_number,
      result.build_start,
      result.build_end,
    ));
  }

  getByMakeAndModel(type, make, model, callback) {
    this.recallsRepository.getByMakeAndModel(type, make, model, (err, data) => {
      this.mapRepoDataOrFail(err, data, type, make, model, null, callback);
    });
  }

  getByMakeModelAndYear(type, make, model, year, callback) {
    this.recallsRepository.getByMakeModelAndYear(type, make, model, year, (err, data) => {
      this.mapRepoDataOrFail(err, data, type, make, model, year, callback);
    });
  }

  mapRepoDataOrFail(err, data, type, make, model, year, callback) {
    if (err) {
      console.error(`An error occurred for type=${type}, make=${make}, model=${model}, year=${year}`);
      console.error(err);
      callback(err);
    } else {
      const recalls = this.constructor.mapToRecallList(data.Items);
      callback(null, recalls);
    }
  }
}

module.exports = RecallsResource;
