var express = require('express');
var url = require("url");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('post', { posts: items, post : "none" });
});
router.get('/:id', function(req, res, next) {
  var post = items.posts[req.params.id];
  console.log(post);
  res.render('post', { post: post, posts : "none" });
});

module.exports = router;
