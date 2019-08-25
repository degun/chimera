import React, {useState, useEffect} from 'react';
import {useSpring, animated} from 'react-spring';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { login } from '../store/actions/authActions';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import logourl from '../Chimera_01-01.svg'
import './Login.sass';

function Login({login, error, token}){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(()=>{document.title = "Chimera | Login"}, [])

    const props = useSpring({opacity: 1, from: {opacity: 0}})
    
    if(token){return <Redirect to="/" />}

    return(
        <div id="login">
            <div className="logo">
                <img src={logourl} alt="logo file"/><animated.div style={props}><span className="Chimera">Chimera</span></animated.div>
            </div>
            <form>
                <h3>Log in</h3>
                <TextField name="email" type="email" label="email" placeholder="enter email" onChange={({target}) => setEmail(target.value)} />
                <TextField name="password" label="Password" type="password" placeholder="enter password" onChange={({target})=> setPassword(target.value)} />
                <PrimaryButton className="login" onClick={() => login(email, password)}>Log in</PrimaryButton>
                <h6>{error && error.message}</h6>
            </form>
        </div>
    )
}

const mapStateToProps = state => {
    return {
        token: state.auth.token,
        error: state.auth.error,
        loading: state.auth.loading
    }
}

const mapDispatchToProps = dispatch => {
    return {
        login: (email, password) => dispatch(login(email, password))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);