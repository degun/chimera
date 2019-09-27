import * as actionTypes from './actionTypes';
import * as logTypes from './logTypes';
import axios from 'axios';
import numeral from 'numeral';
import { updateUserLocally, updateAdminLocally } from './usersActions';
import { logout } from './authActions';
import { addLog } from './logsActions';

export const getAllTransactions = () => {
    return (dispatch, getState) => {
        const state = getState();
        const {token, admin} = state.auth;
        const {allTypesSelected, filters} = state.transactions;
        // const own = admin ? '' : 'own';
        const {client, types, partners, fromDate, toDate} = filters;
        let q = `?from=${new Date(fromDate).toLocaleDateString("it-IT")}&to=${new Date(toDate).toLocaleDateString("it-IT")}&`;
        if(client){q+=`client=${client}&`}
        if(!allTypesSelected){q+=`types=${types}&,`}
        if(admin){q+=`partners=${partners}&,`};
        const bearer = 'Bearer ' + token;
        if(!types.length || (admin && !partners.length)){
            dispatch({
                type: actionTypes.TRANSACTIONS_GET_LIST,
                transactions: []
            })
        }else{
            axios.get(`https://api.chimera-finance.com/api/transactions/${q}`, { headers: { 'Authorization': bearer } }).then(res => {
                const transactions = res.data;
                dispatch({
                    type: actionTypes.TRANSACTIONS_GET_LIST,
                    transactions
                })
            }).catch(e => {
                console.log(e)
                if(e.response && e.response.status === 401){
                    dispatch(logout);
                }
            });
        }
    }   
}

export const getAllClients = () => {
    return (dispatch, getState) => {
        const state = getState();
        const {token} = state.auth;
        const bearer = 'Bearer ' + token;
        axios.get(`https://api.chimera-finance.com/api/clients/`, { headers: { 'Authorization': bearer } }).then(res => {
            const clients = res.data;
            dispatch({
                type: actionTypes.TRANSACTIONS_GET_CLIENTS_LIST,
                clients
            })
        }).catch(e => {
            console.log(e)
            if(e.response && e.response.status === 401){
                dispatch(logout);
            }
        });
    }   
}

export const beginAdd = () => {
    return dispatch => {
        dispatch({type: actionTypes.TRANSACTIONS_BEGIN_ADD})
    }
}

export const endAdd = () => {
    return dispatch => {
        dispatch({type: actionTypes.TRANSACTIONS_END_ADD})
    }
}

export const beginEdit = id => {
    return (dispatch, getState) => {
        const state = getState();
        const {transactions} = state.transactions;
        const transaction = transactions.filter(t=>t.id === id)[0]
        dispatch({type: actionTypes.TRANSACTIONS_BEGIN_EDIT, transaction})
    }
}

export const endEdit = () => {
    return dispatch => {
        dispatch({type: actionTypes.TRANSACTIONS_END_EDIT})
    }
}

export const addTransaction = (transaction_type, client_name, amount, amount_paid, rate, user ) => {
    if(transaction_type === "Payment")client_name = "-"
    return (dispatch, getState) => {
        const state = getState();
        const {users} = state.users;
        const user0 = users.filter(u=> u.url === `http://api.chimera-finance.com/api/users/${user}/`)[0];
        const {username} = user0;
        const {token} = state.auth;
        const bearer = 'Bearer ' + token;
        axios.post("https://api.chimera-finance.com/api/transactions/", {
            transaction_type, client_name, amount, amount_paid, rate, user
        },{
            headers: {"Authorization": bearer}
        }).then(res => {
            dispatch({type: actionTypes.TRANSACTIONS_ADD_SUCCESS, transaction: res.data});
            dispatch({type: actionTypes.TRANSACTIONS_END_ADD});
            dispatch(updateUserLocally(user));
            dispatch(updateAdminLocally());
            let message;
            const adminAmount = numeral(Math.abs(parseFloat(amount))).format('0,0.00 $');
            const partnerAmount = numeral(Math.abs(parseFloat(amount_paid))).format('0,0.00 $');
            switch(transaction_type){
                case 'Wire':
                case 'Credit Card': message = `Added deposit of ${adminAmount} by client ${client_name}, made via ${transaction_type}. Amount registered on partner ${username} is ${partnerAmount}, given that the actual rate is ${rate}.`; break;
                case 'Withdraw': message = `Client ${client_name} withdrawed ${adminAmount} from main balance. ${partnerAmount} were substracted from ${username}'s balance, given that the actual rate is ${rate}.`; break;
                case 'Payment': message = `Made payment of ${adminAmount} to ${username}`;break;
                default: message = `Made transaction of type ${transaction_type}. Partner ${username}, main amount ${adminAmount}, partner amount ${partnerAmount} (because rate is ${rate}).`;break;
            } 
            dispatch(addLog(user, logTypes.TRANSACTION_ADD, message))
        }).catch(e => {
            dispatch({type: actionTypes.TRANSACTIONS_ADD_FAIL, e})
        })
    }
}

