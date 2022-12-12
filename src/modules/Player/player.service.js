import Player from "./models/Player.js";
import Avatar from "./models/Avatar.js";

import PlayerEvents from "./events.js";

class PlayerService {
    constructor(store, mainChannel) {
        if (PlayerService._instance) {
            throw new Error("PlayerService is already initialized");
        }
        PlayerService._instance = this;

        this.events = PlayerEvents;

        this.playerChannel = mainChannel.subchannel("player");
        this.playerCollection = store.collection("player");
    }

    static get service() {
        if (!PlayerService._instance)
            throw new Error("PlayerService is not initialized");
        return PlayerService._instance;
    }

    create = async (username) => {
        const player = new Player({ username });
        player.avatar = await Avatar.create(player.id);
        await this.playerCollection.setRecord(player);

        await this.playerChannel.emit(PlayerEvents.CREATED, player);
        return player;
    };

    get = async (playerId) => {
        return await this.playerCollection.getRecord(playerId);
    };
}

export default PlayerService;
