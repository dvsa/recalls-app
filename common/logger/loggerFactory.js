const bunyan = require('bunyan');
const safeJsonStringify = require('safe-json-stringify');
const requestHeaders = require('../constants/requestHeaders');
const sessionStorageKeys = require('../constants/sessionStorageKeys');

let logConfig;
let logContext;

/**
 * Function customizing the log format based on logContext
 */
function stdoutReformat() {
  return {
    write: (entry) => {
      const log = entry;

      log.message = log.msg;
      log.timestamp = log.time;
      delete log.pid;
      delete log.hostname;
      delete log.time;
      delete log.v;
      delete log.msg;
      if (logContext) {
        log.requestPath = logContext.get(sessionStorageKeys.REQUEST_PATH_KEY);
        log.requestId = logContext.get(sessionStorageKeys.REQUEST_ID_KEY);
        log.queryParameters = logContext.get(sessionStorageKeys.QUERY_PARAMS_KEY);
        log.apigwRequestId = logContext.get(sessionStorageKeys.API_GATEWAY_REQUEST_ID_KEY);
        log.callerName = logContext.get(sessionStorageKeys.CALLER_NAME);
      }
      
      process.stdout.write(`${safeJsonStringify(Object.assign(log, {
        level: bunyan.nameFromLevel[log.level]
      }))}\n`);
    },
  };
}

/**
 * Initialize logger and app to populate logger fields with global and request context
 * 
 * @param app express app
 * @param loggerConfig config values for the logger. Supported properties are: logLevel
 */
module.exports.initialize = (app, loggerContext, loggerConfig) => {
  // Set logger global properties
  logConfig = loggerConfig;
  // Set logger request context
  logContext = loggerContext
  // Set logger request-wide properties by adding a middlewere
  app.use(logContext.middleware);
  app.use((req, res, next) => {
    const eventHeaderIndex = req.rawHeaders.indexOf('x-apigateway-event');

    let awsRequestId;

    if (eventHeaderIndex !== -1) {
      lambdaEvent = JSON.parse(decodeURIComponent(req.rawHeaders[eventHeaderIndex + 1]));
      awsRequestId = lambdaEvent.requestContext ? lambdaEvent.requestContext.requestId : 'N/A';
      console.info(lambdaEvent)
    }
    
    console.info('headerslog');
    console.info(req);
    console.info(req.headers);
    console.info(req.headers[requestHeaders.PARENT_REQUEST_ID]);
    console.info(req.headers[requestHeaders.CALLER_NAME]);
    // If parent caller service sent a requestId set it as this requests ID as well. Use API Gateway request ID otherwise
    if (req.headers[requestHeaders.PARENT_REQUEST_ID]) {
      logContext.set(sessionStorageKeys.REQUEST_ID_KEY, req.headers[requestHeaders.PARENT_REQUEST_ID]);
    } else {
      logContext.set(sessionStorageKeys.REQUEST_ID_KEY, awsRequestId);
    }

    logContext.set(sessionStorageKeys.API_GATEWAY_REQUEST_ID_KEY, awsRequestId);
    logContext.set(sessionStorageKeys.CALLER_NAME, req.headers[requestHeaders.CALLER_NAME]);
    logContext.set(sessionStorageKeys.REQUEST_PATH_KEY, req.url);
    logContext.set(sessionStorageKeys.QUERY_PARAMS_KEY, req.query);
    next();
  });
};

module.exports.create = () => {
  let conf = logConfig || {
    appName: process.env.APP_NAME,
    logLevel: process.env.LOG_LEVEL,
    functionName: process.env.FUNCTION_NAME,
  };

  return bunyan.createLogger({
    name: conf.appName,
    level: conf.logLevel,
    functionName: conf.functionName,
    streams: [{
      type: 'raw',
      stream: stdoutReformat(),
    }],
  })
};
