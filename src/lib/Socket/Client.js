import { nanoid } from "nanoid";

class Client {
    static #clients = new Map();
    #socket;

    constructor(socket) {
        this.id = this._generateId();
        this.#socket = socket;
    }

    _generateId() {
        return nanoid(12);
    }

    static create(socket) {
        const client = new Client();
        this.#clients.set(client.id, client);
        console.log("New Client: ", client);
        return client;
    }

    static get(clientId) {
        return this.#clients.get(clientId);
    }
}

export default Client;
