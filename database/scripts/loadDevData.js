const AWS = require("aws-sdk");
const CSV = require('fast-csv');
const RecallDbRecordDto = require('cvr-common/src/dto/recallDbRecord');
const DateParser = require('cvr-common/src/helpers/DateParser');
const ENVIRONMENT = process.env.ENVIRONMENT;
const RECALLS_TABLE_NAME = `cvr-${ENVIRONMENT}-recalls`;
const MAKES_TABLE_NAME = `cvr-${ENVIRONMENT}-makes`;
const MODELS_TABLE_NAME = `cvr-${ENVIRONMENT}-models`;

const LAUNCH_DATE_COL_NO = 0
const RECALL_NUMBER_COL_NO = 1
const MAKE_COL_NO = 2
const CONCERN_COL_NO = 4
const DEFECT_COL_NO = 5
const REMEDY_COL_NO = 6
const VEHICLE_NUMBER_COL_NO = 7
const MODEL_COL_NO = 9
const VIN_START_COL_NO = 10
const VIN_END_COL_NO = 11
const BUILD_START_COL_NO = 12
const BUILD_END_COL_NO = 13

AWS.config.update({ region: process.env.AWS_REGION });

const documentClient = new AWS.DynamoDB.DocumentClient();
const recallData = [];
const uniqueRecallData = {};
const vehicleMakes = [];
const equipmentMakes = [];
const models = new Map();

let uniqueRowsRead = 0;

function trimIfNotEmpty(field) {
  return (!field || field.length === 0) ? field : field.trim();
}

function addToArrayIfNotYetExists(array, element) {
  if(!array.includes(element)) {
    array.push(element);
  }
}

function addToMapIfNotYetExists(map, key, value) {
  if(map.has(key)) {
    if(map.get(key).indexOf(value) === -1) {
      map.get(key).push(value);
    }
  } else {
    map.set(key, [value]);
  }
}

function addToMakesAndModels(recall) {
  if (recall.type == 'vehicle') {
    addToArrayIfNotYetExists(vehicleMakes, recall.make);
  } else {
    addToArrayIfNotYetExists(equipmentMakes, recall.make);
  }

  addToMapIfNotYetExists(models, `${recall.type}-${recall.make}`, recall.model);
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
        console.error(`Recall body: ${JSON.stringify(recall)}`);
        return process.exit(1);
      } else {
        console.log('Recall ', recall.make_model_recall_number, ' uploaded successfully to the recalls table');
      }
    });
  }
}

function insertModelsToDb() {
  models.forEach((values, key, map) => {
    const modelsParams = {
      TableName: MODELS_TABLE_NAME,
      Item: {
        'type_make': key,
        'models': values.sort(),
      }
    };

    documentClient.put(modelsParams, (err, data) => {
      if (err) {
        console.error('Unable to add model ', key, '. Error JSON:', JSON.stringify(err, null, 2));
        return process.exit(1);
      } else {
        console.log('Models uploaded successfully to the recalls table');
      }
    });
  });
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


// Read and load csv file
CSV.fromPath('../documents/RecallsFileSmall.csv')
.on('data', function(line) {
  if (line[LAUNCH_DATE_COL_NO] !== 'Launch Date') {
    const recall = new RecallDbRecordDto(
      trimIfNotEmpty(DateParser.slashFormatToISO(line[LAUNCH_DATE_COL_NO])),
      trimIfNotEmpty(line[RECALL_NUMBER_COL_NO]),
      trimIfNotEmpty(line[MAKE_COL_NO]),
      trimIfNotEmpty(line[CONCERN_COL_NO]),
      trimIfNotEmpty(line[DEFECT_COL_NO]),
      trimIfNotEmpty(line[REMEDY_COL_NO]),
      trimIfNotEmpty(line[VEHICLE_NUMBER_COL_NO]),
      trimIfNotEmpty(line[MODEL_COL_NO]),
      trimIfNotEmpty(line[VIN_START_COL_NO]),
      trimIfNotEmpty(line[VIN_END_COL_NO]),
      trimIfNotEmpty(DateParser.slashFormatToISO(line[BUILD_START_COL_NO])),
      trimIfNotEmpty(DateParser.slashFormatToISO(line[BUILD_END_COL_NO]))
    );
    recallData.push(recall);
    uniqueRecallData[`${recall.recall_number}${recall.make}${recall.model}`] = recall;
    addToMakesAndModels(recall);
  }
})
.on('error', function(error) {
  console.error(error);
})
.on('end', function() {
  uniqueRowsRead = Object.keys(uniqueRecallData).length;
  if (uniqueRowsRead < recallData.length) {
    console.warn(`WARNING: CSV contains ${recallData.length} rows, but only ${uniqueRowsRead} are unique (recallNum/make/model) recalls!`)
  }
  insertMakesToDb();
  insertRecallsToDb();
  insertModelsToDb();
});
