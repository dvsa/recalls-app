/* eslint no-unused-vars: 0 */
const sinon = require('sinon');
const { expect } = require('chai');
const should = require('chai').should();
const RecallType = require('cvr-common/src/model/recallTypeEnum');
const RecallDbRecordDto = require('cvr-common/src/dto/recallDbRecord');
const RecallsRepository = require('../../repositories/recalls');
const RecallsResource = require('../../resources/recalls');

const TYPE_VEHICLE = RecallType.vehicle;
const MAKE_LAND_ROVER = 'LAND ROVER';
const FIRST_MODEL = 'DISCOVERY SPORT';
const SECOND_MODEL = 'DEFENDER';
const YEAR = '2017';
const FIRST_RECALL_NUMBER = 'R/2017/153';
const SECOND_RECALL_NUMBER = 'R/2009/091';
const FIRST_MAKE_MODEL_RECALL_NUMBER = 'LAND ROVER-DISCOVERY SPORT-R/2017/153';
const SECOND_MAKE_MODEL_RECALL_NUMBER = 'LAND ROVER-DEFENDER-R/2009/091';
const DUMMY_RECALL = new RecallDbRecordDto(null, 'R/1234/01');

const recallItems = {
  Items: [
    {
      model: FIRST_MODEL,
      build_range: [{ start: '2016-12-31', end: '2018-01-01' }, { end: 'INVALID END DATE' }],
      launch_date: '2017-05-23',
      recall_number: FIRST_RECALL_NUMBER,
      make: 'LAND ROVER',
      concern: 'LOCKING RING MAY BE INCORRECTLY ASSEMBLED',
      make_model_recall_number: FIRST_MAKE_MODEL_RECALL_NUMBER,
      remedy: 'Recall the vehicles that are likely to be affected and inspect the fuel pump module retaining ring ensuring it is tightened to the correct specification if required.',
      defect: 'The locking ring retaining the fuel delivery module into the fuel tank may not have been correctly assembled onto the fuel tank during the tank assembly process. The driver may smell an increase in fuel odour and in some circumstances with the vehicle static there could be liquid fuel underneath the rear of the vehicle which in the presence of an ignition source could lead to a fire. It is also possible for fuel to leak onto the road surface which in the case of diesel fuel can present a skid hazard to other road users increasing the risk of a crash.',
      vehicle_number: '479',
      vin_range: [{ start: 'SALCA2BN8HH690357', end: 'SALCA2AN6HH691251' }, { start: 'ZALCA2BN8HH690357', end: 'ZALCA2AN6HH691251' }],
      type: TYPE_VEHICLE,
    },
    {
      model: SECOND_MODEL,
      build_range: [{ start: 'INVALID START DATE' }, { start: '2017-11-11', end: '2017-11-12' }],
      launch_date: '2009-12-04',
      recall_number: SECOND_RECALL_NUMBER,
      make: 'LAND ROVER',
      concern: 'PARKING BRAKE MAY BECOME INEFFECTIVE',
      make_model_recall_number: SECOND_MAKE_MODEL_RECALL_NUMBER,
      remedy: 'Recall the vehicles that are likely to be affected to inspect and where necessary fit a new oil seal degrease the back plate and drum and replace the brake linings.',
      defect: 'Parking brake efficiency can be impaired as a result of an incorrectly assembled oil seal at the transfer box output shaft allowing oil to contaminate the brake linings.',
      vehicle_number: '5003',
      vin_range: [{ start: 'SALCA2BN8HH690311', end: 'SALCA2AN6HH691222' }, { start: 'ZALCA2BN8HH690333', end: 'ZALCA2AN6HH691244' }],
      type: TYPE_VEHICLE,
    },
    {
      model: 'Model without build_range and vin_range',
      launch_date: '2009-12-04',
      recall_number: 'R/2011/01',
      make: 'LAND ROVER',
      concern: 'PARKING BRAKE MAY BECOME INEFFECTIVE',
      make_model_recall_number: 'LAND ROVER-DEFENDER-R/2009/092',
      remedy: 'Remedy 3',
      defect: 'Defect 3',
      vehicle_number: '5003',
      type: TYPE_VEHICLE,
    },
  ],
};

function getAllRecalls(callback) {
  callback(null, recallItems);
}

function getByMakeAndModel(type, make, model, callback) {
  callback(null, recallItems);
}

function getByMakeAndModelWithError(type, make, model, callback) {
  callback(new Error('Error'), null);
}

function getEmptyResponse(recalls, callback) {
  callback(null, null);
}

function updateRecallsWithError(recalls, callback) {
  callback(new Error('Error'), null);
}

