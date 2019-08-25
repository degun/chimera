import React, {useEffect} from 'react';
import moment from 'moment';
import {connect} from 'react-redux';
import {getLogs, setFilter} from '../store/actions/logsActions';
import {selectMenu} from '../store/actions/systemActions';
import { ActivityItem, Icon, Link, mergeStyleSets } from 'office-ui-fabric-react';
import { Redirect } from 'react-router-dom';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { DatePicker, DayOfWeek } from 'office-ui-fabric-react';
import { formatText, formatDate } from '../useful';
import * as t from '../store/actions/logTypes';
import './Logs.sass';

function Logs({logs, token, getLogs, selectMenu, users, filters, setFilter}){

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

    function getUsername(user){
        if(users.length){
            return users.filter(u=> u.url === `http://localhost:8000/api/users/${user}/`)[0].username;
        }else{
            return '';
        }
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
        let iconName = '', color= '';
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
              <Link key={log.id + 'a'}>&nbsp;@{getUsername(log.user)}</Link>
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
                <TextField style={{width: 300}} type="text" value={message} placeholder="Search log text..." onChange={({target}) => setFilter('message',target.value.toLowerCase())} />
            </Stack>
            <div className="logs">
                {items.map(item => (
                    <ActivityItem {...item} key={item.key} className={classNames.exampleRoot} />
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
        selectMenu: menu => dispatch(selectMenu(menu)),
        setFilter: (filter, value) => dispatch(setFilter(filter, value))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Logs);