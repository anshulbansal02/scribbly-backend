import Game from "./models/Game.js";

class GameService {
    static boostrap(store, broker) {
        if (GameService._instance) {
            throw new Error("GameService is already initialized");
        }
        GameService._instance = this;

        this.gameChannel = broker.subchannel("game");

        this.gameCollection = store.collection("game");
        this.roomRelCollection = store.collection("room_game_map");

        this.this.worker = new GameWorker(store, broker);
    }

    static get service() {
        if (!GameService._instance)
            throw new Error("GameService is not initialized");
        return GameService._instance;
    }

    async create(roomId) {
        const game = new Game();

        await this.gameCollection.saveRecord(game);
        await this.roomRelCollection.setKey(roomId, game.id);
        await this.gameChannel.emit("create", game);

        return game;
    }

    async get(gameId) {
        return await this.gameCollection.getRecord(gameId);
    }

    async startGame(gameId) {
        await this.worker.start(gameId);
    }
}

export default PlayerService;
