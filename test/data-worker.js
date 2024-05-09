/**
 * Data worker.
 */
import { WorkerPromise } from "../worker-promise.js";
import { WorkerLink } from "../worker-link.js";
import Test from "./test.js";

// Create worker link
const workerLink = new WorkerLink();

/**
 * Receive data task.
 */
WorkerPromise.receive(workerLink, 'data', (resolve, reject, data) => {
    // Test data
    Test.assert(data);
    Test.assertEqual(data.number, 1234);
    Test.assertEqual(data.text, 'hello');
    Test.assertEqual(data.boolean, true);

    // Create different data
    const dataReturn = {};
    dataReturn.rNumber = 9876;
    dataReturn.rText = 'world';
    dataReturn.rBoolean = false;
    
    // Resolve the return data
    resolve(dataReturn);
});

/**
 * Receive data2 task.
 */
WorkerPromise.receive(workerLink, 'data2', (resolve, reject, data) => {    
    // Resolve the same data
    resolve(data);
});

/**
 * Receive reject-data task.
 */
WorkerPromise.receive(workerLink, 'reject-data', (resolve, reject, data) => {    
    // Create different data
    const dataReturn = {};
    dataReturn.rNumber = 101;
    dataReturn.rText = 'bad robot';
    dataReturn.rBoolean = false;

    // Reject the data
    reject(dataReturn);
});
