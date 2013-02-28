/**
 * Copyright (c) 2007-2010, Kaazing Corporation. All rights reserved.
 */

Screen = function(width, height) {
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("height", height);
    this.canvas.setAttribute("width", width);
    this.context = this.canvas.getContext("2d");
}

$prototype = Screen.prototype;

function copyImageData(array, imageData) {
    var data = imageData.data;
    for(var i=0; i<array.length; i++) {
        data[i] = array[i];
    }
}

function copyAndTransformImageData(array, imageData) {
    var data = imageData.data;

    for (var i=0; i<array.length; i+=4) {
        data[i] = array[i+2];       // red
        data[i+1] = array[i+1];     // green
        data[i+2] = array[i];       // blue
        data[i+3] = 255;            // alpha
    }
}

$prototype.putPixels = function putPixels(array, width, height, xPos, yPos) {
    var imageData = this.context.createImageData(width, height);
    copyAndTransformImageData(array, imageData);
    this.context.putImageData(imageData, xPos, yPos);
}

$prototype.copyRect = function copyRect(width, height, xPos, yPos, xSrc, ySrc){
    var imageData = this.context.getImageData(xSrc, ySrc, width, height);
    this.context.putImageData(imageData, xPos, yPos);
}

VncClient = function() {};

$prototype = VncClient.prototype;

$prototype.connect = function(url, frame) {
    var $this = this;
    this.client = new RfbProtocolClient();
    this.client.onconnect = function(width, height) {
        $this.screen = new Screen(width, height);
        frame.appendChild($this.screen.canvas);
        bindHandlers($this);
    }
    this.client.connect(url);
}

var mouseDownHandler = function(e) {
    client.client.mouseDownHandler(client.client, e);
    e.preventDefault();
    return false;
}

var mouseUpHandler = function(e) {
    client.client.mouseUpHandler(client.client, e);
    e.preventDefault();
    return false;
}

var mouseWheelHandler = function(e) {
    client.client.mouseWheelHandler(client.client, e);
    e.preventDefault();
}

var mouseMoveHandler = function(e) {
    client.client.mouseMoveHandler(client.client, e);
    e.preventDefault();
}

var keyDownHandler = function(e) {
    client.client.keyDownHandler(client.client, e);
    e.preventDefault();
    return false;
}

var keyUpHandler = function(e) {
    client.client.keyUpHandler(client.client, e);
    e.preventDefault();
    return false;
}

var preventDefaultHandler = function(e) {
    e.preventDefault();
    return false;
}

var bindHandlers = function(client) {
    var canvas = client.screen.canvas;
    canvas.addEventListener("contextmenu", preventDefaultHandler, true);
    canvas.addEventListener("mousedown", mouseDownHandler, true);
    canvas.addEventListener("mouseup", mouseUpHandler, true);
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    canvas.addEventListener("mousemove", mouseMoveHandler, true);
    canvas.addEventListener("mousewheel", mouseWheelHandler, true);
}



