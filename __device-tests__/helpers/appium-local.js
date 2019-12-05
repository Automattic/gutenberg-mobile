/**
 * @flow
 * @format
 * */

/**
 * External dependencies
 */
import childProcess from 'child_process';

// Spawns an appium process
export const start = ( localAppiumPort: number, testID: number ) => new Promise < childProcess.ChildProcess > ( ( resolve, reject ) => {
	const params = [
		'--port', localAppiumPort.toString(),
		'--log', `./appium-out-${ localAppiumPort }-${ testID }.log`,
		'--log-no-colors',
		'--relaxed-security', // Needed for mobile:shell command for text entry on Android
	];
	const appium = childProcess.spawn( 'appium', params );

	let appiumOutputBuffer = '';
	let resolved = false;
	appium.stdout.on( 'data', ( data ) => {
		if ( ! resolved ) {
			appiumOutputBuffer += data.toString();
			if ( appiumOutputBuffer.indexOf( 'Appium REST http interface listener started' ) >= 0 ) {
				resolved = true;
				resolve( appium );
			}
		}
	} );

	appium.on( 'close', ( code ) => {
		if ( ! resolved ) {
			reject( new Error( `Appium process exited with code ${ code }` ) );
		}
	} );
} );

export const stop = async ( appium: ?childProcess.ChildProcess ) => {
	if ( ! appium ) {
		return;
	}
	await appium.kill( 'SIGKILL' );
};

export default {
	start,
	stop,
};
