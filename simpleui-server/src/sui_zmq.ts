/**
 * Created by Zack Beucler
 *
 ****************************** NOTE ******************************
 *
 *  A http request can only request data from a single zmq socket
 *
 ******************************************************************
 */


var _zmq = require('zeromq');
import {ServerUtil} from './server-util';
import {Logger, LogLevel} from './server-logger';
import { SuiData } from './sui_data';
import { Queue } from './queue';


enum ZMQ_Connection_Status {
    CONNECTED = "connected",
    RETRY_CONNECTING = "reconnecting",                  // ZMQ_RCVTIMEO ended, attempt to reconnect
    DELAY_CONNECTING = "Waiting for a response",        // waiting for response for ZMQ_RCVTIMEO amount of time
    DISCONNECTED = "disconnected"
}


export class ZMQ_Socket_Wrapper {
    hostname: string;
    port: number;
    remote_address: string;

    socket: any;

    http_queue: Queue;

    connection_status: ZMQ_Connection_Status;

    connection_timeout: number;
    send_timeout: number;
    receive_timeout: number;

    monitor_interval: number; // allows for `connect` and `connect_retry` event listeners https://github.com/zeromq/zeromq.js/blob/5.x/lib/index.js#L547

    messages_received: number;
    messages_sent: number;

    watchdog: any;
    watchdog_interval: number;


