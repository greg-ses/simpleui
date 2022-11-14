/**
 * Created by Zack Beucler
 * 
 * potenitally add a send timeout ZMQ_SNDTIMEO
 *                      http://api.zeromq.org/3-0:zmq-setsockopt
 *      might be good to add because zmq will wait forever if not told otherwise
 */


var _zmq = require('zeromq');
import {ServerUtil} from './server-util';
import {Logger, LogLevel} from './server-logger';
import { SuiData } from './sui_data';


export class ZMQ_Socker_Wrapper {
    hostname: string;
    timeout: number;
    port: number;
    socket: any;

    constructor(hostname: string='svcmachineapps', port: number, timeout: number=500) {
        this.hostname = hostname;
        this.timeout = timeout;
        this.port = port;

        try {
            this.socket = _zmq.socket('req');
            this.socket.connect_timeout = timeout;
            this.connect(this.port);

            this.socket.on('message', (msg) => {
                const raw_zmq_data = msg.toString();
                const zmq_data = SuiData.addXmlStatus(raw_zmq_data);
                Logger.log(LogLevel.DEBUG, `Recieved ZMQ message at port ${this.port}: ${zmq_data.substring(0, 105)}`);
                // deque response from queue
                let [req, res] = SuiData.httpQueue.dequeue();
                // send response
                SuiData.sendResponse(req, res, zmq_data);
            });

            this.socket.on('error', (zmqErr) => {
                const zmq_data = ServerUtil.getServerError('ZMQ_ERROR', '{{ERROR}}', zmqErr);
                Logger.log(LogLevel.ERROR, `ZMQ socket at port ${this.port} got error: ${zmqErr}`);
                // deque response from queue
                let [req, res] = SuiData.httpQueue.dequeue();
                // send response
                SuiData.sendResponse(req, res, zmq_data);
            });

        } catch (err) {
            Logger.log(LogLevel.ERROR, `Could not create ZMQ socket at port ${this.port} got error: ${err}`)
        }
    }

    connect(port: number) {
        try {
            Logger.log(LogLevel.VERBOSE, `ZMQ connecting to --->  tcp://${this.hostname}:${port}`)
            this.socket.connect(`tcp://${this.hostname}:${port}`)

        } catch (e) {
            Logger.log(LogLevel.ERROR, `Could not connect to tcp://${this.hostname}:${port}`);
        }
    }

    send(msg: string) {
        try{
            this.socket.send(msg);
        } catch (err) {
            Logger.log(LogLevel.ERROR, `could not send zmq message:\n${msg}`)
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
    socket_map: Map<number, ZMQ_Socker_Wrapper>;

    constructor(port_list: Array<number>) {
        this.socket_map = new Map();

        for (let port_indx = 0; port_indx < port_list.length; port_indx++) {
            const port = port_list[port_indx];
            const zmq_wrapper_instance = new ZMQ_Socker_Wrapper('svcmachineapps', port)
            this.socket_map.set(port, zmq_wrapper_instance);
        }

        
        process.on('SIGINT', () => {
            Logger.log(LogLevel.INFO, 'ZMQ got SIGINT')
            this.socket_map.forEach((zmq_wrapper_instance, port) => {
                Logger.log(LogLevel.INFO, `closing zmq port: ${port}`);
                zmq_wrapper_instance.close();
            });
        });

        process.on('SIGTERM', () => {
            Logger.log(LogLevel.INFO, 'ZMQ got SIGTERM')
            this.socket_map.forEach((zmq_wrapper_instance, port) => {
                Logger.log(LogLevel.INFO, `closing zmq port: ${port}`);
                zmq_wrapper_instance.close();
            });
        });

        process.on('SIGTERM', () => {
            Logger.log(LogLevel.INFO, 'ZMQ got SIGWINCH')
            this.socket_map.forEach((zmq_wrapper_instance, port) => {
                Logger.log(LogLevel.INFO, `closing zmq port: ${port}`);
                zmq_wrapper_instance.close();
            });
        });
        
    }

    get(port: number) {
        return this.socket_map.get(port);
    }
}



