import React from 'react';
import { TableComp, TableRow } from '../Shared/Table';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { rule_info, RuleInfoData } from './RuleTypes';
import { Risks  } from '../Shared/Risks';
import { RuleToggle } from './RuleToggle';
import { SelectFilterDropdown } from "../Shared/Select";
import { TextInput } from "../Shared/Input";
import { risksFilterFn, severityFilterFn, searchFilterFn, severitySortTypeFn } from "../Shared/TableOpsUtils";
import { extractServiceName } from "../../utils/utils";
import ColoredBgSpan from '../Shared/ColoredBgSpan';
import { severityColorMap } from '../Alerts/AlertsTableOps';
import { TableColumnHeader } from '../Shared/Table';

async function getRulesInfoData(setRulesInfo: React.Dispatch<React.SetStateAction<RuleInfoData>>, ruleCategory: string) {    
    try {
        // @ts-ignore
        const rulesEndpoint = window._env_.REACT_APP_API_DOMAIN + "/api/getRules";
        const response = await axios.get(rulesEndpoint, 
            { params: { rulecategory: ruleCategory } }
        );
        
        var ruleInfoList = new Array<rule_info>();
        response.data.forEach((currElement: rule_info) => {
            ruleInfoList.push({
                uid: currElement.uid,
                description: currElement.description,
                severity: currElement.severity,
                risk_categories: currElement.risk_categories,
                active: currElement.active,
                name: currElement.name,
                cvss_score: currElement.cvss_score
            });
        });
        setRulesInfo({
            data: ruleInfoList,
            error: ''
        });
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
            message = "Error in retrieving rules information."
        }
        
        setRulesInfo({
            data: [],
            error: message
        });
    }
}

type RulesTableOpsProps = {
    ruleCategory: string, 
};

