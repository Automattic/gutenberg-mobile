/**
 * @format
 * @flow
 */

/**
 * External dependencies
 */
import * as React from 'react';
import { UIManager, PanResponder } from 'react-native';

/**
 * Internal dependencies
 */
import styles from './html-text-input-ui.scss';
import { KeyboardAvoidingView } from '@wordpress/components';

type PropsType = {
	parentHeight: number,
	children: React.Node,
};

type StateType = {
};

class HTMLInputContainer extends React.Component<PropsType, StateType> {
	static scrollEnabled: boolean;
	panResponder: PanResponder;

	constructor() {
		super( ...arguments );

		this.panResponder = PanResponder.create( {
			onStartShouldSetPanResponderCapture: ( ) => true,

			onPanResponderMove: ( e, gestureState ) => {
				if ( gestureState.dy > 100 && gestureState.dy < 110 ) {
					//Keyboard.dismiss() and this.textInput.blur() are not working here
					//They require to know the currentlyFocusedID under the hood but
					//during this gesture there's no currentlyFocusedID
					UIManager.blur( e.target );
				}
			},
		} );
	}

	render() {
		return (
			<KeyboardAvoidingView
				style={ styles.keyboardAvoidingView }
				{ ...this.panResponder.panHandlers }
				parentHeight={ this.props.parentHeight }
			>
				{ this.props.children }
			</KeyboardAvoidingView>
		);
	}
}

HTMLInputContainer.scrollEnabled = true;

export default HTMLInputContainer;
