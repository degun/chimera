import { combineReducers } from 'redux';
import authReducer from './authReducer';
import usersReducer from './usersReducer';
import transactionsReducer from './transactionsReducer';
import systemReducer from './systemReducer';
import dashboardReducer from './dashboardReducer';
import logsReducer from './logsReducer';

const rootReducer = combineReducers({
    auth: authReducer,
    users: usersReducer,
    transactions: transactionsReducer,
    system: systemReducer,
    dashboard: dashboardReducer,
    logs: logsReducer
})

export default rootReducer;
