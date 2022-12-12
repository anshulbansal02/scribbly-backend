import Room from "./models/Room.js";

import RoomWorker from "./room.worker.js";

import RoomEvents from "./event.js";

class RoomService {
    constructor(store, mainChannel) {
        if (RoomService._instance) {
            throw new Error("RoomService is already initialized");
        }
        RoomService._instance = this;

        this.events = RoomEvents;

        this.playerChannel = mainChannel.subchannel("player");
        this.roomChannel = mainChannel.subchannel("room");

        this.roomCollection = store.collection("room");
        this.playerRelCollection = store.collection("player_room_map");

        this.worker = new RoomWorker(store, mainChannel);
    }

    static get service() {
        if (!RoomService._instance)
            throw new Error("RoomService is not initialized");
        return RoomService._instance;
    }

    async create(adminPlayerId) {
        const room = new Room(adminPlayerId, [adminPlayerId]);

        await Promise.all([
            this.roomCollection.setRecord(room),
            this.playerRelCollection.setRecord({
                id: adminPlayerId,
                roomId: room.id,
                status: "joined",
            }),

            this.worker.joinRequests.init(room.id),
            this.roomChannel.emit(RoomEvents.CREATED, room),
        ]);

        return room;
    }

    async get(roomId) {
        return await this.roomCollection.getRecord(roomId);
    }

    async exists(roomId) {
        return await this.roomCollection.exists(roomId);
    }

    async getPlayerIds(roomId) {
        return await this.roomCollection.getField(roomId, "playerIds");
    }

    async getAdminId(roomId) {
        return await this.roomCollection.getField(roomId, "adminId");
    }

    async getPlayerRoomId(playerId) {
        const playerRoom = await this.playerRelCollection.getRecord(playerId);
        if (playerRoom && playerRoom.status === "joined")
            return playerRoom.roomId;
    }

    async joinRequest(roomId, playerId) {
        const playerRoom = await this.playerRelCollection.getRecord(playerId);

        if (playerRoom) {
            if (playerRoom.status === "requested") {
                this.cancelJoinRequest(playerId);
                await this.worker.joinRequests.add(roomId, playerId);
            }
        } else {
            await this.worker.joinRequests.add(roomId, playerId);
        }
    }

    async approveJoinRequest(roomId, playerId) {
        await this.roomChannel
            .subchannel(roomId)
            .emit(RoomEvents.PLAYER_JOIN_RESPONSE, {
                playerId,
                approval: true,
            });
    }

    async rejectJoinRequest(roomId, playerId) {
        await this.roomChannel
            .subchannel(roomId)
            .emit(RoomEvents.PLAYER_JOIN_RESPONSE, {
                playerId,
                approval: false,
            });
    }

    async cancelJoinRequest(playerId) {
        const playerRoom = await this.playerRelCollection.getRecord(playerId);
        if (playerRoom.status === "requested")
            await this.worker.joinRequests.remove(playerRoom.roomId, playerId);
    }

    async leave(playerId) {
        const { roomId, status } =
            (await this.playerRelCollection.getRecord(playerId)) ?? {};

        if (!roomId || status === "requested") return;

        const playerIds = await this.roomCollection.getField(
            roomId,
            "playerIds"
        );
        playerIds.splice(playerIds.indexOf(playerId));

        const adminId = await this.roomCollection.getField(roomId, "adminId");
        if (playerId === adminId) this.worker.electAdmin();

        await Promise.all([
            this.playerRelCollection.delRecord(playerId),
            this.roomCollection.setField(roomId, "playerIds", playerIds),

            this.roomChannel
                .subchannel(roomId)
                .emit(RoomEvents.PLAYER_LEFT, playerId),
        ]);
    }
}

export default RoomService;
