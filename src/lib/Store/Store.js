import redis from "redis";

import Collection from "./Collection.js";

class Store {
    constructor(options) {
        this.client = redis.createClient();
        this.collections = new Map();
    }

    async connect() {
        await this.client.connect();
    }

    static async createStore(options) {
        const store = new Store(options);
        await store.connect();
        return store;
    }

    collection(name) {
        const collection =
            this.collections.get(name) ?? new Collection(name, this.client);
        this.collections.set(name, collection);
        return collection;
    }
}

export default Store;
