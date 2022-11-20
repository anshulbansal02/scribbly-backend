import IOEvents from "./../events.js";

function message(player) {
    return ({ text }) => {
        const message = {
            id: 0,
            userId: player.id,
            timestamp: Date.now(),
            text,
        };
        player.cast(IOEvents.CHAT_MESSAGE, message);
    };
}

export { message };
