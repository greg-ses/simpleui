var _zmq = require('zeromq');

import {ServerUtil} from './server-util';
import {Logger, LogLevel} from './server-logger';
import {Queue} from './queue';


export class SuiZMQ {
    hostname: string;
    timeout: number;
    socket: any;
    connections: Array<string>;
    isListening_data: boolean;
    isListening_cmd: boolean;
    message_queue: Queue;


    constructor(hostname: string='svcmachineapps', timeout: number=1000) {
        this.hostname = hostname;
        this.timeout = timeout;
        this.connections = [];
        this.message_queue = new Queue();

        try {
            this.socket = _zmq.socket('req');
            this.socket.connect_timeout = timeout;

            process.on('SIGINT', () => {
                Logger.log(LogLevel.ERROR, 'sui_data.ts got SIGINT, shutting down and closing zmq socket...')
                this.close();
            });

            this.socket.on('message', (msg) => {
                console.log('Got a message!')
                const zmq_data = msg.toString();
                this.message_queue.enqueue(zmq_data);
                console.log(`Updated Queue: ${this.message_queue.length}`)
            });

            this.socket.on('error', (zmqErr) => {
                console.log('Got an error!!!')
                const zmq_data = ServerUtil.getServerError('ZMQ_ERROR', '{{ERROR}}', zmqErr);
                this.message_queue.enqueue(zmq_data);
            })

        } catch (err) {
            Logger.log(LogLevel.ERROR, `COULD NOT MAKE ZMQ SOCKET ${err}`)
            //process.exit(1);  
        }

    }

    connect(port: number) {
        if (this.connections.includes(`${this.hostname}:${port}`)) {
            // Logger.log(LogLevel.VERBOSE, `ZMQ connection to ${this.hostname}:${port} already made`);
        } else {
            try {
                this.socket.connect(`tcp://${this.hostname}:${port}`);
                this.connections.push(`${this.hostname}:${port}`);
            } catch (err) {
                Logger.log(LogLevel.ERROR, `Could not make zmq connection: ${err}`);
            }
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
            this.connections = [];
        }
    }

    set_timeout(ms: number) {
        try {
            this.socket.connect_timeout = ms;
        } catch (err) {
            Logger.log(LogLevel.ERROR, `COULD NOT SET ZMQ TIMEOUT`)
        }
    }
}
