const sinon = require('sinon');
const { expect } = require('chai');
const RecallType = require('cvr-common/src/model/recallTypeEnum');
const RecallsRepository = require('../../repositories/recalls');
const MakesResource = require('../../resources/makes');

const TYPE = RecallType.vehicle;
const DELETE_ERROR = 'Error while deleting makes';

function getAllMakesByType(type, callback) {
  callback(null, {
    Item: { makes: ['HONDA', 'TOYOTA', 'KIA'] },
  });
}

function getAllMakes(callback) {
  callback(null, {
    Items: [
      { type: 'equipment', makes: ['ASEC', 'BELRON'] },
      { type: 'vehicle', makes: ['HONDA', 'TOYOTA', 'KIA'] },
    ],
  });
}

function getEmptyResponse(makes, callback) {
  callback(null, null);
}

function updateMakesWithError(makes, callback) {
  callback(new Error('Error'), null);
}

function deleteMakesWithError(makes, callback) {
  callback(new Error(DELETE_ERROR), null);
}

function getAllMakesByTypeWithError(type, callback) {
  callback(new Error('Error'), null);
}

describe('MakesResource', () => {
  describe('getAllMakesByType() method', () => {
    it('Should return list of makes', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'getAllMakesByType').callsFake(getAllMakesByType);

      const makesResource = new MakesResource(recallsRepository);
      makesResource.getAllMakesByType(TYPE, (err, data) => {
        expect(data).to.be.an('array');
        expect(data).to.have.lengthOf(3);
        expect(data[0]).to.equal('HONDA');
        expect(data[1]).to.equal('TOYOTA');
        done();
      });
    });

    it('Should return error when RecallsRepository returns an error', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'getAllMakesByType').callsFake(getAllMakesByTypeWithError);

      const makesResource = new MakesResource(recallsRepository);
      makesResource.getAllMakesByType(TYPE, (err, data) => {
        expect(data).to.be.an('undefined');
        expect(err.message).to.equal('Error');
        expect(getAllMakesByTypeWithError).to.throw(Error);
        done();
      });
    });
  });

  describe('getAllMakes() method', () => {
    it('Should return data from database mapped to list of Makes objects', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'getAllMakes').callsFake(getAllMakes);

      const makesResource = new MakesResource(recallsRepository);
      makesResource.getAllMakes((err, data) => {
        expect(data).to.be.an('array');
        expect(data).to.have.lengthOf(2);

        expect(data[0].makes).to.nested.include('ASEC');
        expect(data[0].makes).to.not.nested.include('TOYOTA');
        expect(data[1].makes).to.nested.include('TOYOTA');
        done();
      });
    });
  });

  describe('updateMakes() method', () => {
    it('Should return error when RecallsRepository returns an error', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'updateMakes').callsFake(updateMakesWithError);

      const makesResource = new MakesResource(recallsRepository);
      makesResource.updateMakes([{}], (err, data) => {
        expect(data).to.be.an('undefined');
        expect(err.message).to.equal('Error');
        expect(updateMakesWithError).to.throw(Error);
        done();
      });
    });

    it('Should return an empty response when makes will be updated', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'updateMakes').callsFake(getEmptyResponse);

      const makesResource = new MakesResource(recallsRepository);
      makesResource.updateMakes([{}], (err, data) => {
        expect(data).to.be.an('undefined');
        expect(err).to.be.an('null');
        done();
      });
    });
  });

  describe('deleteMakes() method', () => {
    it('Should return error when RecallsRepository returns an error', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'deleteMakes').callsFake(deleteMakesWithError);

      const makesResource = new MakesResource(recallsRepository);
      makesResource.deleteMakes(['R/2000/01'], (err, data) => {
        expect(data).to.be.an('undefined');
        expect(err.message).to.equal(DELETE_ERROR);
        expect(deleteMakesWithError).to.throw(Error);
        done();
      });
    });

    it('Should return an empty response when makes will be deleted', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'deleteMakes').callsFake(getEmptyResponse);

      const makesResource = new MakesResource(recallsRepository);
      makesResource.deleteMakes([{}], (err, data) => {
        expect(data).to.be.an('undefined');
        expect(err).to.be.an('null');
        done();
      });
    });
  });
});
