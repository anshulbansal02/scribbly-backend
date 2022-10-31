import IOEvents from "./../events.js";

function message(socket) {
    return ({ text }) => {
        socket.to(socket.rooms).emit(IOEvents.CANVAS_BEGIN_DRAW, { text });
    };
}

export { message };
