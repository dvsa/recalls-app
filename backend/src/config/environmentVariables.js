module.exports = {
  tableName: process.env.DYNAMODB_RECALLS_TABLE,
  awsRegion: process.env.AWS_REGION || 'eu-west-1',
};
