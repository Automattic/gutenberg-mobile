/**
 * External dependencies
 */
import { NativeModules, Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';

const { RNSentry } = NativeModules;

const IGNORED_DEFAULT_INTEGRATIONS = [
	'Release',
	'Breadcrumbs',
	'UserAgent',
	'DeviceContext',
];

export function initialize( options ) {
	// Disable Sentry initialization on Android because it's not available yet.
	if ( Platform.OS === 'android' ) {
		return;
	}

	if ( ! options ) {
		// eslint-disable-next-line no-console
		console.warn(
			"Sentry options are not defined so it won't be initialized."
		);
		return;
	}

	const { dsn, environment, releaseName } = options;
	Sentry.init( {
		dsn,
		debug: __DEV__,
		environment,
		release: releaseName,
		dist: releaseName,
		beforeSend: async ( event ) => {
			const shouldSendEvent = await RNSentry.shouldSendEvent();
			if ( ! shouldSendEvent ) {
				return false;
			}

			// The scope from the native side is attached to the event.
			const eventWithScope = await RNSentry.attachScopeToEvent( event );
			// Set user fetched from native side to the event.
			eventWithScope.user = await RNSentry.getUser();

			return eventWithScope;
		},
		integrations: ( items ) => {
			const filteredIntegrations = items.filter(
				( item ) => ! IGNORED_DEFAULT_INTEGRATIONS.includes( item.name )
			);
			// Breadcrumbs integration is required to enable breadcumbs in the event.
			// As the breadcrumbs will be set by the main apps, we disable all the tracking options.
			filteredIntegrations.push(
				new Sentry.BrowserIntegrations.Breadcrumbs( {
					console: false,
					dom: false,
					fetch: false,
					history: false,
					sentry: false,
					xhr: false,
				} )
			);
			return filteredIntegrations;
		},
	} );
}
