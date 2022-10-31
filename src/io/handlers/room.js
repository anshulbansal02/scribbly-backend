import IOEvents from "./../events.js";

import { nanoid } from "nanoid";

function create(socket) {
    return () => {
        socket.emit(IOEvents.ROOM_JOIN, nanoid());
    };
}

export { create };
