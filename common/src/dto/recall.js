class RecallDto {
  constructor(
    make,
    model,
    recallNumber,
    defectDescription,
    launchDate,
    concern,
    remedy,
    affectedVehiclesNumber,
    buildRange,
  ) {
    this.make = make;
    this.model = model;
    this.recallNumber = recallNumber;
    this.defectDescription = defectDescription;
    this.launchDate = launchDate;
    this.concern = concern;
    this.remedy = remedy;
    this.affectedVehiclesNumber = affectedVehiclesNumber;
    this.buildRange = this.constructor.parseDateRanges(buildRange);
  }

  static parseDateRanges(buildRange) {
    const parsedBuildRange = buildRange || [];
    return parsedBuildRange.map((dateRange) => {
      const parsedDateRange = {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end),
      };
      return parsedDateRange;
    });
  }
}

module.exports = RecallDto;
