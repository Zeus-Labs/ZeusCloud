import { ComplianceTableProps } from "./ComplianceTypes";
import { TableComp } from  "../Shared/Table";
import { ComplianceRuleTable } from "./ComplianceRuleTable";
import { useState } from "react";
import { rulealerts_group } from "../Alerts/AlertsTypes";

function computePassingRules(rule_alerts_group: Array<rulealerts_group>): string {
    var totalPassingRules = 0; 
    var totalRules = 0; 
    rule_alerts_group.forEach(rule_alert => {
        totalRules += 1; 
        var ruleFailed: boolean = false;
        rule_alert.alert_instances.forEach(alertInstance => {
            if(alertInstance.status === "failed") {
                ruleFailed = true;
            }
        })

        if(!ruleFailed) {
            totalPassingRules += 1;
        }
    })

    return totalPassingRules + " of " + totalRules + " rules pass";
}

const ComplianceTable = ({control_group}: ComplianceTableProps) => {
    // State to track open/close state of every row.
    var initOpenTableState: { [rowId: string] : boolean; } = {};
    const [openTableState, setTableOpenState] = useState(initOpenTableState);
    
    const tableColumnHeaders =  
    [
        {
            header: "Compliance Control",
            accessor_key: "control_name",
            allowSorting: false,
        },
        {
            header: "Rules Passing",
            accessor_key: "rule_passing",
            allowSorting: false,
        }
    ];

    const tableHeaderCSS = [{
        "headerClassName": "w-4/5 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6",
        "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
        "chevronClassName": "h-5 w-5",
    },
    {
        "headerClassName": "w-1/5 px-3 py-3.5 text-left text-sm font-semibold text-gray-900",
        "spanClassName": "ml-2 flex-none rounded bg-gray-200 text-gray-900 group-hover:bg-gray-300",
        "chevronClassName": "h-5 w-5",
    }];

    // There will be many rows each row. You click and see a table of 
    // a couple of rule rows.
    var complianceTableRows = control_group.compliance_controls.map((complianceControlRow, 
        idx) => {

        var openStateBool: boolean = false;
        var rule_date_id: string = complianceControlRow.control_name;
        if(rule_date_id in openTableState) {
          openStateBool = openTableState[complianceControlRow.control_name]
        }
        const flipOpenRowStateFn = function() {
            setTableOpenState(prevOpenStateInfo => ({...prevOpenStateInfo, 
                [complianceControlRow.control_name]: !prevOpenStateInfo[complianceControlRow.control_name]}));
        }

        return { 
            columns: [
                {
                    content: complianceControlRow.control_name,
                    accessor_key: "control_name",
                    value: complianceControlRow.control_name,
                    ignoreComponentExpansion: false,
                },
                {
                    content: computePassingRules(complianceControlRow.rule_alerts_group),
                    accessor_key: "rule_passing",
                    value: computePassingRules(complianceControlRow.rule_alerts_group),
                    ignoreComponentExpansion: false,
                },
    
            ],
            // change the rowId
            rowId: complianceControlRow.control_name,
            // nested Component is a table of rules. Remember to wrap it correctly + have correct
            // keys.
            nestedComponent: (      
                <tr key={complianceControlRow.control_name+"_compliance"}>
                    <td key={complianceControlRow.control_name+"_compliance_td"} colSpan={4} className="p-0 bg-gray-50">
                        <div key={complianceControlRow.control_name+"_compliance_div"}>
                            { <ComplianceRuleTable
                                compliance_control={complianceControlRow}
                                /> }
                        </div>
                    </td>
                </tr>),
            openRowState: openStateBool, 
            setOpenRowStateFn: flipOpenRowStateFn,
        };
    });

    return (
        <div className="mt-12 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        <TableComp
                            tableFixed={true}
                            tableColumnHeaders={tableColumnHeaders}
                            tableHeaderCSS={tableHeaderCSS}
                            tableRows={complianceTableRows}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export { ComplianceTable };