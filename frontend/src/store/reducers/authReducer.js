import * as types from '../actions/actionTypes';

const initialState = {
    token: "",
    error: null,
    loading: false,
    admin: false,
    balance: 0,
    id: 0
}

const authStart = (state, action) => {
    return {...state, error: null, loading: true}
}

const authSuccess = (state, action) => {
    console.log(action.token)
    return {
        ...state, 
        error: null, 
        loading: false, 
        token: action.token,
        id: action.id,
        email: action.email,
        username: action.username,
        admin: action.is_staff,
        balance: action.balance
    }
}

const authSetToken = (state, action) => {
    return {...state, token: action.token}
}


const authFail = (state, action) => {
    return {...state, error: action.error, loading: false}
}

const updateBalance = (state, action) => {
    return {...state, balance: parseFloat(action.balance)}
}

const authReducer = (state = initialState, action) => {
    switch(action.type){
        case types.AUTH_START: return authStart(state, action);
        case types.AUTH_FAIL: return authFail(state, action);
        case types.AUTH_SUCCESS: return authSuccess(state, action);
        case types.AUTH_SET_TOKEN: return authSetToken(state, action);
        case types.ADMIN_UPDATE_BALANCE: return updateBalance(state, action);
        case types.AUTH_LOGOUT: return {...initialState};
        default: return state;
    }
}

export default authReducer;