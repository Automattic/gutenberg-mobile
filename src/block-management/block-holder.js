/**
* @format
* @flow
*/

/**
 * External dependencies
 */
import React from 'react';
import {
	View,
	Text,
	TouchableWithoutFeedback,
	NativeSyntheticEvent,
	NativeTouchEvent,
	Keyboard,
} from 'react-native';
import TextInputState from 'react-native/lib/TextInputState';
import {
	requestImageUploadCancel,
} from 'react-native-gutenberg-bridge';

/**
 * WordPress dependencies
 */
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { addAction, hasAction, removeAction } from '@wordpress/hooks';
import { getBlockType } from '@wordpress/blocks';
import { BlockEdit, BlockInvalidWarning } from '@wordpress/block-editor';
import { __, sprintf } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import type { BlockType } from '../store/types';
import styles from './block-holder.scss';
import InlineToolbar, { InlineToolbarActions } from './inline-toolbar';

type PropsType = BlockType & {
	clientId: string,
	rootClientId: string,
	isSelected: boolean,
	isFirstBlock: boolean,
	isLastBlock: boolean,
	showTitle: boolean,
	borderStyle: Object,
	focusedBorderColor: string,
	getBlockIndex: ( clientId: string, rootClientId: string ) => number,
	getPreviousBlockClientId: ( clientId: string ) => string,
	getNextBlockClientId: ( clientId: string ) => string,
	getBlockName: ( clientId: string ) => string,
	onChange: ( attributes: mixed ) => void,
	onInsertBlocks: ( blocks: Array<Object>, index: number ) => void,
	onCaretVerticalPositionChange: ( targetId: number, caretY: number, previousCaretY: ?number ) => void,
	onReplace: ( blocks: Array<Object> ) => void,
	onSelect: ( clientId: string ) => void,
	mergeBlocks: ( clientId: string, clientId: string ) => void,
	moveBlockUp: () => void,
	moveBlockDown: () => void,
	removeBlock: () => void,
};

type StateType = {
	isFullyBordered: boolean;
}

export class BlockHolder extends React.Component<PropsType, StateType> {
	constructor( props: PropsType ) {
		super( props );

		this.state = {
			isFullyBordered: false,
		};
	}

	onFocus = ( event: NativeSyntheticEvent<NativeTouchEvent> ) => {
		if ( event ) {
			// == Hack for the Alpha ==
			// When moving the focus from a TextInput field to another kind of field the call that hides the keyboard is not invoked
			// properly, resulting in keyboard up when it should not be there.
			// The code below dismisses the keyboard (calling blur on the last TextInput field) when the field that now gets the focus is a non-textual field
			const currentlyFocusedTextInput = TextInputState.currentlyFocusedField();
			if ( event.nativeEvent.target !== currentlyFocusedTextInput && ! TextInputState.isTextInput( event.nativeEvent.target ) ) {
				TextInputState.blurTextInput( currentlyFocusedTextInput );
			}
		}
		this.props.onSelect( this.props.clientId );
	};

	onRemoveBlockCheckUpload = ( mediaId: number ) => {
		if ( hasAction( 'blocks.onRemoveBlockCheckUpload' ) ) {
			// now remove the action as it's  a one-shot use and won't be needed anymore
			removeAction( 'blocks.onRemoveBlockCheckUpload', 'gutenberg-mobile/blocks' );
			requestImageUploadCancel( mediaId );
		}
	};

	onInlineToolbarButtonPressed = ( button: number ) => {
		Keyboard.dismiss();
		switch ( button ) {
			case InlineToolbarActions.UP:
				this.props.moveBlockUp();
				break;
			case InlineToolbarActions.DOWN:
				this.props.moveBlockDown();
				break;
			case InlineToolbarActions.DELETE:
				// adding a action that will exist for as long as it takes for the block to be removed and the component unmounted
				// this acts as a flag for the code using the action to know of its existence
				addAction( 'blocks.onRemoveBlockCheckUpload', 'gutenberg-mobile/blocks', this.onRemoveBlockCheckUpload );
				this.props.removeBlock();
				break;
		}
	};

	insertBlocksAfter = ( blocks: Array<Object> ) => {
		const order = this.props.getBlockIndex( this.props.clientId, this.props.rootClientId );
		this.props.onInsertBlocks( blocks, order + 1 );

		if ( blocks[ 0 ] ) {
			// focus on the first block inserted
			this.props.onSelect( blocks[ 0 ].clientId );
		}
	};

	renderToolbar() {
		if ( ! this.props.isSelected ) {
			return null;
		}

		return (
			<InlineToolbar
				clientId={ this.props.clientId }
				onButtonPressed={ this.onInlineToolbarButtonPressed }
				canMoveUp={ ! this.props.isFirstBlock }
				canMoveDown={ ! this.props.isLastBlock }
			/>
		);
	}

