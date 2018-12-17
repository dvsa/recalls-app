const awsServerlessExpress = require('aws-serverless-express');
const app = require('./src/app');

const server = awsServerlessExpress.createServer(app);

module.exports = {
  handler: (lambdaEvent, context) => awsServerlessExpress.proxy(server, lambdaEvent, context),
};
