var _zmq = require('zeromq');
import { clearInterval } from 'timers';
import { SuiData } from '../src/sui_data';
import { ZmqMap, ZmqSocket, ZmqConnectionStatus } from '../src/sui_zmq';


//import { Logger, LogLevel } from '../src/server-logger';
// setup logger
//Logger.setLogLevel("DEBUG");


class ZMQ_Reply_Socket {
    socket: any
    port: number;
    address: string;

    constructor(port: number) {
        try {
            this.port = port;
            this.address = `tcp://127.0.0.1:${this.port}`;
            this.socket = _zmq.socket('rep');
            this.socket.setsockopt(_zmq.ZMQ_LINGER, 0);
            this.socket.bindSync(this.address);

        } catch (err) {
           console.error(`Could not make REPLY socket on ${this.address}, got error: ${err}`);
        }
    }
    send(msg: string) {
        try {
            this.socket.send(msg);
        } catch (err) {
            console.error(`Could not send zmq message: ${msg} got error: ${err}`);
        }
    }
    close() {
        try {
            if (this.socket.closed === false) {
                this.socket.close();
                console.info(`Socket closed ${this.address}`);
            }
        } catch (err) {
            console.error(`Could not close socket ${this.address}, got error: ${err}`);
        }
    }
}





const PORT = 1234;
const HOSTNAME = '127.0.0.1';
let mock_reply_socket: ZMQ_Reply_Socket;
let test_request_socket: ZmqSocket;





describe('ZmqSocket Class testing', () => {


    beforeEach( () => {
        test_request_socket = new ZmqSocket(HOSTNAME, PORT, "test-tab");
        test_request_socket.initalize();
        mock_reply_socket = new ZMQ_Reply_Socket(PORT);

        //SuiData.zmqSocketMap = new ZmqMap();
    });
    afterEach( () => {
        test_request_socket.close();
        clearInterval(test_request_socket.watchdogInterval);
        clearInterval(SuiData.zmqSocketMap.logInterval);

        mock_reply_socket.socket.unbindSync(mock_reply_socket.address);
        mock_reply_socket.close();
    });


    // class inits properly
    test('Class instance exist', () => {
        expect(test_request_socket).toBeTruthy();
    });


    // also tests that sockets connect on init (bc of beforeEach())
    test('REQ socket should recieve message from REP socket', done => {
        const test_message = "ABCDEFG";
        test_request_socket.send(test_message);
        mock_reply_socket.socket.on('message', (raw_data: any) => {
            const zmq_msg = raw_data.toString();
            expect(zmq_msg).toEqual(test_message);
            done();
        });
    });


    test('REQ socket sends message when item is added to its queue', done => {
        let test_message = "ABCDEFG_";

        // create message listener
        mock_reply_socket.socket.on('message', (raw_data: any) => {
            const zmq_msg = raw_data.toString();
            expect(zmq_msg).toEqual(`<request COMMAND="${test_message}" valueName=""/>`);
            done();
        });

        let mock_req = {
            query: { cmd: test_message },
            params: { zmqValue: "" }
        }

        test_request_socket.httpQueue.enqueue([mock_req, {}]);
    }, 1_000);


    test.todo('REQ Socket should reconnect to REP socket if REP socket power cycles');

    test.todo('Sockets close down when SIGINT/SIGTERM is recevieved');

    test.todo('HTTP queue max size and ZMQ Socket internal queue max size should be the same value');
});




describe('ZmqMap class testing', () => {
    let testZmqMap: ZmqMap;

    beforeEach( () => {
        testZmqMap = new ZmqMap();
    });
    afterEach( () => {
        clearInterval(testZmqMap.logInterval);
    });


    test('ZmqMap is initalized', () => {
        expect(testZmqMap).toBeTruthy();
    });

    test('Should add a socket to the ZmqMap', () => {
        testZmqMap.addSocket(HOSTNAME,PORT, "test-tab");
        expect(testZmqMap.size()).toEqual(1);
    });
});


