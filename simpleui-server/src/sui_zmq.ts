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
import {Logger, LogLevel} from './server-logger';



enum ZMQ_Connection_Status {
    CONNECTED = "Connected",
    RETRY_CONNECTING = "Reconnecting",                  // ZMQ_RCVTIMEO ended, attempt to reconnect
    DELAY_CONNECTING = "Waiting for a response",        // waiting for response for ZMQ_RCVTIMEO amount of time
    DISCONNECTED = "Disconnected",
    CLOSED = "Closed"
}

export class ZMQ_Socket_Wrapper {
    hostname: string;
    port: number;
    remote_address: string;
    connection_timeout: number;
    send_timeout: number;
    recieve_timeout: number;
    socket: any;
    connection_status: ZMQ_Connection_Status;

    constructor(hostname: string, port: number = 0, connection_timeout: number=1_000, send_timeout: number=0, recieve_timeout: number=500) {
        this.hostname = hostname;
        this.remote_address = `tcp://${hostname}:${port}`;
        this.connection_timeout = connection_timeout;
        this.send_timeout = send_timeout;
        this.recieve_timeout = recieve_timeout;
        this.connection_status = ZMQ_Connection_Status.DISCONNECTED


        try {
            this.socket = _zmq.socket('req');
            this.socket.setsockopt(_zmq.ZMQ_LINGER, 0);                 // dont wait for response before closing
            this.socket.setsockopt(_zmq.ZMQ_CONNECT_TIMEOUT, connection_timeout);
            this.socket.setsockopt(_zmq.ZMQ_SNDTIMEO, 0);               // throw error if we cannot send message
            this.socket.setsockopt(_zmq.ZMQ_RCVTIMEO, this.recieve_timeout);

            this.socket.monitor(100, 0);

            this.socket.once('connect', (data: any) => {
                this.connection_status = ZMQ_Connection_Status.CONNECTED;
            });
            this.socket.once('connect_retry', (data: any) => {
                this.connection_status = ZMQ_Connection_Status.RETRY_CONNECTING;
            });
            this.socket.once('connect_delay', (data: any) => {
                this.connection_status = ZMQ_Connection_Status.DELAY_CONNECTING;
            });
            this.socket.once('disconnect', (data: any) => {
                this.connection_status = ZMQ_Connection_Status.DISCONNECTED;
            });
            this.socket.once('close', (data: any) => {
                this.connection_status = ZMQ_Connection_Status.CLOSED;
            });
            this.socket.once('close_error', (data: any) => {
                console.log(`${this.remote_address} close_error ${data} ${data.toString()}`)
            });


            //this.connect();


            setInterval( () => {
                //console.log(`\t${this.remote_address} ${this.connection_status}`)
            }, 250);

        } catch (err) {
            Logger.log(LogLevel.ERROR, `Could not create ${this.remote_address}, got error ${err}`);
        }
    }

    connect() {
        this.socket.connect(`tcp://${this.hostname}:${this.port}`);
    }
    disconnect() {
        this.socket.connect(`tcp://${this.hostname}:${this.port}`);
    }

    send(msg: string) {
        try{
            this.socket.send(msg);
        } catch (err) {
            Logger.log(LogLevel.ERROR, `Could not send zmq message:\n${msg} got error: ${err}`);
        }
    }

    close() {
        try {
            if (this.socket.closed === false) {
                this.socket.close();
                Logger.log(LogLevel.DEBUG, `Closed ${this.remote_address}`)
            }
        } catch (err) {
            Logger.log(LogLevel.ERROR, `Could not close ${this.remote_address}, got error: ${err}`);
        }
    }


}




// export class __ZMQ_Socket_Wrapper {
//     hostname: string;
//     timeout: number;
//     ZMQ_SEND_MSG_TIMEOUT_ms: number;
//     port: number;
//     socket: any;
//     http_queue: Queue;


//     constructor(hostname: string, port: number, timeout: number=500, send_timeout: number=500) {
//         this.hostname = hostname;
//         this.timeout = timeout;
//         this.ZMQ_SEND_MSG_TIMEOUT_ms = send_timeout;
//         this.port = port;
//         this.http_queue = new Queue();



//         try {
//             this.socket = _zmq.socket('req').setsockopt(_zmq.ZMQ_SNDTIMEO, this.ZMQ_SEND_MSG_TIMEOUT_ms);
//             this.socket.connect_timeout = timeout;
//             this.connect(this.port);

