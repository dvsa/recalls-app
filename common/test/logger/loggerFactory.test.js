const sinon = require('sinon');
const { expect } = require('chai');
const sessionStorageKeys = require('../../src/constants/sessionStorageKeys');
const loggerFactory = require('../../src/logger/loggerFactory');

const TIMESTAMP = '1545134667';
const REQUEST_PATH = 'req path key';
const REQUEST_ID = 'req id key';
const QUERY_PARAMS = 'query params key';
const API_GATEWAY_REQUEST_ID = 'api gateway id key';
const CALLER_NAME = 'caller name';
const APP_NAME = 'my super cool app';
const LOG_LEVEL = 'info';
const FUNCTION_NAME = 'my great function';

const entryLogObject = {
  pid: '123456',
  hostname: 'hostname',
  time: TIMESTAMP,
  v: 'what is it?',
};

const loggerConfig = {
  appName: APP_NAME,
  logLevel: LOG_LEVEL,
  functionName: FUNCTION_NAME,
};

const loggerContext = {
  get: (key) => {
    if (key === sessionStorageKeys.REQUEST_PATH_KEY) {
      return REQUEST_PATH;
    }
    if (key === sessionStorageKeys.REQUEST_ID_KEY) {
      return REQUEST_ID;
    }
    if (key === sessionStorageKeys.QUERY_PARAMS_KEY) {
      return QUERY_PARAMS;
    }
    if (key === sessionStorageKeys.API_GATEWAY_REQUEST_ID_KEY) {
      return API_GATEWAY_REQUEST_ID;
    }
    if (key === sessionStorageKeys.CALLER_NAME) {
      return CALLER_NAME;
    }
    return null;
  },
};

const app = {
  use: () => {
  },
};

let writeSpy;

function expectBasicLogParamsToBeSet(log) {
  expect(log.name).to.equal(APP_NAME);
  expect(log.level).to.equal(LOG_LEVEL);
}

function expectDeletedLogParamsToBeUndefined(log) {
  expect(log.pid).to.be.an('undefined');
  expect(log.hostname).to.be.an('undefined');
  expect(log.time).to.be.an('undefined');
  expect(log.v).to.be.an('undefined');
  expect(log.msg).to.be.an('undefined');
}

function expectLogParamsFromLoggerContextToBeSet(log) {
  expect(log.requestPath).to.equal(REQUEST_PATH);
  expect(log.requestId).to.equal(REQUEST_ID);
  expect(log.queryParameters).to.equal(QUERY_PARAMS);
  expect(log.apigwRequestId).to.equal(API_GATEWAY_REQUEST_ID);
  expect(log.callerName).to.equal(CALLER_NAME);
}

function expectLogParamsFromLoggerContextToBeUndefined(log) {
  expect(log.requestPath).to.be.an('undefined');
  expect(log.requestId).to.be.an('undefined');
  expect(log.queryParameters).to.be.an('undefined');
  expect(log.apigwRequestId).to.be.an('undefined');
  expect(log.callerName).to.be.an('undefined');
}

describe('Logger factory', () => {
  describe('stdoutReformat should format entry object correctly', () => {
    beforeEach(() => {
      writeSpy = sinon.spy(process.stdout, 'write');
    });
    afterEach(() => {
      writeSpy.restore();
    });

    describe('when log object is passed as an argument to be logged', () => {
      it('when loggerContext and loggerConfig are present', (done) => {
        loggerFactory.initialize(app, loggerContext, loggerConfig);
        const { logger } = loggerFactory;

        logger.info(entryLogObject);

        const log = JSON.parse(writeSpy.getCalls()[0].args[0]);
        expectBasicLogParamsToBeSet(log);
        expectDeletedLogParamsToBeUndefined(log);
        expectLogParamsFromLoggerContextToBeSet(log);
        expect(log.message).to.equal('');
        expect(log.timestamp).to.equal(TIMESTAMP);
        expect(log.functionName).to.equal(FUNCTION_NAME);
        done();
      });

      it('when loggerConfig object is empty', (done) => {
        process.env.APP_NAME = APP_NAME;
        process.env.LOG_LEVEL = LOG_LEVEL;

        loggerFactory.initialize(app, loggerContext, null);
        const { logger } = loggerFactory;

        logger.info(entryLogObject);

        const log = JSON.parse(writeSpy.getCalls()[0].args[0]);
        expectBasicLogParamsToBeSet(log);
        expectDeletedLogParamsToBeUndefined(log);
        expectLogParamsFromLoggerContextToBeSet(log);
        expect(log.message).to.equal('');
        expect(log.timestamp).to.equal(TIMESTAMP);
        expect(log.functionName).to.be.an('undefined');
        done();
      });

      it('when loggerContext object is empty', (done) => {
        loggerFactory.initialize(app, null, loggerConfig);
        const { logger } = loggerFactory;

        logger.info(entryLogObject);

        const log = JSON.parse(writeSpy.getCalls()[0].args[0]);
        expectBasicLogParamsToBeSet(log);
        expectDeletedLogParamsToBeUndefined(log);
        expectLogParamsFromLoggerContextToBeUndefined(log);
        expect(log.message).to.equal('');
        expect(log.timestamp).to.equal(TIMESTAMP);
        expect(log.functionName).to.equal(FUNCTION_NAME);
        done();
      });
    });

    it('when only message is passed', (done) => {
      const LOG_MESSAGE = 'hello, how are you?';

      loggerFactory.initialize(app, null, loggerConfig);
      const { logger } = loggerFactory;

      logger.info(LOG_MESSAGE);

      const log = JSON.parse(writeSpy.getCalls()[0].args[0]);
      expectBasicLogParamsToBeSet(log);
      expectDeletedLogParamsToBeUndefined(log);
      expectLogParamsFromLoggerContextToBeUndefined(log);
      expect(log.message).to.equal(LOG_MESSAGE);
      expect(log.timestamp).to.not.equal(TIMESTAMP);
      expect(log.functionName).to.equal(FUNCTION_NAME);
      done();
    });
  });
});
