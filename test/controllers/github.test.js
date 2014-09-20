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
        headers: { "X-Github-Event": "unknown" }
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
        headers: { "X-Github-Event": "ping" },
        json: badMessage
      }, function (err, response) {
        expect(err).to.be(null);
        expect(response.statusCode).to.be(500);
        server.stop(done);
      });
    });
  });

  describe("ping event", function () {
    it("includes the types of events the hook notifies for", function (done) {
      server.start(function () {
        request.post({
          uri: server.info.uri + "/hooks/github",
          headers: { "X-Github-Event": "ping" },
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

  describe("push event", function (done) {
    var push;

    beforeEach(function () {
      push = JSON.parse(fs.readFileSync(__dirname + "/../snapshots/github.push.json", "utf8"));
    });

    it("mentions branch creation", function (done) {
      push.created = true;
      push.forced = true;

      server.start(function () {
        request.post({
          uri: server.info.uri + "/hooks/github",
          headers: { "X-Github-Event": "push" },
          json: push
        }, function (err, response) {
          expect(err).to.be(null);
          expect(response.statusCode).to.be(200);
          expect(server.settings.app.bot.notice.called).to.be(true);

          var notice = server.settings.app.bot.notice.lastCall.args[0];
          expect(notice).to.contain("new branch");
          expect(notice).to.contain("1 commit");
          expect(notice).to.contain("NodeDC/node-dc-irc:master");

          server.stop(done);
        });
      });
    });

    it("makes sense when a new branch is created with no commits", function (done) {
      push.created = true;
      push.forced = true;
      push.commits = [];

      server.start(function () {
        request.post({
          uri: server.info.uri + "/hooks/github",
          headers: { "X-Github-Event": "push" },
          json: push
        }, function (err, response) {
          expect(err).to.be(null);
          expect(response.statusCode).to.be(200);
          expect(server.settings.app.bot.notice.called).to.be(true);

          var notice = server.settings.app.bot.notice.lastCall.args[0];
          expect(notice).to.contain("new branch");
          expect(notice).to.contain("no commits");
          expect(notice).to.contain("NodeDC/node-dc-irc:master");

          server.stop(done);
        });
      });
    });

    it("mentions branch deletion", function (done) {
      server.start(function () {
        push.deleted = true;

        request.post({
          uri: server.info.uri + "/hooks/github",
          headers: { "X-Github-Event": "push" },
          json: push
        }, function (err, response) {
          expect(err).to.be(null);
          expect(response.statusCode).to.be(200);
          expect(server.settings.app.bot.notice.called).to.be(true);

          var notice = server.settings.app.bot.notice.lastCall.args[0];
          expect(notice).to.contain("deleted branch");
          expect(notice).to.contain("NodeDC/node-dc-irc:master");

          server.stop(done);
        });
      });
    });

    it("properly pluralizes a single commit", function (done) {
      server.start(function () {
        request.post({
          uri: server.info.uri + "/hooks/github",
          headers: { "X-Github-Event": "push" },
          json: push
        }, function (err, response) {
          expect(err).to.be(null);
          expect(response.statusCode).to.be(200);
          expect(server.settings.app.bot.notice.called).to.be(true);

          var notice = server.settings.app.bot.notice.lastCall.args[0];
          expect(notice).to.contain("pushed");
          expect(notice).to.contain("1 commit");
          expect(notice).to.contain("NodeDC/node-dc-irc:master");

          server.stop(done);
        });
      });
    });

    it("properly pluralizes multiple commits", function (done) {
      push.commits = push.commits.concat(push.commits);

      server.start(function () {
        request.post({
          uri: server.info.uri + "/hooks/github",
          headers: { "X-Github-Event": "push" },
          json: push
        }, function (err, response) {
          expect(err).to.be(null);
          expect(response.statusCode).to.be(200);
          expect(server.settings.app.bot.notice.called).to.be(true);

          var notice = server.settings.app.bot.notice.lastCall.args[0];
          expect(notice).to.contain("pushed");
          expect(notice).to.contain("2 commits");
          expect(notice).to.contain("NodeDC/node-dc-irc:master");

          server.stop(done);
        });
      });
    });

    it("includes force-push information", function (done) {
      push.forced = true;

      server.start(function () {
        request.post({
          uri: server.info.uri + "/hooks/github",
          headers: { "X-Github-Event": "push" },
          json: push
        }, function (err, response) {
          expect(err).to.be(null);
          expect(response.statusCode).to.be(200);
          expect(server.settings.app.bot.notice.called).to.be(true);

          var notice = server.settings.app.bot.notice.lastCall.args[0];
          expect(notice).to.contain("force-pushed");
          expect(notice).to.contain("NodeDC/node-dc-irc:master");

          server.stop(done);
        });
      });
    });

  });

});
