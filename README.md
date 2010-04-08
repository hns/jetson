Jetson
======

An experimental streaming JSON parser for RingoJS based on [Jackson]

[Jackson]: http://jackson.codehaus.org/

Usage
-----

Currently the parser builds full JS objects and invokes the callback 
with each top-level object. This es a bit wasteful for a streaming parser
and will likely change in the near future.

    var {Parser} = require("jetson");
    var parser = new Parser(function(obj) {
        print(uneval(obj));
    });
    parser.write('{"foo": "bar"}').close();
