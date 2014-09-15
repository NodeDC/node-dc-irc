var messages = function (server) {
  server.route({
    method: "GET",
    path: "/messages",
    handler: messages.find.bind(this, server.settings.app.database)
  });
};

messages.find = function (database, request, reply) {
  database.getMessages(function (err, messages) {
    if (err) {
      return reply(Hapi.error.internal("Failed to retrieve messages.", err));
    }

    reply(messages);
  });
};

module.exports = messages;
