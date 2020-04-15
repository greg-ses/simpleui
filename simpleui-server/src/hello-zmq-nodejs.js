
// Hello World server
// Binds REP socket to tcp://*:16901
// Expects "Hello" from client, replies with "world"
// const BMSDataService_data_port = 16901;


const fs = require ('fs');
const zmq = require('zeromq');
const maxRequests = 10;

// socket to talk to server
console.log('Connecting to hello world server…');
const requester = zmq.socket('req');

let requestNum = 0;
let replyNum = 0;

requester.on("message", function(reply) {
    replyNum++;
    const filename = fileStub + replyNum + ".xml";
    console.log("Receive reply : " + xmlRequest + ", filename: " + filename);
    // fs.writeFileSync(filename, JSON.stringify($json));
    fs.writeFileSync(filename, reply.toString());

    if (replyNum === maxRequests) {
        requester.close();
        process.exit(0);
    }
});

requester.connect("tcp://localhost:16901");

const cmd = "EXPORT_DATA";
const valueName = "";
const THE_GET_REQUEST_TEMPLATE = "<request COMMAND=\"{{COMMAND}}\" valueName=\"{{valueName}}\"/>";    // arg1 - cmd, arg2 - valueName
let xmlRequest =
    THE_GET_REQUEST_TEMPLATE
        .replace("{{COMMAND}}", cmd)
        .replace("{{valueName}}", valueName);

const fileStub = "/var/volatile/tmp/apache2/nodejs-zmq-request-";
for (requestNum = 0; requestNum < maxRequests; requestNum++) {
    console.log("Send Request: " + xmlRequest);
    requester.send(xmlRequest);
}

process.on('SIGINT', function() {
    requester.close();
});