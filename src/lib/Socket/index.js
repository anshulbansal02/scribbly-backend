import Client from "./Client.js";

function registerSocketConnections(socketServer) {
    socketServer.on("connection", (socket) => {
        const client = Client.create(socket);
    });
}

export default registerSocketConnections;
