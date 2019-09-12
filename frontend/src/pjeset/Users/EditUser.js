import React, {useState, useEffect} from 'react';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton, ActionButton } from 'office-ui-fabric-react';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { editUser, removeUser,toggleActive, endEdit } from '../../store/actions/usersActions';
import './EditUser.sass';

function EditUser({editing, endEdit, username, email, Wrate, CCrate, balance, active, staff, url, save, remove, toggleActiveState}){
    const [_username, setUsername] = useState(username);
    const [_email, setEmail] = useState(email);
    const [_balance, setBalance] = useState(balance);
    const [_Wrate, setWRate] = useState(Wrate);
    const [_CCrate, setCCRate] = useState(CCrate);
    const [_active, setActive] = useState(active);
    const [deleting, setDeleting] = useState(false);
    useEffect(()=>{setActive(active)}, [active]);
    const deActivateColorRoot = !_active ? "green" : "brown";
    const deActivateColorRootHovered = !_active ? "darkgreen" : "darkbrown";
    const deActivateColorRootPressed = !_active ? "darkgreen" : "darkred";
    return(
        <div>
        <Modal isOpen={editing} onDismiss={endEdit} isModeless={true} dragOptions={{dragHandleSelector: '.head'}} containerClassName={"editModal"}>
            <div className="head"><Text>Edit user</Text><ActionButton style={{height: "100%"}} buttonType={5} onClick={()=>endEdit()}><Icon iconName="Cancel" style={{color: "white"}}/></ActionButton></div>
            <form>
                <Stack>
                    <Stack horizontal>
                        <TextField label="Username" name="username" placeholder="username" value={_username || ""} onChange={({target}) => setUsername(target.value)} />
                        <TextField label="Email" name="email" placeholder="email" value={_email} onChange={({target}) => setEmail(target.value)} /> 
                    </Stack>
                    <Stack horizontal>
                        <TextField type="number" label="Balance" name="balance" placeholder="balance" value={_balance || 0} onChange={({target}) => setBalance(target.value)} />
                        <TextField type="number" step={0.01} min={0} max={1} label="Wire Rate" name="wire rate" placeholder="rate" value={_Wrate || undefined} onChange={({target}) => setWRate(target.value)} /> 
                        <TextField type="number" step={0.01} min={0} max={1} label="Credit Card Rate" name="credit card rate" placeholder="rate" value={_CCrate || undefined} onChange={({target}) => setCCRate(target.value)} /> 
                    </Stack>
                    <Stack horizontal className="actions">
                        <DefaultButton className="cancel" onClick={()=> endEdit()}text="Cancel" />
                        {!staff ? <DefaultButton
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
                                    onClick: () => setDeleting(true),
                                    styles: {root: {color: 'red'}, rootHovered: {color: 'red'}, rootPressed: {color: 'darkred'}},
                                    iconProps: { iconName: 'Delete', color: 'red' }
                                  }
                                ]
                              }} /> : null}
                        <PrimaryButton 
                            className="save"
                            onClick={()=>save(url, _username, _email, {balance: _balance, Wrate: _Wrate, CCrate: _CCrate})} 
                            text="Save" />
                    </Stack>
                </Stack>
            </form>
        </Modal>
        <Dialog
            hidden={!deleting}
            onDismiss={() => setDeleting(false)}
            dialogContentProps={{
                type: DialogType.normal,
                title: `Delete user ${username}?`,
                subText: 'Warning! By deleting this user you will delete all his data, all his related transactions and the resulting profit from this user. Are you absolutely sure you want to delete this user?'
            }}
            modalProps={{
                isBlocking: true,
                styles: { main: { maxWidth: 450 } },
                dragOptions: true
            }}
            >
            <DialogFooter>
                <PrimaryButton styles={{root:{backgroundColor: 'red'}, rootHovered:{backgroundColor: 'orangered'}, rootPressed:{backgroundColor: 'darkred'}, }} 
                    onClick={() => {remove(url); setDeleting(false)}} text="Delete" />
                <DefaultButton onClick={()=>setDeleting(false)} text="Cancel" />
            </DialogFooter>
        </Dialog>
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
        save: (url, username, email, is_active, is_staff, partner_data) => dispatch(editUser(url, username, email, is_active, is_staff, partner_data)),
        toggleActiveState: (url, active) => dispatch(toggleActive(url, active)),
        endEdit: () => dispatch(endEdit()),
        remove: url => dispatch(removeUser(url))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditUser);