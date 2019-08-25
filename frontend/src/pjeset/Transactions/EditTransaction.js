import React, {useState, useEffect} from 'react';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { DefaultButton, PrimaryButton, ActionButton } from 'office-ui-fabric-react';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { editUser, removeUser,toggleActive, endEdit } from '../../store/actions/usersActions';
import './EditTransaction.sass';

function EditTransaction({editing, endEdit, username, email, rate, balance, active, url, save, remove, toggleActiveState}){
    const [_username, setUsername] = useState(username);
    const [_email, setEmail] = useState(email);
    const [_balance, setBalance] = useState(balance);
    const [_rate, setRate] = useState(rate);
    const [_active, setActive] = useState(active);
    useEffect(()=>{setActive(active)}, [active]);
    const deActivateColorRoot = !_active ? "green" : "brown";
    const deActivateColorRootHovered = !_active ? "darkgreen" : "darkbrown";
    const deActivateColorRootPressed = !_active ? "darkgreen" : "darkred";
    return(
        <Modal isOpen={editing} onDismiss={endEdit} isModeless={true} dragOptions={{dragHandleSelector: '.head'}} containerClassName={"editModal"}>
            <div className="head"><Text>Edit user</Text><ActionButton style={{height: "100%"}} buttonType={5} onClick={()=>endEdit()}><Icon iconName="Cancel" style={{color: "white"}}/></ActionButton></div>
            <form>
                <Stack>
                    <Stack horizontal>
                        <TextField label="Username" name="username" placeholder="username" value={_username || ""} onChange={({target}) => setUsername(target.value)} />
                        <TextField label="Email" name="email" placeholder="email" value={_email} onChange={({target}) => setEmail(target.value)} /> 
                    </Stack>
                    <Stack horizontal>
                        <TextField type="number" label="Balance" name="balance" placeholder="balance" value={_balance || undefined} onChange={({target}) => setBalance(target.value)} />
                        <TextField type="number" step={0.01} min={0} max={1} label="Rate" name="rate" placeholder="rate" value={_rate || undefined} onChange={({target}) => setRate(target.value)} /> 
                    </Stack>
                    <Stack horizontal className="actions">
                        <DefaultButton className="cancel" onClick={()=> endEdit()}text="Cancel" />
                        <DefaultButton
                            className="delete"
                            styles={{root: {color: deActivateColorRoot, borderColor: deActivateColorRoot}, 
                                    rootHovered: {color: deActivateColorRootHovered, borderColor: deActivateColorRootHovered}, 
                                    rootPressed: {color: deActivateColorRootPressed, borderColor: deActivateColorRootPressed}}
                                } 
                            onClick={() => toggleActiveState(url, !_active)}
                            text={_active ? "Deactivate" : "Activate"}
                            split={true}
                            menuProps={{
                                items: [
                                  {
                                    key: 'deleteUser',
                                    text: 'Delete',
                                    style: {color: 'red', marginRight: 0},
                                    onClick: () => remove(url),
                                    iconProps: { iconName: 'Delete', iconColor: 'red' }
                                  }
                                ]
                              }} />
                        <PrimaryButton 
                            className="save"
                            onClick={()=>save(url, _username, _email, {balance: _balance, rate: _rate, active: _active})} 
                            text="Save" />
                    </Stack>
                </Stack>
            </form>
        </Modal>
    )
}

const mapStateToProps = state => {
    return {
        token: state.auth.token
    }
}

const mapDispatchToProps = dispatch => {
    return {
        save: (url, username, email, is_active, is_staff, partner_data) => dispatch(editUser(url, username, email, is_active, is_staff, partner_data)),
        toggleActiveState: (url, active) => dispatch(toggleActive(url, active)),
        endEdit: () => dispatch(endEdit()),
        remove: url => dispatch(removeUser(url))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditTransaction);