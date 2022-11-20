import EventEmitter from "events";

import { generateRoomId } from "./index.js";
import Game from "./../Game/Game.js";
import RoomSettings from "./RoomSettings.js";

class Room extends EventEmitter {
    static #activeRooms = new Map();
    #joinRequests;

    #joinRequestsProcessor = (function () {
        const requests = new Map();
        let processingRequest = false;

        function add(player) {
            requests.set(player.id, player);
            reprocess();
        }

        function acceptRequest(player) {
            requests.delete(player.id);
            this.#addPlayer(player);
            reprocess();
        }

        function rejectRequest(player) {
            requests.delete(player.id);
            player.emit("ROOM_JOIN_REJECTED", { reason: "REQUEST_DENIED" });
            reprocess();
        }

        function cancelRequest(player) {
            requests.delete(player.id);
            reprocess();
        }

        function reprocess() {
            processingRequest = false;
            setImmediate(process);
        }

        function process() {
            if (processingRequest) return;

            this.admin.off("PLAYER_JOIN_APPROVE");
            this.admin.off("PLAYER_JOIN_REJECT");

            const request = this.#joinRequests.values().next().value;
            this.admin.emit("PLAYER_JOIN_REQUEST", player);

            processingRequest = true;
            this.admin.once("PLAYER_JOIN_APPROVE", acceptRequest);
            this.admin.once("PLAYER_JOIN_REJECT", rejectRequest);
        }

        return { add, reprocess, cancelRequest };
    })();

    constructor(admin) {
        super();
        this.id = generateRoomId();
        this.players = new Map();
        this.admin = admin;
        this.settings = new RoomSettings();
        this.game = new Game(this);

        this.players.set(admin.id, admin);
    }

    get view() {
        return {
            id: this.id,
            adminId: this.admin?.id,
            players: Array.from(this.players.values()).map(
                (player) => player.view
            ),
            settings: this.settings,
        };
    }

    static create(player) {
        const room = new Room(player);
        this.#activeRooms.set(room.id, room);
        return room;
    }

    static get(roomId) {
        return this.#activeRooms.get(roomId);
    }

    #electAdmin() {
        // Randomly selects a new admin
        this.#joinRequestsProcessor.reprocess();
    }

    joinRequest(player) {
        if (this.players.size >= this.settings.room.maxPlayersLimit) {
            player.emit("ROOM_JOIN_REJECTED", { reason: "MAX_PLAYERS_LIMIT" });
            return;
        }
        if (this.admin && this.settings.room.private) {
            this.#joinRequestsProcessor.add(player);
        } else {
            this.#addPlayer(player);
        }
    }

    #addPlayer(player) {
        this.players.set(player.id, player);
        this.emit("PLAYER_JOIN", player);
        player.emit("ROOM_JOIN", this);
    }

    removePlayer(player) {
        if (!this.players) {
            this.destroy();
            return;
        }
        if (this.admin.id === player.id) {
            this.#electAdmin();
        }
        this.emit("PLAYER_LEAVE", player);
        player.emit("ROOM_LEAVE", this);
    }
}
export default Room;
