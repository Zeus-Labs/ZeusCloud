import { TableComp } from  "../Shared/Table";
import { useState } from "react";
import { ComplianceResourceTable } from "./ComplianceResourceTable";
import { ComplianceRuleTableProps } from "./ComplianceTypes";
import { alert_instance } from "../Alerts/AlertsTypes";

function computePassingAlerts(alert_instances: alert_instance[]): string {
    var totalPassingAlerts = 0; 
    var totalAlerts = 0; 
    alert_instances.forEach(alert_instance => {
        totalAlerts += 1; 
        if (alert_instance.status === "passed") {
            totalPassingAlerts += 1; 
        }
    })

    return totalPassingAlerts + " of " + totalAlerts + " resources passing";
}


const ComplianceRuleTable = ({compliance_control}: ComplianceRuleTableProps) => {
    // State to track open/close state of every row.
    var initOpenTableState: { [rowId: string] : boolean; } = {};
    const [openTableState, setTableOpenState] = useState(initOpenTableState);

    const tableColumnHeaders =  
    [
        {
            header: "IronCloud Rule",
            accessor_key: "rule_control",
            allowSorting: false,
        },
        {
            header: "Resources Passing",
            accessor_key: "resources_passing",
            allowSorting: false,
        }
    ];

    const ruletableHeaderCSS = [{
        "headerClassName": "w-3/4 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6",
        "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
        "chevronClassName": "h-5 w-5",
    },
    {
        "headerClassName": "w-1/4 px-3 py-3.5 text-left text-sm font-semibold text-gray-900",
        "spanClassName": "ml-2 flex-none rounded bg-gray-200 text-gray-900 group-hover:bg-gray-300",
        "chevronClassName": "h-5 w-5",
    }];

    // Multiple rows of rules. Each row is a rule control that when clicked opens
    // up a table. 
    var ruleTableRows = compliance_control.rule_alerts_group.map((rule_alerts, idx) => {

        var openStateBool: boolean = false;
        var rule_date_id: string = rule_alerts.rule_data.uid;
        if(rule_date_id in openTableState) {
          openStateBool = openTableState[rule_date_id]
        }
        const flipOpenRowStateFn = function() {
            setTableOpenState(prevOpenStateInfo => ({...prevOpenStateInfo, 
                [rule_date_id]: !prevOpenStateInfo[rule_date_id]}));
        }

        return { 
            columns: [
                {
                    content: rule_alerts.rule_data.description,
                    accessor_key: "rule_control",
                    value: rule_alerts.rule_data.description,
                    ignoreComponentExpansion: false,
                },
                {
                    content: computePassingAlerts(rule_alerts.alert_instances),
                    accessor_key: "resources_passing",
                    value: computePassingAlerts(rule_alerts.alert_instances),
                    ignoreComponentExpansion: false,
                },
    
            ],
            // change the rowId
            rowId: rule_alerts.rule_data.uid,
            // nested Component is a table of resources. Remember to wrap it correctly.
            nestedComponent:  (      
                <tr key={rule_alerts.rule_data.uid+"_ruleId"}>
                    <td key={rule_alerts.rule_data.uid+"_ruleId_td"} colSpan={4} className="p-0 bg-gray-50">
                        <div key={rule_alerts.rule_data.uid+"_ruleId_div"}>
                            { <ComplianceResourceTable
                                rule_alerts={rule_alerts} /> }
                        </div>
                    </td>
                </tr>),
            openRowState: openStateBool, 
            setOpenRowStateFn: flipOpenRowStateFn,
        };
    });

    return(
        <div className="ml-10 mb-5 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div className="overflow-hidden md:rounded-lg">
                        <TableComp
                                tableFixed={false}
                                tableColumnHeaders={tableColumnHeaders}
                                tableHeaderCSS={ruletableHeaderCSS}
                                tableRows={ruleTableRows}
                        />
                    </div>
                </div>
            </div>
       </div>
    )

}

export { ComplianceRuleTable };