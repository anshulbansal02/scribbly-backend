import { nanoid } from "nanoid";
import Entity from "../../../lib/Entity.js";

import Avatar from "./Avatar.js";

class Player extends Entity {
    constructor({ username }) {
        this.id = this.generateId();
        this.username = username;
        this.avatar = new Avatar(this.id);
        this.roomId;
    }

    generateId() {
        return nanoid(12);
    }
}

export default Player;
