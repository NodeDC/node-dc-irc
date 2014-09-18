var stubs = require("../lib/stubs");
var expect = require("expect.js");
var mocha = require("mocha");
var sinon = require("sinon");
var request = require("request");
var fs = require("fs");
var server = require("../../server");

describe("/hooks/github", function () {
  beforeEach(function () {
    sinon.stub(server.settings.app.bot, "notice");
  });

  afterEach(function () {
    server.settings.app.bot.notice.restore();
  });

  it("rejects requests with unknown hook types", function (done) {
    server.start(function () {
      request.post({
        uri: server.info.uri + "/hooks/github",
        headers: {
          "X-Github-Event": "unknown"
        }
      }, function (err, response) {
        expect(err).to.be(null);
        expect(response.statusCode).to.be(400);
        server.stop(done);
      });
    });
  });

  it("doesn’t explode if message parsing fails", function (done) {
    var badMessage = {
      clearlyNotAGithubHookRequest: true
    };

    server.start(function () {
      request.post({
        uri: server.info.uri + "/hooks/github",
        headers: {
          "X-Github-Event": "ping"
        },
        json: badMessage
      }, function (err, response) {
        expect(err).to.be(null);
        expect(response.statusCode).to.be(500);
        server.stop(done);
      });
    });
  });

  it("parses “ping” events", function (done) {
    server.start(function () {
      request.post({
        uri: server.info.uri + "/hooks/github",
        headers: {
          "X-Github-Event": "ping"
        },
        body: fs.readFileSync(__dirname + "/../snapshots/github.ping.json")
      }, function (err, response) {
        expect(err).to.be(null);
        expect(response.statusCode).to.be(200);
        expect(server.settings.app.bot.notice.called).to.be(true);

        var notice = server.settings.app.bot.notice.lastCall.args[0];
        expect(notice).to.contain("push");
        expect(notice).to.contain("NodeDC/node-dc-irc");

        server.stop(done);
      });
    });
  });

});
