/**
 * Created by Zack Beucler
 *
 * potenitally add a send timeout ZMQ_SNDTIMEO
 *                      http://api.zeromq.org/3-0:zmq-setsockopt
 *      might be good to add because zmq will wait forever if not told otherwise
 *
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
    port: number;
    socket: any;
    http_queue: Queue;


    constructor(hostname: string, port: number, timeout: number=500) {
        this.hostname = hostname;
        this.timeout = timeout;
        this.port = port;
        this.http_queue = new Queue();

        try {
            this.socket = _zmq.socket('req');
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

        } catch (err) {
            Logger.log(LogLevel.ERROR, `Could not create ZMQ socket at port ${this.port} got error: ${err}`);
            process.exit(1);
        }
    }

    connect(port: number) {
        try {
            Logger.log(LogLevel.VERBOSE, `ZMQ connecting to --->  tcp://${this.hostname}:${port}`)
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


    handleApplicationExit(type: string) {
        Logger.log(LogLevel.INFO, `ZMQ got ${type}`);
        this.socket_map.forEach((zmq_wrapper_instance, port) => {
            Logger.log(LogLevel.INFO, `closing zmq port: ${port}`);
            zmq_wrapper_instance.close();
        });
    }
}

