import { Request } from "zeromq";
import { ServerUtil } from './server-util';
import { Logger, LogLevel } from './server-logger';
import { SuiData } from './sui_data';
import { HttpQueue } from './queue';
import { PropsFileReader } from './props-file-reader';


/**
 * [x] sui will reconnect if BMS restarts (connected, disconnected, connecting, connected)
 * [x] sui will connect if the BMS is down and then comes back up (disconnected, connecting, connected)
 * [ ] multiple clients get the correct data
 * [ ] ?
 */


export enum ZmqConnectionStatus {
    CONNECTED = "connected",
    DELAY_CONNECTION = "wait for a response",
    RETRY_CONNECTION = "reconnecting",
    DISCONNECTED = "disconnected",
    CLOSED = "closed"
}

const slice_string = (data: string) => data.substring(0, 16)

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
    waitingForResponse: boolean;
    sendingRequest: boolean;

    constructor(hostname: string, port: number, id: string) {
        this.hostname = hostname;
        this.port = port;
        this.id = id;
        this.connectionStatus = ZmqConnectionStatus.DISCONNECTED;
        this.httpQueue = new HttpQueue();
        this.msgCount = 0;
        this.waitingForResponse = false;
        this.sendingRequest = false;

    }

    /**
     * Reads the socket's queue and will send and wait for a response
     */
    async process() {

        // socket is ready if we are connected, if we are not wating for a response, and if we are not currently trying to send.
        const socketIsReady = (this.connectionStatus == ZmqConnectionStatus.CONNECTED) &&
                            (!this.waitingForResponse) && (!this.sendingRequest);

        // don't continue unless the socket is ready
        if (!socketIsReady) { return; }

        while (!this.httpQueue.isEmpty()) {
            // 1. Get the oldest http request (front of queue)
            let [req, res] = this.httpQueue.dequeue();

            // 2. Generate the ZMQ data packet
            const zmqPacket = req.method === 'POST' ? SuiData.buildZmqCmdPacket(req) : SuiData.buildZmqDataPacket(req);

            // 3. Make sure that if the app is in read-only mode, we do not send commands (for redundency)
            if (PropsFileReader.cmdVars?.readonly && zmqPacket.includes("cmd=")) { return; }

            // 4. Send the ZMQ request
            this.send(zmqPacket);

            // 5. Wait for a response
            let rawZmqResponse;
            try {
                this.waitingForResponse = true;
                rawZmqResponse = await this.socket.receive();
                this.waitingForResponse = false;
            } catch (err) {
                console.log(`Socket ${this.id} got error while recieving ${err?.code}`);
                // NOTE: If we can't receieve the response, its no big deal. We care mostly that the request got to the BMS
                rawZmqResponse = Buffer.from("<response>fail</response>");
            }

            // 6. Parse the ZMQ response
            const zmqResponse = rawZmqResponse.toString();

            // 7. Create the HTTP response
            const responseBody = SuiData.addXmlStatus(zmqResponse);

            // 8. Send the HTTP response
            SuiData.sendResponse(req, res, responseBody);
        }
    }


    initialize() {
        try {
            Logger.log(LogLevel.INFO, `Initializing socket ${this.id}`);

            // set up socket
            this.socket = new Request({
                linger: 0,           // dont wait for messages to be sent before closing the socket
                // connectTimeout: 900, // dont wait forever to connect
            });

            this.outboundMessages = 0;

            this.socket.events.on("connect", (metadata) => {
                this.connectionStatus = ZmqConnectionStatus.CONNECTED;
                Logger.log(LogLevel.DEBUG, `Socket ${this.id} connected to ${this.hostname}`);
            });
            this.socket.events.on("connect:delay", (metadata) => {
                this.connectionStatus = ZmqConnectionStatus.DELAY_CONNECTION;
            });
            this.socket.events.on("connect:retry", (metadata) => {
                this.connectionStatus = ZmqConnectionStatus.RETRY_CONNECTION;
            });
            this.socket.events.on("disconnect", (metadata) => {
                this.connectionStatus = ZmqConnectionStatus.DISCONNECTED;
                Logger.log(LogLevel.DEBUG, `Socket ${this.id} disconnected from ${this.hostname}`);
            });

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
            this.sendingRequest = true;
            await this.socket.send(msg);
            Logger.log(LogLevel.DEBUG, `Socket ${this.id} sending ZMQ msg to ${this.hostname} ${msg}`);
        } catch (err) {
            Logger.log(LogLevel.ERROR, `Socket ${this.id} could not send ${msg}, got error: ${err}`);
        }
        this.sendingRequest = false;
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
