var express = require('express');
var url = require("url");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  getRequest("localhost", "3000", "/api/posts", function(items){
    res.render('index', items);
  });
});

module.exports = router;
