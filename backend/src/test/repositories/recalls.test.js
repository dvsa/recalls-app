const { expect } = require('chai');
const RecallsRepository = require('../../repositories/recalls');

const TABLE_NAME = 'testTableName';
const INDEX_NAME = 'recallsSecondaryIndexName';
const type = 'vehicle';
const make = 'testMake';
const model = 'testModel';
const year = 2016;
const recallsRepository = new RecallsRepository();

describe('RecallsRepository', () => {
  describe('getByMakeAndModel() method', () => {
    before(() => {
      recallsRepository.dbClient = {
        database: { query: (params, callback) => callback(null, params) },
        recallsTable: TABLE_NAME,
        recallsSecondaryIndexName: INDEX_NAME,
      };
    });

    it('Should map make and model to index format properly', (done) => {
      recallsRepository.getByMakeAndModel(type, make, model, (err, data) => {
        expect(data).to.be.an('object');
        expect(data.TableName).to.equal(TABLE_NAME);
        expect(data.IndexName).to.equal(INDEX_NAME);
        expect(data.ExpressionAttributeValues[':typeMakeModel']).to.equal(`${type}-${make}-${model}`);
        done();
      });
    });

    describe('getByMakeModelAndYear() method', () => {
      before(() => {
        recallsRepository.dbClient = {
          database: { query: (params, callback) => callback(null, params) },
          recallsTable: TABLE_NAME,
          recallsSecondaryIndexName: INDEX_NAME,
        };
      });

      it('Should map make, model and year to dynamodb query format properly', (done) => {
        recallsRepository.getByMakeModelAndYear(type, make, model, year, (err, data) => {
          expect(data).to.be.an('object');
          expect(data.TableName).to.equal(TABLE_NAME);
          expect(data.IndexName).to.equal(INDEX_NAME);
          expect(data.ExpressionAttributeValues[':typeMakeModel']).to.equal(`${type}-${make}-${model}`);
          expect(data.ExpressionAttributeValues[':yearStart']).to.equal(`${year}-01-01`);
          expect(data.ExpressionAttributeValues[':yearEnd']).to.equal(`${year}-12-31`);
          done();
        });
      });
    });

    describe('getAllMakes() method', () => {
      before(() => {
        recallsRepository.dbClient = {
          database: { get: (params, callback) => callback(null, params) },
          makesTable: TABLE_NAME,
        };
      });

      it('Should map params properly', (done) => {
        recallsRepository.getAllMakes(type, (err, data) => {
          expect(data).to.be.an('object');
          expect(data.TableName).to.equal(TABLE_NAME);
          expect(data.Key.type).to.equal(type);
          done();
        });
      });
    });

    describe('getAllModels() method', () => {
      before(() => {
        recallsRepository.dbClient = {
          database: { get: (params, callback) => callback(null, params) },
          modelsTable: TABLE_NAME,
        };
      });

      it('Should map params properly', (done) => {
        recallsRepository.getAllModels(type, make, (err, data) => {
          expect(data).to.be.an('object');
          expect(data.TableName).to.equal(TABLE_NAME);
          expect(data.Key.type_make).to.equal(`${type}-${make}`);
          done();
        });
      });
    });
  });
});
