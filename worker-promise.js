/**
 * Worker promise.
 * Used to transfer data between main thread and worker thread using promises.
 */
import { WorkerLink } from "./worker-link.js";

export class WorkerPromise {
    /**
     * Send data to the other thread to perform a task.
     * @param {WorkerLink} workerLink The worker link that the promise is sending data to.
     * @param {String} name The name of the type of message the data is related to.
     * @param {Object} data The data being sent.
     * @return {Promise} Promise to resolve or reject the task being performed.
     */
    static send(workerLink, name, data) {
        // Post the send data to the other thread
        return workerLink.postSend(name, data);
    }

    /**
     * Receive promises from the other thread.
     * @param {WorkerLink} workerLink The worker link that the promise is receiving data from.
     * @param {String} name The name of the type of message the data is related to.
     * @callback executor A callback used to initialize the promise.
     * @param {Object} data The data that was past into the send function.
     * @param {function} resolve Call this to resolve the promise.
     * @param {function} reject Call this to reject the promise.
     */
    static receive(workerLink, name, executor) {
        // Add a receive wait
        workerLink.addReceiveWait(name, executor);
    }
}