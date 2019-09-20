import * as types from './actionTypes';
import axios from 'axios';
import numeral from 'numeral';
import { getAllTransactions } from './transactionsActions';
import { logout } from './authActions';
import { addLog } from './logsActions';
import { urltoid } from '../../useful';
import * as  logTypes from './logTypes';

export const getAllUsers = () => {
    return (dispatch, getState) => {
        const state = getState();
        const {token} = state.auth;
        const bearer = 'Bearer ' + token;
        axios.get('https://api.chimera-finance.com/api/users/', { headers: { 'Authorization': bearer } }).then(res => {
            dispatch({
                type: types.USERS_GET_LIST,
                users: res.data
            })
        }).catch(e => {
            console.log(e);
            if(e.response && e.response.status === 401){
                dispatch(logout);
            }
        });
    }   
}

export const beginAdd = () => {
    return dispatch => {
        dispatch({type: types.USERS_BEGIN_ADD})
    }
}

export const endAdd = () => {
    return dispatch => {
        dispatch({type: types.USERS_END_ADD})
    }
}

export const beginEdit = email => {
    return dispatch => {
        dispatch({type: types.USERS_BEGIN_EDIT, email})
    }
}

export const endEdit = () => {
    return dispatch => {
        dispatch({type: types.USERS_END_EDIT})
    }
}

export const updateUserLocally = id => {
    return (dispatch, getState) => {
        const state = getState();
        const {token} = state.auth;
        axios.get(`https://api.chimera-finance.com/api/users/${id}/`,{
            headers: {"Authorization": 'Bearer ' + token}
        }).then(response=>{
            dispatch({type: types.USERS_GET_ONE, data: response.data});
        }).catch(e => {
            console.log(e);
        })
    }
}

export const updateAdminLocally = () => {
    return (dispatch, getState) => {
        const state = getState();
        const {token, id} = state.auth;
        axios.get(`https://api.chimera-finance.com/api/users/${id}/`,{
            headers: {"Authorization": 'Bearer ' + token}
        }).then(response=>{
            dispatch({type: types.ADMIN_UPDATE_BALANCE, balance: response.data.partner_data.balance});
        }).catch(e => {
            console.log(e);
        })
    }
}

export const addUser = (username, email, password, partner_data) => {
    return (dispatch, getState) => {
        const state = getState();
        const {token} = state.auth;
        const bearer = 'Bearer ' + token;
        axios.post("https://api.chimera-finance.com/api/users/", {
            username, email, password, partner_data
        },{
            headers: {"Authorization": bearer}
        }).then(res => {
            const {url, username, partner_data} = res.data;
            const {balance, Wrate, CCrate} = partner_data;
            dispatch({type: types.USERS_ADD_SUCCESS, user: res.data});
            dispatch({type: types.USERS_END_ADD});
            dispatch(updateAdminLocally());
            dispatch(addLog(urltoid(url), logTypes.USER_ADD, `Added partner ${username} with initial balance ${numeral(parseFloat(balance)).format('0,0.00 $')} Wire rate ${Wrate} and Credit Card rate ${CCrate}.`))
        }).catch(e => {
            dispatch({type: types.USERS_ADD_FAIL})
        })
    }
}

export const editUser = (url, username, email, partner_data) => {
    return (dispatch, getState) => {
        const state = getState();
        const {users} = state.users;
        const oldUser = users.filter(u=> u.url === url)[0];
        const oldUsername = oldUser.username;
        const oldEmail = oldUser.email;
        const oldBalance = oldUser.partner_data.balance;
        const oldWRate = oldUser.partner_data.Wrate;
        const oldCCRate = oldUser.partner_data.CCrate;
        const admin = oldUser.is_staff;
        const {balance, Wrate, CCrate} = partner_data;
        const token = state.auth.token;
        const bearer = 'Bearer ' + token;
        axios.patch(url.replace('http', 'https'), {username, email, partner_data},{headers: {"Authorization": bearer}})
        .then(res => {
            dispatch({type: types.USERS_EDIT_SUCCESS, data: res.data});
            dispatch({type: types.USERS_END_EDIT});
            dispatch(updateAdminLocally())
            dispatch(updateUserLocally(urltoid(url)));
            const adminOrPartner = admin ? 'admin' : `partner with id ${urltoid(url)}`;
            const changedUsername = (username !== oldUsername) ? ` username from ${oldUsername} to ${username},` : '';
            const changedEmail = (email !== oldEmail) ?  ` email from ${oldEmail} to ${email},` : '';
            const changedBalance = (parseFloat(balance) !== parseFloat(oldBalance)) ?  ` balance from ${numeral(parseFloat(oldBalance)).format('0,0.00 $')} to ${numeral(parseFloat(balance)).format('0,0.00 $')},` : '';
            const changedWRate = (Wrate !== oldWRate) ?  ` Wire rate from ${oldWRate} to ${Wrate},` : '';
            const changedCCRate = (CCrate !== oldCCRate) ?  ` Credit Card rate from ${oldCCRate} to ${CCrate},` : '';
            let message = `Updated ${adminOrPartner}: changed${changedUsername + changedEmail + changedBalance + changedWRate + changedCCRate}`.replace(/.$/,".");
            dispatch(addLog(urltoid(url), logTypes.USER_UPDATE, message))
        })
        .catch(e => dispatch({type: types.USERS_EDIT_FAIL, error: e}))
    }
}

export const removeUser = url => {
    return (dispatch, getState) => {
        const state = getState();
        const {token} = state.auth;
        const {users} = state.users;
        const user = users.filter(u=> u.url === url)[0];
        const bearer = 'Bearer ' + token;
        axios.delete(url.replace('http', 'https'),{headers: {"Authorization": bearer}})
        .then((res) => {
            const {username, partner_data} = user;
            const {balance} = partner_data;
            dispatch({type: types.USERS_REMOVE_SUCCESS, url});
            dispatch({type: types.USERS_END_EDIT});
            dispatch(updateAdminLocally());
            dispatch(getAllTransactions());
            const message = `Removed partner ${username}, along with his balance of ${balance} and all his transactions.`;
            dispatch(null, logTypes.USER_REMOVE, message)
        })
        .catch(e => dispatch({type: types.USERS_REMOVE_FAIL, error: e}))
    }
}

export const toggleActive = (url, is_active) => {
    return (dispatch, getState) => {
        const state = getState();
        const {users} = state.users;
        const user = users.filter(u=> u.url === url)[0];
        const {username} = user;
        const token = state.auth.token;
        const bearer = 'Bearer ' + token;
        axios.patch(url, {is_active, partner_data: {}},{headers: {"Authorization": bearer}})
        .then(res => {
            dispatch({type: types.USERS_ARCHIVE_SUCCESS, data: res.data});
            dispatch({type: types.USERS_END_EDIT});
            dispatch(updateUserLocally(urltoid(url)));
            const logtype = is_active ? logTypes.USER_ACTIVATE : logTypes.USER_DEACTIVATE;
            const action = is_active ? "Activated" : "Deactivated";
            const message = `${action} partner ${username}. Now he will ${is_active ? 'again' : 'not'} be available for new transactions and${is_active ? '' : ' will not be able to'} log in.`;
            dispatch(addLog(urltoid(url), logtype, message))
        })
        .catch(e => dispatch({type: types.USERS_ARCHIVE_FAIL, error: e}))
    }
}