	getBlockForType() {
		return (
			<BlockEdit
				name={ this.props.name }
				isSelected={ this.props.isSelected }
				attributes={ this.props.attributes }
				setAttributes={ this.props.onChange }
				onFocus={ this.onFocus }
				onReplace={ this.props.onReplace }
				insertBlocksAfter={ this.insertBlocksAfter }
				mergeBlocks={ this.props.mergeBlocks }
				onCaretVerticalPositionChange={ this.props.onCaretVerticalPositionChange }
				clientId={ this.props.clientId }
			/>
		);
	}

	getAccessibilityLabelForBlock() {
		const { clientId, rootClientId } = this.props;
		const order = this.props.getBlockIndex( clientId, rootClientId );
		const name = this.props.getBlockName( clientId );
		let blockTitle = getBlockType( name ).title;

		blockTitle = blockTitle === 'Unrecognized Block' ? blockTitle : `${ blockTitle } Block`;

		return sprintf( __( '%s. Row %d.' ), blockTitle, order + 1 ); // Use one indexing for better accessibility
	}

	renderBlockTitle() {
		return (
			<View style={ styles.blockTitle }>
				<Text>BlockType: { this.props.name }</Text>
			</View>
		);
	}

	render() {
		const { isSelected, borderStyle, focusedBorderColor, isValid, name } = this.props;

		const borderColor = isSelected ? focusedBorderColor : 'transparent';
		const accessibilityLabel = this.getAccessibilityLabelForBlock();
		const blockType = getBlockType( name );

		return (
			// accessible prop needs to be false to access children
			// https://facebook.github.io/react-native/docs/accessibility#accessible-ios-android
			<TouchableWithoutFeedback
				accessible={ false }
				onPress={ this.onFocus }
			>

				<View style={ [ styles.blockHolder, borderStyle, { borderColor } ] }>
					{ this.props.showTitle && this.renderBlockTitle() }
					<View
						accessibile={ true }
						accessibilityLabel={ accessibilityLabel }
						style={ [ ! isSelected && styles.blockContainer, isSelected && styles.blockContainerFocused ] }
					>
						{ isValid && this.getBlockForType() }
						{ ! isValid &&
							<BlockInvalidWarning blockTitle={ blockType.title } icon={ blockType.icon } />
						}
					</View>
					{ this.renderToolbar() }
				</View>

			</TouchableWithoutFeedback>
		);
	}
}

export default compose( [
	withSelect( ( select, { clientId, rootClientId } ) => {
		const {
			getBlockName,
			getBlockIndex,
			getBlocks,
			getPreviousBlockClientId,
			getNextBlockClientId,
			isBlockSelected,
			__unstableGetBlockWithoutInnerBlocks,
		} = select( 'core/block-editor' );
		const order = getBlockIndex( clientId, rootClientId );
		const isSelected = isBlockSelected( clientId );
		const isFirstBlock = order === 0;
		const isLastBlock = order === getBlocks().length - 1;
		const block = __unstableGetBlockWithoutInnerBlocks( clientId );
		const { name, attributes, isValid } = block || {};

		return {
			attributes,
			getBlockIndex,
			getBlockName,
			getPreviousBlockClientId,
			getNextBlockClientId,
			isFirstBlock,
			isLastBlock,
			isSelected,
			name,
			isValid,
		};
	} ),
	withDispatch( ( dispatch, { clientId, rootClientId }, { select } ) => {
		const {
			insertBlocks,
			mergeBlocks,
			moveBlocksDown,
			moveBlocksUp,
			removeBlock,
			replaceBlocks,
			selectBlock,
			updateBlockAttributes,
		} = dispatch( 'core/block-editor' );

		return {
			mergeBlocks( forward ) {
				const {
					getPreviousBlockClientId,
					getNextBlockClientId,
				} = select( 'core/block-editor' );

				if ( forward ) {
					const nextBlockClientId = getNextBlockClientId( clientId );
					if ( nextBlockClientId ) {
						mergeBlocks( clientId, nextBlockClientId );
					}
				} else {
					const previousBlockClientId = getPreviousBlockClientId( clientId );
					if ( previousBlockClientId ) {
						mergeBlocks( previousBlockClientId, clientId );
					}
				}
			},
			moveBlockDown() {
				moveBlocksDown( clientId );
			},
			moveBlockUp() {
				moveBlocksUp( clientId );
			},
			removeBlock() {
				removeBlock( clientId );
			},
			onInsertBlocks( blocks: Array<Object>, index: number ) {
				insertBlocks( blocks, index, rootClientId );
			},
			onSelect: ( selectedClientId: string ) => {
				selectBlock( selectedClientId );
			},
			onChange: ( attributes: Object ) => {
				updateBlockAttributes( clientId, attributes );
			},
			onReplace( blocks: Array<Object>, indexToSelect: number ) {
				replaceBlocks( [ clientId ], blocks, indexToSelect );
			},
		};
	} ),
] )( BlockHolder );
