const request = require('request');

/** Wrapper for 'requests' package.
 * It returns errors if request receives a 4xx or 5xx HTTP response  */
class HttpRequest {
  static get(options, callback) {
    request.get(options, (err, res, body) => {
      HttpRequest.failOn4xx5xxResponseOrContinue(err, res, body, callback);
    });
  }

  static delete(options, callback) {
    request.delete(options, (err, res, body) => {
      HttpRequest.failOn4xx5xxResponseOrContinue(err, res, body, callback);
    });
  }

  static patch(options, callback) {
    request.patch(options, (err, res, body) => {
      HttpRequest.failOn4xx5xxResponseOrContinue(err, res, body, callback);
    });
  }

  static failOn4xx5xxResponseOrContinue(err, res, body, callback) {
    const statusCode = res && res.statusCode;
    if (statusCode >= 400 && statusCode < 600) {
      const customError = new Error(`HTTP response - ${res && res.statusCode} ${res && res.statusMessage}`);
      callback(customError, res, body);
    } else {
      callback(err, res, body);
    }
  }
}

module.exports = HttpRequest;
