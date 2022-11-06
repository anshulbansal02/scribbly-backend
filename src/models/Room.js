import { generateRoomId } from "./../utils/index.js";

const defaultGameSettings = {
    drawingTime: 90,
    rounds: 3,
    difficulty: 1,
};

class Room {
    // Active Rooms
    static activeRooms = new Map();

    constructor() {
        this.id = generateRoomId();
        this.players = [];
        this.admin = null;
        this.settings = defaultGameSettings;
    }

    get view() {
        return {
            id: this.id,
            adminId: this.admin.id,
            players: this.players.map((player) => player.view),
            settings: this.settings,
        };
    }

    static create(player) {
        const room = new Room();
        room.add(player);
        room.electAdmin();
        this.activeRooms.set(room.id, room);
        return room;
    }

    static get(roomId) {
        return this.activeRooms.get(roomId);
    }

    destroy() {
        for (const player of this.players) {
            player.exitRoom(this.id);
        }
        this.activeRooms.delete(this.id);
    }

    add(player) {
        this.players.push(player);
        player.setRoom(this);
        return this;
    }

    remove(player) {
        this.players = this.players.filter((p) => p.id !== player);

        if (!this.players) {
            this.destroy();
        }

        if (this.admin.id === player.id) {
            this.electAdmin();
        }

        player.exitRoom();
        return this;
    }

    electAdmin() {
        this.admin =
            this.players[Math.floor(Math.random() * this.players.length)];
    }

    settingsUpdate(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}

export default Room;
