import Player from "./models/Player.js";

class PlayerService {
    static boostrap(store, broker) {
        if (PlayerService._instance) {
            throw new Error("PlayerService is already initialized");
        }
        PlayerService._instance = this;

        this.playerChannel = broker.subchannel("player");
        this.playerCollection = store.collection("player");
    }

    static get service() {
        if (!PlayerService._instance)
            throw new Error("PlayerService is not initialized");
        return PlayerService._instance;
    }

    async create(username) {
        const player = new Player({ username });
        await this.playerCollection.saveRecord(player);
        await this.playerChannel.emit("create", player);
        return player;
    }

    async get(playerId) {
        return await this.playerCollection.getRecord(playerId);
    }
}

export default PlayerService;
