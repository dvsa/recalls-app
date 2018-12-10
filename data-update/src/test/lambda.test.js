const AWS = require('aws-sdk');
const sinon = require('sinon');
const lambda = require('../lambda.js');

const event = {
  done: {},
  succeed: {},
  fail: {},
  logGroupName: '/aws/lambda/cvr-malgorzatar-data-update',
  logStreamName: '2018/12/10/[$LATEST]505f754a109d41bf862636601812e8d6',
  functionName: 'cvr-malgorzatar-data-update',
  memoryLimitInMB: '256',
  functionVersion: '$LATEST',
  getRemainingTimeInMillis: {},
  invokeid: '10a08301-fc53-11e8-8ee9-af92e75d850f',
  awsRequestId: '10a08301-fc53-11e8-8ee9-af92e75d850f',
  invokedFunctionArn: 'arn:aws:lambda:eu-west-1:169618167949:function:cvr-malgorzatar-data-update',
  Records: [
    {
      eventVersion: '2.1',
      eventSource: 'aws:s3',
      awsRegion: 'eu-west-1',
      eventTime: '2018-12-10T07:17:30.719Z',
      eventName: 'ObjectCreated:Put',
      userIdentity: { principalId: 'AWS:AIDAIYGRMU4QK4NSBPLOK' },
      requestParameters: { sourceIPAddress: '91.222.71.98' },
      responseElements: {
        'x-amz-request-id': '920A55A1072A0154',
        'x-amz-id-2': 't0CeA8FpXRlnqVRf5ggv+BiS9BvpdvXC5akTK2ocLYlTO3XlcqaAQi7A7JZS1rSgNv5jCiG0hrI=',
      },
      s3: {
        s3SchemaVersion: '1.0',
        configurationId: 'tf-s3-lambda-20181210071249210400000004',
        bucket: {
          name: 'cvr-169618167949-eu-west-1-malgorzatar-data-upload',
          ownerIdentity: { principalId: 'ADMYPCVZ5WHGH' },
          arn: 'arn:aws:s3:::cvr-169618167949-eu-west-1-malgorzatar-data-upload',
        },
        object: {
          key: 'RecallsFile+%282%29.csv',
          size: 5106825,
          eTag: '87b471d6fe20931c682977e6143856bb',
          versionId: 'MGenGIMGXdUnzqv2M1XNN1SYihgt2ZZU',
          sequencer: '005C0E130A72375DB2',
        },
      },
    },
  ],
};

function getObject(bucket, callback) {
  callback(null, { Body: {} });
}

describe('Lamda handler', () => {
  describe('', () => {
    it('', () => {
      const getObject = sinon.stub(AWS.S3.prototype, 'getObject');
      getObject.yields(null, 'test');

      // const s3 = new AWS.S3();
      // const stub = sinon.stub(s3, 'getObject').callsFake(getObject);

      lambda.handler(event, () => {

      });

      // sinon.assert.calledOnce(stub);
    });
  });
});
