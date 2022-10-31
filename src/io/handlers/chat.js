const IOEvents = require("./../events");

function message(socket) {
    return ({ text }) => {
        socket.to(socket.rooms).emit(IOEvents.CANVAS_BEGIN_DRAW, { text });
    };
}

module.exports = { message };
