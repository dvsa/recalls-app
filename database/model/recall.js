function mapRecallNumberToRecallType(recallNumber) {
  const type = recallNumber.split('/')[0];
  const vehicleTypes = ['R', 'RM', 'RCT', 'RPT', 'RSPV', 'RPC'];
  return vehicleTypes.includes(type) ? 'vehicle' : 'equipment';
}

class Recall {
  constructor(launchDate, recallNumber, make, concern, defect, remedy, vehicleNumber, model, vinStart, vinEnd, buildStart, buildEnd) {
    this.make_model_recall_number = make + '-' + model + '-' + recallNumber;
    this.type = mapRecallNumberToRecallType(recallNumber);
    this.type_make_model = this.type + '-' + make + '-' + model;
    this.launch_date = launchDate;
    this.recall_number = recallNumber;
    if (make) {this.make = make};
    if (concern) {this.concern = concern};
    if (defect) {this.defect = defect};
    if (remedy) {this.remedy = remedy};
    if (vehicleNumber) {this.vehicle_number = vehicleNumber};
    if (model) {this.model = model};
    if (vinStart) {this.vin_start = vinStart};
    if (vinEnd) {this.vin_end = vinEnd};
    if (buildStart) {this.build_start = buildStart};
    if (buildEnd) {this.build_end = buildEnd};
  }
}

module.exports = Recall;
