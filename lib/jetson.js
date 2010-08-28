var strings = require("ringo/utils/strings");
var arrays = require("ringo/utils/arrays");

export("Parser");

function Parser(callback) {
    var f = org.codehaus.jackson.JsonFactory();
    var r = new java.io.PipedReader();
    var w = new java.io.PipedWriter();
    w.connect(r);
    var p = f.createJsonParser(r);
    var ob = new ObjectBuilder(callback);

    this.write = function(content) {
        w.write(content);
        w.flush();
        return this;
    };

    this.close = function() {
        w.close();
    };

    new java.lang.Thread(function() {
        while(p.nextToken()) {
            var token = String(p.getCurrentToken());
            if (strings.startsWith(token, "VALUE_")) {
                var arg = 
                    token == "VALUE_FALSE" ? false :
                    token == "VALUE_NULL" ? null :
                    token == "VALUE_NUMBER_FLOAT" ? p.getDoubleValue() :
                    token == "VALUE_NUMBER_INT" ? p.getLongValue() :
                    token == "VALUE_STRING" ? p.getText():
                    token == "VALUE_TRUE" ? true : null;
                ob.value(arg);
            } else if (token == "FIELD_NAME") {
                ob.name(p.getText());
            } else {
                var event = strings.toCamelCase(token.toLowerCase());
                ob[event]();
            }
        }
    }).start();
}

function ObjectBuilder(callback) {
    var stack = [];
    var name;

    this.startObject = function() {
        var current = arrays.peek(stack);
        if (current instanceof Object) {
            stack.push(current[name] = {});
            delete name;
        } else if (current instanceof Array) {
            var obj = {};
            current.push(obj);
            stack.push(obj);
        } else {
            if (current !== undefined) {
                if (stack.length > 1) {
                    throw new Error("Inconsistent state");
                }
                // primitive top level item
                callback(stack.pop());
            }
            stack.push({});
        }
    };

    this.endObject = function() {
        var obj = stack.pop();
        if (stack.length == 0) {
            callback(obj);
        }
    };

    this.startArray = function() {
        var current = arrays.peek(stack);
        if (current instanceof Object) {
            stack.push(current[name] = []);
            delete name;
        } else if (current instanceof Array) {
            var arr = [];
            current.push(arr);
            stack.push(arr);
        } else {
            if (current !== undefined) {
                if (stack.length > 1) {
                    throw new Error("Inconsistent state");
                }
                // primitive top level item
                callback(stack.pop());
            }
            stack.push([]);
        }
    };

    this.endArray = function() {
        var arr = stack.pop();
        if (stack.length == 0) {
            callback(arr);
        }
    };

    this.name = function(n) {
        name = n;
    };

    this.value = function(value) {
        var current = arrays.peek(stack);
        if (current instanceof Object) {
            current[name] = value;
            delete name;
        } else if (current instanceof Array) {
            current.push(value);
        } else {
            if (current !== undefined) {
                if (stack.length > 1) {
                    throw new Error("Inconsistent state");
                }
                // primitive top level item
                callback(stack.pop());
            }
            stack.push(value);
        }
    };
}
