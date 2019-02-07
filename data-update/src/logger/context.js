const storageKeys = require('cvr-common/src/constants/sessionStorageKeys');
const crypto = require('crypto');
const envVariables = require('../config/environmentVariables');

const requestIdKey = crypto.randomBytes(20).toString('hex');

class LoggerContext {
  static getContext() {
    return {
      get: (key) => {
        if (key === storageKeys.REQUEST_ID_KEY) {
          return requestIdKey;
        }
        if (key === storageKeys.CALLER_NAME) {
          return envVariables.lambdaName;
        }
        return null;
      },
    };
  }
}

module.exports = LoggerContext;
