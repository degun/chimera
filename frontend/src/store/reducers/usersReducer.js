import * as types from '../actions/actionTypes';

const initialState = {
    users: [],
    editing: false,
    editingThis: '',
    adding: false
}

const getUsersList = (state, action) => {
    return {...state, users: action.users}
}

const beginEdit = (state, action) => {
    return {...state, editing: true, editingThis: action.email}
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
    return {...state, users: [...state.users, action.user] }
}

const removeSuccess = (state, action) => {
    const newUsers = state.users.filter(user => {
        return user.id !== action.id
    });
    return {...state, users: newUsers}
}

const updateUsersList = (state, action) => {
    const newUsers = state.users.map(user => {
        if(user.id === action.data.id){
            return action.data
        }else{
            return user
        }
    })
    return {...state, users: newUsers}
}

const usersReducer = (state = initialState, action) => {
    console.log(action.type);
    switch(action.type){
        case types.USERS_GET_LIST: return getUsersList(state, action);
        case types.USERS_GET_ONE: return updateUsersList(state, action);
        case types.USERS_EDIT_SUCCESS: return updateUsersList(state, action);
        case types.USERS_ARCHIVE_SUCCESS: return updateUsersList(state, action);
        case types.USERS_REMOVE_SUCCESS: return removeSuccess(state, action);
        case types.USERS_BEGIN_EDIT: return beginEdit(state, action);
        case types.USERS_END_EDIT: return endEdit(state);
        case types.USERS_BEGIN_ADD: return beginAdd(state);
        case types.USERS_END_ADD: return endAdd(state);
        case types.USERS_ADD_SUCCESS: return addSuccess(state, action);
        case types.USERS_UPDATE_USER: return updateUsersList(state, action);
        case types.AUTH_LOGOUT: return {...initialState};
        default: return state;
    }
}

export default usersReducer;