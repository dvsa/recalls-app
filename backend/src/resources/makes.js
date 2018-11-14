class MakesResource {
  constructor(recallsRepository) {
    this.recallsRepository = recallsRepository;
  }

  getAllMakes(type, callback) {
    this.recallsRepository.getAllMakes(type, (err, data) => {
      if (err) {
        console.error(err);
        callback(err);
      } else {
        const retrievedItem = data.Item;
        const retrievedMakes = (retrievedItem || {}).makes;
        callback(null, retrievedMakes || []);
      }
    });
  }
}

module.exports = MakesResource;
