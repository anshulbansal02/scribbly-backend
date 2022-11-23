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

export default TurnOrderer;
