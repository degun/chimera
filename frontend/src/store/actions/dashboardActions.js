import * as types from './actionTypes';
import axios from 'axios';
import {logout} from './authActions';

export const setFilter = (filter, value) => {
    return {
        type: types.DASHBOARD_SET_FILTER,
        filter,
        value
    }
}

export const getDashboardData = () => {
    return (dispatch, getState) => {
        const state = getState();
        const {fromDate, toDate} = state.dashboard.filters;
        const {token} = state.auth;
        let q = `?from=${new Date(fromDate).toLocaleDateString("it-IT")}&to=${new Date(toDate).toLocaleDateString("it-IT")}&`;
        const bearer = 'Bearer ' + token;
        axios.get(`http://localhost:8000/api/transactions/${q}`, { headers: { 'Authorization': bearer } }).then(res => {
            dispatch({
                type: types.DASHBOARD_GET_DATA,
                data: res.data
            })
        }).catch(e => {
            console.log(e.response.status)
            if(e.response.status === 401){
                dispatch(logout);
            }
        });         
    }    
}