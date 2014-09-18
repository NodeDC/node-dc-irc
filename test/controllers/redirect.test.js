var stubs = require("../lib/stubs");
var expect = require("expect.js");
var mocha = require("mocha");
var request = require("request");
var server = require("../../server");

describe("/", function () {
  it("redirects to GitHub repository", function (done) {
    server.start(function () {
      request.get({
        uri: server.info.uri + "/",
        followRedirect: false
      }, function (err, response) {
        expect(err).to.be(null);
        expect(response.statusCode).to.be(302);
        expect(response.headers.location).to.contain("github.com/NodeDC/node-dc-irc");
        server.stop(done);
      });
    });
  });
});
