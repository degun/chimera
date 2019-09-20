import React, {useState, useEffect} from 'react';
import {useSpring, animated} from 'react-spring';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { login, resetPassword } from '../store/actions/authActions';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Text } from 'office-ui-fabric-react/lib/Text';
import logourl from '../Chimera_01-01.svg'
import './Login.sass';

function Login({login, forgot, error, token}){
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
                <TextField name="admin_email" type="email" label="email" placeholder="enter email" onChange={({target}) => setEmail(target.value)} onKeyPress={({key}) => (key === "Enter") ? login(email, password) : null} />
                <TextField name="admin_password" label="Password" type="password" placeholder="enter password" onChange={({target})=> setPassword(target.value)} onKeyPress={({key}) => (key === "Enter") ? login(email, password) : null} />
                <TooltipHost className="forgot" content={email ? "" : "Please enter email"} styles={{ root: { display: 'inline-block' } }}>
                    <Text onClick={() => {
                        if(email){
                            return forgot(email);
                        }else{
                            return null
                        }
                    }}>Forgot password?</Text>
                </TooltipHost>
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
        login: (email, password) => dispatch(login(email, password)),
        forgot: email => dispatch(resetPassword(email))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);