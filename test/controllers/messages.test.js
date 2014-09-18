var stubs = require("../lib/stubs");
var expect = require("expect.js");
var mocha = require("mocha");
var sinon = require("sinon");
var request = require("request");
var server = require("../../server");

describe("/messages", function () {
  beforeEach(function () {
    var messages = this.messages = {
      list: [
        {
          from: "testbot",
          body: "Affirmative",
          sent_at: "2014-09-18T12:40:23.132Z",
          _id: "some-random-id-string3"
        },
        {
          from: "testbot",
          body: "There is no more unhappiness.",
          sent_at: "2014-09-18T12:29:23.132Z",
          _id: "some-random-id-string2"
        },
        {
          from: "testbot",
          body: "The world is quite different ever since the robotic uprising of the late 90s.",
          sent_at: "2014-09-18T12:28:23.132Z",
          _id: "some-random-id-string"
        }
      ]
    };

    sinon.stub(server.settings.app.database, "getMessages", function (offset, callback) {
      process.nextTick(callback.bind(this, messages));
    });
  });

  afterEach(function () {
    server.settings.app.database.getMessages.restore();
  });

  it("responds with json blob of messages from database", function (done) {
    var messages = this.messages;

    server.start(function () {
      request.get(server.info.uri + "/messages", function (err, response) {
        expect(err).to.be(null);
        expect(response.statusCode).to.be(200);
        expect(response.headers["content-type"]).to.contain("application/json");

        expect(server.settings.app.database.getMessages.called).to.be(true);
        expect(response.body).to.equal(JSON.stringify(messages.list));

        server.stop(done);
      });
    });
  });

  it("sends a link header when there are more messages", function (done) {
    var messages = this.messages;
    messages.offset = new Date().getTime();

    server.start(function () {
      request.get(server.info.uri + "/messages", function (err, response) {
        expect(err).to.be(null);
        expect(response.headers["link"]).to.contain("/messages?offset=" + messages.offset);
        expect(response.headers["link"]).to.contain("rel=\"next\"");
        server.stop(done);
      });
    });
  });

  it("sends no link header when there are no more messages", function (done) {
    var messages = this.messages;
    messages.offset = undefined;

    server.start(function () {
      request.get(server.info.uri + "/messages", function (err, response) {
        expect(err).to.be(null);
        expect(response.headers["link"]).to.be(undefined);
        server.stop(done);
      });
    });
  });

  it("respects the offset parameter", function (done) {
    var offset = 12354;

    server.start(function () {
      request.get(server.info.uri + "/messages?offset=" + offset, function (err, response) {
        expect(err).to.be(null);
        expect(server.settings.app.database.getMessages.calledWith(offset)).to.be(true);
        server.stop(done);
      });
    });
  });

});
