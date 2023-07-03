import {TableColumnHeader, TableComp, TableRow} from '../Shared/Table';
import axios from 'axios';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Risks  } from '../Shared/Risks';
import { SelectFilterDropdown } from '../Shared/Select';
import { alertNumberSortTypeFn, severitySortTypeFn, severityFilterFn, 
    searchFilterFn, risksFilterFn, zeroAlertFilter} from "../Shared/TableOpsUtils";
import { RuleAlertsResponse, rulealerts_group, AlertId, alert_instance, DisplayNode} from './AlertsTypes';
import { GeneratedAlertsTable } from './GeneratedAlertsTable';
import { AlertSlideover } from './AlertsSlideover';
import { TextInput } from "../Shared/Input";
import { extractServiceName } from "../../utils/utils";
import ColoredBgSpan from '../Shared/ColoredBgSpan';
import posthog from 'posthog-js'
import {createSearchParams, useNavigate, useSearchParams } from 'react-router-dom';
export const severityColorMap:{[label:string]:string}={
    "Critical":"red",
    "High":"orange",
    "Moderate":"yellow",
    "Low":"gray"
}

async function getActiveAlertsInfoData(ruleCategory: string): Promise<RuleAlertsResponse> {
    try {
        // @ts-ignore
        const ruleAlertsEndpoint = window._env_.REACT_APP_API_DOMAIN + "/api/getAllAlerts";
        const response = await axios.get(ruleAlertsEndpoint,
            { params: { rulecategory: ruleCategory } }
        );
        
        return {
            rule_alerts_group: response.data.rule_alerts_group.filter((group: rulealerts_group) => group.rule_data.active),
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




type AlertsTableOpsProps = {
    ruleCategory: string, 
    selectedRuleAlertGroup:rulealerts_group | undefined,
    selectedAlertInstance: alert_instance | undefined,
    isSlideover:boolean
};

const AlertsTableOps = ({ruleCategory,selectedAlertInstance,selectedRuleAlertGroup,
    isSlideover}: AlertsTableOpsProps) => {
    if (ruleCategory !== "misconfiguration" && ruleCategory !== "attackpath" && ruleCategory !== "vulnerability") {
        throw new Error("Invalid rule category");
    }
    let initRuleAlertsGroupList: rulealerts_group[] = [];
    var initRulesAlertsInfo: RuleAlertsResponse = {
        rule_alerts_group: initRuleAlertsGroupList, 
        error: ''
    };

    let initDisplayedTableRows: TableRow[] = [];

    let initNestedAlertCompList: React.ReactNode[] = [];
    
    const [activeAlertsInfo, setActiveAlertsInfo] = useState(initRulesAlertsInfo);
    function toggleAlertMuteState(alertId: AlertId, newMutedValue: boolean) {
        setActiveAlertsInfo(function (curAlertsInfo) {
            const newAlertsInfo = {...curAlertsInfo}; 
            var groupIndex: number = newAlertsInfo.rule_alerts_group.findIndex(group => group.rule_data.uid === alertId.rule_data_uid)
            var alertIndex: number = newAlertsInfo.rule_alerts_group[groupIndex].alert_instances.findIndex(alert_instance => alert_instance.resource_id === alertId.resource_id)
            newAlertsInfo.rule_alerts_group[groupIndex].alert_instances[alertIndex].muted = newMutedValue
            return newAlertsInfo;
        });
    }
    const accountIdsFound = useMemo(
        function() {
            var accountIds: string[] = []
            for (var rule_alerts of activeAlertsInfo.rule_alerts_group) {
                for (var alert_instance of rule_alerts.alert_instances) {
                    accountIds.push(alert_instance.account_id)
                }
            }
            return Array.from(new Set(accountIds)) 
        },
        [activeAlertsInfo]
      );
      
    const [nestedAlertComponents, setNestedAlertComponents] = useState(initNestedAlertCompList);

    // displayedTableRows is a state variable on only the rows displayed.
    const [displayedTableRows, setDisplayedTableRows] = useState(initDisplayedTableRows);

    // allRows is a state variable which has all the table rows initially pulled.
    const [allRows, setAllRows] = useState(initDisplayedTableRows);

    const [searchParams,setSearchParams] = useSearchParams()

    // These are the filters.
    const [severityFilter, setSeverityFilter] = useState(searchParams.get("severity") ?? "All");
    const [riskFilter, setRiskFilter] = useState(searchParams.get("risk") || "All");
    const [searchFilter, setSearchFilter] = useState(searchParams.get("search") || "");


    // Filter for inner alerts tables.
    const [innerAlertsFilter, setInnerAlertsFilter] = useState(
        JSON.parse(searchParams.get("innerAlerts") as string) 
        ?? {
        "muted": "Unmuted",
        "status": "Failed",
        "account": "All",
    });

    // These are states for sorting.
    const [sortState, setSortState] = useState(
        JSON.parse(searchParams.get("sort") as string) 
        ?? {
            "severity": "Dec",
            "alerts": "None"
        })

    // State to track open/close state of every row.
    var initOpenTableState: { [rowId: string] : boolean; } = {};
    const [openTableState, setOpenTableState] = useState(initOpenTableState);

    // For initial display of table.
    const [ready, setReady] = useState(false)

    const navigate = useNavigate()

    useEffect(()=>{
        setSeverityFilter(searchParams.get("severity") ?? "All")
        setRiskFilter(searchParams.get("risk") || "All")
        setSearchFilter(searchParams.get("search") || "")
        setInnerAlertsFilter(
            JSON.parse(searchParams.get("innerAlerts") as string) 
            ?? {
            "muted": "Unmuted",
            "status": "Failed",
            "account": "All",
        })
        setSortState(
            JSON.parse(searchParams.get("sort") as string) 
            ?? {
                "severity": "Dec",
                "alerts": "None"
            })
    },[searchParams])

    // Get all active alerts info data at initial set up. Set all rows to be closed.
    useEffect(() => {
        async function asyncWork() {
            const receivedActiveAlertsInfo = await getActiveAlertsInfoData(ruleCategory);
            setActiveAlertsInfo(receivedActiveAlertsInfo)
            receivedActiveAlertsInfo.rule_alerts_group.forEach(group => {
                var ruleUid: string = group.rule_data.uid;
                setOpenTableState(prevOpenStateInfo => ({...prevOpenStateInfo, 
                    [ruleUid]: false}));
            }); 

            // set openRowState to true when alert row is clicked and the url is changed and params are received on the alerts page
            if(isSlideover && selectedRuleAlertGroup){
                setOpenTableState(prevOpenStateInfo=>({
                    ...prevOpenStateInfo,
                    [selectedRuleAlertGroup?.rule_data.uid]:true
                }))
            }  
        }
        asyncWork()
    }, [ruleCategory,selectedRuleAlertGroup,isSlideover]);

    const queryParams = useMemo(()=>{
        const params = {
            severity: severityFilter, 
            risk: riskFilter,
            search: searchFilter,
            innerAlerts: JSON.stringify(innerAlertsFilter),
            sort: JSON.stringify(sortState)
        }
        return params 
    },[innerAlertsFilter,severityFilter,riskFilter,searchFilter,sortState])

    const navigateOnSideBarClose = useCallback(()=>{
        navigate({
            pathname:`/alerts/${ruleCategory}`,
            search: `?${createSearchParams(queryParams)}`                    
        })
    },[innerAlertsFilter,severityFilter,riskFilter,searchFilter,sortState,ruleCategory])

    // Create each alert table and surrounding components.
    useEffect(() => {
        if(activeAlertsInfo.rule_alerts_group.length === 0) {
            return;
        }

        let alertTableList = activeAlertsInfo.rule_alerts_group.map(activeAlertInfo => {
            
            // Callback function to update open and set the alert instance variable.
            const navigateSlideoverAlertFn = function(currAlertInstance: alert_instance) {
                
                // @ts-ignore
                posthog.capture(`${window._env_.REACT_APP_ENVIRONMENT} Alert Row Clicked`,{environment: window._env_.REACT_APP_ENVIRONMENT})
                navigate({
                    pathname:`/alerts/${ruleCategory}/${encodeURIComponent(activeAlertInfo.rule_data.uid)}/${encodeURIComponent(currAlertInstance.resource_id)}`,
                    search: `?${createSearchParams(queryParams)}`                    
                })
            }
            
            return (
                <tr key={activeAlertInfo.rule_data.uid+"_alerts"}>
                    <td key={activeAlertInfo.rule_data.uid+"_alerts_td"} colSpan={7} className="p-0 bg-gray-50">
                        <div key={activeAlertInfo.rule_data.uid+"_alerts_div"}>
                            {GeneratedAlertsTable({
                                ruleAlertsGroup: activeAlertInfo,
                                filterValueState: innerAlertsFilter,
                                toggleAlertMuteState: toggleAlertMuteState,
                                navigateSlideoverFn: navigateSlideoverAlertFn,
                            })}
                        </div>
                    </td>
                </tr> 
            )
        })
        setNestedAlertComponents(alertTableList);
    }, [activeAlertsInfo, innerAlertsFilter,queryParams]);

    // Create every row in the table. Uses alert tables (as nested) and every rule.
    useEffect(() => {
        const mutedFilterPred = function(alertInstanceMuted: boolean, filterMutedStr: string): boolean {
            if(alertInstanceMuted) {
                return filterMutedStr === "Muted";
            }
            return filterMutedStr === "Unmuted";
        }
        const statusFilterPred = function(alertInstanceFailing: boolean, filterStatusStr: string): boolean {
            if (filterStatusStr === "All") {
                return true
            }
            return alertInstanceFailing;
        }
        const accountFilterPred = function(account: string, filterAccountStr: string): boolean {
            if (filterAccountStr === "All") {
                return true
            }
            return filterAccountStr === account;
        }

        var allTableRows = activeAlertsInfo.rule_alerts_group.map((rulealerts_group, idx) => {
            var openStateBool: boolean = false;
            var rule_date_id: string = rulealerts_group.rule_data.uid;
            if(rule_date_id in openTableState) {
            openStateBool = openTableState[rulealerts_group.rule_data.uid]
            } 
            
            const flipOpenRowStateFn = function() {
            setOpenTableState(prevOpenStateInfo => ({...prevOpenStateInfo, 
                [rule_date_id]: !prevOpenStateInfo[rule_date_id]}));
            }

            if (ruleCategory === "misconfiguration") {
                const serviceName = extractServiceName(rule_date_id);
                return {
                    columns: [
                        {
                            content: rulealerts_group.rule_data.description,
                            accessor_key: "description",
                            value: rulealerts_group.rule_data.description,
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: <ColoredBgSpan value={rulealerts_group.rule_data.severity} 
                                                    bgColor={severityColorMap[rulealerts_group.rule_data.severity]}
                                                    textColor={severityColorMap[rulealerts_group.rule_data.severity]}/>,
                            accessor_key: "severity",
                            value: rulealerts_group.rule_data.severity,
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: <Risks key={rulealerts_group.rule_data.uid} 
                                values={rulealerts_group.rule_data.risk_categories} />,
                            accessor_key: "risk_categories",
                            value: rulealerts_group.rule_data.risk_categories,
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: serviceName,
                            accessor_key: "service",
                            value: serviceName,
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: rulealerts_group.alert_instances.filter(
                                alert_instance => mutedFilterPred(alert_instance.muted, innerAlertsFilter["muted"])
                            ).filter(
                                alert_instance => statusFilterPred(alert_instance.status === "failed", innerAlertsFilter["status"])
                            ).filter(
                                alert_instance => accountFilterPred(alert_instance.account_id, innerAlertsFilter["account"])
                            ).length,
                            accessor_key: "alerts",
                            value: rulealerts_group.alert_instances.filter(
                                alert_instance => mutedFilterPred(alert_instance.muted, innerAlertsFilter["muted"])
                            ).filter(
                                alert_instance => statusFilterPred(alert_instance.status === "failed", innerAlertsFilter["status"])
                            ).filter(
                                alert_instance => accountFilterPred(alert_instance.account_id, innerAlertsFilter["account"])
                            ).length,
                            ignoreComponentExpansion: false,
                        },
                    ],
                    rowId: rulealerts_group.rule_data.uid,
                    nestedComponent: nestedAlertComponents[idx],
                    openRowState: openStateBool, 
                    setOpenRowStateFn: flipOpenRowStateFn,
                }
            } else if(ruleCategory==="attackpath") {
                return {
                    columns: [
                        {
                            content: rulealerts_group.rule_data.description,
                            accessor_key: "description",
                            value: rulealerts_group.rule_data.description,
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: <ColoredBgSpan value={rulealerts_group.rule_data.severity} 
                                                    bgColor={severityColorMap[rulealerts_group.rule_data.severity]}
                                                    textColor={severityColorMap[rulealerts_group.rule_data.severity]}/>,
                            accessor_key: "severity",
                            value: rulealerts_group.rule_data.severity,
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: <Risks key={rulealerts_group.rule_data.uid} 
                                values={rulealerts_group.rule_data.risk_categories} />,
                            accessor_key: "risk_categories",
                            value: rulealerts_group.rule_data.risk_categories,
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: rulealerts_group.alert_instances.filter(
                                alert_instance => mutedFilterPred(alert_instance.muted, innerAlertsFilter["muted"])
                            ).filter(
                                alert_instance => statusFilterPred(alert_instance.status === "failed", innerAlertsFilter["status"])
                            ).filter(
                                alert_instance => accountFilterPred(alert_instance.account_id, innerAlertsFilter["account"])
                            ).length,
                            accessor_key: "alerts",
                            value: rulealerts_group.alert_instances.filter(
                                alert_instance => mutedFilterPred(alert_instance.muted, innerAlertsFilter["muted"])
                            ).filter(
                                alert_instance => statusFilterPred(alert_instance.status === "failed", innerAlertsFilter["status"])
                            ).filter(
                                alert_instance => accountFilterPred(alert_instance.account_id, innerAlertsFilter["account"])
                            ).length,
                            ignoreComponentExpansion: false,
                        },
                    ],
                    rowId: rulealerts_group.rule_data.uid,
                    nestedComponent: nestedAlertComponents[idx],
                    openRowState: openStateBool, 
                    setOpenRowStateFn: flipOpenRowStateFn,
                }
            }else{
                return {
                    columns: [
                        {
                            content: rulealerts_group.rule_data.name || null,
                            accessor_key: "name",
                            value: rulealerts_group.rule_data.name || "",
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: rulealerts_group.rule_data.uid,
                            accessor_key: "cve_identifier",
                            value: rulealerts_group.rule_data.uid,
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: rulealerts_group.rule_data.description,
                            accessor_key: "description",
                            value: rulealerts_group.rule_data.description,
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: <ColoredBgSpan 
                                        value={rulealerts_group.rule_data.severity} 
                                        bgColor={severityColorMap[rulealerts_group.rule_data.severity]}
                                        textColor={severityColorMap[rulealerts_group.rule_data.severity]}
                                    />,
                            accessor_key: "severity",
                            value: rulealerts_group.rule_data.severity,
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: rulealerts_group.rule_data.cvss_score || null,
                            accessor_key: "cvss_score",
                            value: rulealerts_group.rule_data.cvss_score || "",
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: <Risks values={rulealerts_group.rule_data.risk_categories} />,
                            accessor_key: "risk_categories",
                            value: rulealerts_group.rule_data.risk_categories,
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: rulealerts_group.alert_instances.filter(
                                alert_instance => mutedFilterPred(alert_instance.muted, innerAlertsFilter["muted"])
                            ).filter(
                                alert_instance => accountFilterPred(alert_instance.account_id, innerAlertsFilter["account"])
                            ).length,
                            accessor_key: "alerts",
                            value: rulealerts_group.alert_instances.filter(
                                alert_instance => mutedFilterPred(alert_instance.muted, innerAlertsFilter["muted"])
                            ).filter(
                                alert_instance => accountFilterPred(alert_instance.account_id, innerAlertsFilter["account"])
                            ).length,
                            ignoreComponentExpansion: false,
                        },
                        
                    ],
                    rowId: rulealerts_group.rule_data.uid,
                    nestedComponent: nestedAlertComponents[idx],
                    openRowState: openStateBool, 
                    setOpenRowStateFn: flipOpenRowStateFn,
                }
            }
        });

        setAllRows(allTableRows);
    }, [openTableState, activeAlertsInfo, nestedAlertComponents, innerAlertsFilter, ruleCategory]);

    // Filter the displayed table rows.
    useEffect(() => {
        setDisplayedTableRows(function (_) {
            var allRowsCopy = [...allRows]

            var filteredSeverityRows = severityFilterFn(allRowsCopy, severityFilter);
            var filteredRiskRows = risksFilterFn(filteredSeverityRows, riskFilter);
            var filteredSearchRows = searchFilterFn(filteredRiskRows, searchFilter);

            // Filter out any rows with 0 alerts.
            var filteredZeroAlertRows = zeroAlertFilter(filteredSearchRows)


            if(sortState["severity"] === "None" && sortState["alerts"] === "None") {
                return filteredZeroAlertRows;
            } else if(sortState["alerts"] === "Dec") {
                return filteredZeroAlertRows.sort((rowA, rowB) => -1*alertNumberSortTypeFn(rowA, rowB));
            } else if(sortState["alerts"] === "Inc") {
                return filteredZeroAlertRows.sort((rowA, rowB) => alertNumberSortTypeFn(rowA, rowB));
            } else if (sortState["severity"] === "Dec") {
                return filteredZeroAlertRows.sort((rowA, rowB) => -1*severitySortTypeFn(rowA, rowB));
            } else {
                return filteredZeroAlertRows.sort((rowA, rowB) => severitySortTypeFn(rowA, rowB));
            }
        });
    }, [allRows, searchFilter, severityFilter, riskFilter, sortState]);

    let tableColumnHeaders:TableColumnHeader[]=[] 
    switch (ruleCategory){
        case "misconfiguration":
            tableColumnHeaders=[
                {
                    header: "Name",
                    accessor_key: "description",
                    allowSorting: false,
                },
                {
                    header: "Severity",
                    accessor_key: "severity",
                    allowSorting: true,
                    sortColumnHeader: {
                        sortStateValue: sortState["severity"],
                        setSortStateFn: (updatedSeverity: string) => {
                            setSortState({
                                "alerts": "None",
                                "severity": updatedSeverity,
                            })
                        },
                    }
                },
                {
                    header: "Risks",
                    accessor_key: "risk_categories",
                    allowSorting: false,
                },
                {
                    header: "Service", 
                    accessor_key: "service", 
                    allowSorting: false,
                },
                {
                    header: "Alerts",
                    accessor_key: "alerts",
                    allowSorting: true,
                    sortColumnHeader: {
                        sortStateValue: sortState["alerts"],
                        setSortStateFn: (updatedAlerts: string) => {
                            setSortState({
                                "severity": "None",
                                "alerts": updatedAlerts,
                            })
                        },
                    }
                }
            ]
            break;
        
        case "attackpath":
            tableColumnHeaders=[
                {
                    header: "Name",
                    accessor_key: "description",
                    allowSorting: false,
                },
                {
                    header: "Severity",
                    accessor_key: "severity",
                    allowSorting: true,
                    sortColumnHeader: {
                        sortStateValue: sortState["severity"],
                        setSortStateFn: (updatedSeverity: string) => {
                            setSortState({
                                "alerts": "None",
                                "severity": updatedSeverity,
                            })
                        },
                    }
                },
                {
                    header: "Risks",
                    accessor_key: "risk_categories",
                    allowSorting: false,
                },
                {
                    header: "Alerts",
                    accessor_key: "alerts",
                    allowSorting: true,
                    sortColumnHeader: {
                        sortStateValue: sortState["alerts"],
                        setSortStateFn: (updatedAlerts: string) => {
                            setSortState({
                                "severity": "None",
                                "alerts": updatedAlerts,
                            })
                        },
                    }
                }
            ]
            break;
        
        case 'vulnerability':
            tableColumnHeaders=[
                {
                    header: "Name",
                    accessor_key: "name",
                    allowSorting: false,
                },
                {
                    header: "CVE Identifier", 
                    accessor_key: "cve_identifier", 
                    allowSorting: false,
                },
                {
                    header: "Description", 
                    accessor_key: "description", 
                    allowSorting: false,
                },
                {
                    header: "Severity",
                    accessor_key: "severity",
                    allowSorting: true,
                    sortColumnHeader: {
                        sortStateValue: sortState["severity"],
                        setSortStateFn: (updatedSeverity: string) => {
                            setSortState({
                                "alerts": "None",
                                "severity": updatedSeverity,
                            })
                        },
                    }
                },
                {
                    header: "CVSS Score", 
                    accessor_key: "cvss_score", 
                    allowSorting: false,
                },
                {
                    header: "Risks",
                    accessor_key: "risk_categories",
                    allowSorting: false,
                },              
                {
                    header: "Alerts",
                    accessor_key: "alerts",
                    allowSorting: true,
                    sortColumnHeader: {
                        sortStateValue: sortState["alerts"],
                        setSortStateFn: (updatedAlerts: string) => {
                            setSortState({
                                "severity": "None",
                                "alerts": updatedAlerts,
                            })
                        },
                    }
                }
            ]
            break;
    
        default:
            break;
    }
     

    useEffect(() => {
        setTimeout(() => setReady(true), 100)
    }, []);

    let tableHeaderCSS:any[] =[]
    switch (ruleCategory) {
        case "misconfiguration":
            tableHeaderCSS =[{
                "headerClassName": "w-1/2 px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900 sm:pl-6",
                "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
                "chevronClassName": "h-5 w-5",
            },
            {
                "headerClassName": "w-1/10 px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
                "spanClassName": "ml-2 flex-none rounded bg-gray-200 text-gray-900 group-hover:bg-gray-300",
                "chevronClassName": "h-5 w-5",
            },
            {
                "headerClassName": "w-2/10 px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
                "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
                "chevronClassName": "invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
            },
            {
                "headerClassName": "w-1/10 px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
                "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
                "chevronClassName": "invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
            },
            {
                "headerClassName": "w-1/10 px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
                "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
                "chevronClassName": "invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
            }]
            break;

        case "attackpath":
            tableHeaderCSS=[{
                "headerClassName": "w-1/2 px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900 sm:pl-6",
                "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
                "chevronClassName": "h-5 w-5",
            },
            {
                "headerClassName": "w-1/10 px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
                "spanClassName": "ml-2 flex-none rounded bg-gray-200 text-gray-900 group-hover:bg-gray-300",
                "chevronClassName": "h-5 w-5",
            },
            {
                "headerClassName": "w-3/10 px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
                "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
                "chevronClassName": "invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
            },
            {
                "headerClassName": "w-1/10 px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
                "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
                "chevronClassName": "invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
            }]
            break;

        case "vulnerability":
            tableHeaderCSS =[{
                "headerClassName": "px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900 sm:pl-6",
                "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
                "chevronClassName": "h-5 w-5",
            },
            {
                "headerClassName": "px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
                "spanClassName": "ml-2 flex-none rounded bg-gray-200 text-gray-900 group-hover:bg-gray-300",
                "chevronClassName": "h-5 w-5",
            },
            {
                "headerClassName": "px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
                "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
                "chevronClassName": "invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
            },
            {
                "headerClassName": "px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
                "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
                "chevronClassName": "invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
            },
            {
                "headerClassName": "px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
                "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
                "chevronClassName": "invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
            },
            {
                "headerClassName": "px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
                "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
                "chevronClassName": "invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
            },
            {
                "headerClassName": "px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
                "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
                "chevronClassName": "invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
            }]
            break;
        
        default:
            break;
    }

    const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
        setSearchFilter(e.currentTarget.value);
    }

    // These divs are used to build the table and filters.
    return (
    activeAlertsInfo.rule_alerts_group.length === 0
    ? <></>
    : <div className="pt-8 sm:pt-10">
        {/* This div is used to build the filters. */}
        <div className="flex flex-row grid grid-cols-6 gap-4">
                    <div key={"RuleInput"}>
                        <TextInput
                            handleChange={handleSearchChange} title={"Rules"} searchFilter={searchFilter}/>
                    </div>
                    <div key={"RiskFilter"}>
                        <SelectFilterDropdown
                            key={"RiskFilter"} 
                            title={"Risk"} 
                            selectedFilterValue={riskFilter} 
                            setFilter={setRiskFilter}
                            filterOptions={["All", "Vulnerability"]}
                        />
                    </div>
                    <div key={"SeverityFilter"}>
                        <SelectFilterDropdown 
                            key={"SeverityFilter"}
                            title={"Severity"} 
                            selectedFilterValue={severityFilter} 
                            setFilter={setSeverityFilter}
                            filterOptions={["All", "Critical", "High", "Medium", "Low"]}
                        />
                    </div>
                    <div key={"AccountFilter"}>
                        <SelectFilterDropdown 
                            key={"AccountFilter"}
                            title={"Account"} 
                            selectedFilterValue={innerAlertsFilter["account"]} 
                            setFilter={(updatedAccountState: string) => {
                                setInnerAlertsFilter({
                                        ...innerAlertsFilter,
                                        "account": updatedAccountState,
                                    })
                                }}
                            filterOptions={[...accountIdsFound, "All"]}
                        />
                    </div>
                    <div key={"MutedFilter"}>
                        <SelectFilterDropdown 
                            key={"MutedFilter"}
                            title={"Muted Alerts"} 
                            selectedFilterValue={innerAlertsFilter["muted"]} 
                            setFilter={(updatedMuteState: string) => {
                                setInnerAlertsFilter({
                                        ...innerAlertsFilter,
                                        "muted": updatedMuteState,
                                    })
                                }}
                            filterOptions={["Muted", "Unmuted"]}
                            />
                    </div>
                    {ruleCategory!=="vulnerability" 
                    && <div key={"StatusFilter"}>
                        <SelectFilterDropdown
                            key={"StatusFilter"} 
                            title={"Alert Status"} 
                            selectedFilterValue={innerAlertsFilter["status"]} 
                            setFilter={(updatedStatusState: string) => {
                                setInnerAlertsFilter({
                                        ...innerAlertsFilter,
                                        "status": updatedStatusState,
                                    })
                                }}
                            filterOptions={["Failed", "All"]}
                        />
                    </div>}
            </div>

        { ready ? 
        (<div className="mt-12 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        <TableComp 
                            tableFixed={true}
                            tableColumnHeaders={tableColumnHeaders}
                            tableHeaderCSS={tableHeaderCSS}
                            tableRows={displayedTableRows}
                            selectedRowId={(isSlideover && selectedRuleAlertGroup!=undefined) ? selectedRuleAlertGroup.rule_data.uid : ""}
                        />
                    </div>
                </div>
            </div>
        </div>) :
        <></>}

        {isSlideover && selectedAlertInstance && selectedRuleAlertGroup
        && <AlertSlideover 
            selectedAlertInstance={selectedAlertInstance}
            selectedRuleAlertGroup={selectedRuleAlertGroup}
            navigateOnSideBarClose={navigateOnSideBarClose}
            ruleCategory={ruleCategory}
            />
        }

    </div>);
}

export { AlertsTableOps };