// Streaming Jetson demo script featuring Ringo's new async HTTP client
// Run with:
//     ringo twitterstream.js KEYWORD[,KEYWORD]

// needs valid user credentials
var username = "user";
var password = "password";

include("ringo/term");
var {Client} = require("ringo/httpclient");
var {Parser} = require("jetson");

var client = new Client(100000000); // need a way to disable timeout
var parser = new Parser(function(tweet) {
    if (tweet.user) {
        writeln(BOLD, BLUE, tweet.user.name + ":", GREEN, tweet.text);
    } 
});

client.request({
    url: "http://stream.twitter.com/1/statuses/filter.json",
    username: username,
    password: password,
    data: {track: system.args[1] || "♥"},
    part: function(content, status, contentType, exchange) {
        parser.write(content);
    },
    error: function(error) {
        writeln(BOLD, RED, "ERROR:", error);
    }
});
