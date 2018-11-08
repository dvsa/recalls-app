const AWS = require("aws-sdk");
const CSV = require('fast-csv');
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

function escapeStringOrSetSpaceIfEmpty(string) {
  return (string === '' || !string) ? ' ' : string.trim();
}

function mapRecallNumberToRecallType(recallNumber) {
  const type = recallNumber.split('/')[0];
  const vehicleTypes = ['R', 'RM', 'RCT', 'RPT', 'RSPV', 'RPC'];
  return vehicleTypes.includes(type) ? 'vehicle' : 'equipment';
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

function Recall(launchDate, recallNumber, make, concern, defect, remedy, vehicleNumber, model, vinStart, vinEnd, buildStart, buildEnd) {
  this.recallType = mapRecallNumberToRecallType(recallNumber);
  this.launchDate = escapeStringOrSetSpaceIfEmpty(launchDate);
  this.recallNumber = escapeStringOrSetSpaceIfEmpty(recallNumber);
  this.make = escapeStringOrSetSpaceIfEmpty(make);
  this.concern = escapeStringOrSetSpaceIfEmpty(concern);
  this.defect = escapeStringOrSetSpaceIfEmpty(defect);
  this.remedy = escapeStringOrSetSpaceIfEmpty(remedy);
  this.vehicleNumber = escapeStringOrSetSpaceIfEmpty(vehicleNumber);
  this.model = escapeStringOrSetSpaceIfEmpty(model);
  this.vinStart = escapeStringOrSetSpaceIfEmpty(vinStart);
  this.vinEnd = escapeStringOrSetSpaceIfEmpty(vinEnd);
  this.buildStart = escapeStringOrSetSpaceIfEmpty(buildStart);
  this.buildEnd = escapeStringOrSetSpaceIfEmpty(buildEnd);

  if (this.recallType == 'vehicle') {
    addToArrayIfNotYetExists(vehicleMakes, this.make);
    addToMapIfNotYetExists(models, 'vehicle-' + this.make, this.model);
  } else {
    addToArrayIfNotYetExists(equipmentMakes, make);
    addToMapIfNotYetExists(models, 'equipment-' + this.make, this.model);
  }
}

// Read csv file and save it as an array of Recalls
CSV.fromPath('../documents/RecallsFileSmall.csv')
.on('data', function(line) {
  if (line[0] != 'Launch Date') {
    recallData.push(new Recall(line[0], line[1], line[2], line[4], line[5], line[6], line[7], line[9], line[10], line[11], line[12], line[13]));
  }
})
.on('end', function() {
  // Insert recalls from the array to the db
  recallData.forEach(function(recall) {
    const recallsParams = {
      TableName: RECALLS_TABLE_NAME,
      Item: {
        'make_model_recall_number': recall.make + '-' + recall.model + '-' + recall.recallNumber,
        'type': recall.recallType,
        'launch_date': recall.launchDate,
        'recall_number': recall.recallNumber,
        'make': recall.make,
        'concern': recall.concern,
        'defect': recall.defect,
        'remedy': recall.remedy,
        'vehicle_number': recall.vehicleNumber,
        'model': recall.model,
        'vin_start': recall.vinStart,
        'vin_end': recall.vinEnd,
        'build_start': recall.buildStart,
        'build_end': recall.buildEnd
      },
      ReturnConsumedCapacity: 'TOTAL'
    };
    documentClient.put(recallsParams, function(err, data) {
      if (err) {
        console.error('Unable to add recall ', recall.recallType, '. Error JSON:', JSON.stringify(err, null, 2));
        return process.exit(1);
      } else {
        console.info(data);
      }
    });
  });

  // Insert makes to the db
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
      console.error('Unable to add equipment make. Error JSON:', JSON.stringify(err, null, 2));
      return process.exit(1);
    }
  });
  documentClient.put(equipmentMakesParams, (err, data) => {
    if (err) {
      console.error('Unable to add vehicle make. Error JSON:', JSON.stringify(err, null, 2));
      return process.exit(1);
    }
  });

  // Insert models to the db
  models.forEach((value, key, map) => {
    const modelsParams = {
      TableName: MODELS_TABLE_NAME,
      Item: {
        'type_make': key,
        'models': value.sort(),
      }
    };
    documentClient.put(modelsParams, (err, data) => {
      if (err) {
        console.error('Unable to add model ', key, '. Error JSON:', JSON.stringify(err, null, 2));
        return process.exit(1);
      }
    });
  });
});
