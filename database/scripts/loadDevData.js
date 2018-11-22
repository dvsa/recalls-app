const AWS = require("aws-sdk");
const CSV = require('fast-csv');
const Recall = require('../model/recall');
const DateParser = require('../helpers/DateParser');
const ENVIRONMENT = process.env.ENVIRONMENT;
const RECALLS_TABLE_NAME = `cvr-${ENVIRONMENT}-recalls`;
const MAKES_TABLE_NAME = `cvr-${ENVIRONMENT}-makes`;
const MODELS_TABLE_NAME = `cvr-${ENVIRONMENT}-models`;

const LAUNCH_DATE_LINE_NO = 0
const RECALL_NUMBER_LINE_NO = 1
const MAKE_LINE_NO = 2
const CONCERN_LINE_NO = 4
const DEFECT_LINE_NO = 5
const REMEDY_LINE_NO = 6
const VEHICLE_NUMBER_LINE_NO = 7
const MODEL_LINE_NO = 9
const VIN_START_LINE_NO = 10
const VIN_END_LINE_NO = 11
const BUILD_START_LINE_NO = 12
const BUILD_END_LINE_NO = 13

AWS.config.update({ region: process.env.AWS_REGION });

const documentClient = new AWS.DynamoDB.DocumentClient();
const dateParser = new DateParser();
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
  if (line[LAUNCH_DATE_LINE_NO] !== 'Launch Date') {
    const recall = new Recall(
      trimIfNotEmpty(dateParser.slashFormatToISO(line[LAUNCH_DATE_LINE_NO])),
      trimIfNotEmpty(line[RECALL_NUMBER_LINE_NO]), 
      trimIfNotEmpty(line[MAKE_LINE_NO]), 
      trimIfNotEmpty(line[CONCERN_LINE_NO]), 
      trimIfNotEmpty(line[DEFECT_LINE_NO]), 
      trimIfNotEmpty(line[REMEDY_LINE_NO]), 
      trimIfNotEmpty(line[VEHICLE_NUMBER_LINE_NO]), 
      trimIfNotEmpty(line[MODEL_LINE_NO]), 
      trimIfNotEmpty(line[VIN_START_LINE_NO]), 
      trimIfNotEmpty(line[VIN_END_LINE_NO]), 
      trimIfNotEmpty(dateParser.slashFormatToISO(line[BUILD_START_LINE_NO])), 
      trimIfNotEmpty(dateParser.slashFormatToISO(line[BUILD_END_LINE_NO]))
    );
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
