import IOEvents from "./events.js";
import * as roomHandlers from "./handlers/room.js";

import Player from "../models/Player.js";

const registerSocketHandlers = (io) => {
    io.on("connection", (socket) => {
        // Logging
        console.log(`Connection Socket ID:${socket.id}`);
        socket.onAny((eventName, ...args) => {
            console.log(`[EVENT][${eventName}] `, args);
        });

        const player = Player.create(socket);
        player.emitBack(IOEvents.PLAYER_CREATE, { player });

        // Room Events
        socket.on(IOEvents.ROOM_CREATE, roomHandlers.create(player));
        socket.on(IOEvents.ROOM_JOIN, roomHandlers.join(player));
        socket.on(IOEvents.ROOM_LEAVE, roomHandlers.leave(player));
        socket.on("disconnect", roomHandlers.leave(player));

        socket.on(
            IOEvents.GAME_SETTINGS_CHANGE,
            roomHandlers.settings_change(player)
        );
    });
};

export default registerSocketHandlers;
