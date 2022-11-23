import { nanoid } from "nanoid";
import redis from "redis";

class EventBroker {
    #pubClient;
    #subClient;

    #channelTree;

    constructor(options) {
        this.#pubClient = createClient();
        this.#subClient = this.#pubClient.duplicate();

        this.#channelTree = {};
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
            unsubscribe: this.#publish,
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

    #subscribe = async (namespace, event, handler) => {
        const subchannelNames = namespace.split(":");
        let channel = this.#channelTree[subchannelNames.shift()];

        for (const subchannelName of subchannelNames) {
            if (!channel.subchannels[subchannelName]) {
                channel.subchannels[subchannelName] = this.#createSubchannel();
            }
            channel = channel.subchannels[subchannelName];
        }

        if (event) {
            if (!channel.eventHandlers[event])
                channel.eventHandlers[event] = [];
            channel.eventHandlers[event].push({ id: nanoid(), handler });
        } else {
            channel.onAnyHandlers.push({ id: nanoid(), handler });
        }
    };

    #unsubscribe = async (handlerId) => {};

    #publish = async (namespace, event, data) => {
        await this.#pubClient.publish(
            `${namespace}$${event}`,
            JSON.stringify(data)
        );
    };

    #distributeEvents = (message, scope) => {
        function executeHandlers(channel) {
            for (const { id, handler } of channel.onAnyHandlers) {
                handler(message);
            }

            const eventSpecificHandlers = channel.eventHandlers[event] ?? [];
            for (const { id, handler } of eventSpecificHandlers) {
                handler(message);
            }
        }

        const [namespace, event] = scope.split("$");
        const subchannelNames = namespace.split(":");

        let channel = this.#channelTree[subchannelNames.shift()];

        executeHandlers(channel);
        for (const subchannelName of subchannelNames) {
            channel = channel.subchannels[subchannelName];
            executeHandlers(channel);
        }
    };
}

export default EventBroker;
