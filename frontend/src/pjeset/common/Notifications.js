import React, {useState,useEffect} from 'react';
import { connect } from 'react-redux';
import { w3cwebsocket } from 'websocket';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { formatText } from '../../useful';
import { getAllTransactions } from '../../store/actions/transactionsActions';
import { updateAdminLocally } from '../../store/actions/usersActions';
import './Notifications.sass';

function Notifications({token, getTransactions, updateThisUser}){
    const client = w3cwebsocket(`ws://127.0.0.1:9000/notifications/?${token}`);
    const [anchor, setAnchor] = useState(null);
    const [notifications, setNotifications] = useState([]);
    
    useEffect(()=>{
        client.onopen = () => {
          console.log('WebSocket Client Connected');
        };
        client.onmessage = (m) => {
            const msg = JSON.parse(m.data);
            const {message, id, type} = msg;
            setNotifications([...notifications, {head: formatText(type), message, id}])
            getTransactions();
            updateThisUser();
        };
        return () => client.close()
    }, [token])

    function Notification({head, body, id, hideNotification}){
        const [active, setActive] = useState(true);
        useEffect(()=>{
            const timeoutid = setTimeout(() => {
                setActive(false)
                hideNotification(id)
            }, 10000);
            return () => clearTimeout(timeoutid)
        }, [])
        return(
            <div>
                {active ? <Callout
                    className="ms-CalloutExample-callout"
                    onClick={()=>hideNotification(id)}
                    isBeakVisible={false}
                    target={anchor}
                    gapSpace={0}
                    directionalHint={DirectionalHint.bottomRightEdge}
                    styles={{root: {width: '280px', backgrounColor: 'white', zIndex: 8}}}
                >
                    <div className="content">
                        <Text styles={{root: {display: 'block', padding: '20px 20px 0px 20px'}}} variant="large">{head}</Text>
                        <Text styles={{root: {display: 'block', padding: '0px 20px 20px 20px'}}} variant="medium">{body}</Text>
                    </div>
                </Callout>: null}
            </div>
        )
    }

    function removeNotification(id){
        setNotifications(notifications.filter(n=>n.id !== id))
    }

    return(
        <div id="notifications">
            <div className="ms-CalloutCoverExample-buttonArea" id="anchor" ref={ref=>setAnchor(ref)}>
                {notifications.map((notification, i) => {
                    return <Notification key={i} head={notification.head} body={notification.message} id={notification.id} hideNotification={id => removeNotification(id)}/>
                })}
            </div>
        </div>
    )
}

const mapStateToProps = state => {
    return {
        token: state.auth.token
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getTransactions: () => dispatch(getAllTransactions()),
        updateThisUser: () => dispatch(updateAdminLocally())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);