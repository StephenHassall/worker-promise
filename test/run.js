/**
 * Run all the tests.
 */
import Test from "./test.js";
import EchoControl from "./echo-control.js";
import ErrorControl from "./error-control.js";
import BufferControl from "./buffer-control.js";
import TwoWayControl from "./two-way-control.js";
import DataControl from "./data-control.js";

(async () => {
    // Perform tests
    //await EchoControl.run();
    //await ErrorControl.run();
    //await BufferControl.run();
    //await TwoWayControl.run();
    await DataControl.run();

    // Report results
    Test.report();
})();