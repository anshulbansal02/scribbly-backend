import IOEvents from "./events.js";
import * as roomHandlers from "./handlers/room.js";
import * as canvasHandlers from "./handlers/canvas.js";
import * as chatHandlers from "./handlers/chat.js";

import Player from "../models/Player.js";

const registerSocketHandlers = (socketServer) => {
    socketServer.on("connection", (socket) => {
        // Logging
        console.log(`[Socket Connection]:${socket.id}`);
        socket.onAny((eventName, ...args) => {
            console.log(`[EVENT][${eventName}] `, args);
        });

        const player = Player.create();
        player.attachSocket(socket);
        player.emitBack(IOEvents.PLAYER_CREATE, { player });
    });
};

export default registerSocketHandlers;
