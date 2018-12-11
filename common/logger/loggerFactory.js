const bunyan = require('bunyan');
const safeJsonStringify = require('safe-json-stringify');
const httpContext = require('express-http-context');

const AMAZON_LB_TRACE_HEADER = 'x-amzn-trace-id';

let logConfig;

function stderrReformat() {
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

      process.stderr.write(`${safeJsonStringify(Object.assign(log, {
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
module.exports.initialize = (app, loggerConfig) => {
  // Set logger global properties
  logConfig = loggerConfig;
  // Set logger request-wide properties by adding a middlewere
  app.use(httpContext.middleware);
  app.use((req, res, next) => {
    httpContext.set('requestId', req.headers[AMAZON_LB_TRACE_HEADER]);
    httpContext.set('requestPath', req.url);
    httpContext.set('queryParameters', req.query);
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
    requestPath: httpContext.get('requestPath'),
    requestId: httpContext.get('requestId'),
    queryParameters: httpContext.get('queryParameters'),
    streams: [{
      type: 'raw',
      stream: stderrReformat(),
    }],
  })
};
