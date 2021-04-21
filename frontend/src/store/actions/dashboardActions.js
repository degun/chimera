import * as types from './actionTypes';
import axios from 'axios';
import { logout } from './authActions';
import { HOST } from '../../config';

export const setFilter = (filter, value) => {
    return {
        type: types.DASHBOARD_SET_FILTER,
        filter,
        value
    }
}

export const getDashboardData = () => {
    return (dispatch, getState) => {
        dispatch({ type: types.DASHBOARD_LOADING, loading: true })
        const state = getState();
        const {fromDate, toDate, alltime} = state.dashboard.filters;
        const {token} = state.auth;
        const dateQ = alltime ? '' : `from=${new Date(fromDate).toLocaleDateString("it-IT")}&to=${new Date(toDate).toLocaleDateString("it-IT")}&`;
        let q = `?${dateQ}`;
        const bearer = 'Bearer ' + token;
        axios.get(`${HOST}/api/transactions/${q}`, { headers: { 'Authorization': bearer } }).then(res => {
            dispatch({
                type: types.DASHBOARD_GET_DATA,
                data: res.data
            })
            dispatch({ type: types.DASHBOARD_LOADING, loading: false })
        }).catch(e => {
            console.log(e)
            if(e.response && e.response && e.response.status === 401){
                dispatch(logout);
            }
            dispatch({ type: types.DASHBOARD_LOADING, loading: false })
        });
    }
}