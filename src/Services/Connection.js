import { Server as SocketServer } from "socket.io";

function createSocketServer(httpServer) {
    return new SocketServer(httpServer, {
        cors: { origin: "*" },
    });
}

function createConnection(socket) {
    const connection = SocketConnection.create(socket);
}

const socketServer = createSocketServer(httpServer);

socketServer.on("connection", createConnection);

function connectionHandler(socketServer) {
    socketServer.on("connection", SocketConnection.create);
}

connection.register(IOEvents.GAME_START, gameHandlers.start);

class SocketConnection {
    constructor() {}
}

class Player {}

class Room {}

class Game {}
