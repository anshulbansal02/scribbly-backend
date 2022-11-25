class GameService {
    static boostrap(store, broker) {
        if (GameService._instance) {
            return GameService._instance;
        }
        GameService._instance = this;

        this.roomChannel = broker.subchannel("room");
        this.gameChannel = broker.subchannel("game");
        this.store = store;

        this._subscribeToUpdates();

        this.worker = new GameWorker(store, broker);
    }

    static get service() {
        if (!GameService._instance)
            throw new Error("GameService is not initialized");
        return GameService._instance;
    }

    async create(roomId) {
        const game = new Game();

        await this.store.set(game.id, game);
        return game;
    }

    async get(playerId) {
        return await this.store.get(playerId);
    }
}

export default PlayerService;
