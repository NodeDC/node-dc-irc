var stubs = require("../lib/stubs");
var expect = require("expect.js");
var mocha = require("mocha");
var request = require("request");
var server = require("../../server");

describe("/ping", function () {
  it("responds with a pong", function (done) {
    server.start(function () {
      request.get(server.info.uri + "/ping", function (err, response) {
        expect(err).to.be(null);
        expect(response.statusCode).to.be(200);
        expect(response.body).to.equal("pong");
        server.stop(done);
      });
    });
  });
});
