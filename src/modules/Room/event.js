const RoomEvents = Object.freeze({
    CREATED: "created",

    SETTINGS_UPDATED: "settings_updated",

    PLAYER_JOIN_REQUEST: "join_request",
    PLAYER_JOIN_RESPONSE: "join_response",
    PLAYER_JOINED: "joined",
    PLAYER_LEFT: "left",

    ADMIN_ELECTED: "admin_elected",
});

export default RoomEvents;
