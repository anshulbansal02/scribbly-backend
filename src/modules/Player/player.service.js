import Player from "./models/Player.js";

class PlayerService {
    constructor(store, broker) {
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

    create = async (username) => {
        const player = new Player({ username });
        await this.playerCollection.saveRecord(player);
        await this.playerChannel.emit("create", player);
        return player;
    };

    get = async (playerId) => {
        return await this.playerCollection.getRecord(playerId);
    };
}

export default PlayerService;
