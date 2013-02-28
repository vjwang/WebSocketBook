/**
 * Copyright (c) 2007-2010, Kaazing Corporation. All rights reserved.
 */

// RFB protocol client. See RFC 6143, The Remote Framebuffer Protocol
RfbProtocolClient = function() {};

$prototype = RfbProtocolClient.prototype;

$prototype.connect = function(url) {
    this.socket = new WebSocket(url);
    this.socket.binaryType = "arraybuffer";
    this.stream = new CompositeStream();

    bindSocketHandlers(this, this.socket);

    this.buttonMask = 0;
    // Set first handler.
    this.readHandler = versionHandler;
}

var bindSocketHandlers = function($this, socket) {
    socket.onopen = function(e) {
        // Ignore WebSocket open event.
        // The server will send the first message.
    }

    var stream = $this.stream;
    socket.onmessage = function messageHandler(e) {
        // Append bytes to stream.
        stream.append(e.data);
        // Read handler loop.
        while($this.readHandler($this, stream)) {
            // Do nothing.
        }
    }

    socket.onclose = socket.onerror = function() {
        console.log("Connection closed", arguments);
    }
}

// Send bytes on the connection socket.
var sendBytes = function sendBytes($this, buf) {
    $this.socket.send(buf);
}

var versionHandler = function($this, stream) {
    if (stream.length < 12) {
        return false;
    }

    var version = new Uint8Array(stream.consume(12));
    // Echo back version.
    sendBytes($this, version.buffer)

    // Set next handler.
    $this.readHandler = numSecurityTypesHandler;
    return true;
}

var numSecurityTypesHandler = function($this, stream) {
    if (stream.length < 1) {
        return false;
    }
    // Take the numerical value of one byte.
    // That is the number of security types.
    $this.numSecurityTypes = stream.consumeUint8();

    // Set next handler.
    $this.readHandler = securityTypesHandler;
    return true;
}

var securityTypesHandler = function($this, stream) {
    var numSecurityTypes = $this.numSecurityTypes;
    if (stream.length < numSecurityTypes) {
        return false;
    }

    var securityTypes = [];
    for (var i=0; i< numSecurityTypes; i++) {
        securityTypes.push(stream.consumeUint8());
    }

    // Send back '1' to select the None security type. That is the easiest to
    // implement, but it provides no security.
    var noneType = new Uint8Array([1]);
    sendBytes($this, noneType.buffer);

    // Set next handler.
    $this.readHandler = authSuccessHandler;
    return true;
}

var authSuccessHandler = function($this, stream) {
    if (stream.length < 4) {
        return false;
    }
    var authSuccess = stream.consume(4);
    var word = new Uint32Array(authSuccess);
    if (word[0] != 0) {
        throw new Error("Auth failed");
    }

    // send back '1' to indicate desktop sharing is allowed
    var allowSharing = new Uint8Array([1]);
    sendBytes($this, allowSharing.buffer);

    // Set next handler.
    $this.readHandler = handleServerInit;
    return true;
}

var handleServerInit = function($this, stream) {
    if (stream.length < 24) {
        return false;
    }

    // Get dimensions.
    var width = stream.consumeUint16();
    var height = stream.consumeUint16();
    $this.width = width;
    $this.height = height;
    $this.onconnect(width, height);

    // Get pixel format. Ignore it and assume hardcoded default format.
    var bitsPerPixel = stream.consumeUint8();
    var depth = stream.consumeUint8();
    var bigEndian = stream.consumeUint8();
    var trueColor = stream.consumeUint8();
    var redMax = stream.consumeUint16();
    var greenMax = stream.consumeUint16();
    var blueMax = stream.consumeUint16();
    var redShift = stream.consumeUint8();
    var greenShift = stream.consumeUint8();
    var blueShift = stream.consumeUint8();
    stream.consume(3);     // 3 bytes of padding

    // Get name length.
    $this.nameLength = stream.consumeUint32();

    // Set next handler.
    $this.readHandler = handleName;
    return true;
}

var handleName = function($this, stream) {
    var nameLength = $this.nameLength;

    if (stream.length < nameLength) {
        return false;
    }

    var nameBytes = new Uint8Array(stream.consume(nameLength));
    $this.name = String.fromCharCode.apply(null, nameBytes);
    console.log("Connected to: " + $this.name);

    // Set allowed encodings.
    doSetEncodings($this);

    // Start requesting frames.
    doUpdateRequest($this, 0);

    // Set next handler.
    $this.readHandler = defaultHandler;
    return true;
}

var defaultHandler = function($this, stream) {
    if (stream.length < 4) {
        return false;
    }
    var type = stream.consumeUint8();

    switch(type) {
        case 0:
            stream.consume(1) // padding
            var numRectangles = stream.consumeUint16();
            $this.numRectangles = numRectangles;
            $this.readHandler = rectangleHeaderHandler;
            break;
        default:
            throw new Error("Unknown message type: " + type);
    }
    return true;
}

