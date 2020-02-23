import { default as createTestCafe } from "testcafe";
import * as fs from "fs";
import * as path from "path";

// Testcafe cannot test on IE < 11
// Testcafe testing on Chrome Android is currently broken (https://github.com/DevExpress/testcafe/issues/3948)

const browsers = [
	"saucelabs:Internet Explorer@11.285:Windows 10",
	"saucelabs:MicrosoftEdge@16.16299:Windows 10",
	// "saucelabs:Internet Explorer@latest:Windows 10",
	// "saucelabs:MicrosoftEdge@latest:Windows 10",
	"saucelabs:iPhone XS Simulator@12.2",
	"saucelabs:Safari@12.0:macOS 10.14",
	"chrome:headless",
	"firefox:headless"
];

async function testCompat() {
	const testCafe = await createTestCafe(null, 8000, 8001);
	const dir = path.resolve(__dirname, "../tests/Sortable.compat.test.ts");

	const testDir = path.resolve("/tmp/test-results/");
	fs.mkdirSync(testDir, { recursive: true });
	const writeStream = fs.createWriteStream(
		path.resolve(testDir, "compatability-test.xml")
	);
	const runner = testCafe
		.createRunner()
		.src(dir)
		.browsers(browsers)
		.reporter("xunit", writeStream);

	console.log(`Test cafe runner created. Running tests from "${dir}"...`);
	console.log(`Tests are being run in the following browsers:`);
	console.table(browsers);

	// const periods = createPeriods()

	// Runs the test and return how many tests failed.
	const count = await runner.run({ assertionTimeout: 10000 }).catch(error => {
		console.error(
			"We ran into an error when resolving a promise from the runner! Please see below:\n"
		);
		console.error(error);
	});

	// Close the tests.
	testCafe.close();

	// Print to console basd on count of failed tests.
	// passed tests.
	if (count === 0) console.log(`All test passed with "${count}" failed tests!`);

	// failed tests.
	if (count > 0)
		throw new Error(`Not all tests passed, with "${count}" tests failing.`);

	// chances are tests didn't run here.
	if (count === undefined || count === null || count < 0)
		throw new Error("Test runner didn't work... Tests did not actually run.");
}

testCompat()
	.catch(error => {
		console.log("Uh oh, we had an error! Please read the details below:\n");
		console.error(error);
		process.exit(1);
	})
	.finally(() => {
		console.log("Compatability testing complete.");
		process.exit(0);
	});