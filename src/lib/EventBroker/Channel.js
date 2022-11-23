class Channel {
    #broker;

    constructor(namespace, broker) {
        this.namespace = namespace;
        this.#broker = broker;
    }

    async on(event, handler) {
        await this.#broker.subscribe(this.namespace, event, handler);
    }

    async onAny(handler) {
        await this.#broker.subscribe(this.namespace, null, handler);
    }

    async off(handlerId) {
        await this.#broker.unsubscribe(handlerId);
    }

    async emit(event, data) {
        await this.#broker.publish(this.namespace, event, data);
    }

    subchannel(channelName) {
        return new Channel(`${this.namespace}:${channelName}`, this.#broker);
    }
}

export default Channel;
