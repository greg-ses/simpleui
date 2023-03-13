import WebSocket from 'ws';

class WebSocketServer {
    server: WebSocket.Server;

    constructor(port: number) {
        this.server = new WebSocket.Server({ port });
        console.log(`WebSocket server started on port ${port}`);

        this.server.on('connection', (socket: WebSocket) => {
            console.log('A new client connected!');

            socket.on('message', (data: WebSocket.Data) => {
                console.log(`Received message: ${data}`);

                // Send a response back to the client
                socket.send('Hello from the server!');
            });

            socket.on('close', () => {
                console.log('A client disconnected.');
            });
        });
    }


    sendToClient(clientId: string, data: WebSocket.Data) {
        this.server.clients.forEach((client: WebSocket) => {
            if (client.readyState === WebSocket.OPEN && client['_socket'].remoteAddress === clientId) {
                client.send(data);
            }
        });
    }
}


