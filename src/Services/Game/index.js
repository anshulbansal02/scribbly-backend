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

export { Phaser };
