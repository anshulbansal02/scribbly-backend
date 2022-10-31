const IOEvents = require("./events");
const canvasHandlers = require("./handlers/canvas");
const chatHandlers = require("./handlers/chat");
const roomHandlers = require("./handlers/room");
const gameHandlers = require("./handlers/game");

const registerSocketHandlers = (io) => {
    io.on("connection", (socket) => {
        console.log(`New Connection ${socket.id}`);

        // Canvas Events
        socket.on(IOEvents.CANVAS_BEGIN_DRAW, canvasHandlers.beginDraw(socket));
        socket.on(IOEvents.CANVAS_DRAW, canvasHandlers.draw(socket));
        socket.on(IOEvents.CANVAS_FILL, canvasHandlers.fill(socket));
        socket.on(IOEvents.CANVAS_CLEAR, canvasHandlers.clear(socket));

        // Chat Events
        socket.on(IOEvents.CHAT_MESSAGE, chatHandlers.message(socket));
    });
};

module.exports = registerSocketHandlers;
