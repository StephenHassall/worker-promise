/**
 * Data control.
 */
import { WorkerPromise } from "../worker-promise.js";
import { WorkerLink } from "../worker-link.js";
import Test from "./test.js";

export default class DataControl {
    /**
     * Run all the data control tests.
     */
    static async run() {
        // Set test
        Test.test('DataControl');

        // Perform tests
        await DataControl.testComplexData();
        await DataControl.testNonSerializableData();

        // TODO testRejectData();
    }

    /**
     * Test complex data.
     */
    static async testComplexData() {
        // Create worker link
        const workerLink = new WorkerLink('data-worker.js', import.meta.url);

        // Set error
        workerLink.error((error) => {
            // Should not get here
            Test.assert();
        });

        // Create data to send
        const dataFrom = {};
        dataFrom.number = 1234;
        dataFrom.text = 'hello';
        dataFrom.boolean = true;

        // Test complex data
        Test.describe('Complex data');
        let dataReturn = await WorkerPromise.send(workerLink, 'data', dataFrom);
        Test.assert(dataReturn);
        Test.assertEqual(dataReturn.rNumber, 9876);
        Test.assertEqual(dataReturn.rText, 'world');
        Test.assertEqual(dataReturn.rBoolean, false);

        // End worker link
        workerLink.terminate();
    }

    /**
     * Test non serializable data.
     */
    static async testNonSerializableData() {
        // Create worker link
        const workerLink = new WorkerLink('data-worker.js', import.meta.url);

        // Set error
        workerLink.error((error) => {
            // Should not get here
            Test.assert();
        });

        // Create data to send
        const dataFrom = {};
        dataFrom.number = 1234;
        dataFrom.func = function () { return 42; }

        // Test complex data
        Test.describe('Non serializable data');
        try {
            let result = await WorkerPromise.send(workerLink, 'data2', dataFrom);
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Failed to execute \'postMessage\' on \'Worker\': function () { return 42; } could not be cloned.');
        }

        // End worker link
        workerLink.terminate();
    }
}
