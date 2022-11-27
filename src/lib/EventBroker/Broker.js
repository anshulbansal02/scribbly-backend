import { nanoid } from "nanoid";
import redis from "redis";

import Channel from "./Channel.js";

class EventBroker {
    #pubClient;
    #subClient;

    #channelTree;
    #handlersRef;

    constructor(options) {
        this.#pubClient = redis.createClient();
        this.#subClient = this.#pubClient.duplicate();

        this.#channelTree = {};
        this.#handlersRef = new Map();
    }

    async connect() {
        await Promise.all([
            this.#pubClient.connect(),
            this.#subClient.connect(),
        ]);
    }
    async disconnect() {
        await Promise.all([this.#pubClient.quit(), this.#subClient.quit()]);
    }

    async createChannel(channelName) {
        this.#channelTree[channelName] = this.#createSubchannel();

        await this.#subClient.pSubscribe(
            `${channelName}*$?*`,
            this.#distributeEvents
        );

        return new Channel(channelName, {
            subscribe: this.#subscribe,
            unsubscribe: this.#unsubscribe,
            publish: this.#publish,
        });
    }

    #createSubchannel() {
        return {
            onAnyHandlers: [],
            eventHandlers: {},
            subchannels: {},
        };
    }

    #subscribe = (namespace, event, handler) => {
        const subchannelNames = namespace.split(":");
        let channel = this.#channelTree[subchannelNames.shift()];

        for (const subchannelName of subchannelNames) {
            if (!channel.subchannels[subchannelName]) {
                channel.subchannels[subchannelName] = this.#createSubchannel();
            }
            channel = channel.subchannels[subchannelName];
        }

        const listener = { id: nanoid(), handler };

        if (event) {
            if (!channel.eventHandlers[event])
                channel.eventHandlers[event] = [];
            channel.eventHandlers[event].push(listener);
        } else {
            channel.onAnyHandlers.push(listener);
        }

        this.#handlersRef.set(listener.id, namespace);

        return listener.id;
    };

    #unsubscribe = (handlerId) => {
        if (!this.#handlersRef.has(handlerId)) return;

        const namespace = this.#handlersRef.get(handlerId).split(":");
        this.#handlersRef.delete(handlerId);

        let channel = this.#channelTree[namespace.shift()];
        for (const subchannelName in namespace) {
            channel = channel.subchannel[subchannelName];
        }

        for (let i = 0; i < channel.onAnyHandlers.length; i++) {
            if (channel.onAnyHandlers[i].id === handlerId) {
                channel.onAnyHandlers.splice(i, 1);
                return;
            }
        }

        for (const event in channel.eventHandlers) {
            for (let i = 0; i < channel.eventHandlers[event].length; i++) {
                channel.eventHandlers[event].splice(i, 1);
                return;
            }
        }
    };

    #publish = async (namespace, event, data) => {
        await this.#pubClient.publish(
            `${namespace}$${event}`,
            JSON.stringify(data)
        );
    };

    #distributeEvents = (message, scope) => {
        const data = JSON.parse(message);
        function executeHandlers(subchannels, channel) {
            for (const { id, handler } of channel.onAnyHandlers) {
                handler(data, subchannels, id);
            }

            const eventSpecificHandlers = channel.eventHandlers[event] ?? [];
            for (const { id, handler } of eventSpecificHandlers) {
                handler(data, subchannels, id);
            }
        }

        const [namespace, event] = scope.split("$");
        const subchannelNames = namespace.split(":");

        let channel = this.#channelTree[subchannelNames[0]];

        executeHandlers(subchannelNames, channel);
        for (const subchannelName of subchannelNames.slice(1)) {
            channel = channel.subchannels[subchannelName];
            if (!channel) return;
            executeHandlers(subchannelNames, channel);
        }
    };
}

export default EventBroker;
