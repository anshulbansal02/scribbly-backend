import IOEvents from "./events.js";
import * as canvasHandlers from "./handlers/canvas.js";
import * as chatHandlers from "./handlers/chat.js";
import * as roomHandlers from "./handlers/room.js";
import * as gameHandlers from "./handlers/game.js";

const registerSocketHandlers = (io) => {
    io.on("connection", (socket) => {
        console.log(`New Connection ${socket.id}`);

        socket.onAny((eventName, ...args) => {
            console.log(`[EVENT][${eventName}] `, args);
        });

        // Room Events
        socket.on(IOEvents.ROOM_CREATE, roomHandlers.create(socket));

        // Canvas Events
        socket.on(IOEvents.CANVAS_BEGIN_DRAW, canvasHandlers.beginDraw(socket));
        socket.on(IOEvents.CANVAS_DRAW, canvasHandlers.draw(socket));
        socket.on(IOEvents.CANVAS_FILL, canvasHandlers.fill(socket));
        socket.on(IOEvents.CANVAS_CLEAR, canvasHandlers.clear(socket));

        // Chat Events
        socket.on(IOEvents.CHAT_MESSAGE, chatHandlers.message(socket));
    });
};

export default registerSocketHandlers;
