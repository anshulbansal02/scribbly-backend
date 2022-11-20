import { Phaser } from ".";

const GameDefaults = Object.freeze({
    WORD_CHOICE_TIMEOUT: 10000,
    WORD_CHOICES_NUMBER: 3,
});

class Game extends EventEmitter {
    constructor(room) {
        this.room = room;
    }

    init() {
        this.phaser = new Phaser();

        this.settings = structuredClone(this.room.settings.game);
        this.scoreboard = new Scoreboard();
        this.wordChoiceList = [];
        this.currentWord = null;
        this.currentTurnPlayer = null;
        this.currentRoundNumber = 1;
    }

    setWord(word) {
        const wordObj = WordEngine.getWord(word);
        this.currentWord = wordObj;
    }

    getNextTurn() {}

    /*----------------------------------------------------------*/

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
        if (this.currentRoundNumber <= this.settings.rounds) {
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

    async startWordChoice() {
        this.wordChoiceList = await WordEngine.getWordList(
            GameDefaults.WORD_CHOICES_NUMBER
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

        return [this.endTurn, this.settings.guessTimeout];
    }

    // Bootstraps game
    async start() {
        this.init();
        this.initPlayersHandlers();

        this.phaser.execute(this.startGame);

        // End
    }
}
