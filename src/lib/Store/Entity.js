class Entity {
    serialize() {
        return JSON.stringify(this);
    }

    static deserialize(str) {
        const obj = JSON.parse(str);
        return Object.assign(new this(), obj);
    }
}

export default Entity;
