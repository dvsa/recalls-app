class S3BucketObjectProperties {
  constructor(s3, srcBucket, srcKey) {
    this.s3 = s3;
    this.srcBucket = srcBucket;
    this.srcKey = srcKey;
  }
}

module.exports = S3BucketObjectProperties;