export const editTransaction = (transaction_type, client_name, amount, amount_paid, rate, user, id ) => {
    if(transaction_type === "Payment")client_name = "-";
    return (dispatch, getState) => {
        const state = getState();
        const {transactions} = state.transactions;
        const transaction0 = transactions.filter(t=> t.id === id)[0];
        const {username} = transaction0;
        const {token} = state.auth;
        const bearer = 'Bearer ' + token;
        axios.post("https://api.chimera-finance.com/api/transactions/", {
            transaction_type, client_name, amount, amount_paid, rate, user
        },{
            headers: {"Authorization": bearer}
        }).then(res => {
            dispatch({type: actionTypes.TRANSACTIONS_ADD_SUCCESS, transaction: res.data});
            dispatch({type: actionTypes.TRANSACTIONS_END_ADD});
            dispatch(updateUserLocally(user));
            dispatch(updateAdminLocally());
            let message;
            const adminAmount = numeral(Math.abs(parseFloat(amount))).format('0,0.00 $');
            const partnerAmount = numeral(Math.abs(parseFloat(amount_paid))).format('0,0.00 $');
            switch(transaction_type){
                case 'Wire':
                case 'Credit Card': message = `Added deposit of ${adminAmount} by client ${client_name}, made via ${transaction_type}. Amount registered on partner ${username} is ${partnerAmount}, given that the actual rate is ${rate}.`; break;
                case 'Withdraw': message = `Client ${client_name} withdrawed ${adminAmount} from main balance. ${partnerAmount} were substracted from ${username}'s balance, given that the actual rate is ${rate}.`; break;
                case 'Payment': message = `Made payment of ${adminAmount} to ${username}`;break;
                default: message = `Made transaction of type ${transaction_type}. Partner ${username}, main amount ${adminAmount}, partner amount ${partnerAmount} (because rate is ${rate}).`;break;
            } 
            dispatch(addLog(user, logTypes.TRANSACTION_ADD, message))
        }).catch(e => {
            dispatch({type: actionTypes.TRANSACTIONS_ADD_FAIL, e})
        })
    }
}


export const removeTransaction = id => {
    return (dispatch, getState) => {
        const state = getState();
        const token = state.auth.token;
        const bearer = 'Bearer ' + token;
        axios.delete(`https://api.chimera-finance.com/api/transactions/${id}/`,{headers: {"Authorization": bearer}})
        .then(() => {
            const {transactions} = state.transactions;
            const {amount, amount_paid, client_name, user, rate, transaction_type} = transactions.filter(t=>t.id === id)[0];
            const {users} = state.users;
            const user0 = users.filter(u=> u.url === `http://api.chimera-finance.com/api/users/${user}/`)[0];
            const {username} = user0;
            const adminAmount = numeral(parseFloat(amount)).format('0,0.00 $');
            const partnerAmount = numeral(parseFloat(amount_paid)).format('0,0.00 $');
            dispatch({type: actionTypes.TRANSACTIONS_REMOVE_SUCCESS, id});
            dispatch({type: actionTypes.TRANSACTIONS_END_EDIT});
            dispatch(updateAdminLocally());
            const message = `Removed transaction ${id} of type ${transaction_type}. Client: ${client_name}. Main amount: ${adminAmount}. Partner amount: ${partnerAmount}. Partner: ${username}. Rate ${rate}`;
            dispatch(addLog(user, logTypes.TRANSACTION_REMOVE, message))
        })
        .catch(e => dispatch({type: actionTypes.TRANSACTIONS_REMOVE_FAIL, error: e}))
    }
}

export const setTransactionsFilter = (filter, value) => {
    return dispatch => {
        dispatch({type: actionTypes.TRANSACTIONS_SET_FILTER, filter, value});
        dispatch(getAllTransactions())
    }
}

export const setAllPartnersSelected = allPartnersSelected => {
    return {
        type: actionTypes.TRANSACTIONS_SET_ALL_PARTNERS_SELECTED,
        allPartnersSelected
    }
}

export const setAllTypesSelected = allTypesSelected => {
    return {
        type: actionTypes.TRANSACTIONS_SET_ALL_TYPES_SELECTED,
        allTypesSelected
    }
}
