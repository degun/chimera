import React, {useEffect, useState} from 'react';
import moment from 'moment';
import {connect} from 'react-redux';
import {getLogs, setFilter, deleteLog} from '../store/actions/logsActions';
import {setUsersSearchStr} from '../store/actions/usersActions';
import {selectMenu} from '../store/actions/systemActions';
import { ActivityItem, Icon, Link, mergeStyleSets } from 'office-ui-fabric-react';
import { Redirect, useHistory } from 'react-router-dom';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { IconButton } from 'office-ui-fabric-react';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { DatePicker, DayOfWeek } from 'office-ui-fabric-react';
import { formatText, formatDate } from '../useful';
import * as t from '../store/actions/logTypes';
import './Logs.sass';

function Logs({logs, token, getLogs, remove, selectMenu, users, filters, setFilter, openUser}){

    const history = useHistory()

    function Log({item}){
        const [hovered, setHovered] = useState(false);
        let color = hovered ? '#666' : '#ccc';
        return <div className="log" onMouseOver={() => setHovered(true)} onMouseOut={() => setHovered(false)}>
            <IconButton onMouseEnter={() => setHovered(true)} onClick={() => remove(item.key)} iconProps={{iconName:"Delete"}} styles={{root: {position: 'absolute', right: '5px', top: '3px', color}, rootHovered: {color: 'red'}}} />
            <ActivityItem {...item} className={classNames.exampleRoot} />
        </div>
    }

    let {fromDate, toDate, message} = filters;

    fromDate = new Date(fromDate);
    toDate = new Date(toDate);

    useEffect(()=>{
        document.title = "Chimera | Logs"; 
        selectMenu("4");
    }, [selectMenu]);

    useEffect(()=>{
        getLogs()
    }, [getLogs, filters])

    function goToUser(email){
        openUser(email);
        selectMenu("2");
        history.push('/users')
    }

    const classNames = mergeStyleSets({
        exampleRoot: {
          marginTop: '8px',
          textAlign: 'left'
        },
        nameText: {
          fontWeight: 'bold'
        }
    });

    const items = logs.map(log => {
        let iconName = '', color= '', username = '';
        const user = users?.filter(u=> u.id === log.user.toString())[0];
        if(users.length){
            if(user){
                username = "@" + user.username;
            }else{
                username = "Deleted"
            }
        }else{
            username = '';
        }
        
        switch(log.log_type){
            case t.USER_ADD: iconName = 'FollowUser'; color="darkgreen";break;
            case t.USER_REMOVE: iconName = 'UserRemove';color="darkred"; break;
            case t.USER_UPDATE: iconName = 'UserSync'; color="orange";break;
            case t.TRANSACTION_ADD: iconName = 'Money'; color="darkgreen";break;
            case t.TRANSACTION_REMOVE: iconName = 'Money';color="darkred"; break;
            case t.USER_DEACTIVATE: iconName = 'UserPause';color="darkred"; break;
            case t.USER_ACTIVATE: iconName = 'UserFollowed'; color="darkgreen";break;
            default: iconName = "Message";
        }
        return {
            key: log.id,
            activityDescription: [
              <Text className={classNames.nameText} key={log.id}>{formatText(log.log_type)}</Text>,
              <Link key={log.id + 'a'} onClick={() => goToUser(user?.username ?? '')}>&nbsp;{username}</Link>
            ],
            activityIcon: <Icon styles={{root:{color}}} iconName={iconName} />,
            comments: [
              <span key={log.id}>{log.message}</span>
            ],
            timeStamp: moment(new Date(log.entry_time)).format("DD/MM/YY hh:mm:ss")
          }
    })

    if(!token){return <Redirect to="/login" />}

    return(
        <div id="logs">
            <Stack horizontal horizontalAlign="auto" tokens={{ childrenGap: 20 }} styles={{ root: { width: "auto", marginTop: '20px', marginBottom: '12px' } }}>
                <DatePicker style={{width: 140}} formatDate={date => formatDate(date)} firstDayOfWeek={DayOfWeek.Monday} maxDate={toDate} placeholder="From date" value={fromDate} onSelectDate={e=> setFilter('fromDate',new Date(new Date(e).setHours(0,0,0,0)))}/>
                <DatePicker style={{width: 140}} formatDate={date => formatDate(date)} firstDayOfWeek={DayOfWeek.Monday} maxDate={new Date(new Date().setHours(23,59,59,0))} minDate={fromDate} placeholder="To date" value={toDate} onSelectDate={e=> setFilter('toDate',new Date(new Date(e).setHours(23,59,59,0)))}/>
                <SearchBox styles={{root:{width: 300}}} iconProps={{ iconName: 'Filter', style: {color: 'black'}}} value={message} placeholder="Filter by log text..." onChange={e => setFilter('message',e?.target?.value?.toLowerCase() ?? '')} />
            </Stack>
            <div className="logs">
                {items.map(item => (
                    <Log key={item.key} item={item} />
                ))}
            </div>
        </div>
    )
}

const mapStateToProps = state => {
    return {
        token: state.auth.token,
        logs: state.logs.logs,
        filters: state.logs.filters,
        users: state.users.users
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getLogs: () => dispatch(getLogs()),
        remove: id => dispatch(deleteLog(id)),
        selectMenu: menu => dispatch(selectMenu(menu)),
        openUser: username => dispatch(setUsersSearchStr(username)),
        setFilter: (filter, value) => dispatch(setFilter(filter, value))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Logs);