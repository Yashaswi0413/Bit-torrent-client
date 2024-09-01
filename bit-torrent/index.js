import fs from 'fs';
import bencode from 'bencode';
import dgram from 'dgram';
import { URL } from 'url';
import {getPeers} from './tracker.js'

// Read and decode the torrent file
const torrent = bencode.decode(fs.readFileSync('puppy.torrent'));

console.log(getPeers(torrent, peers =>{
    console.log("list of peers : ",peers);
}));


// Convert the byte array to a string
const announceBytes = torrent.announce;
const announceUrl = Buffer.from(Object.values(announceBytes)).toString('utf8');

// Parse the URL
const url = new URL(announceUrl);
console.log('Announce URL:', announceUrl);

// Create a UDP socket
const socket = dgram.createSocket('udp4');

// Message to send
const myMsg = Buffer.from('hello', 'utf-8');

// Send the message
socket.send(myMsg, 0, myMsg.length, url.port, url.hostname, (err) => {
    if (err) {
        console.error('Error sending message:', err);
        return;
    }
    console.log("Message sent");
});

// Handle incoming messages
socket.on('message', (msg) => {
    console.log("Message received:", msg.toString());
});

// Handle socket errors
socket.on('error', (err) => {
    console.error('Socket error:', err);
});

// Close the socket on process exit
process.on('exit', () => {
    socket.close();
});
