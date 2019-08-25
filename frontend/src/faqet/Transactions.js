import React, {useState, useEffect} from 'react';
import moment from 'moment';
import numeral from 'numeral';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { DetailsList, SelectionMode, Selection, DetailsListLayoutMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DatePicker, DayOfWeek } from 'office-ui-fabric-react';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { MarqueeSelection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import { PrimaryButton, IconButton, DefaultButton } from 'office-ui-fabric-react';
import { Dropdown, DropdownMenuItemType } from 'office-ui-fabric-react/lib/Dropdown';
import { CSVLink } from "react-csv";
import { selectMenu } from '../store/actions/systemActions';
import { setToken } from '../store/actions/authActions';
import { formatDate } from '../useful';
import { beginEdit, beginAdd, removeTransaction, getAllTransactions, setTransactionsFilter, setAllPartnersSelected, setAllTypesSelected } from '../store/actions/transactionsActions';
import AddTransaction from '../pjeset/Transactions/AddTransaction';
import './Transactions.sass';

numeral.locale('al');

function Transactions ({selectMenu, beginAdd, token, users, admin, balance, adding, transactions, remove, getTransactions, setFilter, filters, allPartners, allTypes}){
    
    const [deleting, setDeleting] = useState(false);
    const [deletingID, setDeletingID] = useState(0);
    
    let {client, partners, types, fromDate, toDate} = filters;

    fromDate = new Date(fromDate);
    toDate = new Date(toDate);

    useEffect(()=> {
        if(!partners.length){
            setFilter('partners', users.filter(u=> !u.is_staff).map(u => {
                const urlArray = u.url.split("/");
                const key = urlArray[urlArray.length - 2];
                return key
            }));
        }
        if(!types.length){
            setFilter('types', ['Wire', 'Credit Card', 'Withdraw', 'Payment']);
        }
    }, [setFilter])

    const partnersDropdown = users.filter(u => !u.is_staff).map(u=>{
        const urlArray = u.url.split("/");
        const key = urlArray[urlArray.length - 2];
        return {
            key,
            text: u.username,
            selected: partners.includes(key)
        }
    });

    const typesDropdown = [
        { key: 'Wire', text: 'Wire', selected: types.includes('Wire') },
        { key: 'Credit Card', text: 'Credit Card', selected: types.includes('Credit Card') },
        { key: 'Withdraw', text: 'Withdraw', selected: types.includes('Withdraw') },
        { key: 'Payment', text: 'Payment', selected: types.includes('Payment') }
    ];
    
    useEffect(()=>{
        document.title = "Chimera | Transactions"; 
        selectMenu(admin ? "2" : "3");
        getTransactions();
    }, [selectMenu, getTransactions, admin]);
    
    const columns = [
        {
            key: 'id',
            name: 'ID',
            fieldName: 'id',
            minWidth: 20,
            maxWidth: 30,
            isRowHeader: false,
            isSorted: false,
            isSortedDescending: false,
            onColumnClick: _onColumnClick,
            data: 'string',
            isPadded: true,
            isResizable: true
        },
        {
            key: 'transaction_type',
            name: 'Type',
            fieldName: 'transaction_type',
            minWidth: 60,
            maxWidth: 90,
            isRowHeader: false,
            isSorted: false,
            isSortedDescending: false,
            onColumnClick: _onColumnClick,
            data: 'string',
            isPadded: true,
            isResizable: true
        },
        {
            key: 'client',
            name: 'Client name',
            fieldName: 'client',
            minWidth: 110,
            maxWidth: 180,
            isRowHeader: false,
            isSorted: false,
            isSortedDescending: false,
            onColumnClick: _onColumnClick,
            data: 'string',
            isPadded: true,
            isResizable: true
        },
        {
            key: 'partner',
            name: 'Partner',
            fieldName: 'partner',
            minWidth: 70,
            maxWidth: 80,
            isRowHeader: false,
            isSorted: false,
            isSortedDescending: false,
            onColumnClick: _onColumnClick,
            data: 'string',
            isPadded: true,
            isResizable: true
        },
        {
            key: 'amount',
            name: 'Amount',
            fieldName: 'amount',
            minWidth: 70,
            maxWidth: 90,
            isRowHeader: false,
            isSorted: false,
            isSortedDescending: false,
            onColumnClick: _onColumnClick,
            data: 'string',
            isPadded: true,
            isResizable: true
        },
        {
            key: 'rate',
            name: 'Rate',
            fieldName: 'rate',
            minWidth: 30,
            maxWidth: 50,
            isRowHeader: false,
            isSorted: false,
            isSortedDescending: false,
            onColumnClick: _onColumnClick,
            data: 'string',
            isPadded: true,
            isResizable: true
        },
        {
            key: 'amount_paid',
            name: 'Partner amount',
            fieldName: 'amount_paid',
            minWidth: 70,
            maxWidth: 90,
            isRowHeader: false,
            isSorted: false,
            isSortedDescending: false,
            onColumnClick: _onColumnClick,
            data: 'string',
            isPadded: true,
            isResizable: true
        },
        {
            key: 'created_at',
            name: 'Created at',
            fieldName: 'created_at',
            minWidth: 110,
            maxWidth: 110,
            isRowHeader: false,
            isSorted: false,
            isSortedDescending: false,
            onColumnClick: _onColumnClick,
            data: 'string',
            isPadded: true,
            isResizable: true
        },
        {
            key: 'delete',
            name: 'Delete',
            minWidth: 45,
            maxWidth: 55,
            isRowHeader: false,
            isSorted: false,
            isSortedDescending: false,
            onColumnClick: _onColumnClick,
            data: 'string',
            isPadded: true,
            isResizable: true,
            onRender: (item) => {
                return <IconButton onClick={() => { setDeleting(true); setDeletingID(item.id) }} styles={{root:{height: '15px', marginLeft: '7px', color: '#ccc'}, rootHovered: {color: 'red'}, rootPressed: {color: 'darkred'}}} iconProps={{iconName: "Delete"}} />
            }
        }
    ];

    const partnerColumns = [
        {
            key: 'id',
            name: 'ID',
            fieldName: 'id',
            minWidth: 20,
            maxWidth: 30,
            isRowHeader: false,
            isSorted: false,
            isSortedDescending: false,
            onColumnClick: _onColumnClick,
            data: 'string',
            isPadded: true,
            isResizable: true
        },
        {
            key: 'transaction_type',
            name: 'Type',
            fieldName: 'transaction_type',
            minWidth: 60,
            maxWidth: 100,
            isRowHeader: false,
            isSorted: false,
            isSortedDescending: false,
            onColumnClick: _onColumnClick,
            data: 'string',
            isPadded: true,
            isResizable: true
        },
        {
            key: 'client',
            name: 'Client name',
            fieldName: 'client',
            minWidth: 120,
            maxWidth: 140,
            isRowHeader: false,
            isSorted: false,
            isSortedDescending: false,
            onColumnClick: _onColumnClick,
            data: 'string',
            isPadded: true,
            isResizable: true
        },
        {
            key: 'amount',
            name: 'Amount',
            fieldName: 'amount',
            minWidth: 50,
            maxWidth: 60,
            isRowHeader: false,
            isSorted: false,
            isSortedDescending: false,
            onColumnClick: _onColumnClick,
            data: 'string',
            isPadded: true,
            isResizable: true
        },
        {
            key: 'amount_paid',
            name: 'My amount',
            fieldName: 'amount_paid',
            minWidth: 60,
            maxWidth: 80,
            isRowHeader: false,
            isSorted: false,
            isSortedDescending: false,
            onColumnClick: _onColumnClick,
            data: 'string',
            isPadded: true,
            isResizable: true
        },
        {
            key: 'created_at',
            name: 'Created at',
            fieldName: 'created_at',
            minWidth: 130,
            maxWidth: 150,
            isRowHeader: false,
            isSorted: false,
            isSortedDescending: false,
            onColumnClick: _onColumnClick,
            data: 'string',
            isPadded: true,
            isResizable: true
        }
    ];

    function _onColumnClick(){}
    function _renderItemColumn(item, index, column){
        if(column.key === 'amount' || column.key === 'amount_paid'){
            return <div style={{textAlign: 'right'}}>{item[column.key]}</div>
        }else{
            return item[column.key]
        }
    }

    let data = []
    
    data = transactions.map(t => {
        return {
            id: t.id,
            transaction_type: t.transaction_type,
            client: t.client_name,
            amount: numeral(parseFloat(t.amount)).format('0,0.00 $'),
            rate: t.rate,
            partner: admin ? users.filter(u => u.url === `http://localhost:8000/api/users/${t.user}/`)[0].username : null,
            amount_paid: numeral(parseFloat(t.amount_paid)).format('0,0.00 $'),
            created_at: moment(new Date(t.entry_time)).format("DD/MM/YYYY hh:mm:ss"),
        }
    });

    const CSVheaders = [
        { label: "ID", key: "id" },
        { label: "Type", key: "transaction_type" },
        { label: "Client Name", key: "client" },
        { label: "Parner Name", key: "partner" },
        { label: "Amount", key: "amount" },
        { label: "Partner Amount", key: "amount_paid" },
        { label: "Date", key: "created_at" }
      ];

    function changeSelectedPartners(e, e2){
        const p = partnersDropdown.map(type => {
            if(type.key === e2.key){
                return e2
            }else{
                return type
            }
        });
        allPartners(p.every(p=>p.selected));
        setFilter('partners', p.filter(p => p.selected).map(p=> p.key));
    }

    function changeSelectedTypes(e, e2){
        const t = typesDropdown.map(type => {
            if(type.key === e2.key){
                return e2
            }else{
                return type
            }
        })
        allTypes(t.every(t=>t.selected));
        setFilter('types', t.filter(t => t.selected).map(t=> t.key));
    }

    if(!token){return <Redirect to="/login" />}
    return(
        <div id="transactions">
            <Fabric>
                <Stack horizontal horizontalAlign="space-between" tokens={{ childrenGap: 20 }} styles={{ root: { width: 960, padding: "20px 0" } }}>
                    <Stack horizontal horizontalAlign="auto" tokens={{ childrenGap: 20 }} styles={{ root: { width: "auto" } }}>
                        <Dropdown
                            placeholder="Type"
                            selectedKeys={types}
                            onChange={changeSelectedTypes}
                            multiSelect
                            options={[{ key: 'typesHeader', text: 'Types', itemType: DropdownMenuItemType.Header },...typesDropdown]}
                            style={{width: 120, textAlign: 'left'}}
                        />
                        <TextField style={{width: 150}} type="text" value={client} placeholder="Client name..." onChange={({target}) => setFilter('client',target.value.toLowerCase())} />
                        {admin ? <Dropdown
                            placeholder="Filter by partner"
                            selectedKeys={partners}
                            onChange={changeSelectedPartners}
                            multiSelect
                            options={[{ key: 'partnersHeader', text: 'Partners', itemType: DropdownMenuItemType.Header },...partnersDropdown]}
                            style={{width: 140, textAlign: 'left'}}
                        /> : null}
                        <DatePicker style={{width: 140}} formatDate={date => formatDate(date)} firstDayOfWeek={DayOfWeek.Monday} maxDate={toDate} placeholder="From date" value={fromDate} onSelectDate={e=> setFilter('fromDate',new Date(new Date(e).setHours(0,0,0,0)))}/>
                        <DatePicker style={{width: 140}} formatDate={date => formatDate(date)} firstDayOfWeek={DayOfWeek.Monday} maxDate={new Date(new Date().setHours(23,59,59,0))} minDate={fromDate} placeholder="To date" value={toDate} onSelectDate={e=> setFilter('toDate',new Date(new Date(e).setHours(23,59,59,0)))}/>
                    </Stack>
                    {admin ? <PrimaryButton
                        allowDisabledFocus={true}
                        disabled={adding}
                        checked={false}
                        text="New transaction"
                        onClick={()=>beginAdd()}
                        iconProps={{iconName: "Add"}}
                        align="end"
                        styles={{root: {
                            justifySelf: 'flex-end'
                        }}}
                    /> : <div><Text variant="large">Balance:</Text> <Text variant="xLarge">{numeral(balance).format("0,0.00 $")}</Text></div>}
                </Stack>
                <MarqueeSelection>
                    <DetailsList
                        className="table"
                        maxWidth={admin ? 960 : 720}
                        height={'70%'}
                        items={data}
                        compact={false}
                        columns={admin ? columns : partnerColumns}
                        enableShimmer={!data}
                        isHeaderVisible={true}
                        checkboxVisibility={2}
                        selectionMode={SelectionMode.multiple}
                        layoutMode={DetailsListLayoutMode.justified}
                        onRenderItemColumn={_renderItemColumn}
                    />
                </MarqueeSelection>
            </Fabric>
            {adding ? <AddTransaction adding={adding} /> : null}
            <Dialog
                hidden={!deleting}
                onDismiss={() => setDeleting(false)}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: 'Delete transaction?',
                    subText: 'Do you really want do delete this transaction?'
                }}
                modalProps={{
                    isBlocking: true,
                    styles: { main: { maxWidth: 450 } },
                    dragOptions: true
                }}
                >
                <DialogFooter>
                    <PrimaryButton styles={{root:{backgroundColor: 'red'}, rootHovered:{backgroundColor: 'orangered'}, rootPressed:{backgroundColor: 'darkred'}, }} 
                        onClick={() => {remove(deletingID); setDeleting(false)}} text="Delete" />
                    <DefaultButton onClick={()=>setDeleting(false)} text="Cancel" />
                </DialogFooter>
            </Dialog>
            <div className="bottom">
                <div className="data">
                    <Text variant="small" >{transactions.length} transactions</Text>
                </div>
                <DefaultButton iconProps={{iconName: 'Download'}}><CSVLink filename={`transactions_report_${moment(new Date()).format('DD_MM_YYYY_hh_mm_ss')}.csv`} data={data} headers={CSVheaders}>Download CSV</CSVLink></DefaultButton>
            </div>
        </div>
    )
}

const mapStateToProps = state => {
    return {
        token: state.auth.token,
        admin: state.auth.admin,
        balance: state.auth.balance,
        users: state.users.users,
        transactions: state.transactions.transactions,
        editing: state.transactions.editing,
        editingThis: state.transactions.editingThis,
        adding: state.transactions.adding,
        filters: state.transactions.filters
    }
}

const mapDispatchToProps = dispatch => {
    return {
        selectMenu: menu => dispatch(selectMenu(menu)),
        setToken: token => dispatch(setToken(token)),
        beginAdd: () => dispatch(beginAdd()),
        beginEdit: id => dispatch(beginEdit(id)),
        remove: url => dispatch(removeTransaction(url)),
        getTransactions: () => dispatch(getAllTransactions()),
        setFilter: (filter, value) => dispatch(setTransactionsFilter(filter, value)),
        allTypes: bool => dispatch(setAllTypesSelected(bool)),
        allPartners: bool => dispatch(setAllPartnersSelected(bool))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Transactions);