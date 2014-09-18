var Bot = require("../../lib/bot");
var MongoDB = require("../../lib/mongodb");
var sinon = require("sinon");

// Prevent test runs from connecting to IRC or MongoDB.
sinon.stub(Bot.prototype, "connect");
sinon.stub(MongoDB.prototype, "connect");
