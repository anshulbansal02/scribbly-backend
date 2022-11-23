import Player from "./models/Player.js";

class PlayerService {
    static boostrap(store, broker) {
        if (PlayerService._instance) {
            return PlayerService._instance;
        }
        PlayerService._instance = this;

        this.playerChannel = broker.channel("player");
        this.store = store;

        this._subscribeToUpdates();
    }

    static get service() {
        if (!PlayerService._instance)
            throw new Error("PlayerService is not initialized");
        return PlayerService._instance;
    }

    _subscribeToUpdates() {
        this.playerChannel.on("room_join", (playerId, { roomId }) => {
            // Update roomId
        });

        this.playerChannel.on("room_leave", (playerId, { roomId }) => {});
    }

    async create(playerDto) {
        const player = new Player(playerDto);
        await this.store.set(player.id, player);
        this.playerChannel.emit("create", player);
        return player;
    }

    async get(playerId) {
        return await this.store.get(playerId);
        // get from store and return
    }
}

export default PlayerService;
