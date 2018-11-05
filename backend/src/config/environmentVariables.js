module.exports = {
  recallsTableName: process.env.DYNAMODB_RECALLS_TABLE,
  makesTableName: process.env.DYNAMODB_MAKES_TABLE,
  modelsTableName: process.env.DYNAMODB_MODELS_TABLE,
  awsRegion: process.env.AWS_REGION || 'eu-west-1',
};
