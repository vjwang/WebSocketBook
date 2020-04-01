What you need to run this example:

  A modern browser that supports WebSocket, Canvas, TypedArrays.

  An RFB server on a virtual machine or another network accessible host.
    The server must accept RFB with anonymous logins (no passwords).
    The RFB client used as an example here does not support passwords.

  tcp-proxy.js
    Run with node. make sure websocket-example.js is in the same directory.
    This is the ws <-> tcp proxy that connects to the RFB/TCP server.
    The RFB server host and port are hardcoded into the JavaScript.
      You will want to update these.

  vnc.html (which links to vnc.css, ui.js, RfbClient.js, bytes.js)
    vnc.html: The application. Load this in your browser.
    RfbClient.js: Client implementing the RFB protocol.
    ui.js: user interface code: input events and painting canvas updates
    bytes.js: utility code to help process byte streams
    vnc.css: style sheet

