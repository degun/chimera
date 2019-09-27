import * as types from '../actions/actionTypes';

const today = new Date();
const aWeekAgo = new Date(new Date().setDate(today.getDate()-6));

const initialState = {
    transactions: [],
    clients: [],
    editing: false,
    editingThis: 0,
    adding: false,
    editData: {},
    filters: {
        partners: [],
        types: [],
        client: '',
        fromDate: new Date(aWeekAgo.setHours(0,0,0,0)),
        toDate: new Date(today.setHours(23,59,59,0))
    },
    allPartnersSelected: true,
    allTypesSelected: true
}

const getTransactionsList = (state, action) => {
    return {...state, transactions: action.transactions}
}

const getClientsList = (state, action) => {
    return {...state, clients: action.clients}
}

const beginEdit = (state, action) => {
    return {...state, editing: true, editData: action.transaction}
}

const endEdit = state => {
    return {...state, editing: false}
}

const beginAdd = state => {
    return {...state, adding: true}
}

const endAdd = state => {
    return {...state, adding: false}
}

const addSuccess = (state, action) => {
    return {...state, transactions: [ action.transaction,...state.transactions] }
}

const removeSuccess = (state, action) => {
    const newTransactions = state.transactions.filter(transaction => {
        return transaction.id !== action.id
    });
    return {...state, transactions: newTransactions}
}

const updateTransactionsList = (state, action) => {
    const newTransactions = state.transactions.map(transaction => {
        if(transaction.url === action.data.url){
            return action.data
        }else{
            return transaction
        }
    })
    return {...state, transactions: newTransactions}
}

const setFilter = (state, action) => {
    return {...state, filters: {...state.filters, [action.filter]: action.value}}
}

const setAllPartnersSelected = (state, action) => {
    return {...state, allPartnersSelected: action.allPartnersSelected}
}

const setAllTypesSelected = (state, action) => {
    return {...state, allTypesSelected: action.allTypesSelected}
}

const systemReducer = (state = initialState, action) => {
    switch(action.type){
        case types.TRANSACTIONS_GET_LIST: return getTransactionsList(state, action);
        case types.TRANSACTIONS_EDIT_SUCCESS: return updateTransactionsList(state, action);
        case types.TRANSACTIONS_ARCHIVE_SUCCESS: return updateTransactionsList(state, action);
        case types.TRANSACTIONS_REMOVE_SUCCESS: return removeSuccess(state, action);
        case types.TRANSACTIONS_BEGIN_EDIT: return beginEdit(state, action);
        case types.TRANSACTIONS_END_EDIT: return endEdit(state);
        case types.TRANSACTIONS_BEGIN_ADD: return beginAdd(state);
        case types.TRANSACTIONS_END_ADD: return endAdd(state);
        case types.TRANSACTIONS_ADD_SUCCESS: return addSuccess(state, action);
        case types.TRANSACTIONS_SET_FILTER: return setFilter(state, action);
        case types.TRANSACTIONS_SET_ALL_PARTNERS_SELECTED: return setAllPartnersSelected(state, action);
        case types.TRANSACTIONS_SET_ALL_TYPES_SELECTED: return setAllTypesSelected(state, action);
        case types.TRANSACTIONS_GET_CLIENTS_LIST: return getClientsList(state, action);
        case types.AUTH_LOGOUT: return {...initialState};
        default: return state;
    }
}

export default systemReducer;