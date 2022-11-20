import IOEvents from "./../events.js";

function command(player) {
    return (...data) => {
        player.cast(IOEvents.CANVAS, data);
    };
}

export { command };
