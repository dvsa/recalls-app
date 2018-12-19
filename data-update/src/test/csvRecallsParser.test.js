const RecallDbRecordDto = require('cvr-common/src/dto/recallDbRecord');
const { expect } = require('chai');
const Parser = require('../csvRecallsParser');

const firstRecallNumber = 'R/2015/01';
const secondRecallNumber = 'R/2016/02';

const firstBuildStart = '2015-01-12';
const firstBuildEnd = '2015-02-12';
const secondBuildStart = '2016-01-12';
const secondBuildEnd = '2016-02-12';

const firstVinStart = '000###00000';
const firstVinEnd = '111##1111';
const secondVinStart = '222##22222';
const secondVinEnd = '33##3333333';

function createRecallWithRanges(recallNumber, vinStart, vinEnd, buildStart, buildEnd) {
  return new RecallDbRecordDto(
    '2015-05-29',
    recallNumber,
    'Make',
    'Concern',
    'Defect',
    'Remedy',
    '999',
    'Model',
    vinStart,
    vinEnd,
    buildStart,
    buildEnd,
  );
}

describe('CsvRecallsParser', () => {
  describe('addRecallOrMergeIfExists()', () => {
    it('Merges VIN and build ranges for recalls of the same make model and recall number', () => {
      const firstRecall = createRecallWithRanges(
        firstRecallNumber, firstVinStart, firstVinEnd, firstBuildStart, firstBuildEnd,
      );

      const secondRecall = createRecallWithRanges(
        firstRecallNumber, secondVinStart, secondVinEnd, secondBuildStart, secondBuildEnd,
      );

      const parser = new Parser('dummy data', 'CP1252');

      let recalls = new Map();
      recalls = parser.addRecallOrMergeIfExists(firstRecall, recalls);
      recalls = parser.addRecallOrMergeIfExists(secondRecall, recalls);

      const mergedRecall = recalls.values().next().value;

      const firstExpectedVinRange = { start: firstVinStart, end: firstVinEnd };
      const secondExpectedVinRange = { start: secondVinStart, end: secondVinEnd };

      const firstExpectedBuildRange = { start: firstBuildStart, end: firstBuildEnd };
      const secondExpectedBuildRange = { start: secondBuildStart, end: secondBuildEnd };

      expect(recalls).to.have.lengthOf(1);

      expect(mergedRecall.vin_range).to.deep.include(firstExpectedVinRange);
      expect(mergedRecall.vin_range).to.deep.include(secondExpectedVinRange);

      expect(mergedRecall.build_range).to.deep.include(firstExpectedBuildRange);
      expect(mergedRecall.build_range).to.deep.include(secondExpectedBuildRange);
    });

    it('Recalls with different recall numbers are stored separately instead of being merged', () => {
      const firstRecall = createRecallWithRanges(
        firstRecallNumber, firstVinStart, firstVinEnd, firstBuildStart, firstBuildEnd,
      );

      const secondRecall = createRecallWithRanges(
        secondRecallNumber, secondVinStart, secondVinEnd, secondBuildStart, secondBuildEnd,
      );

      const parser = new Parser('dummy data', 'CP1252');

      let recalls = new Map();
      recalls = parser.addRecallOrMergeIfExists(firstRecall, recalls);
      recalls = parser.addRecallOrMergeIfExists(secondRecall, recalls);

      expect(recalls).to.have.lengthOf(2);

      const firstProcessedRecall = recalls.get(firstRecall.make_model_recall_number);
      const secondProcessedRecall = recalls.get(secondRecall.make_model_recall_number);

      expect(firstProcessedRecall).to.have.property('recall_number').that.equals(firstRecallNumber);
      expect(secondProcessedRecall).to.have.property('recall_number').that.equals(secondRecallNumber);
    });
  });
});
