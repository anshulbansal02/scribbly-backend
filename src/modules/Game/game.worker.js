/*
~GameState
- turnOrder: ([number])
- scoreboard: Scoreboard
- preferences: Preferences

- turnPlayerId : (null | string)
- wordOriginal : (null | string)
- wordObfuscated : (null | string)
- roundNumber: (number)


~Scoreboard


*/

class GameWorker {
    constructor(store, broker) {
        // Singleton
        if (PlayerService._instance) {
            return PlayerService._instance;
        }
        PlayerService._instance = this;

        this.playerChannel = broker.channel("player");
        this.store = store;
    }
}
