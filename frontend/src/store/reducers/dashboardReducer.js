import * as types from '../actions/actionTypes';

const initialState = {
    filters: {
        fromDate: new Date().setDate(1),
        toDate: new Date(),
        partner: 0,
        alltime: false
    },
    data: [],
    loading: false
}

const setFilter = (state, action) => {
    return {...state, filters: {...state.filters, [action.filter]: action.value}}
}

const getDashboardData = (state, action) => {
    return {...state, data: action.data}
}

const setDashboardLoading = (state, action) => {
    return {...state, loading: action.loading}
}

const dashboardReducer = (state = initialState, action) => {
    switch(action.type){
        case types.DASHBOARD_GET_DATA: return getDashboardData(state, action);
        case types.DASHBOARD_SET_FILTER: return setFilter(state, action);
        case types.DASHBOARD_LOADING: return setDashboardLoading(state, action);
        case types.AUTH_LOGOUT: return {...initialState};
        default: return state;
    }
}

export default dashboardReducer;