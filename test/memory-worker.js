/**
 * Memory worker.
 */
import { WorkerPromise } from "../worker-promise.js";
import { WorkerLink } from "../worker-link.js";

// Create worker link
const workerLink = new WorkerLink();

/**
 * Receive echo task.
 */
WorkerPromise.receive(workerLink, 'echo', (data, resolve, reject) => {
    // Echo back the same data
    resolve(data);
});
