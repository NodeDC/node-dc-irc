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

MongoDB.prototype.getMessages = function (callback) {
  this.connect(function (err, db) {
    if (err) {
      return callback(err);
    }

    db.collection("messages", function (err, collection) {
      if (err) {
        return callback(err);
      }

      collection.find({}, {
        sort: { sent_at: -1 },
        limit: 100
      }).toArray(callback);
    });
  });
};

module.exports = MongoDB;
