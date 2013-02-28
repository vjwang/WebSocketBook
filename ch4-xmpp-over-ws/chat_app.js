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

// log messages to the output area
var output = document.getElementById("output");
function log(message) {
    var line = document.createElement("div");
    line.textContent = message;
    output.appendChild(line);
}

function connectHandler(cond) {
    if (cond == Strophe.Status.CONNECTED) {
        log("connected");
        connection.send($pres());
    }
}

var url = "ws://localhost:5280/";
var connection = null;

var connectButton = document.getElementById("connectButton");
connectButton.onclick = function() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    connection = new Strophe.Connection({
        proto : new Strophe.Websocket(url)
    });
    connection.connect(username, password, connectHandler);

    // set up handlers
    connection.addHandler(messageHandler, null, "message", "chat");
    connection.addHandler(presenceHandler, null, "presence", null);
    connection.addHandler(pingHandler, "urn:xmpp:ping", "iq", "get");
}
// Create presence update UI
var presenceArea = document.getElementById("presenceArea");
var sel = document.createElement("select");
var availabilities = ["away", "chat", "dnd", "xa"];
var labels = ["Away", "Available", "Busy", "Gone"];
for (var i = 0; i < availabilities.length; i++) {
    var option = document.createElement("option");
    option.value = availabilities[i];
    option.text = labels[i];
    sel.add(option);
}
presenceArea.appendChild(sel);

var statusInput = document.createElement("input");
statusInput.setAttribute("placeholder", "status");
presenceArea.appendChild(statusInput);

var statusButton = document.createElement("button");
statusButton.textContent = "Update Status";
statusButton.onclick = function() {
    var pres = $pres().c("show").t(sel.value).up().c("status").t(statusInput.value);
    connection.send(pres)
}
presenceArea.appendChild(statusButton);

function presenceHandler(presence) {
    var from = presence.getAttribute("from");
    var show = "";
    var status = "";

    Strophe.forEachChild(presence, "show", function(elem) {
        show = elem.textContent;
    });
    Strophe.forEachChild(presence, "status", function(elem) {
        status = elem.textContent;
    });

    if (show || status) {
        log("[presence] " + from + ":" + status + " " + show);
    }

    // indicate that this handler should be called repeatedly
    return true;
}

// Create chat UI
var chatArea = document.getElementById("chatArea");
var toJid = document.createElement("input");
toJid.setAttribute("placeholder", "user@server");
chatArea.appendChild(toJid);

var chatBody = document.createElement("input");
chatBody.setAttribute("placeholder", "chat body");
chatArea.appendChild(chatBody);

var sendButton = document.createElement("button");
sendButton.textContent = "Send";
sendButton.onclick = function() {
    var message = $msg({
        to : toJid.value,
        type : "chat"
    }).c("body").t(chatBody.value);
    connection.send(message);
}
chatArea.appendChild(sendButton);

function messageHandler(message) {
    var from = message.getAttribute("from");
    var body = "";
    Strophe.forEachChild(message, "body", function(elem) {
        body = elem.textContent;
    });

    // log message if body was present
    if (body) {
        log(from + ": " + body);
    }

    // indicate that this handler should be called repeatedly
    return true;
}

function pingHandler(ping) {
    var pingId = ping.getAttribute("id");
    var from = ping.getAttribute("from");
    var to = ping.getAttribute("to");

    var pong = $iq({
        type : "result",
        "to" : from,
        id : pingId,
        "from" : to
    });
    connection.send(pong);

    // indicate that this handler should be called repeatedly
    return true;
}
