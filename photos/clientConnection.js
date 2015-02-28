var http= require("http");
var qs = require("querystring");
//module.exports = marked = require("marked");
module.exports = function(server, app){

  var io = require("socket.io")(server);

module.exports = getRequest = function(host, port, path, callback) {
  var getReq = {
    host:host,
    port:port,
    path:path,
    method:"GET"
  };

  http.request(getReq, function(res){
    res.setEncoding("utf8");
    res.on("data", function(apidata){
      items = JSON.parse(apidata);
      if(callback)callback(items);
    });
  }).end();
}

module.exports = postRequest = function(host, port, path, data, callback) {
  data = qs.stringify(data);

  var postOptions = {
    host:host,
    port:port,
    path:path,
    method:"POST",
    headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': data.length
      }
  };

  var post_req = http.request(postOptions, function(res){
    res.setEncoding("utf8");
    res.on("data", function(apidata){
      items = apidata;
      if(callback)callback(items);
    });
  });

  post_req.write(data);
  post_req.end();
}

module.exports = deleteRequest = function(host, port, path, callback) {
  var delReq = {
    host:host,
    port:port,
    path:path,
    method:"DELETE"
  };

  http.request(delReq, function(res){
    res.setEncoding("utf8");
    res.on("data", function(apidata){
      items = apidata;
      app.set("items", items);
      if(callback)callback(items);
    });
  }).end();
};

module.exports = putRequest = function(host, port, path, data, callback) {
  data = qs.stringify(data);

  var putOptions = {
    host:host,
    port:port,
    path:path,
    method:"PUT",
    headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': data.length
      }
  };

  var put_req = http.request(putOptions, function(res){
    res.setEncoding("utf8");
    res.on("data", function(apidata){
      items = apidata;
      app.set("items", items);
      if(callback)callback(items);
    });
  });

  put_req.write(data);
  put_req.end();
};

io.on('connection', function (socket) {
  socket.on('post', function(path, message){
    console.log(message);
    postRequest("localhost", "3000", path, message, function(items){
      console.log(items);
    });
  });
  socket.on('get', function(path, message){
    getRequest("localhost", "3000", path, function(items){
      console.log(items);
    });
  });
  socket.on('delete', function(path, id){
    deleteRequest("localhost", "3000", path + id, function(items){
      console.log(items);
    });
  });
  socket.on('edit', function(path, id, message){
    putRequest("localhost", "3000", path + id, message, function(items){
      console.log(items);
    });
  });
});
}
