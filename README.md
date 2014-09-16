# node-dc-irc

A IRC bot (and REST API) for [#node.dc on freenode.net](http://webchat.freenode.net/?channels=node.dc).

## Accessing the REST API

This app is hosted at [node-dc-irc.herokuapp.com](http://node-dc-irc.herokuapp.com).

- [GET /messages](http://node-dc-irc.herokuapp.com/messages). Returns the last 100 messages sent to the IRC channel. If the result set is incomplete (there are more than 100 messages), a Link header is sent with the URL to the next page.

```
Link: <http://node-dc-irc.herokuapp.com/messages?offset=1410826789911>; rel="next"
```

## Setting up for Local Development

**This app uses MongoDB as a database.** You’ll either need it running locally on your machine, or have access to an instance elsewhere. No further configuration is needed if it is running locally, but if you choose to access an instance elsewhere, you’ll need the MongoDB connection URI (looks something like `mongodb://…`) accessable at the `MONGODB_URI` environmental variable. See [Setting up Local Dependencies](https://github.com/NodeDC/node-dc-irc/wiki/Setting-up-Local-Dependencies) on the wiki for further assistance.

Clone the app and install NPM dependencies:

```
$ git clone https://github.com/NodeDC/node-dc-irc
$ cd node-dc-irc
$ npm install
```

Then, start the application:

```
$ npm start
```

Your chat listener will join the channel [#node.dc-test on freenode.net](http://webchat.freenode.net/?channels=node.dc-test) under the name “node-dc-test”, and you’ll be able to access the REST API at [localhost:3000](http://localhost:3000).
