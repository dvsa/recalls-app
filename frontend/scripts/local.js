process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'debug';
process.env.BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
process.env.RECALLS_BACKEND_URL = process.env.RECALLS_BACKEND_URL || 'http://localhost:4000';
// It is recommended to use an existing built env as assets base to get the file download working.
process.env.ASSETS_BASE_URL = process.env.ASSETS_BASE_URL || 'https://dvsa-front-end.herokuapp.com';
process.env.DOCUMENTS_BASE_URL = process.env.DOCUMENTS_BASE_URL || 'http://www.dft.gov.uk/vosa/apps/recalls';
process.env.FUNCTION_NAME = process.env.FUNCTION_NAME || 'N/A-localhost-fe';

const app = require('../app');

app.listen(3000, () => {
  console.info('Lambda started in local mode on port 3000.');
});
