var newrelic = function (server) {
  server.route({
    method: "GET",
    path: "/ping",
    handler: newrelic.ping
  });
};

newrelic.ping = function (request, reply) {
  if (process.env.NODE_ENV == "production") {
    require("newrelic").setIgnoreTransaction(true);
  }

  reply("pong")
    .type("text/plain");
};

module.exports = newrelic;
