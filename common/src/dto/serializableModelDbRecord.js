class SerializableModelDbRecordDto {
  /**
   * @param {string} typeMake
   * @param {string[]} models
   */
  constructor(typeMake, models) {
    this.type_make = typeMake;
    this.models = models || [];
  }
}

module.exports = SerializableModelDbRecordDto;
