const AWS = require('aws-sdk');

class S3Client {
  constructor() {
    this.s3 = new AWS.S3();
  }
}

module.exports = S3Client;
