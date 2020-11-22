import React, {useState, useEffect} from 'react';
import numeral from 'numeral';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { DefaultButton, PrimaryButton, ActionButton } from 'office-ui-fabric-react';
import { ComboBox } from 'office-ui-fabric-react/lib/index';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { editTransaction, endEdit } from '../../store/actions/transactionsActions';
import { HOST } from '../../config';
import './EditTransaction.sass';

const host = HOST.replace("https", "http");

numeral.locale('al');

function EditTransaction({editing, endEdit, edit, users, data}){

    const [type, setType] = useState(data.transaction_type);
    const [client, setClient] = useState(data.client_name);
    const [amount, setAmount] = useState(parseFloat(data.amount));
    const [amount_paid, setAmountpaid] = useState(parseFloat(data.amount_paid));
    const [partner, setPartner] = useState(data.user);
    const [currentPartner, setCurrentPartner] = useState({partner_data: {rate: 1}});
    const [rate, setRate] = useState(currentPartner.partner_data.rate)
    const [sign, setSign] = useState(1);
    const [ready, setReady] = useState(false);
    
    useEffect(()=>{
        switch(type){
            case "Wire": setRate(parseFloat(currentPartner.partner_data.rate).toPrecision(2)); break;
            case "Credit Card": setRate(parseFloat(currentPartner.partner_data.rate).toPrecision(2)); break;
            case "Withdraw": setRate(parseFloat(currentPartner.partner_data.rate).toPrecision(2));break;
            case "Payment": setRate(1) ;break;
            default: setRate(parseFloat(currentPartner.partner_data.rate).toPrecision(2));break;
        }
    }, [currentPartner, type]);

    useEffect(()=>{
        setAmount(Math.abs(amount) * sign);
    }, [sign, type, amount]);

    useEffect(()=>{
        setAmountpaid(Math.round( (amount * rate) * 100 + Number.EPSILON ) / 100);
    }, [amount, rate]);

    useEffect(()=>{
        let clientOK = false;
        if(type==="Payment"){
            setClient("");
        }
        if(type==="Payment" || client !== ""){
            clientOK = true;
        }
        if(type !== "" && amount !== 0 && partner !== "" && clientOK){
            setReady(true)
        }else{
            setReady(false)
        }
    }, [type, amount, partner, client]);

    useEffect(()=> {
        setTheSign(type)
    },[type])

    const transaction_types = [
        { key: 'Wire', text: 'Wire' },
        { key: 'Credit Card', text: 'Credit Card' },
        { key: 'Withdraw', text: 'Withdraw' },
        { key: 'Payment', text: 'Payment' }
    ];

    const partners = users.filter(u => (!u.is_staff && u.is_active)).map(u=>{
        const urlArray = u.url.split("/");
        return {
            key: urlArray[urlArray.length - 2],
            text: u.username
        }
    })

    function selectPartner(e, {key}){
        setPartner(key);
        const url = `${host}/api/users/${key}/`;
        setCurrentPartner(users.filter(u=>u.url === url)[0]);
    }

    function setTheSign(type){
        switch(type){
            case "Wire": setSign(1); break;
            case "Credit Card": setSign(1); break;
            case "Withdraw": setSign(-1);break;
            case "Payment": setSign(-1) ;break;
            default: setSign(1);break;
        }
    }

    function setAmountField({target}){
        setTheSign(type);
        if(target.value){
            setAmount(sign * Math.abs(parseFloat(target.value)))
        }else{
            setAmount(0)
        }
    }

    return(
        <Modal isOpen={editing} onDismiss={endEdit} isModeless={true} dragOptions={{dragHandleSelector: '.head'}} containerClassName={"transactionModal"}>
            <div className="head"><Text>Edit transaction</Text><ActionButton style={{height: "100%"}} buttonType={5} onClick={()=>endEdit()}><Icon iconName="Cancel" style={{color: "white"}}/></ActionButton></div>
            <form>
                <Stack>
                    <Stack horizontal className="row1">
                        <ComboBox label="Type of transaction" autoComplete="on" selectedKey={type} options={transaction_types} placeholder="Type..." onChange={(e, {key}) => setType(key)} />
                        <ComboBox label="Partner name" autoComplete="on" allowFreeform selectedKey={partner} options={partners} placeholder="Partner..." onChange={selectPartner} />
                    </Stack>
                    <Stack horizontal className="row2">
                        <TextField disabled={type === "Payment"} name="client" label="Client name" placeholder="client" value={client} onChange={({target}) => setClient(target.value)} /> 
                        <TextField type="number" step={1} name="amount" label="Amount" placeholder="amount" value={amount} onChange={setAmountField} />
                    </Stack>
                    <Stack horizontal className="row3">
                        <Text className="calc" variant="xLarge">{`${numeral(amount).format("0,0.00")} x ${rate} =`}</Text>
                        <div className="partnerAmount">
                            <label htmlFor="partner_amount"><Text variant="medium">Partner amount</Text></label>
                            <Text className="amount" name="partner_amount" variant="xLarge">{numeral(amount_paid).format('0,0.00 $')}</Text>
                        </div>
                    </Stack>
                    <Stack horizontal className="actions">
                        <DefaultButton className="cancel" onClick={()=> endEdit()} text="Cancel" />
                        <PrimaryButton 
                            className="edit"
                            disabled={!ready}
                            onClick={()=>edit(type, client, amount, amount_paid, rate, partner)}
                            text="Save" />
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
        edit: (type, client, amount, amount_paid, rate, partner) => dispatch(editTransaction(type, client, amount, amount_paid, rate, partner)),
        endEdit: () => dispatch(endEdit())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditTransaction);