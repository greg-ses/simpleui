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



export class ZMQ_Socket_Wrapper {
    hostname: string;
    timeout: number;
    ZMQ_SEND_MSG_TIMEOUT_ms: number;
    port: number;
    socket: any;
    http_queue: Queue;


    constructor(hostname: string, port: number, timeout: number=500, send_timeout: number=500) {
        this.hostname = hostname;
        this.timeout = timeout;
        this.ZMQ_SEND_MSG_TIMEOUT_ms = send_timeout;
        this.port = port;
        this.http_queue = new Queue();



        try {
            this.socket = _zmq.socket('req').setsockopt(_zmq.ZMQ_SNDTIMEO, this.ZMQ_SEND_MSG_TIMEOUT_ms);
            this.socket.connect_timeout = timeout;
            this.connect(this.port);

            this.socket.monitor(5000, 0); // allows for `connect` and `connect_retry` event listeners https://github.com/zeromq/zeromq.js/blob/5.x/lib/index.js#L547

            this.socket.on('connect', () => {
                Logger.log(LogLevel.VERBOSE, `ZMQ Socket ${this.hostname}:${this.port} connected`);
            });

            this.socket.on('connect_retry', () => {
                Logger.log(LogLevel.VERBOSE, `ZMQ Socket ${this.hostname}:${this.port} retrying connection...`);
            });


            this.socket.on('message', (msg) => {
                const raw_zmq_data = msg.toString();
                const zmq_data = SuiData.addXmlStatus(raw_zmq_data);
                Logger.log(LogLevel.DEBUG, `Recieved ZMQ message at port ${this.port}: ${zmq_data.substring(0, 105)}`);
                // get response + request from queue
                let [res, req] = this.http_queue.dequeue();
                // send response
                SuiData.sendResponse(req, res, zmq_data);
            });

            this.socket.on('error', (zmqErr) => {
                const zmq_data = ServerUtil.getServerError('ZMQ_ERROR', '{{ERROR}}', zmqErr);
                Logger.log(LogLevel.ERROR, `ZMQ socket at port ${this.port} got error: ${zmqErr}`);
                // get response + request from queue
                let [res, req] = this.http_queue.dequeue();
                // send response
                SuiData.sendResponse(req, res, zmq_data);
            });

            this.http_queue.events.on('item_added', () => {
                // read the most recent item
                let [_, req] = this.http_queue.elements[0];
                let zmq_request_packet = "";

                if (req.method === 'POST') {        // cmd request
                    const parsed_request = {cmd: `${req.params.zmqCmd}`};
                    if (req.headers.accept === "*/*" && req.body) {     // regular cmd request
                        zmq_request_packet = SuiData.getXmlFromJsonArgs(req, parsed_request);
                    } else if (Object.keys(req.query).includes('xml')) {    // &xml debug request
                        zmq_request_packet = req.body;
                    } else {
                        Logger.log(LogLevel.WARNING,
                            `item_added event listener got unknown request type with headers ${req.headers} and body ${req.body}`);
                    }
                    Logger.log(LogLevel.INFO, `App "${req.params.appName}" received command "${parsed_request.cmd}" ` +
                        `for tab ${req.params.tabName} - forwarding to ZMQ.`);
                }
                else {                                        // data request
                    // get data cmd
                    const cmd = SuiData.getZmqCmdFromRequest(req);
                    // create packet
                    zmq_request_packet = `<request COMMAND="${cmd.cmd}" valueName="${cmd.valueName}"/>`;
                    // log zmq details
                    Logger.log( SuiData.requestNum <= 5 ? LogLevel.INFO : LogLevel.DEBUG,
                        `zmq details:\n\ttimeout:\t${timeout}\n\tPort:\t\t${this.port}\n\tCMD:\t\t${JSON.stringify(cmd)}\n\tMsg:\t\t${zmq_request_packet}`);
                }

                // send request
                this.socket.send(zmq_request_packet);
            });


        } catch (err) {
            Logger.log(LogLevel.ERROR, `Could not create ZMQ socket at port ${this.port} got error: ${err}`);
            process.exit(1);
        }
    }

    connect(port: number) {
        try {
            Logger.log(LogLevel.VERBOSE, `ZMQ connecting to tcp://${this.hostname}:${port}`)
            this.socket.connect(`tcp://${this.hostname}:${port}`)
        } catch (e) {
            Logger.log(LogLevel.ERROR, `Could not connect to tcp://${this.hostname}:${port} ${typeof port} Got error: ${e}`);
            //process.exit(1);
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
            this.socket.unmonitor();
        }
    }

    set_timeout(ms: number) {
        try {
            this.socket.connect_timeout = ms;
        } catch (err) {
            Logger.log(LogLevel.ERROR, `Could not set zmq socket timeout: ${ms} got error: ${err}`);
        }
    }
}


/**
 * This class handles the creation and destruction of the zmq map
 * and sockets
 */
export class zmq_wrapper {
    socket_map: Map<number, ZMQ_Socket_Wrapper>;
    hostname: string;

    constructor(port_list: Array<number>, hostname: string) {
        this.socket_map = new Map();
        this.hostname = hostname;


        port_list.forEach( (port) => {
            const zmq_wrapper_instance = new ZMQ_Socket_Wrapper(hostname, port);
            this.socket_map.set(port, zmq_wrapper_instance);
        });

        process.on('SIGINT', () => this.handleApplicationExit('SIGINT'));

        process.on('SIGTERM', () => this.handleApplicationExit('SIGTERM'));

    }

    get(port: number) {
        return this.socket_map.get(port);
    }

    size(): number {
        return this.socket_map.size;
    }

    /**
     * Add a zmq socket to the socket map
     * @param port
     */
    add_socket(port: number) {
        const zmq_wrapper_instance = new ZMQ_Socket_Wrapper(this.hostname, port);
        this.socket_map.set(port, zmq_wrapper_instance);
    }

    handleApplicationExit(signalName: string) {
        Logger.log(LogLevel.INFO, `ZMQ_Socket_Wrapper recieved signal ${signalName}`);
        //process.exit(1)

        this.socket_map.forEach((zmq_wrapper_instance, port) => {
            Logger.log(LogLevel.INFO, `closing zmq port: ${port}`);
            zmq_wrapper_instance.close();
            // close event listeners (message, error, item_added)?
            // zmq_wrapper_instance.http_queue.removeEventListener('item_added', () => {})
        });
    }
}

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
            // read the most recent item
            let [_, req] = this.http_queue.elements[0];
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
                let [res, req] = this.http_queue.dequeue();
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
                let [res, req] = this.http_queue.dequeue();
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
        }, 1_000)
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
            const line = `\t${tabName} \t${status}\n`
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
