class RecallDbRecordDto { 
  constructor(launchDate, recallNumber, make, concern, defect, remedy, vehicleNumber, model, vinStart, vinEnd, buildStart, buildEnd) {
    this.make_model_recall_number = make + '-' + model + '-' + recallNumber;
    this.type = this.mapRecallNumberToRecallType(recallNumber);
    this.type_make_model = this.type + '-' + make + '-' + model;
    this.launch_date = launchDate;
    this.recall_number = recallNumber;
    if (make) {this.make = make};
    if (concern) {this.concern = concern};
    if (defect) {this.defect = defect};
    if (remedy) {this.remedy = remedy};
    if (vehicleNumber) {this.vehicle_number = vehicleNumber};
    if (model) {this.model = model};

    if (vinStart || vinEnd) {
      this.vin_range = [this.createRangeObject(vinStart, vinEnd)];
    }

    if (buildStart || buildEnd) {
      this.build_range = [this.createRangeObject(buildStart, buildEnd)];
    }
  }

  /**
   * Returns an object with 'start' and 'end' properties {start: 'x', end: 'y'}
   * Both properties are optional, if one of them is not defined, the returned object will not include them
   * @param {string} start
   * @param {string} end
   */
  createRangeObject(start, end) {
    const range = {};

    if (start) {
      range.start = start;
    }
    if (end) {
      range.end = end;
    }

    return range;
  }

  mapRecallNumberToRecallType(recallNumber) {
    const type = recallNumber.split('/')[0];
    const vehicleTypes = ['R', 'RM', 'RCT', 'RPT', 'RSPV', 'RPC'];
    return vehicleTypes.includes(type) ? 'vehicle' : 'equipment';
  }
}

module.exports = RecallDbRecordDto;
