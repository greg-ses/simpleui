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
import { HttpQueue } from './queue';



export enum ZmqConnectionStatus {
    CONNECTED = "connected",
    DELAY_CONNECTION = "wait for a response",
    RETRY_CONNECTION = "reconnecting",
    DISCONNECTED = "disconnected",
    CLOSED = "closed"
}

export class ZmqSocket {
    hostname: string;
    port: number;
    id: string;     // 'tabName-propStub'
    socket: any;
    connectionStatus: ZmqConnectionStatus;
    httpQueue: HttpQueue;
    outboundMessages: number;
    watchdogInterval: any;

    constructor(hostname: string, port: number, id: string) {
        this.hostname = hostname;
        this.port = port;
        this.id = id;
        this.connectionStatus = ZmqConnectionStatus.DISCONNECTED;
        this.httpQueue = new HttpQueue();


        this.httpQueue.events.on('item_added', () => {
            // read front of the queue
            let [req, _] = this.httpQueue.front;
            let zmqRequestPacket = "";

            if (req.method === 'POST') {
                console.log('--- got CMD')
                zmqRequestPacket = SuiData.buildZmqCmdPacket(req);
            }
            else {
                zmqRequestPacket = SuiData.buildZmqDataPacket(req);
            }
            // send request
            this.outboundMessages += 1;
            if (zmqRequestPacket.includes("cmd="))
                console.log(`Sending ZMQ: ${zmqRequestPacket}`)
            this.socket.send(zmqRequestPacket);
        });

        this.watchdogInterval = setInterval( () => {
            if (this.outboundMessages > 3) {
                this.recreateSocket();
            }
        }, 1_000);
    }


    initialize() {
        try {

            // set up socket
            this.socket = null;
            this.socket = _zmq.socket('req');
            this.socket.setsockopt(_zmq.ZMQ_LINGER, 0);
            this.socket.setsockopt(_zmq.ZMQ_CONNECT_TIMEOUT, 900);
            this.socket.setsockopt(_zmq.ZMQ_SNDTIMEO, 0);               // throw error if we cannot send message
            this.socket.setsockopt(_zmq.ZMQ_RCVTIMEO, 500);

            this.outboundMessages = 0;
            this.socket.connectionStatus = ZmqConnectionStatus.DISCONNECTED;

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
                Logger.log(LogLevel.DEBUG, `Received ZMQ message at ${this.id}: ${zmq_data.substring(0, 16)}`);
                // get response + request from queue
                let [req, res] = this.httpQueue.dequeue();
                if (typeof res === "string") {
                    Logger.log(LogLevel.DEBUG, `No more items in HTTP queue of ${this.id} to send, returning...`);
                    return;
                }
                // send response
                SuiData.sendResponse(req, res, zmq_data);

                // reset outbound messages
                this.outboundMessages = 0;

            });

            this.socket.on('error', (zmqErr) => {
                const zmq_data = ServerUtil.getServerError('ZMQ_ERROR', '{{ERROR}}', zmqErr);
                Logger.log(LogLevel.ERROR, `ZMQ socket ${this.id} got error: ${zmqErr}`);
                // get response + request from queue
                let [req, res] = this.httpQueue.dequeue();
                // send response
                SuiData.sendResponse(req, res, zmq_data);
            });
        } catch (err) {
            Logger.log(LogLevel.ERROR, `Could not initialize socket ${this.id}`);
        }
    }

    connect() {
        try {
            this.socket.connect(`tcp://${this.hostname}:${this.port}`);
        } catch (err) {
            Logger.log(LogLevel.ERROR, `Socket ${this.id} could not connect, got error ${err}`);
        }
    }

    send(msg: string) {
        try {
            this.socket.send(msg);
        } catch (err) {
            Logger.log(LogLevel.ERROR, `Socket ${this.id} could not send ${msg}, got error: ${err}`);
        }
    }

    close() {
        if (this.socket.closed === false) {
            this.socket.close();
        }
    }

    recreateSocket() {
            Logger.log(LogLevel.INFO, `Recreating the socket for ${this.id}`);
            this.close();
            this.httpQueue.flush_queue();
            this.initialize();
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
            // tslint:disable-next-line:triple-equals
            if (this.socketMap.size != 0) {
                this.logStatus();
            }
        }, 1_000);
    }

    handleApplicationExit(signalName: string) {
        Logger.log(LogLevel.INFO, `SimpleUI received signal ${signalName}`);
        this.socketMap.forEach( (socket, id) => {
            Logger.log(LogLevel.INFO, `closing socket for tab ${id} tcp://${socket.hostname}:${socket.port}`);
            socket.close();
        } )

        clearInterval(this.logInterval);
    }

    addSocket( hostname: string, port: number, id: string ) {
        try {
            const newSocket = new ZmqSocket(hostname, port, id);
            this.socketMap.set(id, newSocket);
        } catch (err) {
            Logger.log(LogLevel.INFO, `Could not add socket for ${id}, got error ${err}`);
        }
    }

    logStatus() {
        if (this.socketMap.size == 0) return;
        let msg = "\n--- ZMQ Socket Connection Status ---\n";
        msg += '\tsocket ID | connection status | outbound ZMQ messages | http queue capacity / http queue max | zmq internal queue capacity / zmq internal queue max\n'
        this.socketMap.forEach( (socket, id) => {
            const status = socket.connectionStatus;
            const line = `\t${id}\t ${status}\t ${socket.outboundMessages}\t ${socket.httpQueue.length}/${socket.httpQueue.MAX_QUEUE_SIZE}\t ${socket.socket?._outgoing?.length}/10000`;
            msg += `${line}\n`;
        });
        msg += "------------------------------------\n";
        Logger.log(LogLevel.DEBUG, msg);
    }


    get(id: string) {
        return this.socketMap.get(id);
    }

    size(): number {
        return this.socketMap.size;
    }


}
