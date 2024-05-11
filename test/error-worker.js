/**
 * Error worker.
 */
import { WorkerPromise } from "../worker-promise.js";
import { WorkerLink } from "../worker-link.js";

// Create worker link
const workerLink = new WorkerLink();

/**
 * Receive error task.
 */
WorkerPromise.receive(workerLink, 'error', (resolve, reject, data) => {
    // If good then resolve okay
    if (data === 'good') { resolve('okay'); return; }

    // If throw error then throw an error
    if (data === 'throw') throw new Error('throw error');

    // If reject then call reject (then return)
    if (data === 'reject') { reject('reject error'); return; }

    // If nothing then just return doing nothing
    if (data === 'nothing') return;

    // If resolve twice
    if (data === 'resolve_twice') { resolve('resolve1'); resolve('resolve2'); return; }

    // If terminate
    if (data === 'terminate') { workerLink.terminate(); return; }

    // Resolve with no data
    resolve();
});
