import React, {useState, useEffect} from 'react';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { DefaultButton, PrimaryButton, ActionButton } from 'office-ui-fabric-react';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { addUser, endAdd } from '../../store/actions/usersActions';
import './AddUser.sass';

function AddUser({adding, endAdd, add, users}){
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");
    const [balance, setBalance] = useState(0);
    const [Wrate, setWRate] = useState(1);
    const [CCrate, setCCRate] = useState(1);
    const [BTCrate, setBTCRate] = useState(1);
    const [isReady, setReady] = useState(false);
    const [errors, setErrors] = useState({
        email: '',
        username: '',
        password: '',
        passwordMatch: ''
    })

    useEffect(()=> {
        if(username && email && password1 && password2 && !errors.username && !errors.email && !errors.password && !errors.passwordMatch){
            setReady(true)
        }else{
            setReady(false)
        }
    }, [username, email, password1, password2, errors])

    function checkEmail(){
        if(email){
            const emails = users.map(u => u.email);
            //var emailRegex = new RegExp('^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$')
            emails.forEach(em =>{
                if (em === email){
                    setErrors({...errors, email: 'User with this email is already present'})
                }
            })
            if(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)){
                setErrors({...errors, email: ''})
            }else{
                setErrors({...errors, email: 'Email not valid'})
            }
        }else{
            setErrors({...errors, email: ''})
        }
    }

    function checkPassword(){
        var mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
        if(password1){
            if(mediumRegex.test(password1)){
                setErrors({...errors, password: ''})
            }else{
                setErrors({...errors, password: 'Password not valid'})
            }
        }else{
            setErrors({...errors, password: ''})
        }
    }

    function checkPassword2(){
        if(password2){
            if(password1 === password2){
                setErrors({...errors, passwordMatch: ''})
            }else{
                setErrors({...errors, passwordMatch: 'Passwords do not match'})
            }
        }else{
            setErrors({...errors, passwordMatch: ''})
        }
    }

    function checkUsername(){
        var usernameRegex = new RegExp("^[A-Z]+$", "i");
        if(username){   
            if(usernameRegex.test(username)){
                setErrors({...errors, username: ''})
            }else{
                setErrors({...errors, username: 'Username should contain only letters'})
            }
            const usernames = users.map(u => u.username);
            for(let us in usernames){
                if (us === username){
                    setErrors({...errors, username: 'User with this username is already present'})
                }
            }
        }else{
            setErrors({...errors, username: ''})
        }
    }

    return(
        <Modal isOpen={adding} onDismiss={endAdd} isModeless={true} dragOptions={{dragHandleSelector: '.head'}} containerClassName={"editModal"}>
            <div className="head"><Text>Add user</Text><ActionButton style={{height: "100%"}} buttonType={5} onClick={()=>endAdd()}><Icon iconName="Cancel" style={{color: "white"}}/></ActionButton></div>
            <form>
                <Stack>
                    <Stack horizontal>
                        <TextField label="Email" name="email" placeholder="email" errorMessage={errors.email} value={email} onChange={({target}) => setEmail(target.value)} onBlur={checkEmail} /> 
                        <TextField label="Username" name="username" placeholder="username" errorMessage={errors.username} value={username} onChange={({target}) => setUsername(target.value)} onBlur={checkUsername} />
                    </Stack>
                    <Stack horizontal>
                        <TextField type="password" label="Password" name="password1" placeholder="password" errorMessage={errors.password} value={password1} onChange={({target}) => setPassword1(target.value)} onBlur={checkPassword} />
                        <TextField type="password" label="Confirm Password" name="password2" placeholder="confirm password" errorMessage={errors.passwordMatch} value={password2} onChange={({target}) => setPassword2(target.value)} onBlur={checkPassword2} /> 
                    </Stack>
                    <Stack horizontal>
                        <TextField type="number" label="Balance" name="balance" placeholder="balance" value={balance} onChange={({target}) => setBalance(target.value)} />
                        <TextField type="number" step={0.01} min={0} max={1} label="Wire Rate" name="wire rate" placeholder="rate" value={Wrate} onChange={({target}) => setWRate(target.value)} /> 
                        <TextField type="number" step={0.01} min={0} max={1} label="Credit Card R." name="credit card rate" placeholder="rate" value={CCrate} onChange={({target}) => setCCRate(target.value)} />
                        <TextField type="number" step={0.01} min={0} max={1} label="BTC Rate" name="BTC rate" placeholder="rate" value={BTCrate} onChange={({target}) => setBTCRate(target.value)} />  
                    </Stack>
                    <Stack horizontal className="actions">
                        <DefaultButton className="cancel" onClick={()=> endAdd()} text="Cancel" />
                        <PrimaryButton 
                            disabled={!isReady}
                            className="add"
                            onClick={()=>add(username, email, password1, {balance, Wrate, CCrate, BTCrate})}
                            text="Add" />
                    </Stack>
                </Stack>
            </form>
        </Modal>
    )
}

const mapStateToProps = state => {
    return {
        token: state.auth.token,
        users: state.users.users
    }
}

const mapDispatchToProps = dispatch => {
    return {
        add: (username, email, password1, password2, partner_data) => dispatch(addUser(username, email, password1, password2, partner_data)),
        endAdd: () => dispatch(endAdd())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddUser);