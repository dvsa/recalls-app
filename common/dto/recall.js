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
}

module.exports = RecallDto;
