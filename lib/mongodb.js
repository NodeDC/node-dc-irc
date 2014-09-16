var Hapi = require("hapi");
var mongodb = require("mongodb");

var MongoDB = function () {
};

MongoDB.prototype.connect = function (callback) {
  var database = process.env.MONGODB_URI || "mongodb://localhost/node-dc-irc";
  mongodb.connect(database, {}, callback);
};

MongoDB.prototype.storeMessage = function (message, callback) {
  this.connect(function (err, db) {
    if (err) {
      return callback(err);
    }

    db.collection("messages", function (err, collection) {
      if (err) {
        return callback(err);
      }

      collection.insert(message, {}, function (err) {
        return callback(err);
      });
    });
  });
};

MongoDB.prototype.getMessages = function (request, reply) {
  var pageSize = 100;

  this.connect(function (err, db) {
    if (err) {
      return reply(Hapi.error.internal("Could not connect to database.", err));
    }

    db.collection("messages", function (err, collection) {
      if (err) {
        return reply(Hapi.error.internal("Could not retrieve messages collection.", err));
      }

      collection.count(function (err, count) {
        if (err) {
          return reply(Hapi.error.internal("Could not count messages collection.", err));
        }

        collection.find({}, {
          sort: { sent_at: -1 },
          limit: pageSize
        }).toArray(function (err, messages) {
          if (err) {
            return reply(Hapi.error.internal("Could not read messages collection.", err));
          }

          if (count > pageSize) {
            var last = messages[messages.length - 1];
            var offset = last.sent_at.getTime();
          }

          reply({ list: messages, offset: offset });
        });
      });
    });
  });
};

module.exports = MongoDB;
