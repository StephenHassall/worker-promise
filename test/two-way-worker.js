/**
 * Two way worker.
 */
import { WorkerPromise } from "../worker-promise.js";
import { WorkerLink } from "../worker-link.js";

// Create worker link
const workerLink = new WorkerLink();

/**
 * Receive control-worker task.
 */
WorkerPromise.receive(workerLink, 'control-worker', (resolve, reject, data) => {
    // Ask the control for some data
    WorkerPromise.send(workerLink, 'worker-control', data + 'worker')
    .then(
        // On fulfilled
        (result) => {
            // Resolve receive promise
            resolve(result + 'result');
        },
        // On rejected
        (error) => {
            // Reject receive promise
            reject(error);
        }
    );
});

/**
 * Receive control-worker-reject task.
 */
WorkerPromise.receive(workerLink, 'control-worker-reject', (resolve, reject, data) => {
    // Ask the control for some data
    WorkerPromise.send(workerLink, 'worker-control', data + 'worker')
    .then(
        // On fulfilled
        (result) => {
            // Resolve receive promise
            resolve(result + 'result');
        },
        // On rejected
        (error) => {
            // Reject receive promise
            reject(error.message + 'error');
        }
    );
});
