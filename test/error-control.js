/**
 * Error control.
 */
import { WorkerPromise } from "../worker-promise.js";
import { WorkerLink } from "../worker-link.js";
import { TimeoutPromise } from "./timeout-promise.js";
import Test from "./test.js";

export default class ErrorControl {
    /**
     * Run all the error control tests.
     */
    static async run() {
        // Set test
        Test.test('ErrorControl');

        // Perform tests
        await ErrorControl.testGood();
        await ErrorControl.testThrowException();
        await ErrorControl.testReject();
        await ErrorControl.testNothing();
        await ErrorControl.testResolveTwice();
        await ErrorControl.testTerminate();
        await ErrorControl.testMissingTask();
        await ErrorControl.testNoData();
    }

    /**
     * Test good.
     */
    static async testGood() {
        // Create worker link
        const workerLink = new WorkerLink('error-worker.js', import.meta.url);

        // Test good
        Test.describe('Good');

        // Set error
        workerLink.error((error) => {
            // Should not get here
            Test.assert();
        });

        // Send no error
        let result = await WorkerPromise.send(workerLink, 'error', 'good');
        Test.assertEqual(result, 'okay');

        // End worker link
        workerLink.terminate();
    }

    /**
     * Test throw exception.
     */
    static async testThrowException() {
        // Create worker link
        const workerLink = new WorkerLink('error-worker.js', import.meta.url);

        // Test throw exception
        Test.describe('Throw exception');

        // Set error
        workerLink.error((error) => {
            Test.assertEqual(error, 'Uncaught Error: throw error');
            workerLink.terminate();
        });

        try {
            // Make worker throw an error
            let result = await WorkerPromise.send(workerLink, 'error', 'throw');
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'terminated');
        }

        // End worker link
        workerLink.terminate();
    }

    /**
     * Test reject.
     */
    static async testReject() {
        // Create worker link
        const workerLink = new WorkerLink('error-worker.js', import.meta.url);

        // Test reject
        Test.describe('Reject');

        // Set error
        workerLink.error((error) => {
            // Should not get here
            Test.assert();
        });

        try {
            // Make worker reject
            let result = await WorkerPromise.send(workerLink, 'error', 'reject');
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'reject error');
        }

        try {
            // Make worker reject-empty
            let result = await WorkerPromise.send(workerLink, 'error', 'reject-empty');
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Worker pormise rejected');
        }

        try {
            // Make worker reject-data
            let result = await WorkerPromise.send(workerLink, 'error', 'reject-data');
            Test.assert();
        } catch (e) {
            const data = e.cause;
            Test.assert(data);
            Test.assertEqual(e.message, 'Worker pormise rejected');
            Test.assertEqual(data.text, 'hello');
            Test.assertEqual(data.number, 123);
        }

        // End worker link
        workerLink.terminate();
    }

    /**
     * Test nothing.
     */
    static async testNothing() {
        // Create worker link
        const workerLink = new WorkerLink('error-worker.js', import.meta.url);

        // Test nothing
        Test.describe('Nothing');

        // Set error
        workerLink.error((error) => {
            // Should not get here
            Test.assert();
        });

        try {
            // Make worker do nothing
            const nothing = WorkerPromise.send(workerLink, 'error', 'nothing');

            // Create timeout promise
            const wait = TimeoutPromise.wait(2000);

            // The nothing promise will do nothing and the timeout promise will win the race
            const result = await Promise.race([nothing, wait]);

            // Check result
            Test.assertEqual(result, 'timeout');
        } catch (e) {
            // Should not get here
            Test.assert();
        }

        // End worker link
        workerLink.terminate();
    }

    /**
     * Test resolve_twice.
     */
    static async testResolveTwice() {
        // Create worker link
        const workerLink = new WorkerLink('error-worker.js', import.meta.url);

        // Test resolve twice
        Test.describe('Resolve twice');

        // Set error
        workerLink.error((error) => {
            // Should not get here
            Test.assert();
        });

        try {
            // Make worker resolve twice
            let result = await WorkerPromise.send(workerLink, 'error', 'resolve_twice');
            Test.assertEqual(result, 'resolve1');

            // Delay for the other resolve to do its thing
            await TimeoutPromise.wait(2000);
        } catch (e) {
            // Should not get here
            Test.assert();
        }

        // End worker link
        workerLink.terminate();
    }

    /**
     * Test terminate.
     */
    static async testTerminate() {
        // Create worker link
        const workerLink = new WorkerLink('error-worker.js', import.meta.url);

        // Test terminate
        Test.describe('Terminate');

        // Set error
        workerLink.error((error) => {
            // Should not get here
            Test.assert();
        });

        try {
            // Make worker do nothing
            const nothing = WorkerPromise.send(workerLink, 'error', 'terminate');

            // Create timeout promise
            const wait = TimeoutPromise.wait(2000);

            // The nothing promise will do nothing and the timeout promise will win the race
            const result = await Promise.race([nothing, wait]);

            // Check result
            Test.assertEqual(result, 'timeout');
        } catch (e) {
            // Should not get here
            Test.assert();
        }

        // End worker link
        workerLink.terminate();
    }

    /**
     * Test missing task name.
     */
    static async testMissingTask() {
        // Create worker link
        const workerLink = new WorkerLink('error-worker.js', import.meta.url);

        // Test resolve twice
        Test.describe('Missing task');

        // Set error
        workerLink.error((error) => {
            // Should not get here
            Test.assert();
        });

        try {
            // Make worker resolve twice
            let result = await WorkerPromise.send(workerLink, 'missing_task', 'data');
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Unknown task name missing_task');
        }

        // End worker link
        workerLink.terminate();
    }

    /**
     * Test no data name.
     */
    static async testNoData() {
        // Create worker link
        const workerLink = new WorkerLink('error-worker.js', import.meta.url);

        // Test resolve twice
        Test.describe('No data');

        // Set error
        workerLink.error((error) => {
            // Should not get here
            Test.assert();
        });

        try {
            // Make worker resolve twice
            let result = await WorkerPromise.send(workerLink, 'error');
            Test.assertEqual(result, undefined);
        } catch (e) {
            // Should not get here
            Test.assert();
        }

        // End worker link
        workerLink.terminate();
    }
}
