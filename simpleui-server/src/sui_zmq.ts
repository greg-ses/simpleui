import { Request } from "zeromq";
import { ServerUtil } from './server-util';
import { Logger, LogLevel } from './server-logger';
import { SuiData } from './sui_data';
import { HttpQueue } from './queue';
import { PropsFileReader } from './props-file-reader';

// TODO: Make sure if simpleui starts before the BMS that sui can still connect

const slice_string = (data: string) => data.substring(0, 16)

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
    socket: Request;
    connectionStatus: ZmqConnectionStatus;
    httpQueue: HttpQueue;
    outboundMessages: number;
    watchdogInterval: any;
    msgCount: number;

    constructor(hostname: string, port: number, id: string) {
        this.hostname = hostname;
        this.port = port;
        this.id = id;
        this.connectionStatus = ZmqConnectionStatus.DISCONNECTED;
        this.httpQueue = new HttpQueue();
        this.msgCount = 0;


        this.httpQueue.events.on('item_added', async () => {
            // if (this.connectionStatus != ZmqConnectionStatus.CONNECTED) { return; }

            while (this.connectionStatus == ZmqConnectionStatus.CONNECTED && !this.httpQueue.isEmpty()) {
                // get front of the queue
                let [req, res] = this.httpQueue.dequeue();
                let zmqRequestPacket = req.method === 'POST' ? SuiData.buildZmqCmdPacket(req) : SuiData.buildZmqDataPacket(req);

                // dont send if in readonly mode and packet is a cmd (redundency)
                if (PropsFileReader.cmdVars?.readonly && zmqRequestPacket.includes("cmd=")) { return; }

                // send request
                Logger.log(LogLevel.DEBUG, `Socket ${id} sending ZMQ msg to ${this.hostname}`)
                this.send(zmqRequestPacket);

                // Sometimes, the socket complains when it has sent a message and gets no response (BMS is down).
                // This is because the socket will send a message and wait or a response which won't arrive (bc the BMS is down).
                // This usually has a error code 'EAGAIN' or 'EBUSY'. Since we don't really care what the response is,
                // we can just recreate the socket and reconnect
                let raw_zmq_data;
                try {
                    [raw_zmq_data] = await this.socket.receive();
                } catch (err) {
                    Logger.log(LogLevel.DEBUG, `WARNING: Socket ${this.id} got receive error: ${err.code}`);
                    this.recreateSocket();
                    return
                }

                // parse response
                const zmq_data = raw_zmq_data.toString();
                Logger.log(LogLevel.DEBUG, `Socket ${this.id} recieved ZMQ response: ${slice_string(zmq_data)}`);

                // create http response body
                const res_data = SuiData.addXmlStatus(zmq_data);

                // send response
                SuiData.sendResponse(req, res, res_data);

                // reset outbound messages
                this.outboundMessages = 0;

                this.msgCount++;

            }
        });

        this.watchdogInterval = setInterval( () => {
            if (this.outboundMessages > 3) {
                this.recreateSocket();
            }
        }, 1_000);
    }


    initialize() {
        try {
            console.log("Initalizing ZMQ socket");

            // set up socket
            this.socket = null;
            this.socket = new Request({
                linger: 0,           // dont wait for messages to be sent before closing the socket
                connectTimeout: 900, // dont wait forever to connect
                // sendTimeout: 0,
                // receiveTimeout: 500,
            });

            this.outboundMessages = 0;

            this.socket.events.on("connect", (metadata) => {
                this.connectionStatus = ZmqConnectionStatus.CONNECTED;
                Logger.log(LogLevel.DEBUG, `Socket ${this.id} connected to ${this.hostname}`);
            })
            this.socket.events.on("connect:delay", (metadata) => {
                this.connectionStatus = ZmqConnectionStatus.DELAY_CONNECTION;
            })
            this.socket.events.on("connect:retry", (metadata) => {
                this.connectionStatus = ZmqConnectionStatus.RETRY_CONNECTION;
            })
            this.socket.events.on("disconnect", (metadata) => {
                this.connectionStatus = ZmqConnectionStatus.DISCONNECTED;
                Logger.log(LogLevel.DEBUG, `Socket ${this.id} disconnected from ${this.hostname}`);
            })

            // connect socket
            this.connect();

        } catch (err) {
            Logger.log(LogLevel.ERROR, `Could not initialize socket ${this.id}. ${err}`);
        }
    }

    connect() {
        try {
            this.socket.connect(`tcp://${this.hostname}:${this.port}`);
        } catch (err) {
            Logger.log(LogLevel.ERROR, `Socket ${this.id} could not connect, got error ${err}`);
        }
    }

    async send(msg: string) {
        try {
            await this.socket.send(msg);
            Logger.log(LogLevel.DEBUG, `Sending the following ZMQ packet: ${msg}`);
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
        Logger.log(LogLevel.INFO, `Recreating the socket ${this.id}`);
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
                // this.logStatus();
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
        // if (this.socketMap.size == 0) return;
        // let msg = "\n--- ZMQ Socket Connection Status ---\n";
        // msg += '\tsocket ID | connection status | outbound ZMQ messages | http queue capacity / http queue max | zmq internal queue capacity / zmq internal queue max\n'
        // this.socketMap.forEach( (socket, id) => {
        //     const status = socket.connectionStatus;
        //     const line = `\t${id}\t ${status}\t ${socket.outboundMessages}\t ${socket.httpQueue.length}/${socket.httpQueue.MAX_QUEUE_SIZE}\t ${socket.socket?._outgoing?.length}/10000`;
        //     msg += `${line}\n`;
        // });
        // msg += "------------------------------------\n";
        // Logger.log(LogLevel.DEBUG, msg);
    }


    get(id: string) {
        return this.socketMap.get(id);
    }

    size(): number {
        return this.socketMap.size;
    }


}
