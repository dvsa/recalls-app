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
    it('Returns primary keys of deleted recalls when all recalls have model present', () => {
      /** In a real scenario previousRecalls would be fetched from the API
       * and currentRecalls would come from a recently uploaded CSV file */
      const previousRecalls = convertCsvToRecallDtos(`${__dirname}/data/testData-BeforeDeleting.csv`).correctRecalls;
      const currentRecalls = convertCsvToRecallDtos(`${__dirname}/data/testData-AfterDeleting.csv`).correctRecalls;

      const comparer = new RecallComparer(previousRecalls, currentRecalls);
      const deletedRecalls = comparer.findDeletedRecallsPrimaryKeys([]);

      expect(deletedRecalls).to.have.lengthOf(2);
      expect(deletedRecalls).to.include('OTHER EQUIPMENT-Composite X-RCOMP/2009/009');
      expect(deletedRecalls).to.include('MITSUBISHI-LANCER EVO-R/2014/013');
    });

    it('Returns primary keys of deleted recalls but without keys of recalls that have missing model', () => {
      /** In a real scenario previousRecalls would be fetched from the API
       * and currentRecalls would come from a recently uploaded CSV file */
      const previousRecalls = convertCsvToRecallDtos(`${__dirname}/data/testData-BeforeDeleting.csv`).correctRecalls;
      const currentRecalls = convertCsvToRecallDtos(`${__dirname}/data/testData-AfterDeleting.csv`).correctRecalls;
      const recallsWithMissingModel = convertCsvToRecallDtos(`${__dirname}/data/missingModelCases/testDataWithoutModels.csv`).recallsWithMissingModel;

      const comparer = new RecallComparer(previousRecalls, currentRecalls);
      const deletedRecalls = comparer.findDeletedRecallsPrimaryKeys(recallsWithMissingModel);

      expect(deletedRecalls).to.have.lengthOf(1);
      expect(deletedRecalls).to.include('OTHER EQUIPMENT-Composite X-RCOMP/2009/009');
    });
  });
  describe('findDeletedMakesPrimaryKeys()', () => {
    it('Returns primary keys of deleted makes', () => {
      const previousRecalls = convertCsvToRecallDtos(`${__dirname}/data/testData-BeforeDeleting.csv`).correctRecalls;
      const currentRecalls = convertCsvToRecallDtos(`${__dirname}/data/testData-AfterDeleting.csv`).correctRecalls;

      const comparer = new RecallComparer(previousRecalls, currentRecalls);
      const previousMakes = comparer.constructor.extractMakesFromRecalls(previousRecalls, [], []);
      const currentMakes = RecallComparer.extractMakesFromRecalls(currentRecalls, [], []);

      const deletedMakes = RecallComparer.findDeletedMakesPrimaryKeys(previousMakes, currentMakes,
        []);

      expect(deletedMakes).to.have.lengthOf(1);
      expect(deletedMakes).to.include('equipment');
    });
    it('Returns primary keys of deleted makes without keys that appeared in recallsWithMissingModel array', () => {
      const previousRecalls = convertCsvToRecallDtos(`${__dirname}/data/missingModelCases/testData-Before.csv`).correctRecalls;
      const currentRecallsCollection = convertCsvToRecallDtos(`${__dirname}/data/missingModelCases/testData-After.csv`);
      const currentRecalls = currentRecallsCollection.correctRecalls;
      const recallsWithMissingModel = currentRecallsCollection.recallsWithMissingModel;

      const comparer = new RecallComparer(previousRecalls, currentRecalls);
      const previousMakes = comparer.constructor.extractMakesFromRecalls(previousRecalls, [], []);
      const currentMakes = RecallComparer.extractMakesFromRecalls(currentRecalls, previousRecalls,
        recallsWithMissingModel);

      const deletedMakes = RecallComparer.findDeletedMakesPrimaryKeys(previousMakes, currentMakes,
        recallsWithMissingModel);

      expect(deletedMakes).to.have.lengthOf(0);
    });
  });
  describe('findDeletedModelsPrimaryKeys()', () => {
    it('Returns primary keys of deleted models', () => {
      const previousRecalls = convertCsvToRecallDtos(`${__dirname}/data/testData-BeforeDeleting.csv`).correctRecalls;
      const currentRecalls = convertCsvToRecallDtos(`${__dirname}/data/testData-AfterDeleting.csv`).correctRecalls;

      const comparer = new RecallComparer(previousRecalls, currentRecalls);
      const previousModels = comparer.constructor.extractModelsFromRecalls(previousRecalls, [], []);
      const currentModels = RecallComparer.extractModelsFromRecalls(currentRecalls, [], []);

      const deletedModels = RecallComparer.findDeletedModelsPrimaryKeys(
        previousModels, currentModels, [],
      );

      expect(deletedModels).to.have.lengthOf(1);
      expect(deletedModels).to.include('equipment-OTHER EQUIPMENT');
    });
    it('Returns primary keys of deleted models without keys that appeared in recallsWithMissingModel array', () => {
      const previousRecalls = convertCsvToRecallDtos(`${__dirname}/data/missingModelCases/testData-Before.csv`).correctRecalls;
      const currentRecallsCollection = convertCsvToRecallDtos(`${__dirname}/data/missingModelCases/testData-After.csv`);
      const currentRecalls = currentRecallsCollection.correctRecalls;
      const recallsWithMissingModel = currentRecallsCollection.recallsWithMissingModel;

      const comparer = new RecallComparer(previousRecalls, currentRecalls);
      const previousModels = comparer.constructor.extractModelsFromRecalls(previousRecalls, [], []);
      const currentModels = RecallComparer.extractModelsFromRecalls(currentRecalls, previousRecalls,
        recallsWithMissingModel);

      const deletedModels = RecallComparer.findDeletedModelsPrimaryKeys(
        previousModels, currentModels, recallsWithMissingModel,
      );

      expect(deletedModels).to.have.lengthOf(1);
      expect(deletedModels).to.include('vehicle-A MAKE Y');
    });
  });
  describe('findModifiedAndValidRecalls()', () => {
    it('Returns recalls that were modified or added under new make-model-recallNumber combination', () => {
      /** In a real scenario previousRecalls would be fetched from the API
       * and currentRecalls would come from a recently uploaded CSV file */
      const previousRecalls = convertCsvToRecallDtos(`${__dirname}/data/testData.csv`).correctRecalls;
      const currentRecalls = convertCsvToRecallDtos(`${__dirname}/data/testDataWithAdditionalRecalls.csv`).correctRecalls;

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
      const previousRecalls = convertCsvToRecallDtos(`${__dirname}/data/testDataWithAdditionalRecalls.csv`).correctRecalls;
      const currentRecalls = convertCsvToRecallDtos(`${__dirname}/data/testDataWithAdditionalRecalls-Reordered.csv`).correctRecalls;

      const comparer = new RecallComparer(previousRecalls, currentRecalls);
      const modifiedRecalls = comparer.findModifiedAndValidRecalls();

      expect(modifiedRecalls).to.have.lengthOf(0);
    });
  });
  describe('findModifiedModels()', () => {
    it('Returns a set of updated makes for given recall type and model', () => {
      const previousRecalls = convertCsvToRecallDtos(`${__dirname}/data/testData.csv`).correctRecalls;
      const currentRecalls = convertCsvToRecallDtos(`${__dirname}/data/testDataWithAdditionalRecalls.csv`).correctRecalls;

      const comparer = new RecallComparer(previousRecalls, currentRecalls);
      // previousModels would normally be fetched from the back-end
      const previousModels = comparer.constructor.extractModelsFromRecalls(previousRecalls, [], []);
      const currentModels = RecallComparer.extractModelsFromRecalls(currentRecalls, [], []);
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
      const previousRecalls = convertCsvToRecallDtos(`${__dirname}/data/testData.csv`).correctRecalls;
      const currentRecalls = convertCsvToRecallDtos(`${__dirname}/data/testDataWithAdditionalRecalls.csv`).correctRecalls;

      const comparer = new RecallComparer(previousRecalls, currentRecalls);
      // previousMakes would normally be fetched from the back-end
      const previousMakes = comparer.constructor.extractMakesFromRecalls(previousRecalls, [], []);
      const currentMakes = RecallComparer.extractMakesFromRecalls(currentRecalls, [], []);
      const modifiedMakes = RecallComparer.findModifiedMakes(previousMakes, currentMakes);

      expect(modifiedMakes).to.have.lengthOf(2);
      expect(modifiedMakes[0].type).to.equal('vehicle');
      expect(modifiedMakes[1].type).to.equal('equipment');
      expect(modifiedMakes[0].makes).to.include('BMW');
      expect(modifiedMakes[1].makes).to.include('OTHER EQUIPMENT');
    });
  });
  describe('extractModelsFromRecalls()', () => {
    it('Should extract models from valid recalls and recalls without model that need model fetched from recall\'s previous version', () => {
      const previousRecalls = convertCsvToRecallDtos(`${__dirname}/data/missingModelCases/testData-Before.csv`).correctRecalls;
      const currentRecallsCollection = convertCsvToRecallDtos(`${__dirname}/data/missingModelCases/testData-After.csv`);
      const currentRecalls = currentRecallsCollection.correctRecalls;
      const recallsWithMissingModel = currentRecallsCollection.recallsWithMissingModel;

      const comparer = new RecallComparer(previousRecalls, currentRecalls);
      const extractedModels = comparer.constructor
        .extractModelsFromRecalls(currentRecalls, previousRecalls, recallsWithMissingModel);

      expect(extractedModels).to.have.lengthOf(8);
      expect(extractedModels.get('vehicle-MERCEDES BENZ').models).to.have.lengthOf(1);
      expect(extractedModels.get('vehicle-MITSUBISHI').models).to.have.lengthOf(1);
      expect(extractedModels.get('vehicle-BMW').models).to.have.lengthOf(1);
      expect(extractedModels.get('vehicle-NEW MAKE').models).to.have.lengthOf(2);
      expect(extractedModels.get('vehicle-GRAY & ADAMS').models).to.have.lengthOf(1);
      expect(extractedModels.get('vehicle-A MAKE Z').models).to.have.lengthOf(3);
      expect(extractedModels.get('equipment-OTHER EQUIPMENT').models).to.have.lengthOf(1);
      expect(extractedModels.get('equipment-A MAKE X').models).to.have.lengthOf(3);
    });
  });
  describe('extractMakesFromRecalls()', () => {
    it('Should extract makes from valid recalls and recalls without model which has previous version in the database', () => {
      const previousRecalls = convertCsvToRecallDtos(`${__dirname}/data/missingModelCases/testData-Before.csv`).correctRecalls;
      const currentRecallsCollection = convertCsvToRecallDtos(`${__dirname}/data/missingModelCases/testData-After.csv`);
      const currentRecalls = currentRecallsCollection.correctRecalls;
      const recallsWithMissingModel = currentRecallsCollection.recallsWithMissingModel;

      const comparer = new RecallComparer(previousRecalls, currentRecalls);
      const extractedMakes = comparer.constructor
        .extractMakesFromRecalls(currentRecalls, previousRecalls, recallsWithMissingModel);

      expect(extractedMakes).to.have.lengthOf(2);
      expect(extractedMakes.get('vehicle').makes).to.have.lengthOf(6);
      expect(extractedMakes.get('equipment').makes).to.have.lengthOf(2);
    });
  });
});
