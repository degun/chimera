import * as types from '../actions/actionTypes';

const toDate = new Date()
const fromDate = new Date().setDate(toDate.getDate()-1)

const initialState = {
    filters: {
        fromDate,
        toDate,
        message: ''
    },
    logs: [],
    loading: false
}

const setFilter = (state, action) => {
    return {...state, filters: {...state.filters, [action.filter]: action.value}}
}

const getLogs = (state, action) => {
    return {...state, logs: action.data}
}

const removeLog = (state, action) => {
    return {...state, logs: state.logs.filter(log => log.id !== action.id)}
}

const setLogsLoading = (state, action) => {
    return {...state, loading: action.loading}
}

const logsReducer = (state = initialState, action) => {
    switch(action.type){
        case types.LOGS_GET_DATA: return getLogs(state, action);
        case types.LOGS_SET_FILTER: return setFilter(state, action);
        case types.AUTH_LOGOUT: return {...initialState};
        case types.LOGS_REMOVE: return removeLog(state, action);
        case types.LOGS_LOADING: return setLogsLoading(state, action);
        default: return state;
    }
}

export default logsReducer;