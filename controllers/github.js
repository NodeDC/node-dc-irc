var Joi = require("joi");
var Hapi = require("hapi");

var github = function (server) {
  var bot = server.settings.app.bot;

  server.route({
    method: "POST",
    path: "/hooks/github",
    config: {
      validate: {
        headers: {
          "x-github-event": Joi.string().required().valid(Object.keys(github.parsers))
        }
      },
      handler: function (request, reply) {
        var parser = github.parsers[request.headers["x-github-event"]];
        var message;

        if (parser) {
          try {
            message = parser(request.payload);
          }
          catch (e) {
            return reply(Hapi.error.internal("Parser of event type '" +
              request.headers["x-github-event"] + "' threw error while " +
              "parsing the request.", e));
          }

          if (message) {
            bot.notice(message);
          }

          reply(message)
            .type("text/plain");
        }
        else {
          return reply(Hapi.error.internal("Event type known, but failed to find parser."));
        }
      }
    }
  });
};

github.parsers = {
  ping: function (payload) {
    var message = [];
    var problematicHooks = [];

    message.push("Wahoo! GitHub is now configured to notify here on " +
      englishize(payload.hook.events) + ".");

    for (var i = 0; i < payload.hook.events.length; i++) {
      var hook = payload.hook.events[i];
      if (!github.parsers[hook]) {
        problematicHooks.push(hook);
      }
    };

    if (problematicHooks.length) {
      message.push("That’s great and all, but I don’t yet understand how to " +
        "tell you about " + englishize(problematicHooks) + ". See " +
        "https://github.com/NodeDC/node-dc-irc to make me smarter!");
    }

    message.push("In the words of GitHub, “" + payload.zen + "”");

    return message.join(" ");
  },

  pull_request: function (payload) {
    var message = [];
    var ignoreNotification = null;

    message.push(payload.pull_request.user.login);

    switch (payload.action) {
      case "opened":
        message.push("would like your feedback on a merge from");
        break;

      case "closed":
        if (payload.pull_request.merged) {
          message.push("has just merged");
        }
        else {
          message.push("has decided we should not merge");
        }
        break;

      case "reopened":
        message.push("has re-opened a pull request from");
        break;

      default:
        return ignoreNotification;
    }

    message.push(payload.pull_request.head.repo.full_name + ":" +
      payload.pull_request.head.ref + " into " +
      payload.pull_request.base.repo.full_name + ":" +
      payload.pull_request.base.ref + " — " +
      payload.pull_request.html_url + ".");

    return message.join(" ");
  }
};

var englishize = function (list) {
  if (list.length <= 2) {
    return list.join(" and ");
  }

  return list.slice(0, list.length - 1).join(", ") + ", and " + last;
};

module.exports = github;
