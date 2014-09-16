var redirect = function (server) {
  server.route({
    method: "GET",
    path: "/",
    handler: redirect.toDocs
  });
};

redirect.toDocs = function (request, reply) {
  reply.redirect("https://github.com/NodeDC/node-dc-irc");
};

module.exports = redirect;
