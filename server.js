if (process.env.NODE_ENV == "production") {
  require("newrelic");
}

var Hapi = require("hapi");
var port = parseInt(process.env.PORT) || 3000;
var server = new Hapi.Server("0.0.0.0", port, {
  cors: true,
  router: { isCaseSensitive: false, stripTrailingSlash: true }
});

require("./controllers/newrelic")(server);

server.start();
