import { Banner } from '../Components/Shared/Banner';
import Tabs from '../Components/Shared/Tabs';
import {RulesTableOps} from '../Components/Rules/RulesTableOps';
import { useState } from 'react';


const Rules = () => {
    // @ts-ignore
    const [current, setCurrent] = useState(window._env_.REACT_APP_ENVIRONMENT === "Demo" ? "Attack Paths" : "Misconfigurations");
    const tabs = [
        {
            name: "Misconfigurations",
            body: <RulesTableOps key={"misconfiguration"} ruleCategory={"misconfiguration"} />
        },
        {
            name: "Attack Paths",
            body: <RulesTableOps key={"attackpath"} ruleCategory={"attackpath"} />
        },
        {
            name: "Vulnerabilities",
            body: <RulesTableOps key={"vulnerability"} ruleCategory={"vulnerability"} />
        }
    ]

    return (
        <div className="min-h-full">
            <Banner bannerHeader='Rules' bannerDescription='Detect your risks in the cloud by configuring ZeusCloud rules.' />
            <div className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4">
                <div className="flex flex-col mx-auto w-11/12">
                    <Tabs tabs={tabs} current={current} setCurrent={setCurrent}/>
                </div>
            </div>
      </div>
    );
}

export default Rules;