describe('RecallsResource', () => {
  describe('getByMakeModelAndYear() method', () => {
    it('Should return data from database mapped to list of Recall objects', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'getByMakeAndModel').callsFake(getByMakeAndModel);

      const recallsResource = new RecallsResource(recallsRepository);
      recallsResource.getByMakeModelAndYear(
        TYPE_VEHICLE, MAKE_LAND_ROVER, FIRST_MODEL, YEAR, (err, data) => {
          expect(data).to.be.an('array');
          expect(data).to.have.lengthOf(2);
          expect(data[0].recallNumber).to.equal(FIRST_RECALL_NUMBER);
          expect(data[1].recallNumber).to.equal(SECOND_RECALL_NUMBER);
          done();
        },
      );
    });

    it('Should return error when RecallsRepository returns an error', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'getByMakeAndModel').callsFake(getByMakeAndModelWithError);

      const recallsResource = new RecallsResource(recallsRepository);
      recallsResource.getByMakeModelAndYear(
        TYPE_VEHICLE, MAKE_LAND_ROVER, FIRST_MODEL, YEAR, (err, data) => {
          expect(data).to.be.an('undefined');
          expect(err.message).to.equal('Error');
          expect(getByMakeAndModelWithError).to.throw(Error);
          done();
        },
      );
    });
  });

  describe('mapToRecallList() method', () => {
    it('Should map to recall list', (done) => {
      const mappedRecalls = RecallsResource.mapToRecallList(recallItems.Items);

      expect(mappedRecalls).to.be.an('array');
      expect(mappedRecalls).to.have.lengthOf(3);

      mappedRecalls[0].should.have.deep.property('model', FIRST_MODEL);
      mappedRecalls[0].should.have.deep.property('recallNumber', FIRST_RECALL_NUMBER);

      mappedRecalls[1].should.have.deep.property('model', SECOND_MODEL);
      mappedRecalls[1].should.have.deep.property('recallNumber', SECOND_RECALL_NUMBER);
      done();
    });
  });

  describe('mapToRecallListToDbRecordDto() method', () => {
    it('Should map to recall list to RecallDbRecordDto', (done) => {
      const mappedRecalls = RecallsResource.mapRecallToListDbRecordDto(recallItems.Items);

      expect(mappedRecalls).to.be.an('array');
      expect(mappedRecalls).to.have.lengthOf(3);

      mappedRecalls[0].should.have.deep.property('model', FIRST_MODEL);
      mappedRecalls[0].should.have.deep.property('recall_number', FIRST_RECALL_NUMBER);

      mappedRecalls[1].should.have.deep.property('model', SECOND_MODEL);
      mappedRecalls[1].should.have.deep.property('recall_number', SECOND_RECALL_NUMBER);
      done();
    });
  });

  describe('getAllRecalls() method', () => {
    it('Should return data from database mapped to list of Recall objects', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'getAllRecalls').callsFake(getAllRecalls);

      const recallsResource = new RecallsResource(recallsRepository);
      recallsResource.getAllRecalls((err, data) => {
        expect(data).to.be.an('array');
        expect(data).to.have.lengthOf(3);

        expect(data[0].recall_number).to.equal(FIRST_RECALL_NUMBER);
        expect(data[1].recall_number).to.equal(SECOND_RECALL_NUMBER);
        done();
      });
    });
  });

  describe('updateRecalls() method', () => {
    it('Should return error when RecallsRepository returns an error', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'updateRecalls').callsFake(updateRecallsWithError);

      const recallsResource = new RecallsResource(recallsRepository);
      recallsResource.updateRecalls([DUMMY_RECALL], (err, data) => {
        expect(data).to.be.an('undefined');
        expect(err.message).to.equal('Error');
        expect(updateRecallsWithError).to.throw(Error);
        done();
      });
    });

    it('Should return an empty response when recalls will be updated', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'updateRecalls').callsFake(getEmptyResponse);

      const recallsResource = new RecallsResource(recallsRepository);
      recallsResource.updateRecalls([DUMMY_RECALL], (err, data) => {
        expect(data).to.be.an('undefined');
        expect(err).to.be.an('null');
        done();
      });
    });
  });

  describe('getAllRecalls() method', () => {
    it('Should return data from database mapped to list of Recall objects', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'getAllRecalls').callsFake(getAllRecalls);

      const recallsResource = new RecallsResource(recallsRepository);
      recallsResource.getAllRecalls((err, data) => {
        expect(data).to.be.an('array');
        expect(data).to.have.lengthOf(3);

        expect(data[0].recall_number).to.equal(FIRST_RECALL_NUMBER);
        expect(data[1].recall_number).to.equal(SECOND_RECALL_NUMBER);
        done();
      });
    });
  });

  describe('isYearWithinDateRange() method', () => {
    it('Should return false when startDate is not an number', (done) => {
      expect(RecallsResource.isYearWithinDateRange('text', new Date('2018-01-02'), 2018)).to.equal(false);
      done();
    });

    it('Should return false when endDate is not an number', (done) => {
      expect(RecallsResource.isYearWithinDateRange(new Date('2018-01-02'), 'text', 2018)).to.equal(false);
      done();
    });

    it('Should return false when startDate is after year', (done) => {
      expect(RecallsResource.isYearWithinDateRange(new Date('2018-01-01'), new Date('2018-01-02'), 2017)).to.equal(false);
      done();
    });

    it('Should return false when endDate is before year', (done) => {
      expect(RecallsResource.isYearWithinDateRange(new Date('2016-01-01'), new Date('2016-01-02'), 2017)).to.equal(false);
      done();
    });

    it('Should return true when startDate and endDate are in the same year as year', (done) => {
      expect(RecallsResource.isYearWithinDateRange(new Date('2017-01-01'), new Date('2017-01-02'), 2017)).to.equal(true);
      done();
    });

    it('Should return true when startDate is before and endDate is after year', (done) => {
      expect(RecallsResource.isYearWithinDateRange(new Date('2016-01-01'), new Date('2018-01-02'), 2017)).to.equal(true);
      done();
    });
  });
});
