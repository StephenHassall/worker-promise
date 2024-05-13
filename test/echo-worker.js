/**
 * Echo worker.
 */
import { WorkerPromise } from "../worker-promise.js";
import { WorkerLink } from "../worker-link.js";

// Create worker link
const workerLink = new WorkerLink();

/**
 * Receive echo task.
 */
WorkerPromise.receive(workerLink, 'echo', (resolve, reject, data) => {
    // Echo back the same data
    resolve(data);
});

/**
 * Receive echo-async task.
 */
WorkerPromise.receive(workerLink, 'echo-async', async (resolve, reject, data) => {
    // Use await for the promise to finish
    const result = await new Promise((timeoutResolve) => {
        setTimeout(() => {
            timeoutResolve('timeout');
        }, 500)
    });

    // Then echo back the same data
    resolve(data + result);
});
