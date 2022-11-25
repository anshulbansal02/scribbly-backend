import { randomInt } from "./../../utils";

class RoomWorker {
    constructor(store, broker) {
        this.roomCollection = store.collection("room");
        this.playerRelCollection = store.collection("player_room_map");
        this.requestsQueueCollection = store.collection("room_requests_queue");

        this.playerChannel = broker.subchannel("player");
        this.roomChannel = broker.subchannel("room");

        this._subscribeToUpdates();
    }

    _subscribeToUpdates() {
        this.roomChannel.on("admin_elect", async (channels, adminId) => {
            const roomId = channels.at(-1);
            await this.requestsQueueCollection.lSet(roomId, 0, 0);
            setImmediate(() => this._processJoinRequest(roomId));
        });
    }

    joinRequests = {
        async init(roomId) {
            await this.requestsQueueCollection.delKey(roomId);
            await this.requestsQueueCollection.rPush(roomId, 0, "");
        },

        async add(roomId, playerId) {
            await this.playerRelCollection.saveRecord(playerId, {
                roomId,
                status: "requested",
            });
            await this.requestsQueueCollection.rPush(roomId, playerId);
            setImmediate(() => this._processJoinRequest(roomId));
        },

        async remove(playerId) {
            const roomId = await this.playerRelCollection.getField(
                roomId,
                "roomId"
            );
            await this.requestsQueueCollection.lRem(roomId, playerId);
            await this.playerRelCollection.delRecord(roomId);
            setImmediate(() => this._processJoinRequest(roomId));
        },
    };

    async electAdmin(roomId) {
        const playerIds = await this.roomCollection.getField(
            roomId,
            "playerIds"
        );

        const adminId = playerIds[randomInt(0, playerIds.length - 1)];

        await this.roomCollection.setField(roomId, "adminId", adminId);
        await this.roomChannel.subchannel(roomId).emit("admin_elect", adminId);
    }

    async _addPlayer(roomId, playerId) {
        const playerIds = await this.roomCollection.getField(
            roomId,
            "playerIds"
        );
        playerIds.push(playerId);

        await Promise.all([
            this.playerRelCollection.setField(playerId, "status", "joined"),
            this.roomCollection.setField(roomId, "playerIds", playerIds),
            this.roomChannel.subchannel(roomId).emit("player_join", playerId),
            this.playerChannel.subchannel(playerId).emit("room_join", roomId),
        ]);
    }

    _processJoinRequest = async (roomId) => {
        // Check if already processing a request
        const isProcessing = +(await this.requestsQueueCollection.lIndex(
            roomId,
            0
        ));
        if (isProcessing) return;

        // Turn off previous handler
        let handlerId = await this.requestsQueueCollection.lIndex(roomId, 1);
        if (handlerId) {
            this.playerChannel.off(handlerId);
        }

        const playerId = await this.requestsQueueCollection.lIndex(roomId, 1);

        if (!playerId) {
            return;
        }

        // Set is processing request
        await this.requestsQueueCollection.lSet(roomId, 0, 1);

        // Process join request
        const roomIsPrivate = await this.roomCollection.getField(
            roomId,
            "settings.isPrivate"
        );
        if (!roomIsPrivate) {
            this._addPlayer(roomId, playerId);
            await this.requestsQueueCollection.lRem(roomId, playerId);
            await this.requestsQueueCollection.lSet(roomId, 0, 0);
            setImmediate(() => this._processJoinRequest(roomId));
            return;
        }

        const adminChannel = this.playerChannel.subchannel(adminId);
        const playerChannel = this.playerChannel.subchannel(playerId);

        await adminChannel.emit("player_join_request", playerId);

        handlerId = await adminChannel.on(
            "player_join_response",
            async (channels, { playerId, approve }) => {
                if (approve) {
                    this._addPlayer(roomId, playerId);
                }
                await playerChannel.emit("join_response", {
                    playerId,
                    approve,
                });
                await this.requestsQueueCollection.lSet(roomId, 0, 0);
            }
        );
        await this.requestsQueueCollection.lSet(roomId, 1, handlerId);
    };
}

export default RoomWorker;
