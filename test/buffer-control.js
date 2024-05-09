/**
 * Buffer control.
 */
import { WorkerPromise } from "../worker-promise.js";
import { WorkerLink } from "../worker-link.js";
import Test from "./test.js";

export default class BufferControl {
    /**
     * Run all the buffer control tests.
     */
    static async run() {
        // Set test
        Test.test('BufferControl');

        // Perform tests
        //await BufferControl.testSingleBuffer();
        await BufferControl.test3Buffer();
    }

    /**
     * Test single buffer.
     */
    static async testSingleBuffer() {
        // Create worker link
        const workerLink = new WorkerLink('buffer-worker.js', import.meta.url);

        // Test single buffer
        Test.describe('Single buffer');

        // Create byte array
        const byteArray = new Uint8Array(4);
        byteArray[0] = 0x01;
        byteArray[1] = 0x02;
        byteArray[2] = 0x04;
        byteArray[3] = 0x08;

        // Send buffer
        let result = await WorkerPromise.send(workerLink, 'single-buffer', 'single buffer', [byteArray.buffer]);

        // Get data and trasferable list
        let data = result.data;
        let transferableList = result.transferableList;
        Test.assertEqual(data, 'single buffer');
        Test.assert(transferableList);
        Test.assertEqual(transferableList.length, 1);
        let returnedByteArray = new Uint8Array(transferableList[0]);
        Test.assertEqual(returnedByteArray[0], 0x02);
        Test.assertEqual(returnedByteArray[1], 0x03);
        Test.assertEqual(returnedByteArray[2], 0x05);
        Test.assertEqual(returnedByteArray[3], 0x09);

        // End worker link
        workerLink.terminate();
    }

    /**
     * Test 3 buffers.
     */
    static async test3Buffer() {
        // Create worker link
        const workerLink = new WorkerLink('buffer-worker.js', import.meta.url);

        // Test 3 buffer
        Test.describe('3 buffer');

        // Create arrays
        const byteArray = new Uint8Array(4);
        const integerArray = new Uint32Array(4);
        const floatArray = new Float64Array(4);

        // Set values
        byteArray[0] = 0x11;
        byteArray[1] = 0x22;
        byteArray[2] = 0x34;
        byteArray[3] = 0x48;
        integerArray[0] = 123;
        integerArray[1] = 456;
        integerArray[2] = 789;
        integerArray[3] = 852;
        floatArray[0] = 3.142;
        floatArray[1] = 12.34;
        floatArray[2] = 2.718;
        floatArray[3] = 101.42;

        // Send buffers
        let result = await WorkerPromise.send(workerLink, '3-buffer', '3 buffer', [byteArray.buffer, integerArray.buffer, floatArray.buffer]);

        // Get data and trasferable list
        let data = result.data;
        let transferableList = result.transferableList;
        Test.assertEqual(data, '3 buffer');
        Test.assert(transferableList);
        Test.assertEqual(transferableList.length, 3);
        let returnedByteArray = new Uint8Array(transferableList[0]);
        let returnedIntegerArray = new Uint32Array(transferableList[1]);
        let returnedFloatArray = new Float64Array(transferableList[2]);
        Test.assertEqual(returnedByteArray[0], 0x12);
        Test.assertEqual(returnedByteArray[1], 0x23);
        Test.assertEqual(returnedByteArray[2], 0x35);
        Test.assertEqual(returnedByteArray[3], 0x49);
        Test.assertEqual(returnedIntegerArray[0], 124);
        Test.assertEqual(returnedIntegerArray[1], 457);
        Test.assertEqual(returnedIntegerArray[2], 790);
        Test.assertEqual(returnedIntegerArray[3], 853);
        Test.assertEqual(returnedFloatArray[0].toFixed(3), '4.142');
        Test.assertEqual(returnedFloatArray[1].toFixed(2), '13.34');
        Test.assertEqual(returnedFloatArray[2].toFixed(3), '3.718');
        Test.assertEqual(returnedFloatArray[3].toFixed(2), '102.42');

        // End worker link
        workerLink.terminate();
    }
}
