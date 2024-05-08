/**
 * Run all the tests.
 */
import Test from "./test.js";
import EchoControl from "./echo-control.js";
import ErrorControl from "./error-control.js";

(async () => {
    // Perform tests
    //await EchoControl.run();
    await ErrorControl.run();

    // Report results
    Test.report();
})();