/** @format */

import renderer from 'react-test-renderer';

import App from './App';
import BlockListBlock from '../components/editor/block-list/block';

describe( 'App', () => {
	it( 'renders without crashing', () => {
		const app = renderer.create( <App /> );
		const rendered = app.toJSON();
		expect( rendered ).toBeTruthy();
	} );

	it( 'renders without crashing with a block focused', () => {
		// render an App using the default Store
		const app = renderer.create( <App /> );
		const rendered = app.toJSON();

		// App should be rendered OK
		expect( rendered ).toBeTruthy();
	} );

	it( 'Code block is a TextInput', () => {
		renderer
			.create( <App /> )
			.root.findAllByType( BlockListBlock )
			.forEach( ( blockHolder ) => {
				if ( 'core/code' === blockHolder.props.name ) {
					// TODO: hardcoded indices are ugly and error prone. Can we do better here?
					const blockHolderContainer = blockHolder.children[ 0 ].children[ 0 ].children[ 0 ];
					const contentComponent = blockHolderContainer.children[ 0 ];
					const inputComponent =
						contentComponent.children[ 0 ].children[ 0 ].children[ 0 ].children[ 0 ].children[ 0 ]
							.children[ 0 ].children[ 0 ];
					expect( inputComponent.type ).toBe( 'TextInput' );
				}
			} );
	} );

	it( 'Heading block test', () => {
		renderer
			.create( <App /> )
			.root.findAllByType( BlockListBlock )
			.forEach( ( blockHolder ) => {
				if ( 'core/heading' === blockHolder.props.name ) {
					const aztec = blockHolder.findByType( 'RCTAztecView' );
					expect( aztec.props.text.text ).toBe( '<h2>Welcome to Gutenberg</h2>' );
				}
			} );
	} );
} );
