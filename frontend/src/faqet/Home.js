import React, {useEffect} from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import Dashboard from '../pjeset/Home/Dashboard';
import { selectMenu } from '../store/actions/systemActions';
import './Home.sass';

function Home({selectMenu, token, balance}){
    useEffect(()=>{selectMenu("0");document.title = "Chimera | Home"}, [selectMenu]);

    if(!token){return <Redirect to="/login" />}
    return(
        <div id="home">
            <Dashboard />
        </div>
    )
}

const mapStateToProps = state => {
    return {
        token: state.auth.token,
        balance: state.auth.balance
    }
}

const mapDispatchToProps = dispatch => {
    return {
        selectMenu: menu => dispatch(selectMenu(menu))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);