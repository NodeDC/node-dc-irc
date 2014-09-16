var messages = function (server) {
  var db = server.settings.app.database;
  var url = server.settings.app.url;

  server.route({
    method: "GET",
    path: "/messages",
    config: {
      pre: [
        { method: db.getMessages.bind(db), assign: "messages" }
      ],
      handler: function (request, reply) {
        var messages = request.pre.messages;
        var response = reply(messages.list);

        if (messages.offset) {
          response.header("Link", "<" + url + "/messages?offset=" + messages.offset + ">; rel=\"next\"");
        }
      }
    }
  });
};

module.exports = messages;
