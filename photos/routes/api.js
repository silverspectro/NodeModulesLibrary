var fs = require("fs");
var morgan = require("morgan");
var path = require("path");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var qs = require("querystring");
var express = require("express");
var server = express();

var API = function() {
console.log(arguments);

var names = [];
this.items = [];

for(var args = 0; args < arguments.length; args++) {
  names.push(arguments[args]);
}

var files = [];
this.router = express.Router();

  //utility function
  function getDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd='0'+dd
    }

    if(mm<10) {
        mm='0'+mm
    }

    today = mm+'-'+dd+'-'+yyyy;
    return today;
  }

  function createDir(names) {
    if(fs.existsSync(__dirname + "/api")) {
      if(typeof names === "object") {
        names.forEach(function(name){
          if(fs.existsSync(__dirname + "/api/" + name)){
            console.log(name + " exists");
          } else if(typeof name === "string") {
            console.log("Creating folder " + name);
            fs.mkdirSync(__dirname + "/api/" + name);
          }
        });
      } else {
        console.log(names);
        if(fs.existsSync(__dirname + "/api/" + names)){
          console.log(names + " exists");
        } else {
          console.log("Creating folder " + names);
          fs.mkdirSync(__dirname + "/api/" + names);
        }
      }
    } else {
      console.log("Creating folder " + names);
      fs.mkdirSync(__dirname + "/api");
      createDir(names);
    }
  }

  if(!names) {
    console.log("provide a name for the api");
  } else {
    createDir(names);
    createDir("log");
  }

  function createRoutes(names) {
    names.forEach(function(name){
      var filename = name;
      var file = path.join(__dirname,"api/"+ name +"/"+name );
      files.push(path.join(__dirname,"api/"+ name +"/"+name ))
      return server.set(filename, file);
    });
  }

  createRoutes(names);

  var logfile = path.join(__dirname, "/api/log/log" + getDate());

  // create a write stream (in append mode)
  var LogStream = fs.createWriteStream(logfile, {flags: 'a'});

  // server.set("name", "/api/"+name);
  server.use(morgan("combined", {stream: LogStream}));
  server.use(morgan("dev"));
  server.use(bodyParser.json());  //automatically convert to JSON
  server.use(methodOverride());

  function LoadorInitialize(file, callback) {
    fs.exists(file, function(exist){
      if(exist) {
        fs.readFile(file,"utf8", function(err, data){
          if(err)throw err;
          var data = data.toString();
          items = JSON.parse(data || "[]");
          callback(items);
        });
      } else {
        callback([]);
      }
    });
  };
  //access /, /index, /title, /0-2
  function listitems(file, req, res, itemIndex) {
    if(!itemIndex)itemIndex = "";
    var rangeString = /\d-\d/;
    var singleString = /^\d+$/;
    var res_items = [];

    LoadorInitialize(file, function(items){
      res.status(200);
      if(singleString.test(itemIndex)) {
        if(itemIndex || itemIndex === 0) {
          if(items[itemIndex]) {
            var item = items[itemIndex];
            res.json(item)
          } else {
            res.write("no Match");
          }
        }
      }else if(rangeString.test(itemIndex)){
        var max = itemIndex.substr(itemIndex.indexOf("-")+1);
        var min = itemIndex.slice(0, itemIndex.indexOf("-"));
        console.log("range = "+min+" - "+max);
        if(max < items.length) {
          for(var i = min; i <= max; i++) {
            var item = items[i];
            res_items.push(item);
          }
          res.json(res_items);
        } else {
          console.log("range is to great, they are only " + items.length +" "+ name);
          res.end("range is to great, they are only " + items.length +" "+ name);
        }
      }else if(itemIndex && !singleString.test(itemIndex)) {
        for(var i in items) {
          if(items[i].title == itemIndex) {
            var item = items[i];
            res_items.push(item);
          }
        }
        res.json(res_items);
        console.log("no match for " + itemIndex);
        res.end("no match for " + itemIndex);
      } else {
        for(var i in items) {
          var item = items[i];
          res_items.push(item);
        }
        res.json(res_items);
      }
      res.end("\n\ndone");
    });
  };

  function storeitem(file, items, message, req, res) {
    fs.writeFile(file, JSON.stringify(items), "utf8", function(err){
      if(err) {
        res.status(404);
        console.log(err);
        res.end(err);
      }
      res.status(200);
      if(message) {
        res.end(message);
      } else {
        res.end("item added");
      }
    });
  };

  function additem(file, itemDescription, req ,res) {
    if(!itemDescription)console.log("no item description");
    var item = {};
    if(Object.keys(itemDescription).length > 1) {
      item = itemDescription;
    } else {
      if(itemDescription[Object.keys(itemDescription)[0]]) {
        item.description = itemDescription[Object.keys(itemDescription)[0]];
      } else {
        item.description = itemDescription;
      }
    }
    item.created = new Date();
    item.type = req.url.slice(1);
    item._index = items.length;

    var lowerItem = {};
    for(prop in item) {
      lowerItem[prop.toLowerCase()] = item[prop];
    }

    LoadorInitialize(file, function(items){
      items.push(lowerItem);
      storeitem(file,  items ,"item Added", req, res);
    });
  };

  function deleteitem(file, itemIndex, req, res) {
    if(isNaN(itemIndex)) {
      res.status(404);
      res.end("Not a item, enter a number");
    } else if(!items[itemIndex]) {
      res.status(404);
      res.end("Not a listed item");
    } else {
      LoadorInitialize(file, function(items){
        items.splice(itemIndex, 1);
        storeitem(file, items, "\n\nitem " + itemIndex +" deleted", req, res);
      });
    }
  };

  function modifyitem(file, itemDescription, itemIndex, req, res) {
    if(itemDescription) {
      if(isNaN(itemIndex)) {
        res.status(404);
        res.end("Not a item, enter a number");
      } else if(!items[itemIndex]) {
      	console.log(items);
        res.status(404);
        res.end("Not a item, enter a number");
      } else {
        LoadorInitialize(file, function(items){
          var item = {};
          if(Object.keys(itemDescription)) {
            var item = itemDescription;
            for(high in item) {
              item[high.toLowerCase()] = item[high];
            }
            if(items[itemIndex]) {
              for(prop in item) {
                if(prop !== "created")items[itemIndex][prop.toLowerCase()] = item[prop.toLowerCase()];
              }
            } else {
              items[itemIndex] = itemDescription;
            }
          }else {
            item = itemDescription;
            items[itemIndex].description = itemDescription;
          }
          storeitem(file, items, "item " + itemIndex + " modified", req, res);
        });
      }
    } else {
      res.status(404);
      res.end("No modification, enter modification to do");
    }
  };

  //middlewrare for all request
router.use(function(req, res, next) {
  req.setEncoding("utf8");
  next();
});


  //on routes that end in projects
  router.route("/:db_name")
    //access with GET
    .get(function(req, res){
      var file = server.get(req.params.db_name);
      listitems(file, req, res);
    })

    .post(function(req, res){
      var file = server.get(req.params.db_name);
      var item = "";
      item = req.body;
      if(item !== "")additem(file, item, req, res);

    });

  router.route("/:db_name/:item_id")

    .get(function(req, res){
      var file = server.get(req.params.db_name);
      var itemIndex = req.params.item_id;
      listitems(file, req, res, itemIndex);
    })

    .delete(function(req, res){
      var file = server.get(req.params.db_name);
      var itemIndex = parseInt(req.params.item_id);
      deleteitem(file, itemIndex, req, res);
    })

    .put(function(req, res){
      var file = server.get(req.params.db_name);
      var itemIndex = req.params.item_id;
      var item = "";
      item = req.body;

      if(item !== "")modifyitem(file, item, itemIndex, req, res);

    });

}

module.exports = API;
