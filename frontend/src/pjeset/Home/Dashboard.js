import React, {useEffect} from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip, AreaChart, Area
  } from 'recharts';
import numeral from 'numeral';
import { connect } from 'react-redux';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { DatePicker, DayOfWeek } from 'office-ui-fabric-react';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { ComboBox } from 'office-ui-fabric-react/lib/index';
import { setFilter, getDashboardData } from '../../store/actions/dashboardActions';
import { round2 } from '../../useful';
import './Dashboard.sass';

function Dashboard({admin, balance, users, setFilter, filters, getData, data}){

    let {fromDate, toDate, partner} = filters;

    useEffect(()=>{
        getData()
    }, [getData, fromDate, toDate, partner])

    fromDate = new Date(fromDate);
    toDate = new Date(toDate);

    const partnersDropdown = users.filter(u=> !u.is_staff).map(u => {
        const urlArray = u.url.split("/");
        const key = urlArray[urlArray.length - 2];
        return {key, text: u.username}
    });

    function formatDate(date){
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-UK', options)
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
                deposits: round2(partnerData.filter(p => p.entry_time === d).reduce((da, a)=>{
                    return parseFloat(a.amount) + da
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
                deposits: d.filter(d => parseInt(d.user) === p.id).reduce((da, a)=>{
                    return parseFloat(a.amount) + da
                }, 0),
                profit: d.filter(d => parseInt(d.user) === p.id).reduce((da, a)=>{
                    return parseFloat(a.amount) - parseFloat(a.amount_paid) + da
                }, 0)
            }
        })
    }

    const alldata = prepareAllUsersData(data);
    const allprofit = alldata.reduce((a, b) => a + b.profit, 0)

    return(
        <div id="dashboard">
            <Stack className="bar" horizontal horizontalAlign="space-between" tokens={{ childrenGap: 20 }} styles={{ root: { width: 960, padding: "20px 0" } }}>
                <Stack horizontal horizontalAlign="auto" tokens={{ childrenGap: 20 }} styles={{ root: { width: "auto" } }}>
                    {admin ? <ComboBox autoComplete="on" allowFreeform selectedKey={partner} options={partnersDropdown} placeholder="Partner..." onChange={(e, e2) => setFilter('partner',e2.key)} style={{width: 140}} /> : null}
                    <DatePicker style={{width: 140}} formatDate={date => formatDate(date)} firstDayOfWeek={DayOfWeek.Monday} maxDate={toDate} placeholder="From date" value={fromDate} onSelectDate={e=> setFilter('fromDate',new Date(new Date(e).setHours(0,0,0,0)))}/>
                    <DatePicker style={{width: 140}} formatDate={date => formatDate(date)} firstDayOfWeek={DayOfWeek.Monday} maxDate={new Date(new Date().setHours(23,59,59,0))} minDate={fromDate} placeholder="To date" value={toDate} onSelectDate={e=> setFilter('toDate',new Date(new Date(e).setHours(23,59,59,0)))}/>
                </Stack>
                <div className="balance">
                    <div className="b">
                        <Text variant="large">Balance:&nbsp;</Text>
                        <Text variant="xLarge">{numeral(parseFloat(balance)).format("0,0.00 $")}</Text>
                    </div>
                    <div className="p">
                        <Text variant="medium">Profit:&nbsp;</Text>
                        <Text variant="mediumPlus">{numeral(parseFloat(allprofit)).format("0,0.00 $")}</Text>
                    </div>
                </div>
            </Stack>
            <section className="userInfo">
                <AreaChart
                    width={460}
                    height={400}
                    data={prepareSingleUserData(partner)}
                >
                    <CartesianGrid strokeDasharray="1 13" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="deposits" stackId="one" stroke="#8884d8" fill="darkcyan" />
                    <Area type="monotone" dataKey="profit" stackId="one" stroke="#82ca9d" fill="darkgreen" />
                </AreaChart>
                <BarChart
                    width={460}
                    height={400}
                    data={alldata}
                >
                    <CartesianGrid strokeDasharray="1 13" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="deposits" fill="darkcyan" />
                    <Bar dataKey="profit" fill="darkgreen" />
                </BarChart>
            </section>
            <section className="allInfo">
                
            </section>
        </div>
    )
}

const mapStateToProps = state => {
    return {
        users: state.users.users,
        balance: state.auth.balance,
        admin: state.auth.admin,
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