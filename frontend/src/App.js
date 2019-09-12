import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Menu from './pjeset/common/Menu';
import Notifications from './pjeset/common/Notifications';
import Home from './faqet/Home';
import Login from './faqet/Login';
import Users from './faqet/Users';
import Transactions from './faqet/Transactions';
import Logs from './faqet/Logs';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import './App.css';

initializeIcons();

function App() {
  return (
    <div className="App">
      <Menu />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/users" component={Users} />
        <Route exact path="/transactions" component={Transactions} />
        <Route exact path="/logs" component={Logs} />
      </Switch>
      <Notifications />
    </div>
  );
}

export default App;