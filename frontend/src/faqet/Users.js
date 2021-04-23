import React, {useState, useEffect} from 'react';
import moment from 'moment';
import numeral from 'numeral';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { DetailsList, SelectionMode, DetailsRow, DetailsListLayoutMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { MarqueeSelection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import { PrimaryButton } from 'office-ui-fabric-react';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { ComboBox } from 'office-ui-fabric-react/lib/index';
import { selectMenu } from '../store/actions/systemActions';
import { setToken } from '../store/actions/authActions';
import { getAllUsers, beginEdit, beginAdd, setUsersSearchStr } from '../store/actions/usersActions';
import EditUser from '../pjeset/Users/EditUser';
import AddUser from '../pjeset/Users/AddUser';
import './Users.sass';

numeral.locale('al');

function sortByKey(array, key, asc) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return asc ? ((x < y) ? -1 : ((x > y) ? 1 : 0)) : ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
}

function Users({getUsers, selectMenu, beginEdit, beginAdd, token, users, editing, editingThis, adding, searchStr, setSearchStr}){

    const [sortkey, setSortkey] = useState("staff");
    const [ascending, setAscending] = useState(true);
    const [roleFilter, setRoleFilter] = useState("partner");

    useEffect(()=>{
        getUsers();
    }, [getUsers])

    const columns = [
        {
            key: 'username',
            name: 'Username',
            fieldName: 'username',
            minWidth: 60,
            maxWidth: 80,
            isSorted: sortkey === 'username',
            isSortedDescending: ascending,
            onColumnClick: onColumnClick,
            data: 'string',
            isPadded: true
        },
        {
            key: 'email',
            name: 'Email',
            fieldName: 'email',
            minWidth: 180,
            maxWidth: 200,
            isSorted: sortkey === 'email',
            isSortedDescending: ascending,
            onColumnClick: onColumnClick,
            data: 'string',
            isPadded: true
        },
        {
            key: 'last_login',
            name: 'Last login',
            fieldName: 'last_login',
            minWidth: 80,
            maxWidth: 100,
            isSorted: sortkey === 'last_login',
            isSortedDescending: ascending,
            onColumnClick: onColumnClick,
            data: 'date',
            isPadded: true
        },
        {
            key: 'balance',
            name: 'Balance',
            fieldName: 'balance',
            minWidth: 80,
            maxWidth: 90,
            isSorted: sortkey === 'balance',
            isSortedDescending: ascending,
            onColumnClick: onColumnClick,
            data: 'number',
            isPadded: true
        },
        {
            key: 'Wrate',
            name: 'Wire',
            fieldName: 'Wrate',
            minWidth: 30,
            maxWidth: 30,
            isSorted: sortkey === 'Wrate',
            isSortedDescending: ascending,
            onColumnClick: onColumnClick,
            data: 'number',
            isPadded: true
        },
        {
            key: 'CCrate',
            name: 'CC',
            fieldName: 'CCrate',
            minWidth: 30,
            maxWidth: 30,
            isSorted: sortkey === 'CCrate',
            isSortedDescending: ascending,
            onColumnClick: onColumnClick,
            data: 'number',
            isPadded: true
        },
        {
            key: 'BTCrate',
            name: 'BTC',
            fieldName: 'BTCrate',
            minWidth: 30,
            maxWidth: 30,
            isSorted: sortkey === 'BTCrate',
            isSortedDescending: ascending,
            onColumnClick: onColumnClick,
            data: 'number',
            isPadded: true
        },
        {
            key: 'btc',
            name: 'BTC on',
            fieldName: 'btc',
            minWidth: 40,
            maxWidth: 40,
            isPadded: true
        },
        {
            key: 'is_active',
            name: 'Active',
            fieldName: 'active',
            minWidth: 60,
            maxWidth: 100,
            isPadded: true
        }
    ];

    const data = sortByKey(users.map(user => {
        return {
            id: user.id,
            email: user.email,
            last_login: moment(new Date(user.last_login)).fromNow().replace("50 years ago", 'never'),
            date_joined: moment(new Date(user.date_joined)).fromNow(),
            username: user.username,
            password: user.password,
            balance: parseFloat(user.partner_data.balance),
            Wrate: user.partner_data.Wrate,
            CCrate: user.partner_data.CCrate,
            BTCrate: user.partner_data.BTCrate,
            btc: user.partner_data.btc,
            active: user.is_active,
            staff: user.is_staff
        }
    }), sortkey, ascending).filter(u => {
        return (u.email.indexOf(searchStr.toLowerCase()) !== -1) || (u.username.toLowerCase().indexOf(searchStr.toLowerCase()) !== -1)
    }).filter(u => {
        switch(roleFilter){
            case "partner": return !u.staff;
            case "admin": return u.staff;
            default: return true;
        }
    })

    useEffect(()=>{
        selectMenu("1");
        document.title = "Chimera | Users"
    }, [getUsers, selectMenu])

    function onItemInvoked({email}){
        beginEdit(email);
    }
    function onColumnClick(_e, {key}){
        setSortkey(key);
        setAscending(true)
        if(key === sortkey){setAscending(!ascending)}
    }
    function onRenderItemColumn(item, index, column){
        const fieldContent = item[column.fieldName];
        switch (column.key) {
            case 'is_active':
                return fieldContent ? <Icon iconName="StatusCircleInner" styles={{root: {marginLeft: '14px'}}} /> : null;
            case 'btc':
                return fieldContent ? <Icon iconName="StatusCircleInner" styles={{root: {marginLeft: '14px'}}} /> : null;
            case 'balance':
                return <span style={{textAlign: 'right'}}>{numeral(fieldContent).format('0,0.00 $')}</span>
            default:
              return <span>{fieldContent}</span>;
          }
    }
    function onRenderRow(props){
        return <DetailsRow {...props} styles={{root: {backgroundColor: props.item.staff ? "lightblue" : "white", fontSize: '1.1em'}}} />
    }
    
    let editData;
    editData = data.filter(user => {
        return user.email === editingThis
    })[0]

    const roles = [
        { key: 'admin', text: 'Admin' },
        { key: 'partner', text: 'Partner' },
    ];
        
    if(!token){
        return <Redirect to="/login" />
    }
    return(
        <div id="users">
            <Fabric>
                <Stack horizontal horizontalAlign="space-between" tokens={{ childrenGap: 20 }} styles={{ root: { width: 960, padding: "20px 0" } }}>
                    <Stack horizontal horizontalAlign="auto" tokens={{ childrenGap: 20 }} styles={{ root: { width: "auto" } }}>
                        <SearchBox styles={{root:{width: 300}}} iconProps={{ iconName: 'Filter', style: {color: 'black'}}}  value={searchStr} placeholder="Filter by username or email..." onChange={e => {if(e)setSearchStr(e.target.value)}} onClear={() => setSearchStr('')} />
                        <ComboBox style={{width: 150}} options={roles} selectedKey={roleFilter} placeholder="Filter by role..." onChange={(e, {key})=> setRoleFilter(key)} />
                    </Stack>
                    <PrimaryButton
                        allowDisabledFocus={true}
                        disabled={adding}
                        checked={false}
                        text="New user"
                        onClick={()=>beginAdd()}
                        iconProps={{iconName: "Add"}}
                        align="end"
                        styles={{root: {
                            justifySelf: 'flex-end'
                        }}}
                    />
                </Stack>
                <MarqueeSelection>
                    <DetailsList
                        className="table"
                        maxWidth={960}
                        minWidth={960}
                        items={data}
                        compact={false}
                        columns={columns}
                        onItemInvoked={onItemInvoked}
                        enableShimmer={!data}
                        isHeaderVisible={true}
                        checkboxVisibility={2}
                        selectionMode={SelectionMode.multiple}
                        layoutMode={DetailsListLayoutMode.justified}
                        onRenderItemColumn={onRenderItemColumn}
                        onRenderRow={onRenderRow}
                    />
                </MarqueeSelection>
            </Fabric>
            {editing ? <EditUser editing={editing} {...editData} /> : null}
            {adding ? <AddUser adding={adding} /> : null}
        </div>
    )
}


const mapStateToProps = state => {
    return {
        token: state.auth.token,
        users: state.users.users,
        editing: state.users.editing,
        editingThis: state.users.editingThis,
        adding: state.users.adding,
        searchStr: state.users.searchStr
    }
}

const mapDispatchToProps = dispatch => {
    return {
        selectMenu: menu => dispatch(selectMenu(menu)),
        setToken: token => dispatch(setToken(token)),
        getUsers: () => dispatch(getAllUsers()),
        beginEdit: email => dispatch(beginEdit(email)),
        beginAdd: () => dispatch(beginAdd()),
        setSearchStr: str => dispatch(setUsersSearchStr(str))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Users);