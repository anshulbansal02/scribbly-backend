import { nanoid } from "nanoid";

class Player {
    constructor({ username }) {
        this.id = this.generateId();
        this.username = username;
        this.avatar;
        this.roomId;
    }

    generateId() {
        return nanoid(12);
    }
}

export default Player;
