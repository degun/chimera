import * as types from './actionTypes';

export const selectMenu = selected => {
    return dispatch => {
        dispatch({
            type: types.SYSTEM_SET_SELECTED_MENU,
            selected
        })
    }
}