const AWS = require('aws-sdk');

class S3Client {
  static createS3Client() {
    return new AWS.S3();
  }
}

module.exports = S3Client;
