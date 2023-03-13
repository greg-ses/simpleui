import * as WebSocket from 'ws';


export interface DataMessage {
    appName: string;
    propsStub: string;
    tabName: string;
    zmqPort: number;
    zmqCommand: string;
  }



export class SuiWebSocketServer {
    port: number;
    server: WebSocket.Server;

    constructor(port: number) {
        this.port = port;


        this.server = new WebSocket.Server({
            port: this.port
        });

        this.server.on("listening", () => {
            console.log('socket listening')
        })


        this.server.on('connection', (webSocket: WebSocket) => {

            webSocket.on('message', (raw_msg: string) => {
                let message = JSON.parse(raw_msg);
                console.log(`Got message from ${raw_msg}`);
            });

            webSocket.on('error', (err: any) => {
                console.error(`Websocket got error`, err)
            });
        })
    }
}










// import { WebSocket } from 'ws';

// export class SuiWebSocketServer {
//     server: WebSocket.Server;

//     constructor(port: number) {
//         this.server = new WebSocket.Server({ port });
//         console.log(`WebSocket server started on port ${port}`);

//         this.server.on('connection', (socket: WebSocket) => {
//             console.log('A new client connected!');

//             socket.on('message', (data: WebSocket.Data) => {
//                 console.log(`Received message: ${data}`);

//                 // Send a response back to the client
//                 socket.send('Hello from the server!');
//             });

//             socket.on('close', () => {
//                 console.log('A client disconnected.');
//             });
//         });
//     }


//     sendToClient(clientId: string, data: WebSocket.Data) {
//         this.server.clients.forEach((client: WebSocket) => {
//             if (client.readyState === WebSocket.OPEN && client['_socket'].remoteAddress === clientId) {
//                 client.send(data);
//             }
//         });
//     }
// }
