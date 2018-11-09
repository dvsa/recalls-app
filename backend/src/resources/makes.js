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
        callback(null, retrievedItem.makes);
      }
    });
  }
}

module.exports = MakesResource;
