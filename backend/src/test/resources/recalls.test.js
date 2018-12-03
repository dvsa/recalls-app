/* eslint no-unused-vars: 0 */
const sinon = require('sinon');
const { expect } = require('chai');
const should = require('chai').should();
const RecallType = require('cvr-common/model/recallTypeEnum');
const RecallsRepository = require('../../repositories/recalls');
const RecallsResource = require('../../resources/recalls');

const TYPE_VEHICLE = RecallType.vehicle;
const MAKE_LAND_ROVER = 'LAND ROVER';
const FIRST_MODEL = 'DISCOVERY SPORT';
const SECOND_MODEL = 'DEFENDER';
const YEAR = '2017';
const FIRST_RECALL_NUMBER = 'R/2017/153';
const SECOND_RECALL_NUMBER = 'R/2009/091';

const recallItems = {
  Items: [
    {
      model: FIRST_MODEL,
      build_end: '2017-03-07',
      build_start: '2017-03-02',
      launch_date: '2017-05-23',
      recall_number: FIRST_RECALL_NUMBER,
      make: 'LAND ROVER',
      concern: 'LOCKING RING MAY BE INCORRECTLY ASSEMBLED',
      make_model_recall_number: 'LAND ROVER-DISCOVERY SPORT-R/2017/153',
      remedy: 'Recall the vehicles that are likely to be affected and inspect the fuel pump module retaining ring ensuring it is tightened to the correct specification if required.',
      defect: 'The locking ring retaining the fuel delivery module into the fuel tank may not have been correctly assembled onto the fuel tank during the tank assembly process. The driver may smell an increase in fuel odour and in some circumstances with the vehicle static there could be liquid fuel underneath the rear of the vehicle which in the presence of an ignition source could lead to a fire. It is also possible for fuel to leak onto the road surface which in the case of diesel fuel can present a skid hazard to other road users increasing the risk of a crash.',
      vehicle_number: '479',
      vin_start: 'SALCA2BN8HH690357',
      vin_end: 'SALCA2AN6HH691251',
      type: TYPE_VEHICLE,
    },
    {
      model: SECOND_MODEL,
      build_end: '2008-02-13',
      build_start: '2007-06-07',
      launch_date: '2009-12-04',
      recall_number: SECOND_RECALL_NUMBER,
      make: 'LAND ROVER',
      concern: 'PARKING BRAKE MAY BECOME INEFFECTIVE',
      make_model_recall_number: 'LAND ROVER-DEFENDER-R/2009/091',
      remedy: 'Recall the vehicles that are likely to be affected to inspect and where necessary fit a new oil seal degrease the back plate and drum and replace the brake linings.',
      defect: 'Parking brake efficiency can be impaired as a result of an incorrectly assembled oil seal at the transfer box output shaft allowing oil to contaminate the brake linings.',
      vehicle_number: '5003',
      vin_start: 'SALLDHMS87A740136',
      vin_end: 'SALLDVBS88A757662',
      type: TYPE_VEHICLE,
    },
  ],
};

function getByMakeModelAndYear(type, make, model, year, callback) {
  callback(null, recallItems);
}

function getByMakeModelAndYearWithError(type, make, model, year, callback) {
  callback(new Error('Error'), null);
}

describe('RecallsResource', () => {
  describe('getByMakeModelAndYear() method', () => {
    it('Should return data from database mapped to list of Recall objects', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'getByMakeModelAndYear').callsFake(getByMakeModelAndYear);

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
      sinon.stub(recallsRepository, 'getByMakeModelAndYear').callsFake(getByMakeModelAndYearWithError);

      const recallsResource = new RecallsResource(recallsRepository);
      recallsResource.getByMakeModelAndYear(
        TYPE_VEHICLE, MAKE_LAND_ROVER, FIRST_MODEL, YEAR, (err, data) => {
          expect(data).to.be.an('undefined');
          expect(err.message).to.equal('Error');
          expect(getByMakeModelAndYearWithError).to.throw(Error);
          done();
        },
      );
    });
  });

  describe('mapToRecallList() method', () => {
    it('Should map to recall list', (done) => {
      const mappedRecalls = RecallsResource.mapToRecallList(recallItems.Items);

      expect(mappedRecalls).to.be.an('array');
      expect(mappedRecalls).to.have.lengthOf(2);

      mappedRecalls[0].should.have.deep.property('model', FIRST_MODEL);
      mappedRecalls[0].should.have.deep.property('recallNumber', FIRST_RECALL_NUMBER);

      mappedRecalls[1].should.have.deep.property('model', SECOND_MODEL);
      mappedRecalls[1].should.have.deep.property('recallNumber', SECOND_RECALL_NUMBER);
      done();
    });
  });
});
