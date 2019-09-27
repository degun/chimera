import React, { useEffect } from 'react';
import { Pivot, PivotItem, PivotLinkSize, PivotLinkFormat } from 'office-ui-fabric-react/lib/Pivot';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { DefaultButton } from 'office-ui-fabric-react';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout, refreshToken } from '../../store/actions/authActions';
import { selectMenu } from '../../store/actions/systemActions';
import './Menu.sass';

function Menu({logOut, refreshToken, setMenu, token, menu, admin, username}){
    useEffect(() => {
      const interval = setInterval( () => {
        refreshToken()
      }, 300000);
      return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        refreshToken();
        window.addEventListener("focus", refreshToken);
        return () => window.removeEventListener("focus", refreshToken);
    },[])
    
    if(!token) return null;
    
    function itemClicked(e){
      setMenu(e.key.slice(1));
    }
    
    function logOutClicked(){
      logOut();
      return <Redirect to="/login" />
    }
    
    return (
        <div id="menu">
          <nav>
            <Pivot linkSize={PivotLinkSize.normal} linkFormat={PivotLinkFormat.links} selectedKey={menu} onLinkClick={itemClicked}>
              <PivotItem iconProps={{iconName: 'People'}} itemKey="0" headerText="Dashboard" onClick={() => setMenu("home")} onRenderItemLink={() => <Link to="/"><Icon iconName="Diagnostic" /> Dashboard</Link>} />
              {admin ? <PivotItem itemKey="1" headerText="Users" onClick={() => setMenu("users")} onRenderItemLink={() => <Link to="/users"><Icon iconName="People" /> Users</Link>} /> : null}
              <PivotItem itemKey="2" headerText="Transactions" onClick={() => setMenu("transactions")} onRenderItemLink={() => <Link to="/transactions"><Icon iconName="Money" /> Transactions</Link>} />
              <PivotItem itemKey="4" headerText="Transactions" onClick={() => setMenu("logs")} onRenderItemLink={() => <Link to="/logs"><Icon iconName="TextDocument" /> Logs</Link>} />
            </Pivot>
            <div>
              <Text variant="large" styles={{root: {verticalAlign: 'middle', color: '#777'}}}>{username}  |  </Text>
              <DefaultButton
                className="logout"
                allowDisabledFocus={true}
                text="Logout"
                onClick={() => logOutClicked()}
                iconProps={{ iconName: 'Leave' }}
              />
            </div>
          </nav>
        </div>
    )
}

const mapStateToProps = state => {
  return {
    token: state.auth.token,
    admin: state.auth.admin,
    menu: state.system.menu,
    username: state.auth.username
  }
}

const mapDispatchToProps = dispatch => {
  return {
    logOut: () => dispatch(logout()),
    setMenu: menu => dispatch(selectMenu(menu)),
    refreshToken: () => dispatch(refreshToken())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);