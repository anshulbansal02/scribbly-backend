import { Server as SocketIOServer } from "socket.io";
import Client from "./Client.js";

import EventEmitter from "events";

class Socket extends EventEmitter {
    #clients;
    #middlewares;

    constructor(httpServer, path) {
        super();
        this.#clients = new Map();
        this.#middlewares = {};
        this.ioServer = new SocketIOServer(httpServer, {
            path,
            cors: { origin: process.env.CORS_ORIGIN },
        });

        this.ioServer.on("connection", this.#handleConnection.bind(this));
    }

    #handleConnection(socket) {
        const client = new Client(socket);

        this.#handleEvent(client, "connection");

        socket.onAny((event, data) => this.#handleEvent(client, event, data));

        socket.on("disconnect", () => {
            this.#clients.delete(client.id);
        });

        this.#clients.set(client.id, client);
    }

    #handleEvent(client, event, data) {
        const middlewares = [
            ...(this.#middlewares["*"] ?? []),
            ...(this.#middlewares[event] ?? []),
            this.#callListeners,
        ];

        let index = 0;

        function next() {
            const handler = middlewares[index++];
            handler(client, data, event, next);
        }

        next();
    }

    #callListeners = (client, data, event) => {
        const listeners = this.rawListeners(event);
        for (const listener of listeners) {
            listener(client, data, event);
        }
    };

    static createServer({ httpServer, path }) {
        const socketServer = new Socket(httpServer, path);
        return socketServer;
    }

    /*
    middlewareFunction: (client, data, event, next) => {}
    */
    useMiddleware(event, fn) {
        let middleware = fn;
        let eventName = event;

        if (typeof eventName !== "string") {
            middleware = eventName;
            eventName = "*";
        }

        if (this.#middlewares[eventName])
            this.#middlewares[eventName].push(middleware);
        else this.#middlewares[eventName] = [middleware];
    }

    /*
    handler: (client, data, event) => {} 
    */
    on(event, handler) {
        this.addListener(event, handler);
    }

    getClient(clientId) {
        return this.#clients.get(clientId);
    }
}

export default Socket;
