import * as types from '../actions/actionTypes';

const initialState = {
    filters: {
        fromDate: new Date(),
        toDate: new Date(),
        message: ''
    },
    logs: []
}

const setFilter = (state, action) => {
    return {...state, filters: {...state.filters, [action.filter]: action.value}}
}

const getLogs = (state, action) => {
    return {...state, logs: action.data}
}

const logsReducer = (state = initialState, action) => {
    switch(action.type){
        case types.LOGS_GET_DATA: return getLogs(state, action);
        case types.LOGS_SET_FILTER: return setFilter(state, action);
        default: return state;
    }
}

export default logsReducer;