const sinon = require('sinon');
const expect = require('chai').expect;
const RecallsRepository = require('../../repositories/recalls');
const MakesResource = require('../../resources/makes');

const TYPE = 'vehicle';

function getAllMakes(type, callback) {
  callback(null, {
    Item: { makes: ['HONDA', 'TOYOTA', 'KIA'] },
  });
}

function getAllMakesWithError(type, callback) {
  callback(new Error('Error'), null);
}

describe('MakesResource', () => {
  describe('getAllMakes() method', () => {
    it('Should return list of makes', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'getAllMakes').callsFake(getAllMakes);

      const makesResource = new MakesResource(recallsRepository);
      makesResource.getAllMakes(TYPE, (err, data) => {
        expect(data).to.be.an('array');
        expect(data).to.have.lengthOf(3);
        expect(data[0]).to.equal('HONDA');
        expect(data[1]).to.equal('TOYOTA');
        done();
      });
    });

    it('Should return error when RecallsRepository returns an error', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'getAllMakes').callsFake(getAllMakesWithError);

      const makesResource = new MakesResource(recallsRepository);
      makesResource.getAllMakes(TYPE, (err, data) => {
        expect(data).to.be.an('undefined');
        expect(err.message).to.equal('Error');
        expect(getAllMakesWithError).to.throw(Error);
        done();
      });
    });
  });
});
