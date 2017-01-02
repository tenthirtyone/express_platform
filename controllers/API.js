var express = require('express');
var root = process.cwd();
var config = require(root + '/lib/config');
var router = express.Router();

router.get('/', (req, res) => {
  res.send(true);
});

module.exports = router;
