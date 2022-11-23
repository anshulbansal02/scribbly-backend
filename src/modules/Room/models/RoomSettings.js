import Entity from "./../../../lib/Entity.js";

class RoomSettings extends Entity {
    constructor() {
        this.isPrivate = false;
        this.maxPlayers = 10;
    }

    update(key, value) {
        const updater = this[`#set_${key}`];
        if (typeof updater === "function") updater(value);
    }

    #set_isPrivate(value) {
        if (typeof value === "boolean") {
            this.isPrivate = value;
        }
    }

    #set_maxPlayers(value) {}
}

export default RoomSettings;
