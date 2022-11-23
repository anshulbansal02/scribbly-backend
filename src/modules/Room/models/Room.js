import RoomSettings from "./RoomSettings.js";
import { customAlphabet } from "nanoid";
import Entity from "../../../lib/Entity.js";

class Room extends Entity {
    constructor() {
        this.id = this._generateId();
        this.playerIds = new Set();
        this.adminPlayerId;
        this.settings = new RoomSettings();
    }

    _generateId() {
        return customAlphabet("abcdefghjkmnopqrstuvwxyz", 6)();
    }
}

export default Room;
