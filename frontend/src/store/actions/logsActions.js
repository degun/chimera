import * as types from './actionTypes';
import axios from 'axios';
import { logout } from './authActions';

export const addLog = (user, type, message) => {
    return (dispatch, getState) => {
        const state = getState();
        const {token} = state.auth;
        const bearer = 'Bearer ' + token;
        axios.post(`https://api.chimera-finance.com/api/logs/`, {user, log_type: type, message}, { headers: { 'Authorization': bearer } }).then(res => {
            dispatch({
                type: types.LOGS_ADD,
                data: res.data
            })
        }).catch(e => {
            console.log(e)
            if(e.response && e.response && e.response.status === 401){
                dispatch(logout);
            }
        });         
    }    
}

export const setFilter = (filter, value) => {
    return {
        type: types.LOGS_SET_FILTER,
        filter,
        value
    }
}

export const getLogs = () => {
    return (dispatch, getState) => {
        const state = getState();
        const {fromDate, toDate, message} = state.logs.filters;
        const {token} = state.auth;
        let q = `?from=${new Date(fromDate).toLocaleDateString("it-IT")}&to=${new Date(toDate).toLocaleDateString("it-IT")}&`;
        if(message){q+=`message=${message}`}
        const bearer = 'Bearer ' + token;
        axios.get(`https://api.chimera-finance.com/api/logs/${q}`, { headers: { 'Authorization': bearer } }).then(res => {
            dispatch({
                type: types.LOGS_GET_DATA,
                data: res.data
            })
        }).catch(e => {
            console.log(e)
            if(e.response && e.response.status === 401){
                dispatch(logout());
            }
        });         
    }    
}