/**
 * Worker promise.
 * Used to transfer data between main thread and worker thread using promises.
 * It is just calling the WorkerLink send and receive functions.
 */
import { WorkerLink } from "./worker-link.js";

export class WorkerPromise {
    /**
     * Send data to the other thread to perform a task.
     * @param {WorkerLink} workerLink The worker link that the promise is sending data to.
     * @param {String} name The name of the type of message the data is related to.
     * @param {Object} [data] The data being sent.
     * @param {Array} [transferableList] List of buffers that will be transferred.
     * @return {Promise} Promise to resolve or reject the task being performed.
     */
    static send(workerLink, name, data, transferableList) {
        // Call the worker send function
        return workerLink.send(name, data, transferableList);
    }

    /**
     * Receive promises from the other thread.
     * @param {WorkerLink} workerLink The worker link that the promise is receiving data from.
     * @param {String} name The name of the type of message the data is related to.
     * @callback executor A callback used to initialize the promise.
     * @param {function} resolve Call this to resolve the promise.
     * @param {function} reject Call this to reject the promise.
     * @param {Object} [data] The data that was past into the send function.
     * @param {Array} [transferableList] List of buffers that will be transferred.
     */
    static receive(workerLink, name, executor) {
        // Add a receive wait
        workerLink.receive(name, executor);
    }
}