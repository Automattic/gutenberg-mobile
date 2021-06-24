/**
 * WordPress dependencies
 */
import { addAction, addFilter } from '@wordpress/hooks';
import {
	doGutenbergNativeSetup,
	initialHtmlGutenberg,
} from '@wordpress/react-native-editor';

/**
 * Internal dependencies
 */
import correctTextFontWeight from './text-font-weight-correct';
import setupJetpackEditor from './jetpack-editor-setup';
import setupBlockExperiments from './block-experiments-setup';
import initialHtml from './initial-html';
import * as Sentry from './sentry';

addAction( 'native.pre-render', 'gutenberg-mobile', async ( props ) => {
	const { sentryOptions } = props;

	require( './strings-overrides' );
	correctTextFontWeight();

	// Crash logging - Sentry initialization
	Sentry.initialize( sentryOptions );
} );

addAction( 'native.render', 'gutenberg-mobile', ( props ) => {
	setupJetpackEditor(
		props.jetpackState || { blogId: 1, isJetpackActive: true }
	);
	const capabilities = props.capabilities ?? {};
	setupBlockExperiments( capabilities );
} );

addFilter( 'native.block_editor_props', 'gutenberg-mobile', ( editorProps ) => {
	if ( __DEV__ ) {
		let { initialTitle, initialData } = editorProps;

		if ( initialTitle === undefined ) {
			initialTitle = 'Welcome to gutenberg for WP Apps!';
		}

		if ( initialData === undefined ) {
			initialData = initialHtml + initialHtmlGutenberg;
		}

		return {
			...editorProps,
			initialTitle,
			initialData,
		};
	}
	return editorProps;
} );

doGutenbergNativeSetup();
