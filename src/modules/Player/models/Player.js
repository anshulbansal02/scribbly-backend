import { nanoid } from "nanoid";

class Player {
    constructor({ username }) {
        this.id = this.generateId();
        this.username = username;
        this.avatar = null;
        this.roomId = null;
    }

    generateId() {
        return nanoid(12);
    }
}

export default Player;
