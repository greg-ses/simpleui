var _zmq = require('zeromq');
import { ZMQ_Socket_Wrapper } from '../src/sui_zmq';
import { Logger, LogLevel } from '../src/server-logger';

// setup logger
Logger.setLogLevel("ERROR");


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
            Logger.log(LogLevel.ERROR, `Could not make REPLY socket on ${this.address}, got error: ${err}`);
        }
    }
    send(msg: string) {
        try {
            this.socket.send(msg);
        } catch (err) {
            Logger.log(LogLevel.ERROR, `Could not send zmq message: ${msg} got error: ${err}`);
        }
    }
    close() {
        try {
            if (this.socket.closed === false) {
                this.socket.close();
                Logger.log(LogLevel.ERROR, `Socket closed`);
            }
        } catch (err) {
            Logger.log(LogLevel.ERROR, `Could not close socket ${this.port}, got error: ${err}`);
        }
    }
}





const PORT = 1234;
const HOSTNAME = '127.0.0.1';
let mock_reply_socket: ZMQ_Reply_Socket;
let test_request_socket: ZMQ_Socket_Wrapper;





describe('ZMQ_Socket_Wrapper Class testing', () => {

    afterAll( () => {
        mock_reply_socket.close();
        test_request_socket.close();
    });


    beforeEach( () => {
        mock_reply_socket = new ZMQ_Reply_Socket(PORT);
        test_request_socket = new ZMQ_Socket_Wrapper(HOSTNAME, PORT);
    });
    afterEach( () => {
        mock_reply_socket.close();
        test_request_socket.close();
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


    // times out occasionally because the socket from the previous test hasnt closed yet and therefore
    // cannot create a new socket
    test('REQ socket sends message when item is added to its queue', done => {

        let test_message = "ABCDEFG";

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
        test_request_socket.http_queue.enqueue([{}, mock_req]);
    }, 10_000);


    test.todo('REQ Socket should reconnect to REP socket if REP socket power cycles');


    test.todo('Sockets close down when SIGINT/SIGTERM is recevieved');
});

