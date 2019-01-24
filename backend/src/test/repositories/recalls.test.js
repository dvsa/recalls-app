const { expect } = require('chai');
const RecallsRepository = require('../../repositories/recalls');

const TABLE_NAME = 'testTableName';
const INDEX_NAME = 'recallsSecondaryIndexName';
const type = 'vehicle';
const make = 'testMake';
const model = 'testModel';
const models = [{ type_make: type, models: [model] }];
const recalls = [{ make_model_recall_number: 'testMakeModelRecallNumber' }];
const exclusiveStartKey = 1;
const recallPrimaryKey = 'vehicle-BMW-E90-R/1234/12';
const makePrimaryKey = 'vehicle';
const modelPrimaryKey = 'vehicle-BMW';
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

    it('Should map recalls properly without exclusiveStartKey', (done) => {
      recallsRepository.getAllRecalls(null, (err, data) => {
        expect(data).to.be.an('object');
        expect(data.TableName).to.equal(TABLE_NAME);
        expect(data.ExclusiveStartKey).to.equal(undefined);
        done();
      });
    });

    it('Should map recalls properly with exclusiveStartKey', (done) => {
      recallsRepository.getAllRecalls(exclusiveStartKey, (err, data) => {
        expect(data).to.be.an('object');
        expect(data.TableName).to.equal(TABLE_NAME);
        expect(data.ExclusiveStartKey).to.equal(exclusiveStartKey);
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

    it('Should map recalls properly without exclusiveStartKey', (done) => {
      recallsRepository.getAllMakes(null, (err, data) => {
        expect(data).to.be.an('object');
        expect(data.TableName).to.equal(TABLE_NAME);
        expect(data.ExclusiveStartKey).to.equal(undefined);
        done();
      });
    });

    it('Should map recalls properly with exclusiveStartKey', (done) => {
      recallsRepository.getAllMakes(exclusiveStartKey, (err, data) => {
        expect(data).to.be.an('object');
        expect(data.TableName).to.equal(TABLE_NAME);
        expect(data.ExclusiveStartKey).to.equal(exclusiveStartKey);
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

    it('Should map recalls properly without exclusiveStartKey', (done) => {
      recallsRepository.getAllModels(null, (err, data) => {
        expect(data).to.be.an('object');
        expect(data.TableName).to.equal(TABLE_NAME);
        expect(data.ExclusiveStartKey).to.equal(undefined);
        done();
      });
    });

    it('Should map recalls properly without exclusiveStartKey', (done) => {
      recallsRepository.getAllModels(exclusiveStartKey, (err, data) => {
        expect(data).to.be.an('object');
        expect(data.TableName).to.equal(TABLE_NAME);
        expect(data.ExclusiveStartKey).to.equal(exclusiveStartKey);
        done();
      });
    });
  });

  describe('deleteMakes() method', () => {
    before(() => {
      recallsRepository.dbClient = {
        database: { delete: (params, callback) => callback(null, params) },
        makesTable: TABLE_NAME,
      };
    });
    it('Should pass primary keys properly', (done) => {
      recallsRepository.deleteMakes([makePrimaryKey], (err, data) => {
        expect(data.Key.type).to.equal(makePrimaryKey);
        expect(data.TableName).to.equal(TABLE_NAME);
        done();
      });
    });
  });

  describe('deleteModels() method', () => {
    before(() => {
      recallsRepository.dbClient = {
        database: { delete: (params, callback) => callback(null) },
        modelsTable: TABLE_NAME,
      };
    });
    it('Should pass primary keys properly', (done) => {
      recallsRepository.deleteModels([modelPrimaryKey], (err) => {
        expect(err).to.equal(null);
        // TODO: finish
        done();
      });
    });
    it('Should report errors properly', (done) => {
      recallsRepository.dbClient = {
        database: { delete: (params, callback) => callback(new Error()) },
        modelsTable: TABLE_NAME,
      };
      recallsRepository.deleteModels([modelPrimaryKey], (err) => {
        expect(err).to.be.an('Error');
        // TODO: finish
        done();
      });
    });
  });

  describe('deleteRecalls() method', () => {
    before(() => {
      recallsRepository.dbClient = {
        database: { delete: (params, callback) => callback(null) },
        modelsTable: TABLE_NAME,
      };
    });
    it('Should pass primary keys properly', (done) => {
      recallsRepository.deleteRecalls([recallPrimaryKey], (err) => {
        expect(err).to.equal(null);
        // TODO: finish
        done();
      });
    });
    it('Should report errors properly', (done) => {
      recallsRepository.dbClient = {
        database: { delete: (params, callback) => callback(new Error()) },
        modelsTable: TABLE_NAME,
      };
      recallsRepository.deleteRecalls([recallPrimaryKey], (err) => {
        expect(err).to.be.an('Error');
        // TODO: finish
        done();
      });
    });
  });

  describe('deleteMakes() method', () => {
    it('Should pass primary keys properly', (done) => {
      recallsRepository.dbClient = {
        database: { delete: (params, callback) => callback(null) },
        modelsTable: TABLE_NAME,
      };

      recallsRepository.deleteMakes([makePrimaryKey], (err) => {
        expect(err).to.equal(null);
        // TODO: finish
        done();
      });
    });
    it('Should report errors properly', (done) => {
      recallsRepository.dbClient = {
        database: { delete: (params, callback) => callback(new Error()) },
        modelsTable: TABLE_NAME,
      };
      recallsRepository.deleteMakes([makePrimaryKey], (err) => {
        expect(err).to.be.an('Error');
        // TODO: finish
        done();
      });
    });
  });

  describe('updateMakes() method', () => {
    it('Should map params properly', (done) => {
      recallsRepository.dbClient = {
        database: { update: (params, callback) => callback(null, params) },
        makesTable: TABLE_NAME,
      };
      recallsRepository.updateMakes([make], (err, data) => {
        expect(data).to.be.an('object');
        expect(data.TableName).to.equal(TABLE_NAME);
        done();
      });
    });
    it('Should report errors properly', (done) => {
      recallsRepository.dbClient = {
        database: { update: (params, callback) => callback(new Error()) },
        modelsTable: TABLE_NAME,
      };
      recallsRepository.updateMakes([makePrimaryKey], (err) => {
        expect(err).to.be.an('Error');
        // TODO: finish
        done();
      });
    });
  });
  describe('updateModels() method', () => {
    it('Should map params properly', (done) => {
      recallsRepository.dbClient = {
        database: { update: (params, callback) => callback(null, params) },
        makesTable: TABLE_NAME,
      };
      recallsRepository.updateModels([make], (err) => {
        expect(err).to.be.equal(null);
        done();
      });
    });
    it('Should report errors properly', (done) => {
      recallsRepository.dbClient = {
        database: { update: (params, callback) => callback(new Error()) },
        modelsTable: TABLE_NAME,
      };
      recallsRepository.updateModels([modelPrimaryKey], (err) => {
        expect(err).to.be.an('Error');
        // TODO: finish
        done();
      });
    });
  });
  describe('updateModels() method', () => {
    before(() => {
      recallsRepository.dbClient = {
        database: { update: (params, callback) => callback(new Error('error'), params) },
        modelsTable: TABLE_NAME,
      };
    });

    it('Should map params properly', (done) => {
      recallsRepository.updateModels(models, (err, data) => {
        expect(err.message).to.equal('error');
        expect(data).to.be.an('object');
        expect(data.TableName).to.equal(TABLE_NAME);
        expect(data.Key.type_make).to.equal(type);
        done();
      });
    });
  });
  describe('updateRecalls() method', () => {
    before(() => {
      recallsRepository.dbClient = {
        database: { update: (params, callback) => callback(new Error('error'), params) },
        recallsTable: TABLE_NAME,
      };
    });

    it('Should map params properly', (done) => {
      recallsRepository.updateRecalls(recalls, (err, data) => {
        expect(err.message).to.equal('error');
        expect(data).to.be.an('object');
        expect(data.TableName).to.equal(TABLE_NAME);
        expect(data.Key.make_model_recall_number).to.equal('testMakeModelRecallNumber');
        done();
      });
    });
  });
});
