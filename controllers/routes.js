var express = require('express');
var root = process.cwd();
var config = require(root + '/lib/config');
var router = express.Router();
var url = require('url');

router.get('/', (req, res) => {  
  res.render('pages/index', {
    apiKey: config.apiKey,
    shopUrl: req.session.shopUrl
  });
});

module.exports = router;
