var messages = function (server) {
  var db = server.settings.app.database;

  server.route({
    method: "GET",
    path: "/messages",
    config: {
      pre: [
        { method: db.getMessages.bind(db), assign: "messages" }
      ],
      handler: function (request, reply) {
        reply(request.pre.messages);
      }
    }
  });
};

module.exports = messages;
