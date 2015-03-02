var express = require('express');
var url = require("url");
var router = express.Router();

/* GET home page. */
router.get('/:id', function(req, res, next) {
  console.log(req.params.id);
  getRequest("localhost", "3000", "/api/posts/"+req.params.id, function(items){
    res.render('post', items);
  });
});

module.exports = router;
