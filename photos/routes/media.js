var express = require('express');
var url = require("url");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('media', { medias: items, media : "none" });
});
router.get('/:id', function(req, res, next) {
  var media = items.media[req.params.id];
  res.render('media', { media: media, medias : "none" });
});

module.exports = router;
