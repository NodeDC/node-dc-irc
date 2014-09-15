if (process.env.NODE_ENV == "production") {
  require("newrelic");
}

var hapi = require("hapi");
var port = parseInt(process.env.PORT) || 3000;
var server = hapi.createServer("0.0.0.0", port);

server.start();
