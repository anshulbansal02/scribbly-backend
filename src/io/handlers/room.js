import IOEvents from "./../events.js";

import { Room } from "./../../models/index.js";

function create(player) {
    return ({ username }) => {
        player.setUsername(username);
        const room = Room.create(player);

        player.emitBack(IOEvents.ROOM_JOIN, { room });
    };
}

function join(player) {
    return ({ roomId, username }) => {
        const room = Room.get(roomId);

        if (room) {
            player.setUsername(username);
            room.add(player);
            player.emitBack(IOEvents.ROOM_JOIN, { room });
            player.broadcast(IOEvents.ROOM_PLAYER_JOIN, { player });
        } else {
            player.emitBack(IOEvents.ROOM_NON_EXISTANT);
        }
    };
}

function leave(player) {
    return () => {
        if (player.room) {
            player.emitBack(IOEvents.ROOM_LEAVE);
            player.broadcast(IOEvents.ROOM_PLAYER_LEAVE, { player });

            player.room.remove(player);
        }
    };
}

function settings_change(player) {
    return ({ settings }) => {
        player.room.settingsUpdate(settings);

        player.broadcast(IOEvents.GAME_SETTINGS_CHANGE, { settings });
    };
}

export { create, join, leave, settings_change };
