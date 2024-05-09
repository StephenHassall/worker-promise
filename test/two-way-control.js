/**
 * Two way control.
 */
import { WorkerPromise } from "../worker-promise.js";
import { WorkerLink } from "../worker-link.js";
import Test from "./test.js";

export default class TwoWayControl {
    /**
     * Run all the echo control tests.
     */
    static async run() {
        // Set test
        Test.test('TwoWayControl');

        // Perform tests
        //await TwoWayControl.testTwoWay();
        await TwoWayControl.testTwoWayReject();
    }

    /**
     * Test two way promise.
     */
    static async testTwoWay() {
        // Create worker link
        const workerLink = new WorkerLink('two-way-worker.js', import.meta.url);

        // Handle two way return task
        WorkerPromise.receive(workerLink, 'worker-control', (resolve, reject, data) => {
            // Resolve with extra data
            resolve(data + 'control');
        });

        // Test two way promise
        Test.describe('Two way promise');
        let result = await WorkerPromise.send(workerLink, 'control-worker', 'data');
        Test.assertEqual(result, 'dataworkercontrolresult');

        // End worker link
        workerLink.terminate();
    }

    /**
     * Test two way reject promise.
     */
    static async testTwoWayReject() {
        // Create worker link
        const workerLink = new WorkerLink('two-way-worker.js', import.meta.url);

        // Handle two way return task
        WorkerPromise.receive(workerLink, 'worker-control', (resolve, reject, data) => {
            // Reject with extra data
            reject(data + 'control');
        });

        // Test two way promise
        Test.describe('Two way reject promise');
        try {
            let result = await WorkerPromise.send(workerLink, 'control-worker-reject', 'data');
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'dataworkercontrolerror');
        }

        // End worker link
        workerLink.terminate();
    }
}
