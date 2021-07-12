/**
 * External dependencies
 */
import {
	getEditorHtml,
	initializeEditor,
	fireEvent,
	waitFor,
	within,
} from 'test/helpers';

/**
 * WordPress dependencies
 */
import { getBlockTypes, unregisterBlockType } from '@wordpress/blocks';
import { registerCoreBlocks } from '@wordpress/block-library';

/**
 * Internal dependencies
 */
import setupJetpackEditor from '../../jetpack-editor-setup';

beforeAll( () => {
	// Register all core blocks
	registerCoreBlocks();
	// Register Jetpack blocks
	setupJetpackEditor( { blogId: 1, isJetpackActive: true } );
} );

afterAll( () => {
	// Clean up registered blocks
	getBlockTypes().forEach( ( block ) => {
		unregisterBlockType( block.name );
	} );
} );

describe( 'Contact Info block', () => {
	it( 'inserts the block', async () => {
		const {
			getByA11yLabel,
			getByTestId,
			getByText,
			debug,
		} = await initializeEditor( {
			initialHtml: '',
			capabilities: { contactInfoBlock: true },
		} );

		// Open the inserter menu
		fireEvent.press( await waitFor( () => getByA11yLabel( 'Add block' ) ) );

		const blockList = getByTestId( 'InserterUI-Blocks' );
		// onScroll event used to force the FlatList to render all items
		fireEvent.scroll( blockList, {
			nativeEvent: {
				contentOffset: { y: 0, x: 0 },
				contentSize: { width: 100, height: 100 },
				layoutMeasurement: { width: 100, height: 100 },
			},
		} );

		// Insert the block
		fireEvent.press( await waitFor( () => getByText( 'Contact Info' ) ) );

		// Get the block
		const block = await waitFor( () =>
			getByA11yLabel( /Contact Info Block\. Row 1/ )
		);

		expect( block ).toBeDefined();
		const expectedHtml = `<!-- wp:jetpack/contact-info -->
<div class="wp-block-jetpack-contact-info"><!-- wp:jetpack/email /-->

<!-- wp:jetpack/phone /-->

<!-- wp:jetpack/address /--></div>
<!-- /wp:jetpack/contact-info -->`;
		expect( getEditorHtml() ).toBe( expectedHtml );
	} );
} );
