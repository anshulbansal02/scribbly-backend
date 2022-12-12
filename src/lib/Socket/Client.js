import { nanoid } from "nanoid";

import EventEmitter from "events";

class Client extends EventEmitter {
    #socket;

    constructor(socket) {
        super();
        this.id = this.#generateId();
        this.#socket = socket;
    }

    #generateId() {
        return nanoid(12);
    }

    emit(event, data) {
        this.#socket.emit(event, data);
    }

    on(event, handler) {
        this.#socket.on(event, handler);
    }
}

export default Client;
