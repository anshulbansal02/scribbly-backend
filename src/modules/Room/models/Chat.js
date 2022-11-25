import { nanoid } from "nanoid";

class ChatMessage {
    constructor(text, playerId) {
        this.id = this._generateId();
        this.timestamp = Date.now();
        this.playerId = playerId;
        this.text = text;
    }

    _generateId() {
        return nanoid();
    }
}
