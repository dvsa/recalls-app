class RecallDto {
  constructor(make, model, recallNumber, defectDescription, launchDate, concern, remedy, affectedVehiclesNumber) {
    this.make = make;
    this.model = model;
    this.recallNumber = recallNumber;
    this.defectDescription = defectDescription;
    this.launchDate = launchDate;
    this.concern = concern;
    this.remedy = remedy;
    this.affectedVehiclesNumber = affectedVehiclesNumber;
  }

  set make(make) {
    this.make = make;
  }

  set model(model) {
    this.model = model;
  }

  set recallNumber(recallNumber) {
    this.recallNumber = recallNumber;
  }

  set defectDescription(defectDescription) {
    this.defectDescription = defectDescription;
  }

  set launchDate(launchDate) {
    this.launchDate = launchDate;
  }

  set concern(concern) {
    this.concern = concern;
  }

  set remedy(remedy) {
    this.remedy = remedy;
  }

  set affectedVehiclesNumber(affectedVehiclesNumber) {
    this.affectedVehiclesNumber = affectedVehiclesNumber;
  }
}

module.exports = RecallDto;
