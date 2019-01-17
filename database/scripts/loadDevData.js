const AWS = require("aws-sdk");
const CSV = require('fast-csv');
const RecallDbRecordDto = require('cvr-common/src/dto/recallDbRecord');
const DateParser = require('cvr-common/src/helpers/DateParser');
const delay = ms => new Promise(res => setTimeout(res, ms));
const ENVIRONMENT = process.env.ENVIRONMENT;
const RECALLS_TABLE_NAME = `cvr-${ENVIRONMENT}-recalls`;
const MAKES_TABLE_NAME = `cvr-${ENVIRONMENT}-makes`;
const MODELS_TABLE_NAME = `cvr-${ENVIRONMENT}-models`;
const RECALLS_TABLE_SECONDARY_INDEX = 'type-make-model-gsi';
const UPSCALED_WRITE_THROUGHPUT = 500;
const UPSCALED_READ_THROUGHPUT = 65;
const NORMAL_THROUGHPUT = 1;
const MAX_CHECK_COUNT = 10;
const CHECK_COUNT_DELAY_SECONDS = 10;

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

const dynamoDB = new AWS.DynamoDB();
const documentClient = new AWS.DynamoDB.DocumentClient();
const recallData = [];
const uniqueRecallData = {};
const vehicleMakes = [];
const equipmentMakes = [];
const models = new Map();

let checkNumber = 1;
let uniqueRowsRead = 0;

function getTableThroughputParams(tableName, desiredWriteThroughput, desiredReadThroughput, indexName) {
  const output = {
    TableName: tableName,
    ProvisionedThroughput: {
      ReadCapacityUnits: desiredReadThroughput,
      WriteCapacityUnits: desiredWriteThroughput
    },
  };

  if (indexName) {
    output.GlobalSecondaryIndexUpdates = [{
      Update: {
        IndexName: indexName,
        ProvisionedThroughput: {
          ReadCapacityUnits: desiredReadThroughput,
          WriteCapacityUnits: desiredWriteThroughput
        }
      }
    }];
  }

  return output;
}

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

async function getRecallCount(callback) {
  const params = {
    TableName: RECALLS_TABLE_NAME,
    IndexName: RECALLS_TABLE_SECONDARY_INDEX,
    Select: 'COUNT'
  };

  documentClient.scan(params, callback);
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

async function checkThroughput(callback) {
  var params = {
    TableName: RECALLS_TABLE_NAME
   };

   dynamoDB.describeTable(params, callback);
}

// Callback function to await the proper amount of recalls in the recalls table before decreasing the throughput
const countCallback = async function countCallback(err, data) {
  if (err) {
    console.error(err);
    return process.exit(1);
  } else {
    console.log(`${data.Count} recalls found in iteration #${checkNumber}`);
    if (data.Count != uniqueRowsRead) {
      if (checkNumber <= MAX_CHECK_COUNT) {
        await delay(CHECK_COUNT_DELAY_SECONDS * 1000);
        checkNumber++;
        getRecallCount(countCallback);
      } else {
        console.error(`Recall count is not equal to the expected value of ${uniqueRowsRead}`);
        dynamoDB.updateTable(getTableThroughputParams(RECALLS_TABLE_NAME, NORMAL_THROUGHPUT, NORMAL_THROUGHPUT, RECALLS_TABLE_SECONDARY_INDEX), function(err, data) {
          if (err) {
            console.error(`Table ${RECALLS_TABLE_NAME} throughput not reduced!! Rerun, reduce manually or destroy the env to avoid incurring raised dynamodb costs`);
            console.error(err);
            return process.exit(1);
          } else {
            console.log(`Table ${RECALLS_TABLE_NAME} updated with throughput ${NORMAL_THROUGHPUT}`);
            return process.exit(1);
          }
        });
      }
    } else {
      // At the end decrease dynamoDB throughput to normal values if item count matches
      dynamoDB.updateTable(getTableThroughputParams(RECALLS_TABLE_NAME, NORMAL_THROUGHPUT, NORMAL_THROUGHPUT, RECALLS_TABLE_SECONDARY_INDEX), function(err, data) {
        if (err) {
          console.error(`Table ${RECALLS_TABLE_NAME} throughput not reduced!! Rerun, reduce manually or destroy the env to avoid incurring raised dynamodb costs`);
          console.error(err);
          return process.exit(1);
        } else {
          console.log(`Table ${RECALLS_TABLE_NAME} updated with throughput ${NORMAL_THROUGHPUT}`);
        }
      });
    }
  }
};

// callback function that checks if throughput is changed to the expected amount, if yes proceeds with data load.
const throughputCallback = function throughputCallback(expectedWriteThroughput, expectedReadThroughput, currentRetry, delaySeconds) {
  return (err, data) => {
    if (err) {
      console.error(err);
      return process.exit(1);
    } else {
      if (data.Table.ProvisionedThroughput.WriteCapacityUnits != expectedWriteThroughput && data.Table.ProvisionedThroughput.ReadCapacityUnits != expectedReadThroughput) {
        console.log(`Table ${RECALLS_TABLE_NAME} real  throughput is ${data.Table.ProvisionedThroughput.WriteCapacityUnits}/${data.Table.ProvisionedThroughput.ReadCapacityUnits}; waiting...`);
        if (currentRetry <= MAX_CHECK_COUNT) {
          setTimeout(function() {
            checkThroughput(throughputCallback(expectedWriteThroughput, expectedReadThroughput, currentRetry + 1, delaySeconds));
          }, delaySeconds * 1000);
        } else {
          console.error('DynamoDB table write capacity did not change in expected amount of time investigate and/or rerun the build');
          return process.exit(1);
        }
      } else {
        console.log(`Table ${RECALLS_TABLE_NAME} real throughput is ${data.Table.ProvisionedThroughput.WriteCapacityUnits}/${data.Table.ProvisionedThroughput.ReadCapacityUnits}; Loading CSV data`);
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
          // Start waiting on expected ammount of recalls to be loaded, then decrease throughput via countCallback
          console.log(`Expecting ${uniqueRowsRead} recalls`);
          setTimeout(function(){
            getRecallCount(countCallback);
          }, 1000);
        });
      }
    }
  };
};

// Increase dynamoDB throughput to load data faster, and start the load via throughputCallback
dynamoDB.updateTable(getTableThroughputParams(RECALLS_TABLE_NAME, UPSCALED_WRITE_THROUGHPUT, UPSCALED_READ_THROUGHPUT, RECALLS_TABLE_SECONDARY_INDEX), function(err, data) {
  if (err) {
    console.error(err);
    return process.exit(1);
  } else {
    console.log(
      `Table ${RECALLS_TABLE_NAME} updated with write throughput ${UPSCALED_WRITE_THROUGHPUT}, read throughput ${UPSCALED_READ_THROUGHPUT}; Checking whether the change took effect... `
      );

    checkThroughput(throughputCallback(UPSCALED_WRITE_THROUGHPUT, UPSCALED_READ_THROUGHPUT, 0, 5));
  }
});
