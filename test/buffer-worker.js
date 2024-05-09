/**
 * Buffer worker.
 */
import { WorkerPromise } from "../worker-promise.js";
import { WorkerLink } from "../worker-link.js";

// Create worker link
const workerLink = new WorkerLink();

/**
 * Receive single-buffer task.
 */
WorkerPromise.receive(workerLink, 'single-buffer', (resolve, reject, data, transferableList) => {
    // Check transferable list is valid
    if (!transferableList) { reject(); }
    if (transferableList.length !== 1) { reject(); }

    // Set byte array
    const byteArray = new Uint8Array(transferableList[0]);

    // Incease each byte
    byteArray[0]++;
    byteArray[1]++;
    byteArray[2]++;
    byteArray[3]++;
    
    // Send back the same data and byte array buffer
    resolve(data, [byteArray.buffer]);
});

/**
 * Receive 3-buffer task.
 */
WorkerPromise.receive(workerLink, '3-buffer', (resolve, reject, data, transferableList) => {
    // Check transferable list is valid
    if (!transferableList) { reject(); }
    if (transferableList.length !== 3) { reject(); }

    // Set byte array
    const byteArray = new Uint8Array(transferableList[0]);
    const integerArray = new Uint32Array(transferableList[1]);
    const floatArray = new Float64Array(transferableList[2]);

    // Incease each byte
    byteArray[0]++;
    byteArray[1]++;
    byteArray[2]++;
    byteArray[3]++;

    // Increase each integer
    integerArray[0]++;
    integerArray[1]++;
    integerArray[2]++;
    integerArray[3]++;

    // Increase each float
    floatArray[0]++;
    floatArray[1]++;
    floatArray[2]++;
    floatArray[3]++;
    
    // Send back the same data and arrays
    resolve(data, [byteArray.buffer, integerArray.buffer, floatArray.buffer]);
});
