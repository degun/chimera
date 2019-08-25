import * as types from '../actions/actionTypes';

const initialState = {
    menu: '0'
}

const selectMenu = (state, action) => {
    return {...state, menu: action.selected}
}

const systemReducer = (state = initialState, action) => {
    switch(action.type){
        case types.SYSTEM_SET_SELECTED_MENU: return selectMenu(state, action);
        case types.AUTH_LOGOUT: return {...initialState};
        default: return state;
    }
}

export default systemReducer;