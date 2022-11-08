var _zmq = require('zeromq');
import {ServerUtil} from './server-util';
import {Logger, LogLevel} from './server-logger';
import { SuiData } from './sui_data';


export class SuiZMQ {
    hostname: string;
    timeout: number;
    socket: any;
    connections: Array<string>;


    constructor(hostname: string='svcmachineapps', timeout: number=500) {
        this.hostname = hostname;
        this.timeout = timeout;
        this.connections = [];

        try {
            this.socket = _zmq.socket('req');
            this.socket.connect_timeout = timeout;

            process.on('SIGINT', () => {
                Logger.log(LogLevel.ERROR, 'sui_data.ts got SIGINT, shutting down and closing zmq socket...')
                this.close();
                process.exit(1);
            });

            
            this.socket.on('message', (msg) => {
                const raw_zmq_data = msg.toString();
                const zmq_data = SuiData.addXmlStatus(raw_zmq_data);
                
                console.log(`Got a message! ${zmq_data.substring(0, 105)}`);
                // deque response from queue
                let [req, res] = SuiData.httpQueue.dequeue();

                // send response
                SuiData.sendResponse(req, res, zmq_data);
            });



            this.socket.on('error', (zmqErr) => {
                console.log('Got an error!!!');
                const zmq_data = ServerUtil.getServerError('ZMQ_ERROR', '{{ERROR}}', zmqErr);
                // deque the response 
                // sendResponse
            });



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
                Logger.log(LogLevel.ERROR, `Could not make zmq connection to ${this.hostname}:${port} --- ${err}`);
            }
        }
    }

    async send(msg: string) {
        try{
            await this.socket.send(msg);
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
