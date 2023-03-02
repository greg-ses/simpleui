/**
 * Created by Zack Beucler
 *
 ****************************** NOTE ******************************
 *
 *  An http request can only request data from a single zmq socket
 *
 ******************************************************************
 */


var _zmq = require('zeromq');
import {ServerUtil} from './server-util';
import {Logger, LogLevel} from './server-logger';
import { SuiData } from './sui_data';
import { Queue } from './queue';



enum ZmqConnectionStatus {
    CONNECTED = "connected",
    DELAY_CONNECTION = "wait for a respsonse",
    RETRY_CONNECTION = "reconnecting",
    DISCONNECTED = "disconnected",
    CLOSED = "closed"
}

class ZmqSocket {
    hostname: string;
    port: number;
    tabName: string;
    socket: any;
    connectionStatus: ZmqConnectionStatus;
    http_queue: Queue;

    constructor(hostname: string, port: number, tab: string) {
        this.hostname = hostname;
        this.port = port;
        this.tabName = tab;
        this.connectionStatus = ZmqConnectionStatus.DISCONNECTED;
        this.http_queue = new Queue();

        this.http_queue.events.on('item_added', () => {
            // read front of the queue
            let [req, _] = this.http_queue.elements[0];
            let zmqRequestPacket = "";

            if (req.method === 'POST') {
                zmqRequestPacket = SuiData.buildZmqCmdPacket(req);
            }
            else {
                zmqRequestPacket = SuiData.buildZmqDataPacket(req);
            }
            // send request
            this.socket.send(zmqRequestPacket);
        });
    }


    initalize() {
        try {

            // set up socket
            this.socket = null;
            this.socket = _zmq.socket('req');
            this.socket.setsockopt(_zmq.ZMQ_LINGER, 0);
            this.socket.setsockopt(_zmq.ZMQ_CONNECT_TIMEOUT, 900);
            this.socket.setsockopt(_zmq.ZMQ_SNDTIMEO, 0);               // throw error if we cannot send message
            this.socket.setsockopt(_zmq.ZMQ_RCVTIMEO, 500);

            // set up socket monitoring
            this.socket.monitor(250, 0);
            this.socket.on('connect', (data: any) => {
                this.connectionStatus = ZmqConnectionStatus.CONNECTED;
            });
            this.socket.on('connect_retry', (data: any) => {
                this.connectionStatus = ZmqConnectionStatus.RETRY_CONNECTION;
            });
            this.socket.on('connect_delay', (data: any) => {
                this.connectionStatus = ZmqConnectionStatus.DELAY_CONNECTION;
            });
            this.socket.on('disconnect', (data: any) => {
                this.connectionStatus = ZmqConnectionStatus.DISCONNECTED;
            });
            this.socket.on('close', (data: any) => {
                this.connectionStatus = ZmqConnectionStatus.CLOSED;
            });

            // connect socket
            this.connect();

            // add message listeners
            this.socket.on('message', (msg) => {
                const raw_zmq_data = msg.toString();
                const zmq_data = SuiData.addXmlStatus(raw_zmq_data);

                Logger.log(LogLevel.DEBUG, `Recieved ZMQ message at ${this.tabName}: ${zmq_data.substring(0, 16)}`);
                // get response + request from queue
                let [req, res] = this.http_queue.dequeue();
                if (typeof res === "string") {
                    Logger.log(LogLevel.DEBUG, `No more items in HTTP queue of ${this.tabName} to send, returning...`);
                    return;
                }
                // send response
                SuiData.sendResponse(req, res, zmq_data);
            });

            this.socket.on('error', (zmqErr) => {
                const zmq_data = ServerUtil.getServerError('ZMQ_ERROR', '{{ERROR}}', zmqErr);
                Logger.log(LogLevel.ERROR, `ZMQ socket ${this.tabName} got error: ${zmqErr}`);
                // get response + request from queue
                let [req, res] = this.http_queue.dequeue();
                // send response
                SuiData.sendResponse(req, res, zmq_data);
            });
        } catch (err) {
            Logger.log(LogLevel.ERROR, `Could not initalize socket ${this.tabName}`);
        }
    }

    connect() {
        try {
            this.socket.connect(`tcp://${this.hostname}:${this.port}`);
        } catch (err) {
            Logger.log(LogLevel.ERROR, `Socket ${this.tabName} could not connect, got error ${err}`);
        }
    }

    send(msg: string) {
        try{
            this.socket.send(msg);
        } catch (err) {
            Logger.log(LogLevel.ERROR, `Could not send zmq message:\n${msg} got error: ${err}`);
        }
    }

    close() {
        if (this.socket.closed === false) {
            this.socket.close();
        }
    }
}



export class ZmqMap {
    socketMap: Map<string, ZmqSocket>;
    logInterval: any;

    constructor() {
        this.socketMap = new Map();
        process.once('SIGINT', () => this.handleApplicationExit('SIGINT'));
        process.once('SIGTERM', () => this.handleApplicationExit('SIGTERM'));

        this.logInterval = setInterval( () => {
            if (this.socketMap.size != 0) {
                this.logStatus()
            }
        }, 1_000);
    }

    handleApplicationExit(signalName: string) {
        Logger.log(LogLevel.INFO, `SimpleUI recieved signal ${signalName}`);
        this.socketMap.forEach( (socket, tab) => {
            Logger.log(LogLevel.INFO, `closing socket for tab ${tab} tcp://${socket.hostname}:${socket.port}`);
        } )
    }

    addSocket( hostname: string, port: number, tab: string ) {
        try {
            const newSocket = new ZmqSocket(hostname, port, tab);
            this.socketMap.set(tab, newSocket);
        } catch (err) {
            Logger.log(LogLevel.INFO, `Could not add socket for ${tab}, got error ${err}`);
        }
    }

    logStatus() {
        if (this.socketMap.size == 0) return;
        let msg = "\n--- ZMQ Socket Connection Status ---\n";
        this.socketMap.forEach( (socket, tabName) => {
            const status = socket.connectionStatus;
            const line = `\t${tabName}\t ${status}\n`
            msg += line;
        });
        msg += "------------------------------------\n";
        Logger.log(LogLevel.DEBUG, msg);
    }


    get(tabName: string) {
        return this.socketMap.get(tabName);
    }

    size(): number {
        return this.socketMap.size;
    }


}
