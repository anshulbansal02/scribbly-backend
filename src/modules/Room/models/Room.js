import { customAlphabet } from "nanoid";

import RoomSettings from "./RoomSettings.js";

class Room {
    constructor(adminId, playerIds) {
        this.id = this._generateId();
        this.playerIds = playerIds ?? [];
        this.adminId = adminId;
        this.settings = new RoomSettings();
    }

    _generateId() {
        return customAlphabet("abcdefghjkmnopqrstuvwxyz", 6)();
    }
}

export default Room;
