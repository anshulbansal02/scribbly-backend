import Scoreboard from "./Scoreboard.js";
import GamePreferences from "./GamePreferences.js";

class Game {
    constructor() {
        this.id = this._generateId();

        this.preferences = new GamePreferences();
        this.scoreboard = new Scoreboard();

        this.status = "pre_start";

        this.state = {
            word: {
                original: null,
                obfuscated: null,
                choices: [],
            },
            turn: {
                order: [],
                index: 0,
                playerId: null,
            },
            roundNumber: 1,
        };
    }

    _generateId() {
        return nanoid(12);
    }
}
