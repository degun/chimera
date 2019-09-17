import React, {useEffect} from 'react';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip, AreaChart, Area} from 'recharts';
import numeral from 'numeral';
import { connect } from 'react-redux';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { DatePicker, DayOfWeek } from 'office-ui-fabric-react';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { ComboBox } from 'office-ui-fabric-react/lib/index';
import { setFilter, getDashboardData } from '../../store/actions/dashboardActions';
import AnimatedNumber from 'animated-number-react';
import { round2 } from '../../useful';
import './Dashboard.sass';

function Dashboard({admin, balance, users, setFilter, filters, getData, data, partnerId}){

    let {fromDate, toDate, partner, alltime} = filters;

    const selectedPartner = admin ? partner : parseInt(partnerId);

    useEffect(()=>{
        getData()
    }, [getData, fromDate, toDate, partner, alltime])

    fromDate = new Date(fromDate);
    toDate = new Date(toDate);

    const partnersDropdown = users.filter(u=> !u.is_staff).map(u => {
        const urlArray = u.url.split("/");
        const key = urlArray[urlArray.length - 2];
        return {key, text: u.username}
    });

    function formatDate(date){
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-UK', options);
    }

    function prepareSingleUserData(id){
        const partnerData = data.sort((a, b) => new Date(a.entry_time) - new Date(b.entry_time)).filter(d => d.user === parseInt(id)).filter(d => d.transaction_type !== "Payment").map(d=> {
            return {
                ...d,
                entry_time: new Date(d.entry_time).toLocaleDateString("it-IT").replace('/2019', '')
            }
        });
        const dates = [...new Set(partnerData.map(d => d.entry_time))];
        return dates.map(d => {
            return {
                name: d,
                wire: round2(partnerData.filter(p => p.entry_time === d).filter(d => (d.transaction_type === "Wire" || d.transaction_type === "Withdraw")).reduce((acc, a)=>{
                    return parseFloat(a.amount) + acc
                }, 0)),
                cc: round2(partnerData.filter(p => p.entry_time === d).filter(d => d.transaction_type === "Credit Card").reduce((acc, a)=>{
                    return parseFloat(a.amount) + acc
                }, 0)),
                profit: round2(partnerData.filter(p => p.entry_time === d).reduce((da, a)=>{
                    return parseFloat(a.amount) - parseFloat(a.amount_paid) + da
                }, 0))
            }
        })
    }

    function prepareAllUsersData(d){
        d = d.filter(t => t.transaction_type !== "Payment");
        const partners = users.filter(u=>!u.is_staff).map(u => {
            const urlArray = u.url.split("/");
            const id = parseInt(urlArray[urlArray.length - 2]);
            const username = u.username
            return {id, username}
        });
        return partners.map(p => {
            return {
                name: p.username,
                wire: round2(d.filter(d => parseInt(d.user) === p.id).filter(d => (d.transaction_type === "Wire" || d.transaction_type === "Withdraw")).reduce((accumulator, a)=>{
                    return parseFloat(a.amount) + accumulator
                }, 0)),
                cc: round2(d.filter(d => parseInt(d.user) === p.id).filter(d => d.transaction_type === "Credit Card").reduce((accumulator, a)=>{
                    return parseFloat(a.amount) + accumulator
                }, 0)),
                profit: round2(d.filter(d => parseInt(d.user) === p.id).reduce((accumulator, a)=>{
                    return parseFloat(a.amount) - parseFloat(a.amount_paid) + accumulator
                }, 0))
            }
        })
    }

    const alldata = prepareAllUsersData(data);
    const allUsersWire = alldata.reduce((acc, b)=> acc + b.wire, 0);
    const allUsersCC = alldata.reduce((acc, b)=> acc + b.cc, 0);
    const allUsersDeposits = allUsersWire + allUsersCC;
    const singleUserData = prepareSingleUserData(selectedPartner);
    const singleUserWire = singleUserData.reduce((acc, b)=> acc + b.wire, 0);
    const singleUserCC = singleUserData.reduce((acc, b)=> acc + b.cc, 0);
    const singleUserDeposits = singleUserWire + singleUserCC;
    const due = users.filter(u => !u.is_staff).reduce((a, b) => a + parseFloat(b.partner_data.balance), 0);
    const selectedPartnerName = (selectedPartner && admin) ? partnersDropdown.find(p=> p.key === selectedPartner).text : null;
    const seletedPartnerBalance = (selectedPartner && admin) ? users.find(u => u.url === `http://api.chimera-finance.com/api/users/${selectedPartner}/`).balance : balance;

    return(
        <div id="dashboard">
            <Stack className="bar" horizontal horizontalAlign="space-between" tokens={{ childrenGap: 20 }} styles={{ root: { width: 960, padding: "20px 0" } }}>
                <Stack horizontal horizontalAlign="auto" tokens={{ childrenGap: 20 }} styles={{ root: { width: "auto" } }}>
                    {admin ? <div className="combo"><ComboBox autoComplete="on" selectedKey={selectedPartner} options={partnersDropdown} placeholder="Partner..." onChange={(e, e2) => setFilter('partner',e2.key)} style={{width: 140}} />{selectedPartner ? <span className="clear" onClick={()=>setFilter('partner', null)}>Clear</span> : null}</div> : null}
                    <DatePicker style={{width: 140}} formatDate={date => formatDate(date)} firstDayOfWeek={DayOfWeek.Monday} maxDate={toDate} placeholder="From date" value={fromDate} onSelectDate={e=> {setFilter('fromDate',new Date(new Date(e).setHours(0,0,0,0))); setFilter('alltime', false)}}/>
                    <DatePicker style={{width: 140}} formatDate={date => formatDate(date)} firstDayOfWeek={DayOfWeek.Monday} maxDate={new Date(new Date().setHours(23,59,59,0))} minDate={fromDate} placeholder="To date" value={toDate} onSelectDate={e=> {setFilter('toDate',new Date(new Date(e).setHours(23,59,59,0)));setFilter('alltime', false)}}/>
                    <Toggle inlineLabel label='Time limit' onText='All time' offText='Date range' checked={alltime} onChange={()=>setFilter('alltime', !alltime)}  />
                </Stack>
                <div className="balance">
                    <div className="txt">{admin ? 'To pay: ' : 'Balance: '}</div>
                    <Text variant="xLarge"><AnimatedNumber duration={500} value={parseFloat(admin ? due : balance)} formatValue={(due) => numeral(parseFloat(due)).format("0,0.00 $")} /></Text>
                </div>
            </Stack>
            {selectedPartner ? <section className="userInfo">
                <AreaChart
                    width={720}
                    height={400}
                    data={singleUserData}
                >
                    <CartesianGrid strokeDasharray="1 13" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="wire" stackId="one" stroke="#fce100" fill="#fce100" />
                    <Area type="monotone" dataKey="cc" stackId="one" stroke="#ffaa44" fill="#ffaa44" />
                    {admin ? <Area type="monotone" dataKey="profit" stackId="one" stroke="#82ca9d" fill="darkgreen" /> : null}
                </AreaChart>
                <div className="cyphers">
                    <table>
                        <tbody>
                            {admin ? <tr>
                                <td>Partner: </td>
                                <td><Text variant="xLarge">{selectedPartnerName}</Text></td>
                            </tr> : null}
                            <tr>
                                <td>Balance: </td>
                                <td><Text variant="xLarge"><AnimatedNumber duration={500} value={parseFloat(seletedPartnerBalance)} formatValue={val => numeral(parseFloat(val)).format("0,0.00 $")} /></Text></td>
                            </tr>
                            <tr>
                                <td>Deposits: </td>
                                <td><Text variant="xLarge"><AnimatedNumber duration={500} value={parseFloat(singleUserDeposits)} formatValue={val => numeral(parseFloat(val)).format("0,0.00 $")} /></Text></td>
                            </tr>
                            <tr>
                                <td>Wire: </td>
                                <td><Text variant="medium"><AnimatedNumber duration={500} value={parseFloat(singleUserWire)} formatValue={val => numeral(parseFloat(val)).format("0,0.00 $")} /></Text></td>
                            </tr>
                            <tr>
                                <td>Credit Card: </td>
                                <td><Text variant="medium"><AnimatedNumber duration={500} value={parseFloat(singleUserCC)} formatValue={val => numeral(parseFloat(val)).format("0,0.00 $")} /></Text></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section> : null}
            {(admin && alldata.length) ? <section className="allInfo">
            <BarChart
                    width={720}
                    height={400}
                    data={alldata}
                >
                    <CartesianGrid strokeDasharray="1 13" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="wire" fill="#fce100" />
                    <Bar dataKey="cc" fill="#ffaa44" />
                    <Bar dataKey="profit" fill="darkgreen" />
                </BarChart>
                <div className="cyphers">
                    <table>
                        <tbody>
                            <tr>
                                <td>Deposits: </td>
                                <td><Text variant="xLarge"><AnimatedNumber duration={500} value={parseFloat(allUsersDeposits)} formatValue={val => numeral(parseFloat(val)).format("0,0.00 $")} /></Text></td>
                            </tr>
                            <tr>
                                <td>Wire: </td>
                                <td><Text variant="medium"><AnimatedNumber duration={500} value={parseFloat(allUsersWire)} formatValue={val => numeral(parseFloat(val)).format("0,0.00 $")} /></Text></td>
                            </tr>
                            <tr>
                                <td>Credit Card: </td>
                                <td><Text variant="medium"><AnimatedNumber duration={500} value={parseFloat(allUsersCC)} formatValue={val => numeral(parseFloat(val)).format("0,0.00 $")} /></Text></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section> : null}
        </div>
    )
}

const mapStateToProps = state => {
    return {
        users: state.users.users,
        balance: state.auth.balance,
        admin: state.auth.admin,
        partnerId: state.auth.id,
        data: state.dashboard.data,
        filters: state.dashboard.filters
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setFilter: (filter, value) => dispatch(setFilter(filter, value)),
        getData: () => dispatch(getDashboardData())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);