import {Banner} from '../Banner';
import Tabs from '../Components/Shared/Tabs';
import { useState } from 'react';
import { AddNewAccount } from '../Components/Settings/AddNewAccount'
import { ConnectedAccounts } from '../Components/Settings/ConnectedAccounts'

const Settings = () => {
    const [current, setCurrent] = useState("Add New Account");

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
    ]
    return (
        <div className="min-h-full">
            <Banner bannerHeader='Settings' bannerDescription='Connect your cloud accounts and run IronCloud security scans.' />
            <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-9">
                <div className="flex flex-col mx-auto w-11/12">
                    <Tabs tabs={tabs} current={current} setCurrent={setCurrent}/>
                </div>
            </div>
        </div>
    );
  }
  
export default Settings;
