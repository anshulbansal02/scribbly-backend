import { shuffle } from "../../../utils";
import Scoreboard from "../Scoreboard";

class Game extends Entity {
    constructor() {
        this.id = this._generateId();

        this.preferences = new GamePreferences();
        this.scoreboard = new Scoreboard();

        this.state = {
            word: null,
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

    turns = {
        randomize() {
            shuffle(this.turn.order);
        },

        reset() {
            const turn = this.state.turn;
            turn.playerId = turn.order[--turn.index];
        },

        next() {
            const turn = this.state.turn;
            return turn.order[turn.index++];
        },
    };
}
