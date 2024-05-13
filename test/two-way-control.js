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
        await TwoWayControl.testTwoWay();
        await TwoWayControl.testTwoWayReject();
        await TwoWayControl.testTwoWayAsync();
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

    /**
     * Test two way with async promise.
     */
    static async testTwoWayAsync() {
        // Create worker link
        const workerLink = new WorkerLink('two-way-worker.js', import.meta.url);

        // Handle two way return task
        WorkerPromise.receive(workerLink, 'worker-control-async', async (resolve, reject, data) => {
            // Use await for the promise to finish
            const result = await new Promise((timeoutResolve) => {
                setTimeout(() => {
                    timeoutResolve('timeout');
                }, 500)
            });

            // Resolve with extra data
            resolve(data + result + 'control');
        });

        // Test two way promise
        Test.describe('Two way async promise');
        let result = await WorkerPromise.send(workerLink, 'control-worker-async', 'data');
        Test.assertEqual(result, 'dataworkertimeoutcontrolresult');

        // End worker link
        workerLink.terminate();
    }
}
