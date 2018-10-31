/**
* @format
* @flow
*/

import React from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import InlineToolbar from './inline-toolbar';

import type { BlockType } from '../store/';

import styles from './block-holder.scss';

// Gutenberg imports
import { getBlockType, getUnregisteredTypeHandlerName } from '@wordpress/blocks';
import { BlockEdit } from '@wordpress/editor';

type PropsType = BlockType & {
	showTitle: boolean,
	onChange: ( clientId: string, attributes: mixed ) => void,
	onInlineToolbarButtonPressed: ( button: number, clientId: string ) => void,
	onBlockHolderPressed: ( clientId: string ) => void,
	insertBlocksAfter: ( blocks: Array<Object> ) => void,
};

type StateType = {
	selected: boolean,
	focused: boolean,
};

export default class BlockHolder extends React.Component<PropsType, StateType> {
	constructor( props: PropsType ) {
		super( props );
		this.state = {
			selected: false,
			focused: false,
		};
	}

	renderToolbarIfBlockFocused() {
		if ( this.props.focused ) {
			return (
				<InlineToolbar
					clientId={ this.props.clientId }
					onButtonPressed={ this.props.onInlineToolbarButtonPressed }
				/>
			);
		}

		// Return empty view, toolbar won't be rendered
		return <View />;
	}

	getBlockForType() {
		// Since unsupported blocks are handled in block-manager.js, at this point the block should definitely
		// be supported.
		const blockType = getBlockType( this.props.name );
		
		let style;
		if ( blockType.name === 'core/code' ) {
			style = styles.blockCode;
		} else if ( blockType.name === 'core/paragraph' ) {
			style = styles.blockText;
		}

		return (
			<BlockEdit
				name={ this.props.name }
				attributes={ { ...this.props.attributes } }
				// pass a curried version of onChanged with just one argument
				setAttributes={ ( attrs ) =>
					this.props.onChange( this.props.clientId, { ...this.props.attributes, ...attrs } )
				}
				insertBlocksAfter={ this.props.insertBlocksAfter }
				isSelected={ this.props.focused }
				style={ style }
			/>
		);
	}

	getBlockType( blockName: String ) {
		let blockType = getBlockType( blockName );

		if ( ! blockType ) {
			const fallbackBlockName = getUnregisteredTypeHandlerName();
			blockType = getBlockType( fallbackBlockName );
		}

		return blockType;
	}

	renderBlockTitle() {
		return (
			<View style={ styles.blockTitle }>
				<Text>BlockType: { this.props.name }</Text>
			</View>
		);
	}

	render() {
		return (
			<TouchableWithoutFeedback
				onPress={ this.props.onBlockHolderPressed.bind( this, this.props.clientId ) }
			>
				<View style={ styles.blockHolder }>
					{ this.props.showTitle && this.renderBlockTitle() }
					<View style={ styles.blockContainer }>{ this.getBlockForType.bind( this )() }</View>
					{ this.renderToolbarIfBlockFocused.bind( this )() }
				</View>
			</TouchableWithoutFeedback>
		);
	}
}
