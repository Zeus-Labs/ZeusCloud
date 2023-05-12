import {Banner} from '../Components/Shared/Banner';
import Tabs from '../Components/Shared/Tabs';
import {AlertsTableOps} from '../Components/Alerts/AlertsTableOps';
import { useState } from 'react';

const Alerts = () => {
    // @ts-ignore
    const [current, setCurrent] = useState(window._env_.REACT_APP_ENVIRONMENT === "Demo" ? "Attack Paths" : "Misconfigurations");
    const tabs = [
        {
            name: "Misconfigurations",
            body: <AlertsTableOps key={"misconfiguration"} ruleCategory={"misconfiguration"} />
        },
        {
            name: "Attack Paths",
            body: <AlertsTableOps key={"attackpath"} ruleCategory={"attackpath"} />
        },
        {
            name: "Vulnerabilities",
            body: <AlertsTableOps key={"vulnerability"} ruleCategory={"vulnerability"} />
        }
    ]


    return (
      <div className="min-h-full">
          <Banner bannerHeader='Alerts' bannerDescription='Investigate failing findings for your active ZeusCloud rules.' />
          <div className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4">
              <div className="flex flex-col mx-auto w-11/12">
                  <Tabs tabs={tabs} current={current} setCurrent={setCurrent}/>
              </div>
          </div>
      </div>
    );
  }
  
export default Alerts;
  