    constructor(hostname: string, port: number, connect_timeout: number=30_000, send_timeout: number=500) {
        this.hostname = hostname;
        this.port = port;
        this.remote_address = `tcp://${this.hostname}:${this.port}`;

        this.http_queue = new Queue();

        this.connection_status = ZMQ_Connection_Status.DISCONNECTED;

        this.connection_timeout = connect_timeout;
        this.send_timeout = send_timeout;
        this.receive_timeout = 30_000;

        this.monitor_interval = 1_000;
        this.watchdog_interval = 1_000;

        this.messages_received = 0;
        this.messages_sent = 0;





        try {
            this.socket = _zmq.socket('req');
            //this.socket.setsockopt(_zmq.ZMQ_SNDTIMEO, this.send_timeout);
            this.socket.setsockopt(_zmq.ZMQ_RCVTIMEO, this.receive_timeout);
            this.socket.setsockopt(_zmq.ZMQ_CONNECT_TIMEOUT, this.connection_timeout);
            this.socket.setsockopt(_zmq.ZMQ_LINGER, 0);
            this.connect();
            this.socket.monitor(this.monitor_interval, 0);

            this.add_connection_listeners();
            this.add_messaging_listeners();


            // this.watchdog = setInterval( () => {
            //     if ( (this.messages_sent - this.messages_received) >  4) {
            //         this.recreate_socket();
            //     }
            // }, this.watchdog_interval);

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
                    const cmd = SuiData.getCmdFromReq(req);
                    // create packet
                    zmq_request_packet = `<request COMMAND="${cmd.cmd}" valueName="${cmd.valueName}"/>`;
                    // log zmq details
                    Logger.log(
                        SuiData.requestNum <= 5 ? LogLevel.INFO : LogLevel.DEBUG,
                        `Sent ZMQ Request: \n\ttimeout: \t${this.connection_timeout}\n\tPort: \t${this.port}\n\tCMD: \t${JSON.stringify(cmd)}\n\tMsg: \t${zmq_request_packet}`
                    );
                }
                // send request
                this.messages_sent = this.messages_sent + 1;
                this.socket.send(zmq_request_packet);
            });

        } catch (err) {
            Logger.log(LogLevel.ERROR, `Could not create ZMQ socket at port ${this.port} got error: ${err}`);
        }

    }


    connect() {
        try {
            Logger.log(LogLevel.VERBOSE, `ZMQ connecting to ${this.remote_address}`);
            this.socket.connect(this.remote_address);
        } catch (e) {
            Logger.log(LogLevel.ERROR, `Could not connect to ${this.remote_address} Got error: ${e}`);
        }
    }

    send(msg: string) {
        try {
            this.socket.send(msg);
        } catch (err) {
            Logger.log(LogLevel.ERROR, `Could not send zmq message:\n${msg} got error: ${err}`);
        }
    }

    close() {
        if (this?.socket?.closed === false) {
            this.socket.unmonitor();
            this.socket.close();
        }
    }

    disconnect() {
        try {
            this.socket.disconnect(this.remote_address);
        } catch (err) {
            Logger.log(LogLevel.ERROR, `Could not disconnect ${this.remote_address}, got error: ${err}`);
        }
    }

    add_connection_listeners() {
        try {
            this.socket.on('connect', (data: any) => {
                this.connection_status = ZMQ_Connection_Status.CONNECTED;
            });
            this.socket.on('connect_retry', (data: any) => {
                this.connection_status = ZMQ_Connection_Status.RETRY_CONNECTING;
            });
            this.socket.on('connect_delay', (data: any) => {
                this.connection_status = ZMQ_Connection_Status.DELAY_CONNECTING;
            });
            this.socket.on('disconnect', (data: any) => {
                this.connection_status = ZMQ_Connection_Status.DISCONNECTED;
            });

        } catch (err) {
            Logger.log(LogLevel.ERROR, `Could not add connection listeners on port ${this.port} got error: ${err}`);
        }
    }

    add_messaging_listeners() {
        try {
            this.socket.on('message', (msg) => {
                this.messages_received = this.messages_received + 1;
                const raw_zmq_data = msg.toString();
                const zmq_data = SuiData.addXmlStatus(raw_zmq_data);

                Logger.log(LogLevel.DEBUG, `Recieved ZMQ message at port ${this.port}: ${zmq_data.substring(0, 16)}`);
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

        } catch (err) {
            Logger.log(LogLevel.ERROR, `Could not add messaging listeners on port ${this.port} got error: ${err}`);
        }
    }

    recreate_socket() {
        Logger.log(LogLevel.INFO, `Recreating ${this.hostname}:${this.port}`);
        try {
            //this.http_queue.events.removeAllListeners('item_added');

            this.socket.close();

            this.socket = null;

            this.socket = _zmq.socket('req');
            //this.socket.setsockopt(_zmq.ZMQ_SNDTIMEO, this.send_timeout);
            this.socket.setsockopt(_zmq.ZMQ_RCVTIMEO, this.receive_timeout);
            this.socket.setsockopt(_zmq.ZMQ_CONNECT_TIMEOUT, this.connection_timeout);
            this.socket.setsockopt(_zmq.ZMQ_LINGER, 0);
            this.connect();
            this.socket.monitor(this.monitor_interval, 0);

            this.connection_status = ZMQ_Connection_Status.DISCONNECTED;

            this.messages_received = 0;
            this.messages_sent = 0;

            this.add_connection_listeners();
            this.add_messaging_listeners();
        } catch (err) {
            Logger.log(LogLevel.ERROR, `Could not recreate ${this.hostname}:${this.port}, got error ${err}`);
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
    log_interval: any;

    constructor(hostname: string) {
        this.socket_map = new Map();
        this.hostname = hostname;

        process.on('SIGINT', () => this.handleApplicationExit('SIGINT'));
        process.on('SIGTERM', () => this.handleApplicationExit('SIGTERM'));

        this.log_interval = setInterval( () => {
            if (this.socket_map.size != 0) {
                this.log_status();
            }
        }, 1_000);

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
     * @param hostname (optional)
     */
    add_socket(port: number, hostname?: string) {
        try {
            const zmq_wrapper_instance = new ZMQ_Socket_Wrapper(hostname ? hostname : this.hostname, port);
            this.socket_map.set(port, zmq_wrapper_instance);
        } catch (err) {
            Logger.log(LogLevel.ERROR, `Could not add socket. Got error ${err}`);
        }
    }

    /**
     * Adds multiple zmq sockets to socket map
     * @param port_array array of port numbers
     * @param hostname (optional)
     */
    add_sockets(port_array: Array<number>, hostname?: string) {
        port_array.forEach( (port) => {
            if (!this.socket_map.has(port)) {
                const zmq_wrapper_instance = new ZMQ_Socket_Wrapper(hostname ? hostname : this.hostname, port);
                this.socket_map.set(port, zmq_wrapper_instance);
            }
        });
    }

    /**
     * closes all the sockets at once
     * @param signalName
     */
    handleApplicationExit(signalName: string) {
        Logger.log(LogLevel.INFO, `ZMQ_Socket_Wrapper recieved signal ${signalName}`);

        clearInterval(this.log_interval);

        this.socket_map.forEach((zmq_wrapper_instance, port) => {
            Logger.log(LogLevel.INFO, `closing zmq port: ${port}`);
            zmq_wrapper_instance.close();
            // close event listeners (message, error, item_added)?
            // zmq_wrapper_instance.http_queue.removeEventListener('item_added', () => {})
        });
    }


    /**
     * Logs the connection status of each zmq socket
     */
    log_status(): void {
        if (this.socket_map.size == 0) return;
        let msg = "\n--- ZMQ Socket Connection Status ---\n";
        this.socket_map.forEach( (socket_instance: ZMQ_Socket_Wrapper, port: number) => {
             const id = `${socket_instance.hostname}:${port}`;
             const status = socket_instance.connection_status;
             const queue_capacity = socket_instance.http_queue.length;
             const queue_limit = socket_instance.http_queue.MAX_QUEUE_SIZE;
             const line = `\t${id}\t ==> ${status} \tHttp queue capacity: ${queue_capacity}/${queue_limit} \tReceived/sent message: ${socket_instance.messages_received}/${socket_instance.messages_sent} \tInternal socket queue: ${socket_instance.socket?._outgoing?.length}\n`;
             msg += line;
        });
        msg += "------------------------------------\n";
        Logger.log(LogLevel.DEBUG, msg);
    }

    /**
     * Gets a list of all the ports
     * @returns Array of all the ports
     */
    get_all_ports() {
        return Array.from(this.socket_map.keys());
    }

    /**
     * Deletes a socket from the map
     * @param port
     */
    delete_socket(port: number) {
        try {
            this.socket_map.delete(port);
        } catch (err) {
            Logger.log(LogLevel.ERROR, `Could not delete socket ${port}, got error ${err}`);
        }
    }

    /**
     * Recreates a specific socket (close, delete, and replace)
     * @param port
     * @param hostname (optional)
     */
    recreate_socket(port: number, hostname?: string) {
        try {
            // get socket
            let old_socket = this.get(port);
            old_socket.close();
            this.delete_socket(port);
            this.add_socket(port, hostname);
        } catch (err) {
            Logger.log(LogLevel.ERROR, `Could not recreate socket ${port}, got error ${err}`);
        }
    }

}







// try {
//     this.socket = _zmq.socket('req').setsockopt(_zmq.ZMQ_SNDTIMEO, this.ZMQ_SEND_MSG_TIMEOUT_ms);
//     this.socket.connect_timeout = timeout;
//     this.connect(this.port);

//     this.socket.monitor(this.ZMQ_monitor_interval_ms, 0);

//     this.socket.on('connect', (data: any) => {
//         this.connection_status = ZMQ_Connection_Status.CONNECTED;
//         this.reconnect_attempt = 0;
//     });

//     this.socket.on('connect_retry', (data: any) => {
//         this.connection_status = ZMQ_Connection_Status.CONNECTING;
//         this.reconnect_attempt++;
//     });

//     this.socket.on('disconnect', (data: any) => {
//         this.connection_status = ZMQ_Connection_Status.DISCONNECTED;
//         this.reconnect_attempt = 0;
//     });


//     this.socket.on('message', (msg) => {
//         const raw_zmq_data = msg.toString();
//         const zmq_data = SuiData.addXmlStatus(raw_zmq_data);
//         Logger.log(LogLevel.DEBUG, `Recieved ZMQ message at port ${this.port}: ${zmq_data.substring(0, 16)}`);
//         // get response + request from queue
//         let [res, req] = this.http_queue.dequeue();
//         // send response
//         SuiData.sendResponse(req, res, zmq_data);
//     });

//     this.socket.on('error', (zmqErr) => {
//         const zmq_data = ServerUtil.getServerError('ZMQ_ERROR', '{{ERROR}}', zmqErr);
//         Logger.log(LogLevel.ERROR, `ZMQ socket at port ${this.port} got error: ${zmqErr}`);
//         // get response + request from queue
//         let [res, req] = this.http_queue.dequeue();
//         // send response
//         SuiData.sendResponse(req, res, zmq_data);
//     });

//     this.http_queue.events.on('item_added', () => {
//         // read the most recent item
//         let [_, req] = this.http_queue.elements[0];
//         let zmq_request_packet = "";

//         if (req.method === 'POST') {        // cmd request
//             const parsed_request = {cmd: `${req.params.zmqCmd}`};
//             if (req.headers.accept === "*/*" && req.body) {     // regular cmd request
//                 zmq_request_packet = SuiData.getXmlFromJsonArgs(req, parsed_request);
//             } else if (Object.keys(req.query).includes('xml')) {    // &xml debug request
//                 zmq_request_packet = req.body;
//             } else {
//                 Logger.log(LogLevel.WARNING,
//                     `item_added event listener got unknown request type with headers ${req.headers} and body ${req.body}`);
//             }
//             Logger.log(LogLevel.INFO, `App "${req.params.appName}" received command "${parsed_request.cmd}" ` +
//                 `for tab ${req.params.tabName} - forwarding to ZMQ.`);
//         }
//         else {                                        // data request
//             // get data cmd
//             const cmd = SuiData.getCmdFromReq(req);
//             // create packet
//             zmq_request_packet = `<request COMMAND="${cmd.cmd}" valueName="${cmd.valueName}"/>`;
//             // log zmq details
//             Logger.log( SuiData.requestNum <= 5 ? LogLevel.INFO : LogLevel.DEBUG,
//                 `zmq request details:\n\ttimeout:\t${timeout}\n\tPort:\t\t${this.port}\n\tCMD:\t\t${JSON.stringify(cmd)}\n\tMsg:\t\t${zmq_request_packet}`);
//         }

//         // send request
//         this.socket.send(zmq_request_packet);
//     });


// } catch (err) {
//     Logger.log(LogLevel.ERROR, `Could not create ZMQ socket at port ${this.port} got error: ${err}`);
//     process.exit(1);
// }
