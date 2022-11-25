import RoomSettings from "./RoomSettings.js";
import { customAlphabet } from "nanoid";

class Room {
    constructor() {
        this.id = this._generateId();
        this.playerIds = [];
        this.adminId;
        this.settings = new RoomSettings();
    }

    _generateId() {
        return customAlphabet("abcdefghjkmnopqrstuvwxyz", 6)();
    }
}

export default Room;
