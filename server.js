if (process.env.NODE_ENV == "production") {
  require("newrelic");
}

var Hapi = require("hapi");
var Bot = require("./lib/bot");
var MongoDB = require("./lib/mongodb");

var port = parseInt(process.env.PORT) || (process.env.NODE_ENV == "test" ? 0 : 3000);

var database = new MongoDB();
var bot = new Bot(database);

var server = new Hapi.Server("0.0.0.0", port, {
  app: { bot: bot, database: database },
  cors: true,
  router: { isCaseSensitive: false, stripTrailingSlash: true },
  validation: { stripUnknown: true }
});

require("./controllers/newrelic")(server);
require("./controllers/messages")(server);
require("./controllers/redirect")(server);
require("./controllers/github")(server);

if (require.main === module) {
  server.start();
}

module.exports = server;
