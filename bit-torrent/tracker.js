import dgram from 'dgram';
import { Buffer } from 'buffer';
import { URL } from 'url';
import crypto from 'crypto'

export const getPeers = (torrent, callback) => {
    const socket = dgram.createSocket('udp4');

    // Convert the announce field to a URL string
    const announceBytes = torrent.announce; // Make sure this is properly set
    const announceUrl = Buffer.from(Object.values(announceBytes)).toString('utf8'); 
    const url = new URL(announceUrl);

    // Send connection request
    const connReq = buildConnReq();
    udpSend(socket, connReq, url, () => {
        console.log("Connection request sent");
    });

    socket.on('message', response => {
        if (respType(response) === 'connect') {
            // Receive and parse connect response
            const connResp = parseConnResp(response);
            // Send announcement request
            const announceReq = buildAnnounceReq(connResp.connectionId);
            udpSend(socket, announceReq, url, () => {
                console.log("Announcement request sent");
            });
        } else if (respType(response) === 'announce') {
            // Parse announce response
            const announceResp = parseAnnounceResp(response);
            // Pass peers to callback
            callback(announceResp.peers);
        }
    });
};

function udpSend(socket, message, url, callback) {
    socket.send(message, 0, message.length, url.port, url.hostname, callback);
}

function respType(resp) {
    // Implement this function to determine the type of response
    // Example placeholder implementation
    return 'connect'; // or 'announce'
}

function buildConnReq() {
    // Implement this function to build a connection request message
    const buf = Buffer.alloc(16)
    //connection id 
    buf.writeUInt32BE(0x417,0)
    buf.writeUInt32BE(0x27101980,4)
    //action 
    buf.writeUInt32BE(0,8)
    //transaction id 
    crypto.randomBytes(4).copy(buf,12)
    return Buffer.from('connection request');
}

function parseConnResp(resp) {
    // Implement this function to parse a connection response

    return { 
        action : resp.readUInt32BE(0),
        transactionId : resp.readUInt32BE(4) ,
        connectionId : resp.slice(8)
     }; 
}

function buildAnnounceReq(connId) {
    // Implement this function to build an announce request message
    return Buffer.from('announce request');
}

function parseAnnounceResp(resp) {
    // Implement this function to parse an announce response
    return { peers: [] }; // Example placeholder
}
