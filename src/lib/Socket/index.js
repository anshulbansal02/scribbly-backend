import Client from "./Client.js";

function registerSocketConnections(socketServer) {
    socketServer.on("connection", (socket) => {
        const client = Client.create(socket);

        socket.emit("client_id", client.id);
    });
}

export default registerSocketConnections;
