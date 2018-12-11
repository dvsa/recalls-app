const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app');
const envVariables = require('./config/environmentVariables');

const server = awsServerlessExpress.createServer(app);

module.exports = {
  handler: (lambdaEvent, context) => {
    envVariables.functionName = context.functionName;
    return awsServerlessExpress.proxy(server, lambdaEvent, context);
  },
};
