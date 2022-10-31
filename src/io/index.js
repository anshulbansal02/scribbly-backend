const registerSocketHandlers = (io) => {
    io.on("connection", (socket) => {
        console.log(`New Connection ${socket.id}`);
    });
};

module.exports = registerSocketHandlers;
