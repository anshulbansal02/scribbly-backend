import EventEmitter from "events";

import { GameDefaults, GameEvents } from "./index.js";
import Phaser from "./Phaser.js";
import Scoreboard from "./Scoreboard.js";
import WordEngine from "./WordEngine.js";

class Game extends EventEmitter {
    constructor(room) {
        super();
        this.room = room;
    }

    init() {
        this.preferences = structuredClone(this.room.settings.game);

        this.phaser = new Phaser();
        this.turns = new TurnOrderer(this.room.players);
        this.scoreboard = new Scoreboard();

        this.turns.randomize();

        this.state = {
            wordChoices: [],
            word: null,
            turnPlayer: null,
            round: 1,
        };

        this.room.on("PLAYER_LEAVE", (player) => {
            if (this.state.turnPlayer.id === player.id) {
                this.phaser.interrupt(this.endTurn);
            }
            this.turns.remove(player);
        });

        this.room.on("PLAYER_JOIN", (player) => {
            this.turns.add(player);
        });
    }

    setWord(word) {
        this.state.word = WordEngine.obfuscate(word);
    }

    // Phases
    startGame() {
        this.emit("GAME_START");
        return [this.startRound, 1000];
    }

    endGame() {
        this.emit("GAME_END");
        return [];
    }

    startRound() {
        this.emit("ROUND_START", { round: this.currentRoundNumber });

        // Reset turns

        return [this.startTurn, 1000];
    }

    endRound() {
        this.emit("ROUND_END", { round: this.currentRoundNumber });

        // Send round stats

        this.currentRoundNumber++;
        if (this.currentRoundNumber <= this.preferences.rounds) {
            return [this.Phase.ROUND_START, 2000];
        } else {
            return [this.Phase.GAME_END, 1000];
        }
    }

    startTurn() {
        this.turnPlayer = this.getNextTurn();
        if (!this.turnPlayer) return [this.Phase.ROUND_END];
        this.emit("TURN_START", { turn: this.turnPlayer });

        return [this.startWordChoice, 500];
    }

    endTurn() {
        this.emit("TURN_END", { turn: this.turnPlayer });

        this.turnPlayer.off("GAME_WORD", this.setWord);

        // Reveal word if word
        if (this.currentWord) {
        }

        return [this.startTurn, 1000];
    }

    startWordChoice() {
        this.wordChoiceList = WordEngine.getWords(
            GameDefaults.WORD_CHOICES_NUMBER,
            this.preferences.difficulty
        );

        this.turnPlayer.emit("GAME_WORDS", { words: this.wordChoiceList });

        this.turnPlayer.on("GAME_WORD", this.setWord);

        return [this.Phase.WORD_CHOICE_END, GameDefaults.WORD_CHOICE_TIMEOUT];
    }
    endWordChoice() {
        this.turnPlayer.off("GAME_WORD", this.setWord);

        if (!this.currentWord) {
            this.setWord(getRandomItem(this.wordChoiceList));
        }

        return [this.startGuess];
    }

    startGuess() {
        this.emit("GAME_WORD", { word: this.currentWord });

        return [this.endTurn, this.preferences.guessTimeout];
    }

    start() {
        this.init();
        this.phaser.execute(this.startGame);
    }
}

export default Game;
