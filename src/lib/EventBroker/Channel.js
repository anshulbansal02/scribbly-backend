class Channel {
    #broker;

    constructor(namespace, broker) {
        this.namespace = namespace;
        this.#broker = broker;
    }

    on(event, handler, timeout) {
        const handlerId = this.#broker.subscribe(
            this.namespace,
            event,
            handler
        );
        if (timeout && typeof timeout === "number") {
            setTimeout(() => {
                this.#broker.unsubscribe(handlerId);
            }, timeout);
        }
    }

    once(event, handler, timeout) {
        const handlerId = this.#broker.subscribe(
            this.namespace,
            event,
            (message, subchannels, id) => {
                handler(message, subchannels, id);
                this.#broker.unsubscribe(handlerId);
            }
        );
        if (timeout && typeof timeout === "number") {
            setTimeout(() => {
                this.#broker.unsubscribe(handlerId);
            }, timeout);
        }
    }

    onAny(handler, timeout) {
        const handlerId = this.#broker.subscribe(this.namespace, null, handler);
        if (timeout && typeof timeout === "number") {
            setTimeout(() => {
                this.#broker.unsubscribe(handlerId);
            }, timeout);
        }
    }

    off(handlerId) {
        this.#broker.unsubscribe(handlerId);
    }

    async emit(event, data) {
        await this.#broker.publish(this.namespace, event, data);
    }

    subchannel(channelName) {
        return new Channel(`${this.namespace}:${channelName}`, this.#broker);
    }
}

export default Channel;
