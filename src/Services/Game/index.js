class Phaser {
    constructor() {
        this._interruptPhase = null;
        this._phaseDelay = null;
    }

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
}

class TurnOrderer {
    constructor(players, randomize) {
        this.players = players;
        this.order = [...this.players.keys()];
        this.turnIndex = -1;
    }

    next() {
        return this.players.get(order[this.turnIndex++]);
    }

    randomize() {
        let currentIndex = this.order.length,
            randomIndex;

        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [this.order[currentIndex], this.order[randomIndex]] = [
                this.order[randomIndex],
                this.order[currentIndex],
            ];
        }
    }

    reset() {
        this.turnIndex = -1;
    }

    add(player) {
        this.order.push(player.id);
    }

    remove(player) {
        const index = array.indexOf(player.id);
        if (index <= this.turnIndex) this.turnIndex--;
        this.order.splice(index, 1);
    }
}

const GameDefaults = Object.freeze({
    WORD_CHOICE_TIMEOUT: 10000,
    WORD_CHOICES_NUMBER: 3,
});

export { Phaser, TurnOrderer, GameDefaults };
