var Joi = require("joi");

var messages = function (server) {
  var db = server.settings.app.database;

  server.route({
    method: "GET",
    path: "/messages",
    config: {
      validate: {
        query: {
          offset: Joi.number().integer()
        }
      },
      pre: [
        { method: db.getMessages.bind(db), assign: "messages" }
      ],
      handler: function (request, reply) {
        var messages = request.pre.messages;
        var response = reply(messages.list);

        if (messages.offset) {
          response.header("Link", "<http://" + request.info.host + "/messages?offset=" + messages.offset + ">; rel=\"next\"");
        }
      }
    }
  });
};

module.exports = messages;
