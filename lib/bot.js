var irc = require("irc");

var channel = process.env.BOT_CHANNEL || "#node.dc-test";
var name = process.env.BOT_NAME || "node-dc";

var Bot = function (database) {
  this.database = database;
  this.connect();
};

Bot.prototype.connect = function () {
  this.client = new irc.Client("chat.freenode.net", name, {
    channels: [ channel ]
  });

  this.client.on("message", this.logMessage.bind(this));
  this.client.on("pm", this.replyToPM.bind(this));
};

Bot.prototype.logMessage = function (from, to, message) {
  if (!this.isPublicMessage(to)) {
    return;
  }

  this.database.storeMessage({
    from: from,
    body: message,
    sent_at: new Date()
  }, function (err) {
    if (err) {
      this.client.say(channel, "I’ve lost my mind! " + err.toString());
    }
  }.bind(this));
};

Bot.prototype.isPublicMessage = function (to) {
  return channel == to;
};

Bot.prototype.replyToPM = function (from, message) {
  this.client.say(from, "Hey " + from + "! Thanks for the message — but I’m " +
    "just a simple-minded robot, and can’t really understand you. If you’d " +
    "like to get in touch with someone in charge around here, contact one of " +
    "the organizers: http://www.meetup.com/node-dc/members/?op=leaders. If " +
    "you’re having trouble with abuse, please report it: " +
    "https://github.com/NodeDC/CodeOfConduct");
};

module.exports = Bot;
