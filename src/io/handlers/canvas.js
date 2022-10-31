const IOEvents = require("./../events");

function beginDraw(socket) {
    return ({ point }) => {
        socket.to(socket.rooms).emit(IOEvents.CANVAS_BEGIN_DRAW, { point });
    };
}

function draw(socket) {
    return ({ point }) => {
        socket.to(socket.rooms).emit(IOEvents.CANVAS_DRAW, { point });
    };
}

function fill(socket) {
    return ({ point, color }) => {
        socket.to(socket.rooms).emit(IOEvents.CANVAS_FILL, { point, color });
    };
}

function clear(socket) {
    return () => {
        socket.to(socket.rooms).emit(IOEvents.CANVAS_DRAW);
    };
}

module.exports = { beginDraw, draw, fill, clear };
