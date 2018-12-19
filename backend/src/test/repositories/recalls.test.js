const { expect } = require('chai');
const RecallsRepository = require('../../repositories/recalls');

const TABLE_NAME = 'testTableName';
const INDEX_NAME = 'recallsSecondaryIndexName';
const type = 'vehicle';
const make = 'testMake';
const model = 'testModel';
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
  });

  describe('getAllMakesByType() method', () => {
    before(() => {
      recallsRepository.dbClient = {
        database: { get: (params, callback) => callback(null, params) },
        makesTable: TABLE_NAME,
      };
    });

    it('Should map params properly', (done) => {
      recallsRepository.getAllMakesByType(type, (err, data) => {
        expect(data).to.be.an('object');
        expect(data.TableName).to.equal(TABLE_NAME);
        expect(data.Key.type).to.equal(type);
        done();
      });
    });
  });

  describe('getAllModelsByTypeAndMake() method', () => {
    before(() => {
      recallsRepository.dbClient = {
        database: { get: (params, callback) => callback(null, params) },
        modelsTable: TABLE_NAME,
      };
    });

    it('Should map params properly', (done) => {
      recallsRepository.getAllModelsByTypeAndMake(type, make, (err, data) => {
        expect(data).to.be.an('object');
        expect(data.TableName).to.equal(TABLE_NAME);
        expect(data.Key.type_make).to.equal(`${type}-${make}`);
        done();
      });
    });
  });

  describe('getAllRecalls() method', () => {
    before(() => {
      recallsRepository.dbClient = {
        database: { scan: (params, callback) => callback(null, params) },
        recallsTable: TABLE_NAME,
      };
    });

    it('Should map recalls properly', (done) => {
      recallsRepository.getAllRecalls((err, data) => {
        expect(data).to.be.an('object');
        expect(data.TableName).to.equal(TABLE_NAME);
        done();
      });
    });
  });

  describe('getAllMakes() method', () => {
    before(() => {
      recallsRepository.dbClient = {
        database: { scan: (params, callback) => callback(null, params) },
        makesTable: TABLE_NAME,
      };
    });

    it('Should map recalls properly', (done) => {
      recallsRepository.getAllMakes((err, data) => {
        expect(data).to.be.an('object');
        expect(data.TableName).to.equal(TABLE_NAME);
        done();
      });
    });
  });

  describe('getAllModels() method', () => {
    before(() => {
      recallsRepository.dbClient = {
        database: { scan: (params, callback) => callback(null, params) },
        modelsTable: TABLE_NAME,
      };
    });

    it('Should map recalls properly', (done) => {
      recallsRepository.getAllModels((err, data) => {
        expect(data).to.be.an('object');
        expect(data.TableName).to.equal(TABLE_NAME);
        done();
      });
    });
  });

  describe('updateMakes() method', () => {
    before(() => {
      recallsRepository.dbClient = {
        database: { update: (params, callback) => callback(null, params) },
        makesTable: TABLE_NAME,
      };
    });

    it('Should map params properly', (done) => {
      recallsRepository.updateMakes([make], (err, data) => {
        expect(data).to.be.an('object');
        expect(data.TableName).to.equal(TABLE_NAME);
        done();
      });
    });
  });
});
