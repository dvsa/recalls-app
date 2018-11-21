class ModelsResource {
  constructor(recallsRepository) {
    this.recallsRepository = recallsRepository;
  }

  getAllModels(type, make, callback) {
    this.recallsRepository.getAllModels(type, make, (err, data) => {
      if (err) {
        console.error(err);
        callback(err);
      } else {
        const retrievedItem = data.Item;
        // retrievedModels remains undefined if no models exist
        const retrievedModels = (retrievedItem || {}).models;
        callback(null, retrievedModels || []);
      }
    });
  }
}

module.exports = ModelsResource;
