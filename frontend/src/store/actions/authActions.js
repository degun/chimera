import axios from 'axios';
import * as types from './actionTypes';
import {getAllUsers} from './usersActions';
import {getAllTransactions} from './transactionsActions';
import { HOST } from '../../config';

export const authStart = () => {
    return {
        type: types.AUTH_START
    }
}

export const authSuccess = (token, id, email, username, is_staff, balance, btc) => {
    return {
        type: types.AUTH_SUCCESS,
        token,
        id,
        email,
        username,
        is_staff,
        balance,
        btc
    }
}
export const authFail = error => {
    return {
        type: types.AUTH_FAIL,
        error
    }
}
export const authLogout = () => {
    return {
        type: types.AUTH_LOGOUT
    }
}

export const setToken = token => {
    return {
        type: types.AUTH_SET_TOKEN,
        token
    }
}

export const logout = () => {
    return dispatch => {
        axios.post(`${HOST}/api/auth/logout/`).then(()=>{
            dispatch(authLogout())
            window.persistor.flush()
            window.persistor.purge()
        }).catch(e => {
            console.log(e.message)
        })
    }
}

export const refreshToken = () => {
    return (dispatch, getState) => {
        const state = getState();
        const {token} = state.auth;
        axios.post(`${HOST}/api/auth-jwt-refresh/`, {token}).then(res => {
            dispatch(setToken(res.data.token))
        }).catch(e => {
            console.log("refresh token error " + e)
            dispatch(logout())
        })
    }
}

export const login = (email, password) => {
    return dispatch => {
        dispatch(authStart());
        axios.post(`${HOST}/api/auth/login/`, {
            email,
            password
        }).then(res => {
            const {token, user} = res.data;
            const {pk, email, username} = user;
            axios.get(`${HOST}/api/users/${pk}/`,{
                headers: {'Authorization': `Bearer ${token}`}
            }).then(res => {
                const {is_active, is_staff, partner_data} = res.data;
                let balance  = parseFloat(partner_data.balance);
                let btc  = partner_data.btc;
                if(is_active){
                    dispatch(authSuccess(token, pk, email, username, is_staff, balance, btc));
                }
                if(is_staff){
                    dispatch(getAllUsers());
                    dispatch(getAllTransactions())
                }
            })
        }).catch(error => {
            dispatch(authFail(error));
        })
    }
}

export const changePassword = (new_password1, new_password2) => {
    return (dispatch, getState) => {
        const state = getState();
        const {token} = state.auth;
        const bearer = `Bearer ` + token;
        axios.post(`${HOST}/api/auth/password/change/`, {new_password1, new_password2}, { headers: { 'Authorization': bearer } });
        dispatch({type: types.AUTH_RESET_PASSWORD});
    }
}

export const signup = (username, email, password1, password2) => {
    return dispatch => {
        dispatch(authStart());
        axios.post(`${HOST}/api/users/register/`, {
            username,
            email,
            password1,
            password2
        }).then(res => {
            const token = res.data.key;
            dispatch(authSuccess(token));
        }).catch(error => {
            dispatch(authFail(error));
        })
    }
}