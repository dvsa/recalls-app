const bunyan = require('bunyan');
const safeJsonStringify = require('safe-json-stringify');
const httpContext = require('express-http-context');

let appConfig = null;

function stderrWithLevelAsString() {
  return {
    write: (entry) => {
      const log = entry;

      delete log.pid;
      delete log.hostname;

      process.stderr.write(`${safeJsonStringify(Object.assign(log, {
        level: bunyan.nameFromLevel[log.level],
      }))}\n`);
    },
  };
}

module.exports.initialize = (config) => appConfig = config;

module.exports.create = bunyan.createLogger({
  level: appConfig.logLevel,
  functionName: appConfig.functionName,
  requestPath: httpContext.get('requestPath'),
  requestId: httpContext.get('requestId'),
  queryParameters: httpContext.get('queryParameters'),
  streams: [{
    type: 'raw',
    stream: stderrWithLevelAsString(),
  }],
});
