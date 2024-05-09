/**
 * Echo control.
 */
import { WorkerPromise } from "../worker-promise.js";
import { WorkerLink } from "../worker-link.js";
import Test from "./test.js";

export default class EchoControl {
    /**
     * Run all the echo control tests.
     */
    static async run() {
        // Set test
        Test.test('EchoControl');

        // Perform tests
        await EchoControl.testSingle();
        await EchoControl.testMultiple();
    }

    /**
     * Test single promise.
     */
    static async testSingle() {
        // Create worker link
        const workerLink = new WorkerLink('echo-worker.js', import.meta.url);

        // Test single (one at a time)
        Test.describe('Single');
        let result = await WorkerPromise.send(workerLink, 'echo', 'hello world');
        Test.assertEqual(result, 'hello world');
        result = await WorkerPromise.send(workerLink, 'echo', 'another message');
        Test.assertEqual(result, 'another message');

        // Test unknown task name
        Test.describe('Unknow task name');
        try {
            result = await WorkerPromise.send(workerLink, 'unknown', 'lost forever');
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Unknown task name unknown');
        }

        // End worker link
        workerLink.terminate();
    }

    /**
     * Test multiple promise.
     */
    static async testMultiple() {
        // Create worker link
        const workerLink = new WorkerLink('echo-worker.js', import.meta.url);

        // Test 3 in parallel
        Test.describe('3 in parallel');
        const promiseList = [];
        promiseList.push(WorkerPromise.send(workerLink, 'echo', 'promise1'));
        promiseList.push(WorkerPromise.send(workerLink, 'echo', 'promise2'));
        promiseList.push(WorkerPromise.send(workerLink, 'echo', 'promise3'));
        const resultList = await Promise.all(promiseList);
        Test.assertEqual(resultList.length, 3);
        Test.assertEqual(resultList[0], 'promise1');
        Test.assertEqual(resultList[1], 'promise2');
        Test.assertEqual(resultList[2], 'promise3');

        // End worker link
        workerLink.terminate();
    }

}
