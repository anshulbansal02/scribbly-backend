import { generatePlayerId, viewfy } from "../utils/index.js";
import EventEmitter from "events";

class Avatar {
    constructor(seed) {
        this.accentColor = null;
        this.imageUrl = null;
    }
}

class PlayerError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

class Player extends EventEmitter {
    static #playersPool = new Map();

    constructor(username) {
        super();
        this.id = generatePlayerId();
        this.username = username;
        this.avatar = new Avatar(this.id);
        this.room = null;
        this.roomJoinRequest = null;

        this.on("ROOM_JOIN", function (room) {
            this.room = room;
        });

        this.on("ROOM_LEAVE", function (room) {
            this.room = null;
        });
    }

    get view() {
        const { id, username, avatar, isActive } = this;
        return {
            id,
            username,
            avatar,
            isActive,
            roomId: this.room?.id,
        };
    }

    static create(username) {
        if (!username)
            throw new PlayerError("Username is required to create a Player");
        const player = new Player(username);
        this.#playersPool.set(player.id, player);
        return player;
    }

    static get(playerId) {
        return this.#playersPool.get(playerId);
    }

    updateUsername(username) {
        this.username = username;
    }
}

export default Player;
