import { generatePlayerId, viewfy } from "./../utils/index.js";

class Player {
    // Active Connections
    static activePlayers = new Map();
    #socket;

    constructor(socket) {
        this.id = generatePlayerId();
        this.#socket = socket;
        this.username = null;
        this.room = null;
    }

    get view() {
        return {
            id: this.id,
            username: this.username,
            roomId: this.room?.id,
        };
    }

    static create(socket) {
        const player = new Player(socket);
        this.activePlayers.set(player.id, player);
        return player;
    }

    static get(playerId) {
        return this.activePlayers.get(playerId);
    }

    delete() {
        this.activePlayers.delete(this.id);
    }

    setRoom(room) {
        this.room = room;
    }

    exitRoom() {
        this.room = null;
    }

    setUsername(username) {
        this.username = username;
    }

    // Emit back to the client
    emitBack(event, data) {
        this.#socket.emit(event, viewfy(data));
    }

    // Emit to specific client
    emitTo(player, event, data) {
        player.emitBack(event, viewfy(data));
    }

    // Emit to everyone in the room
    broadcastAll(event, data) {
        if (this.room) {
            for (const player of this.room.players) {
                player.emitBack(event, viewfy(data));
            }
        }
    }

    // Emit to everyone except the client in the room
    broadcast(event, data) {
        if (this.room) {
            for (const player of this.room.players) {
                if (player.id === this.id) continue;
                player.emitBack(event, viewfy(data));
            }
        }
    }
}

export default Player;
