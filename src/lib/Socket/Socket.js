import { Server as SocketIOServer } from "socket.io";
import Client from "./Client.js";

import EventEmitter from "events";

class Socket extends EventEmitter {
    #clients;

    constructor(httpServer, path) {
        super();
        this.#clients = new Map();
        this.ioServer = new SocketIOServer(httpServer, {
            path,
            cors: { origin: process.env.CORS_ORIGIN },
        });

        this.ioServer.on("connection", (socket) => {
            const client = new Client(socket);

            this.#callListeners(client, "connection");

            socket.onAny((event, data) =>
                this.#callListeners(client, event, data)
            );

            this.#clients.set(client.id, client);
        });
    }

    static createServer({ httpServer, path }) {
        const socketServer = new Socket(httpServer, path);
        return socketServer;
    }

    #callListeners(client, event, data) {
        const listeners = this.rawListeners(event);
        for (const listener of listeners) {
            listener(client, data, event);
        }
    }

    getClient(clientId) {
        return this.#clients.get(clientId);
    }

    /*
    handler: (client, data, event) => {} 
    */
    on(event, handler) {
        this.addListener(event, handler);
    }
}

export default Socket;
