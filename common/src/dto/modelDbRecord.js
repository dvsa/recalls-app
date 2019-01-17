const SerializableModelDbRecordDto = require('./serializableModelDbRecord');

class ModelDbRecordDto {
  /**
   * @param {string} typeMake
   * @param {Set<string>} models
   */
  constructor(typeMake, models) {
    this.type_make = typeMake;
    this.models = models;
  }

  /**
   * Converts this object to SerializableModelDbRecordDto
   * Sets cannot be serialized, so they are converted to arrays and sorted for easier comparison
   *
   * @returns {SerializableModelDbRecordDto}
   */
  serialize() {
    return new SerializableModelDbRecordDto(this.type_make, Array.from(this.models).sort());
  }
}

module.exports = ModelDbRecordDto;
