class TaskQueueWorker {
    constructor(id, processor) {
        this.queue = new Set();
        this.processor = processor;
    }

    enqueue(task) {
        this.queue.add(task);
        this.execute();
    }

    dequeue() {}

    reprocess() {}

    async process() {
        await this.processor(task);
    }

    execute() {
        setImmediate(this.process);
    }

    destroy() {}
}

export default TaskQueueWorker;
