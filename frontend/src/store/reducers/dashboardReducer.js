import * as types from '../actions/actionTypes';

const initialState = {
    filters: {
        fromDate: new Date(),
        toDate: new Date(),
        partner: 0
    },
    data: []
}

const setFilter = (state, action) => {
    return {...state, filters: {...state.filters, [action.filter]: action.value}}
}

const getDashboardData = (state, action) => {
    return {...state, data: action.data}
}

const dashboardReducer = (state = initialState, action) => {
    switch(action.type){
        case types.DASHBOARD_GET_DATA: return getDashboardData(state, action);
        case types.DASHBOARD_SET_FILTER: return setFilter(state, action);
        default: return state;
    }
}

export default dashboardReducer;