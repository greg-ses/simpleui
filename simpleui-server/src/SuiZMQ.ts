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

                if (req.method === 'POST' && req.body) {        // cmd request
                    const parsed_request = {cmd: `${req.params.zmqCmd}`};
                    switch(req.get('Content-type')) {   // make packet off of content-type
                        case 'application/json': {
                            zmq_request_packet = SuiData.getXmlFromJsonArgs(req, parsed_request);
                            break;
                        }
                        case 'application/xml': {
                            zmq_request_packet = req.body;
                            break;
                        }
                        default:
                            Logger.log(LogLevel.WARNING,
                                `item_added event listener got unimplimented content-type: ${req['Content-Type']}`);
                            break;
                    }
                    Logger.log(LogLevel.INFO, `App "${req.params.appName}" received command "${parsed_request.cmd}" ` +
                        `for tab ${req.params.tabName} - forwarding to ZMQ.`);
                }
                else {                                        // data request
                    // get cmd
                    const cmd = SuiData.getCmdFromReq(req);
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
            Logger.log(LogLevel.ERROR, `Could not connect to tcp://${this.hostname}:${port} Got error: ${e}`);
            process.exit(1);
        }
    }

    send(msg: string) {
        try{
            this.socket.send(msg);
        } catch (err) {
            Logger.log(LogLevel.ERROR, `could not send zmq message:\n${msg} got error: ${err}`);
        }
    }

    close() {
        if (this.socket.closed === false) {
            this.socket.close();
        }
    }

    set_timeout(ms: number) {
        try {
            this.socket.connect_timeout = ms;
        } catch (err) {
            Logger.log(LogLevel.ERROR, `COULD NOT SET ZMQ TIMEOUT ${ms}`);
        }
    }
}


/**
 * This class handles the creation of the zmq map
 * and the destruction of the sockets
 */
export class zmq_wrapper {
    socket_map: Map<number, ZMQ_Socket_Wrapper>;

    constructor(port_list: Array<number>) {
        this.socket_map = new Map();


        port_list.forEach( (port) => {
            const zmq_wrapper_instance = new ZMQ_Socket_Wrapper('svcmachineapps', port);
            this.socket_map.set(port, zmq_wrapper_instance);
        });

        process.on('SIGINT', () => this.handleApplicationExit('SIGINT'));

        process.on('SIGTERM', () => this.handleApplicationExit('SIGTERM'));

        process.on('SIGWINCH', () => this.handleApplicationExit('SIGWINCH'));

    }

    get(port: number) {
        return this.socket_map.get(port);
    }

    size(): number {
        return this.socket_map.size;
    }

    handleApplicationExit(signalName: string) {
        Logger.log(LogLevel.INFO, `ZMQ_Socket_Wrapper recieved signal ${signalName}`);
        this.socket_map.forEach((zmq_wrapper_instance, port) => {
            Logger.log(LogLevel.INFO, `closing zmq port: ${port}`);
            zmq_wrapper_instance.close();
            // close event listeners (message, error, item_added)?
        });
    }
}
