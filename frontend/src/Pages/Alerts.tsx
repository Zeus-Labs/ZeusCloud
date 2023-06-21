import {Banner} from '../Components/Shared/Banner';
import Tabs from '../Components/Shared/Tabs';
import {AlertsTableOps} from '../Components/Alerts/AlertsTableOps';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NotFound from './404Page';
import { RuleAlertsResponse, alert_instance, rulealerts_group } from '../Components/Alerts/AlertsTypes';
import axios from 'axios';

async function getAllAlertsInfo(): Promise<RuleAlertsResponse> {
    try {
        // @ts-ignore
        const ruleAlertsEndpoint = window._env_.REACT_APP_API_DOMAIN + "/api/getAllAlerts";

        const response = await axios.get(ruleAlertsEndpoint,
            { params: { rulecategory: "all" } }
        );        
        return {
            rule_alerts_group: response.data.rule_alerts_group,
            error: ''
        };
    }
    catch (error) {
       
        let message = '';
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.data) {
                message = "Error: " + error.response.data
            } else {
                message = "Oops! Encountered an error..."
            }
        } else {
            message = "Error in retrieving alerts information."
        }

        return {
            rule_alerts_group: [],
            error: message,
        };
    }
}


// TODO: add vulnerablity when nuclei is merged
const ruleCategoryParamToTabMap = {
    attackpath: "Attack Paths",
    misconfiguration: "Misconfigurations",
}

const Alerts = () => {
    const {ruleCategory,rule_uid,alert_resource_id} = useParams<{ruleCategory:string,rule_uid:string,alert_resource_id:string}>()
    // console.log(`ruleCategory=${ruleCategory} rule_uid: ${rule_uid} alert_resource_id: ${alert_resource_id}`)
    // @ts-ignore
    const [current, setCurrent] = useState(ruleCategory in ruleCategoryParamToTabMap ? ruleCategoryParamToTabMap[ruleCategory] : undefined);
    const [notFound,setNotFound] = useState<boolean|undefined>(undefined)

    const navigate = useNavigate()

    let initRuleAlertsGroupList: rulealerts_group[] = [];
    var initRulesAlertsInfo: RuleAlertsResponse = {
        rule_alerts_group: initRuleAlertsGroupList, 
        error: ''
    };
    const [ruleAlertsInfo,setRuleAlertsInfo] = useState(initRulesAlertsInfo)
    const initRuleAlertGroup = {
        rule_data:{
            uid:"",
            description:"",
            severity:"",
            risk_categories:[],
            active:true
        },
        alert_instances:[]
    }
    const [ruleAlertGroup,setRuleAlertGroup]=useState<rulealerts_group | undefined>(initRuleAlertGroup)

    const initAlertInstance:alert_instance = {
        resource_id:"",
        resource_type:"",
        account_id:"",
        context:"",
        status:"",
        first_seen: new Date(),
        last_seen: new Date(),
        muted:false,
        crown_jewel:false
    }
    const [alertInstance,setAlertInstance]=useState<alert_instance | undefined>  (initAlertInstance) 
    const [isSlideOver,setIsSlideOver] = useState(false)

    useEffect(()=>{
        async function setRuleAlertsInfoState(){
            const allRulesAlerts = await getAllAlertsInfo()
            setRuleAlertsInfo(allRulesAlerts)
        }
        if(rule_uid && alert_resource_id) {
            setRuleAlertsInfoState()
        }
        setAlertInstance(initAlertInstance)
        setRuleAlertGroup(initRuleAlertGroup)
    },[rule_uid,alert_resource_id])

    useEffect(()=>{
        if(ruleAlertsInfo.rule_alerts_group.length>0){
            setRuleAlertGroup(ruleAlertsInfo.rule_alerts_group.find(
                ruleAlertGroup =>  {
                    return ruleAlertGroup.rule_data.uid===rule_uid
                }
            ))
        }
    },[ruleAlertsInfo])

    useEffect(()=>{
        // update alertInstance when ruleAlertGroup initial value is updated and it is defined 
        if(ruleAlertGroup && ruleAlertGroup.rule_data.uid!==""){
            setAlertInstance(ruleAlertGroup?.alert_instances.find(
                alertInstance => alertInstance.resource_id===alert_resource_id
            ))
        } 
    },[ruleAlertGroup])
    

    useEffect(()=>{
        ruleCategory && setCurrent(ruleCategory in ruleCategoryParamToTabMap 
            ? ruleCategoryParamToTabMap[ruleCategory as keyof typeof ruleCategoryParamToTabMap] 
            : undefined)
    },[ruleCategory])

    useEffect(()=>{
        // page is not found when either the ruleCategory is invalid or the rule_uid | lert_resource_id is invalid
        if((!current || ((!ruleAlertGroup || !alertInstance) && (rule_uid && alert_resource_id))) ){
            setNotFound(true) 
        }else if((((ruleAlertGroup && ruleAlertGroup.rule_data.uid==="") || (alertInstance && alertInstance.resource_id==="")) && (rule_uid && alert_resource_id) )){
            setNotFound(undefined)
        }else{
            setNotFound(false)
        }

        if(ruleAlertGroup && alertInstance && rule_uid && alert_resource_id){
            setIsSlideOver(true)
        }else{
            setIsSlideOver(false)
        }
    },[current,ruleAlertGroup,alertInstance,rule_uid,alert_resource_id])
    
    const tabs = [
        {
            name: "Misconfigurations",
            body: <AlertsTableOps 
                    key={"misconfiguration"} 
                    ruleCategory={"misconfiguration"}
                    selectedAlertInstance={alertInstance}
                    selectedRuleAlertGroup={ruleAlertGroup}
                    isSlideover={isSlideOver}
                   />
        },
        {
            name: "Attack Paths",
            body: <AlertsTableOps 
                    key={"attackpath"} 
                    ruleCategory={"attackpath"}
                    selectedAlertInstance={alertInstance}
                    selectedRuleAlertGroup={ruleAlertGroup}
                    isSlideover={isSlideOver}
                   />
        },
    ]

    const navigateOnTabClick = (tabName:string)=>{
        const keys = Object.keys(ruleCategoryParamToTabMap);
        for (const ruleParam of keys) {
            if (ruleCategoryParamToTabMap[ruleParam as keyof typeof ruleCategoryParamToTabMap] === tabName) {
                setNotFound(false)
                navigate(`/alerts/${ruleParam}`)
                return
            }
        }
    }

    return (
        notFound===undefined 
        ? <></>
        :(notFound 
        ? <NotFound /> 
        : <div className="min-h-full">
            <Banner bannerHeader='Alerts' bannerDescription='Investigate failing findings for your active ZeusCloud rules.' />
            <div className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4">
                <div className="flex flex-col mx-auto w-11/12">
                    <Tabs tabs={tabs} current={current} setCurrent={setCurrent} navigateOnTabClick={navigateOnTabClick}/>
                </div>
            </div>
        </div>
        )
    );
  }
  
export default Alerts;
  


