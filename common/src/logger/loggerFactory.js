const bunyan = require('bunyan');
const safeJsonStringify = require('safe-json-stringify');
const requestHeaders = require('../constants/requestHeaders');
const sessionStorageKeys = require('../constants/sessionStorageKeys');

class LoggerFactory {
  /**
   * Function customizing the log format based on logContext and logConfig
   */
  static stdoutReformat() {
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
        if (this.logContext) {
          log.requestPath = this.logContext.get(sessionStorageKeys.REQUEST_PATH_KEY);
          log.requestId = this.logContext.get(sessionStorageKeys.REQUEST_ID_KEY);
          log.queryParameters = this.logContext.get(sessionStorageKeys.QUERY_PARAMS_KEY);
          log.apigwRequestId = this.logContext.get(sessionStorageKeys.API_GATEWAY_REQUEST_ID_KEY);
          log.callerName = this.logContext.get(sessionStorageKeys.CALLER_NAME);
        }

        if (this.logConfig) {
          log.functionName = this.logConfig.functionName;
        }

        process.stdout.write(`${safeJsonStringify(Object.assign(log, {
          level: bunyan.nameFromLevel[log.level],
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
  static initialize(app, loggerContext, loggerConfig) {
    // Set logger global properties
    this.logConfig = loggerConfig || {
      appName: process.env.APP_NAME,
      logLevel: process.env.LOG_LEVEL,
    };

    // create logger instance
    this.logger = bunyan.createLogger({
      name: this.logConfig.appName,
      level: this.logConfig.logLevel,
      streams: [{
        type: 'raw',
        stream: this.stdoutReformat(),
      }],
    });

    // Set logger request context
    this.logContext = loggerContext;

    // Set logger request-wide properties by adding a middlewere
    if (app) {
      app.use((req, res, next) => {
        // Extract APIGW request id from the lambda event
        const awsRequestId = req.apiGateway && req.apiGateway.event.requestContext ? req.apiGateway.event.requestContext.requestId : 'N/A';

        // If function name not present extract it from lambda context
        if (!this.logConfig.functionName) {
          this.logConfig.functionName = this.logContext.get(sessionStorageKeys.FUNCTION_NAME);
        }

        // If parent caller service sent a requestId set it as this
        // requests ID as well. Use API Gateway request ID otherwise
        if (req.headers[requestHeaders.PARENT_REQUEST_ID]) {
          this.logContext.set(
            sessionStorageKeys.REQUEST_ID_KEY,
            req.headers[requestHeaders.PARENT_REQUEST_ID],
          );
        } else {
          this.logContext.set(sessionStorageKeys.REQUEST_ID_KEY, awsRequestId);
        }

        this.logContext.set(sessionStorageKeys.API_GATEWAY_REQUEST_ID_KEY, awsRequestId);
        this.logContext.set(sessionStorageKeys.CALLER_NAME,
          req.headers[requestHeaders.CALLER_NAME]);
        this.logContext.set(sessionStorageKeys.REQUEST_PATH_KEY, req.url);
        this.logContext.set(sessionStorageKeys.QUERY_PARAMS_KEY, req.query);
        next();
      });
    }
  }

  get logger() {
    return this.loggerInstance;
  }
}

module.exports = LoggerFactory;
