var express = require('express');
var url = require("url");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('projects', { projects: items, project : "none" });
});
router.get('/:id', function(req, res, next) {
  var project = items.projects[req.params.id];
  res.render('projects', { project: project, projects : "none" });
});

module.exports = router;
