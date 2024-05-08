/**
 * Memory control.
 */
import { WorkerPromise } from "../worker-promise.js";
import { WorkerLink } from "../worker-link.js";
import Test from "./test.js";

export default class MemoryControl {
    /**
     * Test one by one.
     */
    static async testOneByOne() {
        // Set test
        Test.test('MemoryControl');
        Test.describe('One by one');

        // Create worker link if required
        if (!MemoryControl._workerLink) MemoryControl._workerLink = new WorkerLink('memory-worker.js', import.meta.url);

        // Loop for a 100 times
        for (let count = 0; count < 100; count++) {
            // Create data
            const data = 'COUNT:' + count.toString();

            let result = await WorkerPromise.send(MemoryControl._workerLink, 'echo', data);
            Test.assertEqual(result, data);
        }

        // Log test done
        console.log('OneByOne done');
    }

    /**
     * Test parallel.
     */
    static async testParallel() {
        // Set test
        Test.test('MemoryControl');
        Test.describe('Parallel');

        // Create worker link if required
        if (!MemoryControl._workerLink) MemoryControl._workerLink = new WorkerLink('memory-worker.js', import.meta.url);

        // Set promise list
        const promiseList = [];

        // Loop for a 100 times
        for (let count = 0; count < 100; count++) {
            // Create data
            const data = 'COUNT:' + count.toString();

            // Add to promise list
            promiseList.push(WorkerPromise.send(MemoryControl._workerLink, 'echo', data));
        }

        // Perform all the promises at once
        const resultList = await Promise.all(promiseList);

        // Check result
        Test.assertEqual(resultList.length, 100);

        // Loop for a 100 times
        for (let count = 0; count < 100; count++) {
            // Create data
            const data = 'COUNT:' + count.toString();

            // Check result
            Test.assertEqual(resultList[count], data);
        }

        // Log test done
        console.log('Parallel done');
    }
}
