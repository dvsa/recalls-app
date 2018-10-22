const getByMake = require('../functions/getByMake');
const express = require('express');

const router = express.Router();

router.get('/search-by-make', function(req, res) {
  const params = {
    make: req.query.make
  }

  const recalls = getByMake(params);

  console.log(recalls);

  res.status(200).json(recalls).end();
});

module.exports = router;
