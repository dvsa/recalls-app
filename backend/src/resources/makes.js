class MakesResource {
  constructor(recallsRepository) {
    this.recallsRepository = recallsRepository;
  }

  getAllMakes(type, callback) {
    this.recallsRepository.getAllMakes(type, (err, data) => {
      if (err) {
        console.error(`An error occurred for type=${type}`);
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
