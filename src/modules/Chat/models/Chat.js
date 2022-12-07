import { nanoid } from "nanoid";

class Chat {
    constructor(text, playerId) {
        this.id = this._generateId();
        this.messages = [];
    }

    _generateId() {
        return nanoid();
    }
}

export default Chat;
