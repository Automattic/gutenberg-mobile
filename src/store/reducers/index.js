/**
 * @format
 * @flow
 */

import { find, findIndex, reduce } from 'lodash';

import { html2State } from '../utils';

import ActionTypes from '../actions/ActionTypes';
import type { StateType } from '../';
import type { BlockActionType } from '../actions';

function findBlock( blocks, clientId: string ) {
	return find( blocks, ( obj ) => {
		return obj.clientId === clientId;
	} );
}

function findBlockIndex( blocks, clientId: string ) {
	return findIndex( blocks, ( obj ) => {
		return obj.clientId === clientId;
	} );
}

/*
 * insert block into blocks[], below / after block having clientIdAbove
*/
function insertBlock( blocks, block, clientIdAbove ) {
	// TODO we need to set focused: true and search for the currently focused block and
	// set that one to `focused: false`.
	blocks.splice( findBlockIndex( blocks, clientIdAbove ) + 1, 0, block );
}

export const reducer = (
	state: StateType = { blocks: [], initialHtmlHash: '', refresh: false, fullparse: false },
	action: BlockActionType
) => {
	const blocks = [ ...state.blocks ];
	switch ( action.type ) {
		case ActionTypes.BLOCK.UPDATE_ATTRIBUTES: {
			const block = findBlock( blocks, action.clientId );

			// Ignore updates if block isn't known
			if ( ! block ) {
				return state;
			}

			// Consider as updates only changed values
			const nextAttributes = reduce(
				action.attributes,
				( result, value, key ) => {
					if ( value !== result[ key ] ) {
						// Avoid mutating original block by creating shallow clone
						if ( result === findBlock( blocks, action.clientId ).attributes ) {
							result = { ...result };
						}

						result[ key ] = value;
					}

					return result;
				},
				findBlock( blocks, action.clientId ).attributes
			);

			// Skip update if nothing has been changed. The reference will
			// match the original block if `reduce` had no changed values.
			if ( nextAttributes === block.attributes ) {
				return state;
			}

			// Otherwise merge attributes into state
			block.attributes = nextAttributes;

			return { ...state, blocks: blocks, refresh: ! state.refresh };
		}
		case ActionTypes.BLOCK.FOCUS: {
			const destBlock = findBlock( blocks, action.clientId );

			// Deselect all blocks
			for ( const block of blocks ) {
				block.focused = false;
			}

			destBlock.focused = true;
			return { ...state, blocks: blocks, refresh: ! state.refresh };
		}
		case ActionTypes.BLOCK.MOVE_UP: {
			if ( blocks[ 0 ].clientId === action.clientId ) {
				return state;
			}

			const index = findBlockIndex( blocks, action.clientId );
			const tmp = blocks[ index ];
			blocks[ index ] = blocks[ index - 1 ];
			blocks[ index - 1 ] = tmp;
			return { ...state, blocks: blocks, refresh: ! state.refresh };
		}
		case ActionTypes.BLOCK.MOVE_DOWN: {
			if ( blocks[ blocks.length - 1 ].clientId === action.clientId ) {
				return state;
			}

			const index = findBlockIndex( blocks, action.clientId );
			const tmp = blocks[ index ];
			blocks[ index ] = blocks[ index + 1 ];
			blocks[ index + 1 ] = tmp;
			return { ...state, blocks: blocks, refresh: ! state.refresh };
		}
		case ActionTypes.BLOCK.DELETE: {
			const index = findBlockIndex( blocks, action.clientId );
			blocks.splice( index, 1 );
			return { ...state, blocks: blocks, refresh: ! state.refresh };
		}
		case ActionTypes.BLOCK.CREATE: {
			// TODO we need to set focused: true and search for the currently focused block and
			// set that one to `focused: false`.
			insertBlock( blocks, action.block, action.clientIdAbove );
			return { ...state, blocks: blocks, refresh: ! state.refresh };
		}
		case ActionTypes.BLOCK.PARSE: {
			const newState = html2State( action.html );
			newState.refresh = ! state.refresh;
			newState.fullparse = true;
			return newState;
		}
		case ActionTypes.BLOCK.MERGE: {
			const index = findBlockIndex( blocks, action.blockOneClientId );
			blocks.splice( index, 2, action.block );
			return { ...state, blocks: blocks, refresh: ! state.refresh };
		}
		default:
			return state;
	}
};
