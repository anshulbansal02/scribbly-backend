import redis from "redis";

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

class Collection {
    constructor(name, store) {
        this.store = store;
        this.name = name;
    }

    _transformKey(key) {
        return `${this.name}:${key}`;
    }

    // Record Level Operations
    async saveRecord(record) {
        return await this.store.json.set(
            this._transformKey(record.id),
            "$",
            record
        );
    }

    async getRecord(recordId) {
        return await this.store.json.get(this._transformKey(recordId));
    }

    // Atomic Operations
    async setField(recordId, field, value) {
        return await this.store.json.set(
            this._transformKey(recordId),
            `$.${field}`,
            value
        );
    }

    async getField(recordId, field) {
        const result = await this.store.json.get(this._transformKey(recordId), {
            path: `$.${field}`,
        });
        return result[0] ?? null;
    }

    async rPush(key, ...values) {
        return await this.store.rPush(
            this._transformKey(key),
            values.map(String)
        );
    }

    async lPop(key) {
        return await this.store.lPop(this._transformKey(key));
    }

    async lIndex(key) {
        return await this.store.lIndex(this._transformKey(key));
    }

    async lRem(key, value) {
        return await this.store.lRem(this._transformKey(key), 0, value);
    }

    async lSet(key, index, value) {
        return await this.store.lSet(this._transformKey(key), index, value);
    }

    async setKey(key, value) {
        return await this.store.set(this._transformKey(key), value);
    }

    async getKey(key) {
        return await this.store.get(this._transformKey(key));
    }

    async delKey(key) {
        return await this.store.del(this._transformKey(key));
    }
}
