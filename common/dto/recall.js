class RecallDto {
  constructor(make, model, recallNumber, defectDescription, launchDate, concern, remedy, affectedVehiclesNumber, buildStart, buildEnd) {
    this.make = make;
    this.model = model;
    this.recallNumber = recallNumber;
    this.defectDescription = defectDescription;
    this.launchDate = launchDate;
    this.concern = concern;
    this.remedy = remedy;
    this.affectedVehiclesNumber = affectedVehiclesNumber;
    this.buildStart = new Date(buildStart);
    this.buildEnd = new Date(buildEnd);
  }
}

module.exports = RecallDto;