//             this.socket.monitor(5000, 0); // allows for `connect` and `connect_retry` event listeners https://github.com/zeromq/zeromq.js/blob/5.x/lib/index.js#L547

//             this.socket.on('connect', () => {
//                 Logger.log(LogLevel.VERBOSE, `ZMQ Socket ${this.hostname}:${this.port} connected`);
//             });

//             this.socket.on('connect_retry', () => {
//                 Logger.log(LogLevel.VERBOSE, `ZMQ Socket ${this.hostname}:${this.port} retrying connection...`);
//             });


//             this.socket.on('message', (msg) => {
//                 const raw_zmq_data = msg.toString();
//                 const zmq_data = SuiData.addXmlStatus(raw_zmq_data);
//                 Logger.log(LogLevel.DEBUG, `Recieved ZMQ message at port ${this.port}: ${zmq_data.substring(0, 105)}`);
//                 // get response + request from queue
//                 let [res, req] = this.http_queue.dequeue();
//                 // send response
//                 SuiData.sendResponse(req, res, zmq_data);
//             });

//             this.socket.on('error', (zmqErr) => {
//                 const zmq_data = ServerUtil.getServerError('ZMQ_ERROR', '{{ERROR}}', zmqErr);
//                 Logger.log(LogLevel.ERROR, `ZMQ socket at port ${this.port} got error: ${zmqErr}`);
//                 // get response + request from queue
//                 let [res, req] = this.http_queue.dequeue();
//                 // send response
//                 SuiData.sendResponse(req, res, zmq_data);
//             });

//             this.http_queue.events.on('item_added', () => {
//                 // read the most recent item
//                 let [_, req] = this.http_queue.elements[0];
//                 let zmq_request_packet = "";

//                 if (req.method === 'POST') {        // cmd request
//                     const parsed_request = {cmd: `${req.params.zmqCmd}`};
//                     if (req.headers.accept === "*/*" && req.body) {     // regular cmd request
//                         zmq_request_packet = SuiData.getXmlFromJsonArgs(req, parsed_request);
//                     } else if (Object.keys(req.query).includes('xml')) {    // &xml debug request
//                         zmq_request_packet = req.body;
//                     } else {
//                         Logger.log(LogLevel.WARNING,
//                             `item_added event listener got unknown request type with headers ${req.headers} and body ${req.body}`);
//                     }
//                     Logger.log(LogLevel.INFO, `App "${req.params.appName}" received command "${parsed_request.cmd}" ` +
//                         `for tab ${req.params.tabName} - forwarding to ZMQ.`);
//                 }
//                 else {                                        // data request
//                     // get data cmd
//                     const cmd = SuiData.getCmdFromReq(req);
//                     // create packet
//                     zmq_request_packet = `<request COMMAND="${cmd.cmd}" valueName="${cmd.valueName}"/>`;
//                     // log zmq details
//                     Logger.log( SuiData.requestNum <= 5 ? LogLevel.INFO : LogLevel.DEBUG,
//                         `zmq details:\n\ttimeout:\t${timeout}\n\tPort:\t\t${this.port}\n\tCMD:\t\t${JSON.stringify(cmd)}\n\tMsg:\t\t${zmq_request_packet}`);
//                 }

//                 // send request
//                 this.socket.send(zmq_request_packet);
//             });


//         } catch (err) {
//             Logger.log(LogLevel.ERROR, `Could not create ZMQ socket at port ${this.port} got error: ${err}`);
//             process.exit(1);
//         }
//     }

//     connect(port: number) {
//         try {
//             Logger.log(LogLevel.VERBOSE, `ZMQ connecting to tcp://${this.hostname}:${port}`)
//             this.socket.connect(`tcp://${this.hostname}:${port}`)
//         } catch (e) {
//             Logger.log(LogLevel.ERROR, `Could not connect to tcp://${this.hostname}:${port} ${typeof port} Got error: ${e}`);
//             //process.exit(1);
//         }
//     }

//     send(msg: string) {
//         try{
//             this.socket.send(msg);
//         } catch (err) {
//             Logger.log(LogLevel.ERROR, `Could not send zmq message:\n${msg} got error: ${err}`);
//         }
//     }

//     close() {
//         if (this.socket.closed === false) {
//             this.socket.close();
//             this.socket.unmonitor();
//         }
//     }

//     set_timeout(ms: number) {
//         try {
//             this.socket.connect_timeout = ms;
//         } catch (err) {
//             Logger.log(LogLevel.ERROR, `Could not set zmq socket timeout: ${ms} got error: ${err}`);
//         }
//     }
// }


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
