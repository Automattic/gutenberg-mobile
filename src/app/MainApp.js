/** @flow
 * @format */

import React from 'react';
import { subscribeParentGetHtml, subscribeParentToggleHTMLMode } from 'react-native-gutenberg-bridge';

import BlockManager, { type BlockListType } from '../block-management/block-manager';
import { SlotFillProvider } from '@wordpress/components';

import type { EmitterSubscription } from 'react-native';

type PropsType = BlockListType;
type StateType = {};

export default class MainScreen extends React.Component<PropsType, StateType> {
	subscriptionParentGetHtml: ?EmitterSubscription;
	subscriptionParentToggleHTMLMode: ?EmitterSubscription;

	componentDidMount() {
		this.subscriptionParentGetHtml = subscribeParentGetHtml( () => {
			this.props.serializeToNativeAction();
		} );

		this.subscriptionParentToggleHTMLMode = subscribeParentToggleHTMLMode( () => {
			this.props.toggleHtmlModeAction();
		} );
	}

	componentWillUnmount() {
		if ( this.subscriptionParentGetHtml ) {
			this.subscriptionParentGetHtml.remove();
		}
	}

	render() {
		return (
			<SlotFillProvider>
				<BlockManager { ...this.props } />
			</SlotFillProvider>
		);
	}
}