// These divs are used to build the table and filters.
const RulesTableOps = ({ruleCategory}: RulesTableOpsProps) => {
    if (ruleCategory !== "misconfiguration" && ruleCategory !== "attackpath" && ruleCategory !== "vulnerability") {
        throw new Error("Invalid rule category");
    }

    let initRulesInfoList: rule_info[] = [];
    var initRulesInfo: RuleInfoData = {
        data: initRulesInfoList, 
        error: ''};

    let initDisplayedTableRows: TableRow[] = [];
        
    const [rulesInfo, setRulesInfo] = useState(initRulesInfo);

    // displayedTableRows is a state variable on only the rows displayed.
    const [displayedTableRows, setDisplayedTableRows] = useState(initDisplayedTableRows);

    // allRows is a state variable which has all the table rows initially pulled.
    const [allRows, setAllRows] = useState(initDisplayedTableRows);
    
    // These are the filters.
    const [severityFilter, setSeverityFilter] = useState("All");
    const [riskFilter, setRiskFilter] = useState("All");
    const [searchFilter, setSearchFilter] = useState("");

    // These are states for sorting.
    const [sortState, setSortState] = useState({
        "severity": "Dec",
        "alerts": "None"
    })

    // For initial display of table.
    const [ready, setReady] = useState(false)

    // Pull initial rules information. Only runs the very first render.
    useEffect(() => {
        getRulesInfoData(setRulesInfo, ruleCategory);
    }, [ruleCategory]);

    // Set all table rows.
    useEffect(() => {
        var allTableRows = rulesInfo.data.map((dataTableRow, idx) => {
            if (ruleCategory === "misconfiguration") {
                const serviceName = extractServiceName(dataTableRow.uid);
                return {
                    columns: [
                        {
                            content: dataTableRow.description,
                            accessor_key: "description",
                            value: dataTableRow.description,
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: <ColoredBgSpan 
                                        value={dataTableRow.severity} 
                                        bgColor={severityColorMap[dataTableRow.severity]}
                                        textColor={severityColorMap[dataTableRow.severity]}
                                    />,
                            accessor_key: "severity",
                            value: dataTableRow.severity,
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: <Risks values={dataTableRow.risk_categories} />,
                            accessor_key: "risk_categories",
                            value: dataTableRow.risk_categories,
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: serviceName,
                            accessor_key: "service",
                            value: serviceName,
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: <RuleToggle value={dataTableRow.active} original={dataTableRow} />,
                            accessor_key: "active",
                            value: dataTableRow.active,
                            ignoreComponentExpansion: true,
                        },
                    ],
                    rowId: dataTableRow.uid,
                }
            } else if (ruleCategory==="attackpath") {
                return {
                    columns: [
                        {
                            content: dataTableRow.description,
                            accessor_key: "description",
                            value: dataTableRow.description,
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: <ColoredBgSpan 
                                        value={dataTableRow.severity} 
                                        bgColor={severityColorMap[dataTableRow.severity]}
                                        textColor={severityColorMap[dataTableRow.severity]}
                                    />,
                            accessor_key: "severity",
                            value: dataTableRow.severity,
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: <Risks values={dataTableRow.risk_categories} />,
                            accessor_key: "risk_categories",
                            value: dataTableRow.risk_categories,
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: <RuleToggle value={dataTableRow.active} original={dataTableRow} />,
                            accessor_key: "active",
                            value: dataTableRow.active,
                            ignoreComponentExpansion: true,
                        },
                    ],
                    rowId: dataTableRow.uid,
                }
            }else{
                return {
                    columns: [
                        {
                            content: dataTableRow.name || null,
                            accessor_key: "name",
                            value: dataTableRow.name || "",
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: dataTableRow.uid,
                            accessor_key: "cve_identifier",
                            value: dataTableRow.uid,
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: dataTableRow.description,
                            accessor_key: "description",
                            value: dataTableRow.description,
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: <ColoredBgSpan 
                                        value={dataTableRow.severity} 
                                        bgColor={severityColorMap[dataTableRow.severity]}
                                        textColor={severityColorMap[dataTableRow.severity]}
                                    />,
                            accessor_key: "severity",
                            value: dataTableRow.severity,
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: dataTableRow.cvss_score || null,
                            accessor_key: "cvss_score",
                            value: dataTableRow.cvss_score || "",
                            ignoreComponentExpansion: false,
                        },
                        {
                            content: <Risks values={dataTableRow.risk_categories} />,
                            accessor_key: "risk_categories",
                            value: dataTableRow.risk_categories,
                            ignoreComponentExpansion: false,
                        },
                        
                        {
                            content: <RuleToggle value={dataTableRow.active} original={dataTableRow} />,
                            accessor_key: "active",
                            value: dataTableRow.active,
                            ignoreComponentExpansion: true,
                        },
                    ],
                    rowId: dataTableRow.uid,
                }
            }

        }
    );
        setAllRows(allTableRows);
    }, [rulesInfo.data, ruleCategory]);

    useEffect(() => {
        setDisplayedTableRows(function (_) {
            var allRowsCopy = [...allRows]

            // Filter the displayed table rows. TODO: can be separated for more optimization.
            var filteredSeverityRows = severityFilterFn(allRowsCopy, severityFilter);
            var filteredRiskRows = risksFilterFn(filteredSeverityRows, riskFilter);
            var filteredSearchRows = searchFilterFn(filteredRiskRows, searchFilter);

            // TODO: implement sorting up/down or even if there is none.
            if(sortState["severity"] === "None") {
                return filteredSearchRows;
            } else if (sortState["severity"] === "Dec") {
                return filteredSearchRows.sort((rowA, rowB) => -1*severitySortTypeFn(rowA, rowB));
            } else {
                return filteredSearchRows.sort((rowA, rowB) => severitySortTypeFn(rowA, rowB));
            }
        });
    }, [allRows, searchFilter, severityFilter, riskFilter, sortState]);

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
     

    let tableColumnHeaders:TableColumnHeader[]=[] 
    switch (ruleCategory) {
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
                                ...sortState,
                                "severity": updatedSeverity,
                            })
                        },
                    },
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
                    header: "Active",
                    accessor_key: "active",
                    allowSorting: false,
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
                                ...sortState,
                                "severity": updatedSeverity,
                            })
                        },
                    },
                },
                {
                    header: "Risks",
                    accessor_key: "risk_categories",
                    allowSorting: false,
                },
                {
                    header: "Active",
                    accessor_key: "active",
                    allowSorting: false,
                }
            ]
            break;

        case "vulnerability":
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
                                ...sortState,
                                "severity": updatedSeverity,
                            })
                        },
                    },
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
                    header: "Active",
                    accessor_key: "active",
                    allowSorting: false,
                }
            ]
            break;
    
        default:
            break;
    } 
    

    const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
        setSearchFilter(e.currentTarget.value);
    }

    return (
        <div className="pt-8 sm:pt-10">
            <div className="flex flex-row grid grid-cols-6 gap-4">
                <div key={"RuleInput"}>
                    <TextInput
                        handleChange={handleSearchChange} title={"Rules"} searchFilter={searchFilter}/>
                </div>
            
                <div key={"RiskFilter"}>
                    <SelectFilterDropdown 
                        title={"Risk"} 
                        selectedFilterValue={riskFilter} 
                        setFilter={setRiskFilter}
                        filterOptions={["All", "Vulnerability"]}
                    />
                </div>

                <div key={"SeverityFilter"}>
                    <SelectFilterDropdown 
                        title={"Severity"} 
                        selectedFilterValue={severityFilter} 
                        setFilter={setSeverityFilter}
                        filterOptions={["All", "Critical", "High", "Moderate", "Low"]}
                    />
                </div>
            </div>

            {/* These div is for the structure around the table. */}
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
                                />
                        </div>
                    </div>
                </div>
            </div>) :
            <></>}
        </div>
    );
}

export {RulesTableOps}