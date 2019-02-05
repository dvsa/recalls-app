module.exports = {
  recallsBackendUrl: process.env.RECALLS_BACKEND_URL,
  environment: process.env.ENVIRONMENT,
  assetsBucketName: process.env.ASSETS_BUCKET_NAME,
  lambdaName: process.env.LAMBDA_NAME,
  deleteThreshold: process.env.DELETE_THRESHOLD,
  recallsBackendApiKey: process.env.BACKEND_API_KEY,
  logLevel: process.env.LOG_LEVEL,
};
