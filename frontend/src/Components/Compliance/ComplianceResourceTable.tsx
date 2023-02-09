import { TableComp } from  "../Shared/Table";
import { ResourceDisplay } from "../Shared/ResourceDisplay";
import moment from 'moment';
import { TextWithTooltip } from "../Shared/TextWithTooltip";
import { ComplianceResourceTableProps } from "./ComplianceTypes";


const ComplianceResourceTable = ({rule_alerts}: ComplianceResourceTableProps) => {

    const tableColumnHeaders =  
    [
        {
            header: "Resource",
            accessor_key: "resource_id",
            allowSorting: false,
        },
        {
            header: "Context",
            accessor_key: "context",
            allowSorting: false,
        },
        {
            header: "Account",
            accessor_key: "account_id",
            allowSorting: false,
        },
        {
            header: "Last Seen",
            accessor_key: "last_seen",
            allowSorting: false,
        },
        {
            header: "Status",
            accessor_key: "status",
            allowSorting: false,
        },
    ];

    const resourceTableHeaderCSS = [{
        "headerClassName": "w-1/4 px-3 py-3.5 text-left text-sm font-semibold text-gray-900",
    },
    {
        "headerClassName": "w-2/5 px-3 py-3.5 text-left text-sm font-semibold text-gray-900",
    },
    {
        "headerClassName": "px-3 py-3.5 text-left text-sm font-semibold text-gray-900",
    },
    {
        "headerClassName": "px-3 py-3.5 text-left text-sm font-semibold text-gray-900",
    },
    {
        "headerClassName": "px-3 py-3.5 text-left text-sm font-semibold text-gray-900",
    }];

    // Multiple rows of resources.
    var ruleTableRows = rule_alerts.alert_instances.map((alert_instance, idx) => {

        return { 
            columns: [
                {
                    content: <ResourceDisplay
                        key={alert_instance.resource_id} 
                        text={alert_instance.resource_id}
                        type={alert_instance.resource_type}
                        maxTruncationLength={44}/>,
                    accessor_key: "resource_id",
                    value: alert_instance.resource_id,
                    ignoreComponentExpansion: false,
                },
                {
                    content: <TextWithTooltip
                        key={alert_instance.resource_id} 
                        text={alert_instance.context}
                        maxTruncationLength={70}/>,
                    accessor_key: "context",
                    value: alert_instance.context,
                    ignoreComponentExpansion: false,
                },
                {
                    content: alert_instance.account_id,
                    accessor_key: "account_id",
                    value: alert_instance.account_id,
                    ignoreComponentExpansion: false,
                },
                {
                    content: `${moment.duration(moment().diff(moment(alert_instance.last_seen))).humanize()} ago`,
                    accessor_key: "last_seen",
                    value: alert_instance.last_seen,
                    ignoreComponentExpansion: false,
                },
                {
                    content: alert_instance.status,
                    accessor_key: "status",
                    value: alert_instance.status,
                    ignoreComponentExpansion: false,
                },
            ],
            // change the rowId
            rowId: alert_instance.resource_id,
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
                                tableHeaderCSS={resourceTableHeaderCSS}
                                tableRows={ruleTableRows}
                        />
                    </div>
                </div>
            </div>
       </div>
    )

}

export { ComplianceResourceTable };