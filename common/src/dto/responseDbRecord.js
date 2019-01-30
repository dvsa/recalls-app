class ResponseDbRecordDto {
  /**
   * @param {int} lastEvaluatedKey
   * @param {object[]} items
   */
  constructor(lastEvaluatedKey, items) {
    this.lastEvaluatedKey = lastEvaluatedKey;
    this.items = items || [];
  }
}

module.exports = ResponseDbRecordDto;
