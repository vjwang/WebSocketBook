/**
 * Copyright (c) 2007-2010, Kaazing Corporation. All rights reserved.
 */

/**
 * Stream utility with fast appends, prepends, and linear reads.
 * This is useful for building up a buffer of protocol data that grows until
 * it can contain expected data of a given size.
 */
CompositeStream = function() {
    this.chunks = [];
    this.length = 0;
}

var $prototype = CompositeStream.prototype;

// Append an ArrayBuffer.
$prototype.append = function append(b) {
    this.chunks.push(new Uint8Array(b));
    this.length += b.byteLength;
    return this;
}

$prototype.appendBytes = function appendBytes() {
    ba = new Uint8Array(arguments);
    this.append(ba.buffer);
}

$prototype.appendUint16 = function appendUint16(n) {
    var b = new ArrayBuffer(2);
    var dv = new DataView(b);
    dv.setUint16(0, n);
    this.append(b);
}

$prototype.appendUint32 = function appendUint32(n) {
    var b = new ArrayBuffer(4);
    var dv = new DataView(b);
    dv.setUint32(0, n);
    this.append(b);
}

// Prepend an ArrayBuffer.
$prototype.prepend = function append(b) {
    this.chunks.unshift(b);
    this.length += b.byteLength;
    return this;
}

$prototype.consume = function consume(n) {
    if (n > this.length) {
        return null;
    }
    var result = new Uint8Array(n);
    var ri = 0;
    var scannedLength = 0;
    var chunks = this.chunks;
    // Skip over chunks until n or more bytes have been seen.
    for (var idx=0; true; idx++) {
        var chunk = chunks.shift();
        scannedLength += chunk.byteLength;
        if (scannedLength >= n){ 
            // Add partial array to result
            for (var i=0; ri<n; i++) {
                result[ri++] = chunk[i];
            }
            // Save unused remainer back into chunk array.
            var remainder = new Uint8Array(scannedLength - n);
            for (var j=0; i<chunk.byteLength; i++) {
                remainder[j++] = chunk[i];
            }
            chunks.unshift(remainder);
            break;
        } else {
            // Consume entire chunk.
            for (var i=0; i<chunk.byteLength; i++) {
                result[ri++] = chunk[i];
            }
        }
    }

    // Update length.
    this.length = this.length - n;
    // Return n leading bytes.
    return result.buffer;
}

$prototype.consumeUint8 = function consumeUint16() {
    var b = this.consume(1);
    var dv = new DataView(b);
    return dv.getUint8(0);
}

$prototype.consumeUint16 = function consumeUint16() {
    var b = this.consume(2);
    var dv = new DataView(b);
    return dv.getUint16(0);
}

$prototype.consumeUint32 = function consumeUint32() {
    var b = this.consume(4);
    var dv = new DataView(b);
    return dv.getUint32(0);
}

