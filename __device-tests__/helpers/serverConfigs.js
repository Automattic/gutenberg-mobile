exports.local = {
	host: 'localhost',
	port: 4723 + parseInt( process.env.JEST_WORKER_ID ), // Port for local Appium runs
	wdaLocalPort: 8100 + parseInt( process.env.JEST_WORKER_ID ),
};

exports.sauce = {
	host: 'ondemand.saucelabs.com',
	port: 80,
	auth: process.env.SAUCE_USERNAME + ':' + process.env.SAUCE_ACCESS_KEY,
};
