process.env.ENVIRONMENT = process.env.ENVIRONMENT || 'int';
process.env.AWS_REGION = process.env.AWS_REGION || 'eu-west-1';
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'debug';
process.env.FUNCTION_NAME = process.env.FUNCTION_NAME || 'N/A-localhost-be';

const app = require('../app');

app.listen(4000, () => {
  console.info('Lambda started in local node on port 4000.');
});
