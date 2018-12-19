const SerializableMakeDbRecordDto = require('./serializableMakeDbRecord');

class MakeDbRecordDto {
  /**
   * @param {string} type
   * @param {Set<string>} makes
   */
  constructor(type, makes) {
    this.type = type;
    this.makes = makes || new Set();
  }

  /**
   * Converts this object to SerializableMakeDbRecordDto
   * Sets cannot be serialized, so they are converted to arrays and sorted for easier comparison
   *
   * @returns {SerializableMakeDbRecordDto}
   */
  serialize() {
    return new SerializableMakeDbRecordDto(this.type, Array.from(this.makes).sort());
  }
}

module.exports = MakeDbRecordDto;
