class GameWorker {
    constructor(store, broker) {
        this.store = store;
        this.channel = broker.subchannel("game").subchannel(gameId);

        this._interruptPhase = null;
        this._phaseDelay = null;

        this._subscribeToUpdates();
    }

    _subscribeToUpdates() {
        this.roomChannel.on("create", async (subchannels, room) => {
            const game = await this.create(room.id);
            this.roomChannel.subchannel(room.id).emit("game_create", game);
        });
    }

    phases = {
        gameStart: async () => {
            await this.channel.emit("GAME_START");

            return [this.phases.roundStart, 1000];
        },

        gameEnd: async () => {
            await this.channel.emit("GAME_END");

            return [];
        },

        roundStart: async () => {
            let round;
            // increment round

            await this.channel.emit("ROUND_START", {
                round,
            });

            return [this.startTurn, 1000];
        },

        roundEnd: async () => {
            let round;

            this.emit("ROUND_END", { round });

            return round < this.preferences.rounds
                ? [this.phases.roundStart, 2000]
                : [this.phases.gameEnd, 1000];
        },

        turnStart: () => {
            // get next turn from order and index

            if (!this.turnPlayer) return [this.Phase.ROUND_END];
            this.emit("TURN_START", { turn: this.turnPlayer });

            return [this.startWordChoice, 500];
        },

        turnEnd: () => {
            this.emit("TURN_END", { turn: this.turnPlayer });

            this.turnPlayer.off("GAME_WORD", this.setWord);

            // Reveal word if word
            if (this.currentWord) {
            }

            return [this.startTurn, 1000];
        },

        wordChoiceStart: () => {
            this.wordChoiceList = WordEngine.getWords(
                GameDefaults.WORD_CHOICES_NUMBER,
                this.preferences.difficulty
            );

            this.turnPlayer.emit("GAME_WORDS", { words: this.wordChoiceList });

            this.turnPlayer.on("GAME_WORD", this.setWord);

            return [
                this.Phase.WORD_CHOICE_END,
                GameDefaults.WORD_CHOICE_TIMEOUT,
            ];
        },

        wordChoiceEnd: () => {
            this.turnPlayer.off("GAME_WORD", this.setWord);

            if (!this.currentWord) {
                this.setWord(getRandomItem(this.wordChoiceList));
            }

            return [this.startGuess];
        },

        guessStart: () => {
            this.emit("GAME_WORD", { word: this.currentWord });

            return [this.endTurn, this.preferences.guessTimeout];
        },

        guessEnd: () => {},
    };

    async execute(initialPhase) {
        let nextPhase = initialPhase;

        while (nextPhase) {
            nextPhase = this._interruptPhase ?? nextPhase;
            this._interruptPhase = null;
            [nextPhase, nextPhaseDelayTime] = nextPhase();
            if (nextPhaseDelayTime) {
                this._phaseDelay = delay(nextPhaseDelayTime);
                await this._phaseDelay.wait;
                this._phaseDelay = null;
            }
        }
    }

    interrupt(nextPhase) {
        if (this._phaseDelay) {
            this._phaseDelay.cancel();
        }
        this.interruptPhase = nextPhase;
    }

    startGame() {}
    endTurn() {}
}
