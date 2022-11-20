import { nanoid } from "nanoid";

class PlayerError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

function generatePlayerId() {
    return nanoid(12);
}

export { PlayerError, generatePlayerId };
