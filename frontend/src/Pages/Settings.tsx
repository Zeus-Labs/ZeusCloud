import {Banner} from '../Components/Shared/Banner';
import Tabs from '../Components/Shared/Tabs';
import { useState } from 'react';
import { AddNewAccount } from '../Components/Settings/AddNewAccount'
import { ConnectedAccounts } from '../Components/Settings/ConnectedAccounts'
import {useLocation} from 'react-router-dom';
import GenerateReport from '../Components/Settings/GenerateReport';

const Settings = () => {
    const location = useLocation();
    const [current, setCurrent] = useState(
        location.state && location.state.name ? location.state.name : "Add New Account"
    );

    const switchToConnectedAccounts = () => {
        setCurrent("Connected Accounts");
    }
    const tabs = [
        {
            name: "Add New Account",
            body: <AddNewAccount onSubmitCallback={switchToConnectedAccounts}/>
        },
        {
            name: "Connected Accounts",
            body: <ConnectedAccounts/>
        },
        {
            name: "Generate Report",
            body: <GenerateReport/>
        },
    ]
    return (
        <div className="min-h-full">
            <Banner bannerHeader='Settings' bannerDescription='Connect your cloud accounts and run ZeusCloud security scans.' />
            <div className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4">
                <div className="flex flex-col mx-auto w-11/12">
                    <Tabs tabs={tabs} current={current} setCurrent={setCurrent}/>
                </div>
            </div>
        </div>
    );
  }
  
export default Settings;
