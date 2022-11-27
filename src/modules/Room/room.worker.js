import { randomInt } from "./../../utils/index.js";

class RoomWorker {
    constructor(store, mainChannel) {
        this.roomCollection = store.collection("room");
        this.playerRelCollection = store.collection("player_room_map");
        this.requestsQueueCollection = store.collection("room_requests_queue");

        this.playerChannel = mainChannel.subchannel("player");
        this.roomChannel = mainChannel.subchannel("room");

        this._subscribeToUpdates();
    }

    _subscribeToUpdates() {
        this.roomChannel.on("admin_elect", async (adminId, subchannels) => {
            const roomId = subchannels.at(-1);

            this.roomChannel.off(
                await this.joinRequests._getRequestHandlerId(roomId)
            );
            await this.joinRequests._setIsProcessing(roomId, false);

            this.joinRequests._processRequest(roomId);
        });
    }

    joinRequests = {
        _setIsProcessing: async (roomId, isProcessing) => {
            await this.requestsQueueCollection.lSet(
                roomId,
                0,
                isProcessing ? 1 : 0
            );
        },
        _isProcessing: async (roomId) => {
            return +(await this.requestsQueueCollection.lIndex(roomId, 0));
        },

        _setRequestHandlerId: async (roomId, handlerId) => {
            await this.requestsQueueCollection.lSet(roomId, 1, handlerId);
        },
        _getRequestHandlerId: async (roomId) => {
            return await this.requestsQueueCollection.lIndex(roomId, 1);
        },

        _getRequestPlayerId: async (roomId) => {
            return await this.requestsQueueCollection.lIndex(roomId, 2);
        },

        _processRequest: (roomId) => {
            setImmediate(async () => {
                // Check if already processing a request
                if (await this.joinRequests._isProcessing(roomId)) return;

                // Turn off previous handler
                this.roomChannel.off(
                    await this.joinRequests._getRequestHandlerId(roomId)
                );

                const playerId = await this.joinRequests._getRequestPlayerId();
                if (!playerId) return;

                // Set is processing request
                await this.joinRequests._setIsProcessing(roomId, true);

                // Process join request
                const roomIsPrivate = await this.roomCollection.getField(
                    roomId,
                    "settings.isPrivate"
                );
                if (!roomIsPrivate) {
                    this._addPlayer(roomId, playerId);
                    await this.requestsQueueCollection.lRem(roomId, playerId);
                    await this.joinRequests._setIsProcessing(roomId, false);
                    this.joinRequests._processRequest(roomId);
                    return;
                }

                const adminChannel = this.roomChannel
                    .subchannel(roomId)
                    .subchannel("admin");
                const reqestedPlayerChannel =
                    this.playerChannel.subchannel(playerId);

                await adminChannel.emit("player_join_request", playerId);
                handlerId = adminChannel.once(
                    "player_join_response",
                    async ({ playerId, approval }) => {
                        if (approval) this._addPlayer(roomId, playerId);
                        await reqestedPlayerChannel.emit("room_join_response", {
                            playerId,
                            approval,
                        });
                        await this.requestsQueueCollection.lRem(
                            roomId,
                            playerId
                        );
                        await this.joinRequests._setIsProcessing(roomId, false);
                        this.joinRequests._processRequest(roomId);
                    }
                );
                this.joinRequests._setRequestHandlerId(handlerId);
            });
        },

        init: async (roomId) => {
            await this.requestsQueueCollection.delKey(roomId);
            await this.requestsQueueCollection.rPush(roomId, 0, null);
        },

        add: async (roomId, playerId) => {
            await this.playerRelCollection.setRecord({
                id: playerId,
                roomId,
                status: "requested",
            });
            await this.requestsQueueCollection.rPush(roomId, playerId);
            this.joinRequests._processRequest(roomId);
        },

        remove: async (roomId, playerId) => {
            if ((await this.joinRequests._getRequestPlayerId()) === playerId) {
                this.roomChannel.off(
                    await this.joinRequests._getRequestHandlerId(roomId)
                );
                this.joinRequests._setIsProcessing(roomId, false);
            }

            await this.requestsQueueCollection.lRem(roomId, playerId);
            await this.playerRelCollection.delRecord(roomId);
            this.joinRequests._processRequest(roomId);
        },
    };

    async electAdmin(roomId) {
        const playerIds = await this.roomCollection.getField(
            roomId,
            "playerIds"
        );

        const newAdminId = playerIds[randomInt(0, playerIds.length - 1)];

        await this.roomCollection.setField(roomId, "adminId", newAdminId);
        await this.roomChannel
            .subchannel(roomId)
            .emit("admin_elect", newAdminId);
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
        ]);
    }
}

export default RoomWorker;
