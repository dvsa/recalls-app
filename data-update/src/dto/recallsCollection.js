/**
 * Groups recalls retrieved from the CSV file - correct ones and the recalls without model
 */
class RecallsCollection {
  /**
   * @param {Map<String, RecallDbRecordDto>} correctRecalls
   * @param {RecallDbRecordDto[]} recallsWithMissingModel
   */
  constructor(correctRecalls, recallsWithMissingModel) {
    this.correctRecalls = correctRecalls || new Map();
    this.recallsWithMissingModel = recallsWithMissingModel || [];
  }
}

module.exports = RecallsCollection;
