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

// ActiveMQ STOMP connection URL
var url = "ws://0.0.0.0:61614/stomp";

// ActiveMQ username and password. Default value is "guest" for both.
var un, pw = "guest";

var client, src, dest;

// Variables holding the state whether the local and remote user had his/her turn yet
var hasUserPicked, hasOpponentPicked = false;

// HTML code for the opponent's three buttons and variable for opponent's pick
var opponentsBtns = '<button id="opponentRockBtn" name="opponentRock" disabled="disabled">Rock</button>' + '<button id="opponentPaperBtn" name="opponentPaper" disabled="disabled">Paper</button>' + '<button id="opponentScissorsBtn" name="opponentScissors" disabled="disabled">Scissors</button>';
var opponentsPick;

// Variables for this user's three buttons
var rockBtn, paperBtn, scissorsBtn;

// Testing whether the browser supports WebSocket. If it does, fields are rendered for users' names
$(document).ready(function() {
    if (!window.WebSocket) {
        var msg = "Your browser does not have WebSocket support. This example will not work properly.";
        $("#nameFields").css("visibility", "hidden");
        $("#instructions").css("visibility", "visible");
        $("#instructions").html(msg);
    }
});

// Getting started with the game. Invoked after this user's and opponent's name are submitted
var startGame = function() {
    // Disabling the name input fields
    $("#myName").attr("disabled", "disabled");
    $("#opponentName").attr("disabled", "disabled");
    $("#goBtn").attr("disabled", "disabled");
    // Making the instructions and buttons visible
    $("#instructions").css("visibility", "visible");
    $("#buttons").css("visibility", "visible");
    // Queues are named after the players
    dest = "/queue/" + $("#opponentName").val();
    src = "/queue/" + $("#myName").val();
    connect();
};

// Establishing the connection
var connect = function() {
    client = Stomp.client(url);
    client.connect(un, pw, onconnect, onerror);
};

// Function invoked when connection is established
var onconnect = function() {
    console.log("connected to " + url);
    client.subscribe(src, function(message) {
        console.log("message received: " + message.body);
        // The incoming message indicates that the opponent had his/her turn (picked).
        // Therefore, we draw the buttons for the opponent.
        // If this user hasn't had his/her move yet, we hide the div containing the buttons, and only display them
        // when this user has had his/her move too.
        hasOpponentPicked = true;
        if (!hasUserPicked) {
            $("#opponentsButtons").css("visibility", "hidden");
            $("#instructions").html("<p>Your opponent is waiting for you. Make your move!</p>");
        } else {
            $("#instructions").html("<p>Results:</p>");
            client.disconnect(function() {
                console.log("Disconnected...");
            })
        }
        $("#opponentsButtons").html(opponentsBtns);
        switch (message.body) {
            case "rock"     :
                opponentsPick = "#opponentRockBtn";
                break;
            case "paper"    :
                opponentsPick = "#opponentPaperBtn";
                break;
            case "scissors" :
                opponentsPick = "#opponentScissorsBtn";
                break;
        }
        $(opponentsPick).css("background-color", "yellow");
    });
    console.log("subscribed to " + src);
};

var onerror = function(error) {
    console.log(error);
};

var buttonClicked = function(btn) {
    client.send(dest, null, btn.name);
    hasUserPicked = true;
    console.log("message sent: " + btn.name);

    // Setting the background color of the button representing the user's choice to orange.
    // Disabling all the buttons (to prevent changing the vote).
    $("#" + btn.id).css("background-color", "orange");
    $("#rockBtn").attr("disabled", "disabled");
    $("#paperBtn").attr("disabled", "disabled");
    $("#scissorsBtn").attr("disabled", "disabled");
    // Checking if the other user has moved yet. If so, we display the buttons that were drawn beforehand (see onconnect).
    if (hasOpponentPicked) {
        $("#opponentsButtons").css("visibility", "visible");
        $("#instructions").html("<p>Results:</p>");
        client.disconnect(function() {
            onerror = function() {
            };
            console.log("Disconnected...");
        });
    } else {
        $("#instructions").html("<p>Waiting for opponent...</p>");
    }
};
