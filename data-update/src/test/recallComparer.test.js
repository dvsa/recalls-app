const fs = require('fs');
const { expect } = require('chai');
const Parser = require('../csvRecallsParser');
const RecallComparer = require('../recallComparer');

function convertCsvToRecallDtos(csvPath) {
  const data = fs.readFileSync(csvPath);
  const parser = new Parser(data, 'CP1252');
  return parser.parse();
}

describe('RecallComparer', () => {
  describe('findDeletedRecallsPrimaryKeys()', () => {
    it('Returns primary keys of deleted recalls', () => {
      /** In a real scenario previousRecalls would be fetched from the API
       * and currentRecalls would come from a recently uploaded CSV file */
      const previousRecalls = convertCsvToRecallDtos(`${__dirname}/data/testData-BeforeDeleting.csv`);
      const currentRecalls = convertCsvToRecallDtos(`${__dirname}/data/testData-AfterDeleting.csv`);

      const comparer = new RecallComparer(previousRecalls, currentRecalls);
      const deletedRecalls = comparer.findDeletedRecallsPrimaryKeys();

      expect(deletedRecalls).to.have.lengthOf(2);
      expect(deletedRecalls).to.include('OTHER EQUIPMENT-Composite X-RCOMP/2009/009');
      expect(deletedRecalls).to.include('MITSUBISHI-LANCER EVO-R/2014/013');
    });
  });
  describe('findDeletedMakesPrimaryKeys()', () => {
    it('Returns primary keys of deleted makes', () => {
      const previousRecalls = convertCsvToRecallDtos(`${__dirname}/data/testData-BeforeDeleting.csv`);
      const currentRecalls = convertCsvToRecallDtos(`${__dirname}/data/testData-AfterDeleting.csv`);

      const comparer = new RecallComparer(previousRecalls, currentRecalls);
      const previousMakes = comparer.constructor.extractMakesFromRecalls(previousRecalls);
      const currentMakes = RecallComparer.extractMakesFromRecalls(currentRecalls);

      const deletedMakes = RecallComparer.findDeletedMakesPrimaryKeys(previousMakes, currentMakes);

      expect(deletedMakes).to.have.lengthOf(1);
      expect(deletedMakes).to.include('equipment');
    });
  });
  describe('findDeletedModelsPrimaryKeys()', () => {
    it('Returns primary keys of deleted models', () => {
      const previousRecalls = convertCsvToRecallDtos(`${__dirname}/data/testData-BeforeDeleting.csv`);
      const currentRecalls = convertCsvToRecallDtos(`${__dirname}/data/testData-AfterDeleting.csv`);

      const comparer = new RecallComparer(previousRecalls, currentRecalls);
      const previousModels = comparer.constructor.extractModelsFromRecalls(previousRecalls);
      const currentModels = RecallComparer.extractModelsFromRecalls(currentRecalls);

      const deletedModels = RecallComparer.findDeletedModelsPrimaryKeys(
        previousModels, currentModels,
      );

      expect(deletedModels).to.have.lengthOf(1);
      expect(deletedModels).to.include('equipment-OTHER EQUIPMENT');
    });
  });
  describe('findModifiedAndValidRecalls()', () => {
    it('Returns recalls that were modified or added under new make-model-recallNumber combination', () => {
      /** In a real scenario previousRecalls would be fetched from the API
       * and currentRecalls would come from a recently uploaded CSV file */
      const previousRecalls = convertCsvToRecallDtos(`${__dirname}/data/testData.csv`);
      const currentRecalls = convertCsvToRecallDtos(`${__dirname}/data/testDataWithAdditionalRecalls.csv`);

      const comparer = new RecallComparer(previousRecalls, currentRecalls);
      const modifiedRecalls = comparer.findModifiedAndValidRecalls();

      expect(modifiedRecalls).to.have.lengthOf(6);

      expect(modifiedRecalls[0].vin_range).to.deep.include({ start: 'VINSTART000000001', end: 'VINEND99999999999' });
      expect(modifiedRecalls[0].vin_range).to.have.lengthOf(2);

      expect(modifiedRecalls[1].concern).to.equal('Existing recall number with a new model');

      expect(modifiedRecalls[3].concern).to.equal('Completely new recall number');

      expect(modifiedRecalls[4].build_range).to.deep.include({ start: '2008-08-01', end: '2009-09-30' });
      expect(modifiedRecalls[4].build_range).to.have.lengthOf(2);
    });
    it('Does not treat reordered entries as modifications (sorts compared collections)', () => {
      const previousRecalls = convertCsvToRecallDtos(`${__dirname}/data/testDataWithAdditionalRecalls.csv`);
      const currentRecalls = convertCsvToRecallDtos(`${__dirname}/data/testDataWithAdditionalRecalls-Reordered.csv`);

      const comparer = new RecallComparer(previousRecalls, currentRecalls);
      const modifiedRecalls = comparer.findModifiedAndValidRecalls();

      expect(modifiedRecalls).to.have.lengthOf(0);
    });
  });
  describe('findModifiedModels()', () => {
    it('Returns a set of updated makes for given recall type and model', () => {
      const previousRecalls = convertCsvToRecallDtos(`${__dirname}/data/testData.csv`);
      const currentRecalls = convertCsvToRecallDtos(`${__dirname}/data/testDataWithAdditionalRecalls.csv`);

      const comparer = new RecallComparer(previousRecalls, currentRecalls);
      // previousModels would normally be fetched from the back-end
      const previousModels = comparer.constructor.extractModelsFromRecalls(previousRecalls);
      const currentModels = RecallComparer.extractModelsFromRecalls(currentRecalls);
      const modifiedModels = RecallComparer.findModifiedModels(previousModels, currentModels);

      expect(modifiedModels).to.have.lengthOf(3);
      expect(modifiedModels[0].type_make).to.equal('vehicle-MITSUBISHI');
      expect(modifiedModels[1].type_make).to.equal('vehicle-BMW');
      expect(modifiedModels[2].type_make).to.equal('equipment-OTHER EQUIPMENT');
      expect(modifiedModels[0].models).to.include('LANCER EVO');
      expect(modifiedModels[0].models).to.include('ASX');
      expect(modifiedModels[1].models).to.include('E90');
      expect(modifiedModels[2].models).to.include('Composite X');
    });
  });
  describe('findModifiedMakes()', () => {
    it('Returns a set of updated makes for given recall type and model', () => {
      const previousRecalls = convertCsvToRecallDtos(`${__dirname}/data/testData.csv`);
      const currentRecalls = convertCsvToRecallDtos(`${__dirname}/data/testDataWithAdditionalRecalls.csv`);

      const comparer = new RecallComparer(previousRecalls, currentRecalls);
      // previousMakes would normally be fetched from the back-end
      const previousMakes = comparer.constructor.extractMakesFromRecalls(previousRecalls);
      const currentMakes = RecallComparer.extractMakesFromRecalls(currentRecalls);
      const modifiedMakes = RecallComparer.findModifiedMakes(previousMakes, currentMakes);

      expect(modifiedMakes).to.have.lengthOf(2);
      expect(modifiedMakes[0].type).to.equal('vehicle');
      expect(modifiedMakes[1].type).to.equal('equipment');
      expect(modifiedMakes[0].makes).to.include('BMW');
      expect(modifiedMakes[1].makes).to.include('OTHER EQUIPMENT');
    });
  });
});