var rectangleHeaderHandler = function($this, stream) {
    if (stream.length < 12) {
        return false;
    }

    var header = {};

    header.xPos            = stream.consumeUint16();
    header.yPos            = stream.consumeUint16();
    header.width           = stream.consumeUint16();
    header.height          = stream.consumeUint16();
    header.encodingType    = stream.consumeUint32();

    // Set next handler.
    switch(header.encodingType) {
        case 0:
            $this.readHandler = rawHandler;
            break;
        case 1:
            $this.readHandler = copyRectHandler;
            break;
        default:
            throw new Error("Unknown encoding type: " + header.encodingType)
    }

    $this.header = header;
    return true;
}
var rawHandler = function rawHandler($this, stream) {
    var header = $this.header;
    // Assume 32 bits per pixel hardcoded.
    var length = header.width * header.height * (4);

    if (stream.length < length) {
        return false;
    }

    var pixels = new Uint8Array(stream.consume(length));

    // Paint on screen.
    client.screen.putPixels(pixels, header.width, header.height, header.xPos, header.yPos);

    // Set next handler.
    $this.numRectangles--;
    if ($this.numRectangles) {
        $this.readHandler = rectangleHeaderHandler;
    } else {
        $this.readHandler = defaultHandler;
        doUpdateRequest($this, 1);
    }
    return true;
}

var copyRectHandler = function($this, stream) {
    if (stream.length < 4) {
        return false;
    }

    var header = $this.header;
    var xSrc = stream.consumeUint16();
    var ySrc = stream.consumeUint16();

    // Copy rectangle on screen.
    client.screen.copyRect(header.width, header.height, header.xPos, header.yPos, xSrc, ySrc);

    // Set next handler.
    $this.numRectangles--;
    if ($this.numRectangles) {
        $this.readHandler = rectangleHeaderHandler;
    } else {
        $this.readHandler = defaultHandler;
        doUpdateRequest($this, 1);
    }
    return true;
}

var doSetEncodings = function doSetEncodings($this) {
  var request = new CompositeStream();

  request.appendBytes(2, 0)       // type(u8 2) padding (u8 0)
  request.appendUint16(2);        // num encodings (u16 2)
  request.appendUint32(0);        // raw (s32 0)
  request.appendUint32(1);        // copyRect (s32 1)

  sendBytes($this, request.consume(request.length));
}

var doUpdateRequest = function doUpdateRequest($this, incremental) {
    var request = new CompositeStream();

    request.appendBytes(3);             // type (u8 3)
    request.appendBytes(1);             // incremental

    request.appendBytes(0,0,0,0);       // top left corner: x (u16 0) y (u16 0)
    request.appendUint16($this.width);  // width (u16 800)
    request.appendUint16($this.height); // height (u16 600)

    sendBytes($this, request.consume(request.length));
}

var doKeyEvent = function doKeyEvent($this, key, downFlag) {
    var event = new CompositeStream();

    event.appendBytes(4);     // type (u8 4)
    event.appendBytes(downFlag);
    event.appendBytes(0,0);   // padding

    event.appendUint32(key);

    sendBytes($this, event.consume(event.length));
}

// Keys as defined by <X11/keysymdef.h> in the X Window System.
var getKey = function getKey(e) {
    var n = e.which;
    var val;

    if (n >= "A".charCodeAt(0) && n <= "Z".charCodeAt(0)) {
        // alpha keys
        return n;
    }

    if (n >= "0".charCodeAt(0) && n <= "9".charCodeAt(0)) {
        // number keys (and !@#$%^&*() when shifted)
        return n;
    }

    // Partial switch of remaining keys. May require adjustment.
    switch (n) {
        case 8:
            return 0xff08;      // backspace
        case 9:
            return 0xff09;      // tab
        case 13:
            return 0xff0d;      // return
        case 16:
            return 0xffe1;      // shift
        case 17:
            return 0xffe3;      // ctrl
        case 46:
            return 0xffff;      // delete
        case 219:
            return 91;          // left square bracket
        case 220:
            return 92;          // backslash
        case 221:
            return 93;          // right square bracket
        case 222:
            return 39;          // quote
        case 187:
            return 43;          // plus
        case 188:
            return 44;          // comma
        case 189:
            return 45;          // minus
        case 190:
            return 46;          // period
        case 191:
            return 47;          // slash
        case 32:
            return 32;          // space
        case 186:
            return 58;          // colon
    }

    return val;
}

$prototype.keyDownHandler = function keyDownHandler($this, e) {
    var key = getKey(e);
    doKeyEvent(this, key, true);
}

$prototype.keyUpHandler = function keyUpHandler($this, e) {
    var key = getKey(e);
    doKeyEvent(this, key, false);
}

var doMouseEvent = function ($this, e) {
    var event = new CompositeStream();

    event.appendBytes(5);     // type (u8 5)
    event.appendBytes($this.buttonMask);

    // position
    event.appendUint16(e.offsetX);
    event.appendUint16(e.offsetY);

    sendBytes($this, event.consume(event.length));
}

$prototype.mouseMoveHandler = function($this, e) {
    doMouseEvent($this, e);
}

$prototype.mouseDownHandler = function($this, e) {
    if (e.which == 1) {
        // left click
        $this.buttonMask ^= 1;
    } else if (e.which == 3) {
        // right click
        $this.buttonMask ^= (1<<2);
    }
    doMouseEvent($this, e);
}

$prototype.mouseUpHandler = function($this, e) {
    if (e.which == 1) {
        // left click
        $this.buttonMask ^= 1;
    } else if (e.which == 3) {
        // right click
        $this.buttonMask ^= (1<<2);
    }
    doMouseEvent($this, e);
}

// mousewheel up and down is represented by a press and release of buttons
// 4 and 5 respectively.
$prototype.mouseWheelHandler = function($this, e) {
    if(e.wheelDelta > 0) {
        $this.buttonMask |= (1<<3);
        doMouseEvent($this, e);
        $this.buttonMask ^= (1<<3);
        doMouseEvent($this, e);
    } else {
        $this.buttonMask |= (1<<4);
        doMouseEvent($this, e);
        $this.buttonMask ^= (1<<4);
        doMouseEvent($this, e);
    }
}

