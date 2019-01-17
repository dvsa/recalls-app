class SerializableMakeDbRecordDto {
  /**
   * @param {string} type
   * @param {string[]} makes
   */
  constructor(type, makes) {
    this.type = type;
    this.makes = makes || [];
  }
}

module.exports = SerializableMakeDbRecordDto;
