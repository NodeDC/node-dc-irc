if (process.env.NODE_ENV == "production") {
  require("newrelic");
}

var Hapi = require("hapi");
var Bot = require("./lib/bot");
var MongoDB = require("./lib/mongodb");

var port = parseInt(process.env.PORT) || 3000;

var database = new MongoDB();
var bot = new Bot(database);

var server = new Hapi.Server("0.0.0.0", port, {
  app: {
    bot: bot,
    database: database,
    url: process.env.EXTERNAL_URL || "http://localhost:3000"
  },
  cors: true,
  router: { isCaseSensitive: false, stripTrailingSlash: true }
});

require("./controllers/newrelic")(server);
require("./controllers/messages")(server);
require("./controllers/redirect")(server);

server.start();
