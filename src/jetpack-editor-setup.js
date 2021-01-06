/**
 * Internal dependencies
 */
import { JETPACK_DATA_PATH } from '../jetpack/extensions/shared/get-jetpack-data';
/**
 * WordPress dependencies
 */
import { dispatch, select } from '@wordpress/data';

// When adding new blocks to this list please also consider updating ./block-support/supported-blocks.json
const supportedJetpackBlocks = {
	'contact-info': {
		available: true,
	},
	story: {
		available: true,
	},
};

const setJetpackData = ( {
	isJetpackActive = false,
	userData = null,
	siteFragment = null,
	blogId,
} ) => {
	const availableBlocks = supportedJetpackBlocks;
	const jetpackEditorInitialState = {
		available_blocks: availableBlocks,
		jetpack: {
			is_active: isJetpackActive,
		},
		siteFragment,
		tracksUserData: userData,
		wpcomBlogId: blogId,
	};
	global.window[ JETPACK_DATA_PATH ] = jetpackEditorInitialState;
	return jetpackEditorInitialState;
};

export default ( jetpackState ) => {
	if ( ! jetpackState.isJetpackActive ) {
		return;
	}

	const jetpackData = setJetpackData( jetpackState );

	// Note on the use of setTimeout() here:
	// We observed the settings may not be ready exactly when the native.render hooks get run but rather
	// right after that execution cycle (because state hasn't changed yet). Hence, we're only checking for
	// the actual settings to be loaded by using setTimeout without a delay parameter. This ensures the
	// settings are loaded onto the store and we can use the core/block-editor selector by the time we do
	// the actual check.

	// eslint-disable-next-line @wordpress/react-no-unsafe-timeout
	setTimeout( () => {
		const mediaFilesCollectionBlock = select(
			'core/block-editor'
		).getSettings( 'capabilities' ).mediaFilesCollectionBlock;

		console.log( 'MediaFilesCollectionBlock: ', mediaFilesCollectionBlock );
		if ( mediaFilesCollectionBlock !== true ) {
			console.log( '***HIDING' );
			dispatch( 'core/edit-post' ).hideBlockTypes( [
				'jetpack/story',
				'jetpack/contact-info',
			] );
		} else {
			console.log( '***SHowing' );
			dispatch( 'core/edit-post' ).showBlockTypes( [
				'jetpack/story',
				'jetpack/contact-info',
			] );
		}
	} );

	require( '../jetpack/extensions/editor' );

	return jetpackData;
};
