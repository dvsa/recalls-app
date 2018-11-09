const AWS = require("aws-sdk");
const CSV = require('fast-csv');
const Recall = require('../model/recall');
const ENVIRONMENT = process.env.ENVIRONMENT;
const RECALLS_TABLE_NAME = `cvr-${ENVIRONMENT}-recalls`;
const MAKES_TABLE_NAME = `cvr-${ENVIRONMENT}-makes`;
const MODELS_TABLE_NAME = `cvr-${ENVIRONMENT}-models`;

AWS.config.update({ region: process.env.AWS_REGION });

const documentClient = new AWS.DynamoDB.DocumentClient();
const recallData = [];
const vehicleMakes = [];
const equipmentMakes = [];
const models = new Map();

function trimIfNotEmpty(field) {
  return (!field || field.length === 0) ? field : field.trim();
}

function addToArrayIfNotYetExists(array, element) {
  if(!array.includes(element)) {
    array.push(element);
  }
}

function addToMapIfNotYetExists(map, key, value) {
  if(key in map) {
    map.get(key).push(value); 
  } else {
    map.set(key, [value]);
  }
}

function addToMakesAndModels(recall) {
  if (recall.type == 'vehicle') {
    addToArrayIfNotYetExists(vehicleMakes, recall.make);
    addToMapIfNotYetExists(models, 'vehicle-' + recall.make, recall.model);
  } else {
    addToArrayIfNotYetExists(equipmentMakes, recall.make);
    addToMapIfNotYetExists(models, 'equipment-' + recall.make, recall.model);
  }
}

async function insertRecallsToDb() {
  for (const recall of recallData) {
    const recallsParams = {
      TableName: RECALLS_TABLE_NAME,
      Item: recall
    };

    await documentClient.put(recallsParams, function(err, data) {
      if (err) {
        console.error('Unable to add recall ', recall.make_model_recall_number, '. Error JSON:', JSON.stringify(err, null, 2));
        return process.exit(1);
      } else {
        console.log('Recall ', recall.make_model_recall_number, ' uploaded successfully to the recalls table');
      }
    });
  }
}

async function insertModelsToDb() {
  for (const model of models) {
    const modelsParams = {
      TableName: MODELS_TABLE_NAME,
      Item: {
        'type_make': model[0],
        'models': model[1].sort(),
      }
    };

    await documentClient.put(modelsParams, (err, data) => {
      if (err) {
        console.error('Unable to add model ', model[0], '. Error JSON:', JSON.stringify(err, null, 2));
        return process.exit(1);
      } else {
        console.log('Models uploaded successfully to the recalls table');
      }
    });
    console.log("uwaga: " + model);
  }
}

function insertMakesToDb() {
  const vehicleMakesParams = {
    TableName: MAKES_TABLE_NAME,
    Item: {
      'type': 'vehicle',
      'makes': vehicleMakes.sort()
    }
  };
  const equipmentMakesParams = {
    TableName: MAKES_TABLE_NAME,
    Item: {
      'type': 'equipment',
      'makes': equipmentMakes.sort()
    }
  };

  documentClient.put(vehicleMakesParams, (err, data) => {
    if (err) {
      console.error('Unable to add equipment makes. Error JSON:', JSON.stringify(err, null, 2));
      return process.exit(1);
    } else {
      console.log('Equipment makes uploaded successfully to the recalls table');
      documentClient.put(equipmentMakesParams, (err, data) => {
        if (err) {
          console.error('Unable to add vehicle makes. Error JSON:', JSON.stringify(err, null, 2));
          return process.exit(1);
        } else {
          console.log('Vehicle makes uploaded successfully to the recalls table');
        }
      });
    }
  });
}

// Read csv file
CSV.fromPath('../documents/RecallsFileSmall.csv')
.on('data', function(line) {
  if (line[0] !== 'Launch Date') {
    const recall = new Recall(trimIfNotEmpty(line[0]), trimIfNotEmpty(line[1]), trimIfNotEmpty(line[2]), trimIfNotEmpty(line[4]), trimIfNotEmpty(line[5]), trimIfNotEmpty(line[6]), trimIfNotEmpty(line[7]), trimIfNotEmpty(line[9]), trimIfNotEmpty(line[10]), trimIfNotEmpty(line[11]), trimIfNotEmpty(line[12]), trimIfNotEmpty(line[13]));
    recallData.push(recall);
    addToMakesAndModels(recall);
  }
})
.on('error', function(error) {
  console.error(error);
})
.on('end', function() {
  insertMakesToDb();
  insertRecallsToDb();
  insertModelsToDb();
});
