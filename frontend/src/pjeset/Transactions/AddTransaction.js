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
import { addTransaction, endAdd } from '../../store/actions/transactionsActions';
import './AddTransaction.sass';

numeral.locale('al');

function AddTransaction({adding, endAdd, add, users, clients}){
    const [type, setType] = useState("");
    const [client, setClient] = useState("");
    const [client_names, setClientNames] = useState([]);
    const [amount, setAmount] = useState(0);
    const [amount_paid, setAmountpaid] = useState(0);
    const [partner, setPartner] = useState("");
    const [currentPartner, setCurrentPartner] = useState({partner_data: {rate: 1}});
    const [rate, setRate] = useState(1);
    const [sign, setSign] = useState(1);
    const [ready, setReady] = useState(false);

    useEffect(()=>{
        switch(type){
            case "Wire": setRate(parseFloat(currentPartner.partner_data.Wrate).toPrecision(2)); break;
            case "Credit Card": setRate(parseFloat(currentPartner.partner_data.CCrate).toPrecision(2)); break;
            case "BTC": setRate(parseFloat(currentPartner.partner_data.BTCrate).toPrecision(2)); break;
            case "Withdraw": setRate(parseFloat(currentPartner.partner_data.Wrate).toPrecision(2));break;
            case "Payment": setRate(1) ;break;
            default: setRate(1);break;
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
        { key: 'BTC', text: 'BTC' },
        { key: 'Withdraw', text: 'Withdraw' },
        { key: 'Payment', text: 'Payment' }
    ];

    useEffect(()=>{
        setClientNames(clients.map(c => {
            return {
                key: c,
                text: c
            }
        }))
    }, [clients])

    function addClientToClientNames(){
        setClientNames([{key: client, text: client}, ...client_names])
    }

    const partners = users.filter(u => (!u.is_staff && u.is_active && (type === 'BTC' ? u.partner_data.btc : true))).map(({id, username}) => {
        return {
            key: id,
            text: username
        }
    })

    function selectPartner(e, item){
        setPartner(item?.key);
        setCurrentPartner(users.filter(u=>u.id === item?.key)[0]);
    }

    function setTheSign(type){
        switch(type){
            case "Wire": setSign(1); break;
            case "Credit Card": setSign(1); break;
            case "BTC": setSign(1); break;
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

    let color = 'white'

    switch(type){
        case 'Wire': color = '#fce100'; break;
        case 'Credit Card': color = '#ffaa44'; break;
        case 'BTC': color = '#8e41be'; break;
        case 'Withdraw': color = '#da3b01'; break;
        case 'Payment': color = '#00b7c3'; break;
        default: color = 'white'; break;
    }

    const showCalculations = (type && type !== "Payment" && partner)

    return(
        <Modal isOpen={adding} onDismiss={endAdd} isModeless={true} dragOptions={{dragHandleSelector: '.head'}} containerClassName={"transactionModal"}>
            <div className="head"><Text>Add transaction</Text><ActionButton style={{height: "100%"}} buttonType={5} onClick={()=>endAdd()}><Icon iconName="Cancel" style={{color: "white"}}/></ActionButton></div>
            <form style={{borderLeft: `4px solid ${color}`}}>
                <Stack>
                    <Stack horizontal className="row1">
                        <ComboBox label="Type of transaction" autoComplete="on" selectedKey={type} options={transaction_types} placeholder="Type..." onChange={(e, {key}) => setType(key)} />
                        <ComboBox label="Partner name" autoComplete="on" allowFreeform selectedKey={partner} options={partners} placeholder="Partner..." onChange={selectPartner} />
                    </Stack>
                    <Stack horizontal className="row2">
                        <ComboBox disabled={type === "Payment"} label="Client name" autoComplete="on" allowFreeform={true} selectedKey={client} options={client_names} onBlur={addClientToClientNames} placeholder="Client name..." onChange={(e, e2) => setClient(e.target.value ? e.target.value : e2.key)} />
                        <TextField type="number" step={1} name="amount" label="Amount" placeholder="amount" value={amount} onChange={setAmountField} />
                    </Stack>
                    <Stack horizontal className="row3">
                        <Text className="calc" styles={{root: {visibility: showCalculations ? 'visible' : 'hidden'}}} variant="xLarge">{`${numeral(amount).format("0,0.00")} x ${rate} =`}</Text>
                        <div className="partnerAmount">
                            <label htmlFor="partner_amount"><Text variant="medium">Partner amount</Text></label>
                            <Text className="amount" name="partner_amount" variant="xLarge">{numeral(amount_paid).format('0,0.00 $')}</Text>
                        </div>
                    </Stack>
                    <Stack horizontal className="actions">
                        <DefaultButton className="cancel" onClick={()=> endAdd()} text="Cancel" />
                        <PrimaryButton
                            className="add"
                            disabled={!ready}
                            onClick={()=>add(type, client, amount, amount_paid, rate, partner)}
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
        users: state.users.users,
        clients: state.transactions.clients
    }
}

const mapDispatchToProps = dispatch => {
    return {
        add: (type, client, amount, amount_paid, rate, partner) => dispatch(addTransaction(type, client, amount, amount_paid, rate, partner)),
        endAdd: () => dispatch(endAdd())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddTransaction);