// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

// The Definitive Guide to HTML5 WebSocket

var websocket = require("./websocket-example");
var repl = require("repl");

var connections = Object.create(null);

var remoteMultiEval = function(cmd, context, filename, callback) {
    for (var c in connections) {
        connections[c].send(cmd);
    }
    callback(null, "(result pending)");
}

websocket.listen(9999, "localhost", function(conn) {
    conn.id = Math.random().toString().substr(2);
    connections[conn.id] = conn;
    console.log("new connection: " + conn.id);

    conn.on("data", function(opcode, data) {
        console.log("\t" + conn.id + ":\t" + data);
    });
    conn.on("close", function(code, reason) {
        console.log("closed: " + conn.id, code, reason)

        // remove connection
        delete connections[conn.id];
    });
});

repl.start({
    "eval" : remoteMultiEval
});
