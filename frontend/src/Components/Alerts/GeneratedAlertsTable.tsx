import { TableComp } from "../Shared/Table";
import { alert_instance } from './AlertsTypes';
import { GeneratedAlertsTableProps } from "./AlertsTypes";
import { ToggleMuteButton } from "./ToggleMuteButton";
import { ResourceDisplay } from "../Shared/ResourceDisplay";
import moment from 'moment';
import { TextWithTooltip } from "../Shared/TextWithTooltip";
import { InlineIcon } from "../AssetsInventory/assetUtils";
import { labelImage } from "./ResourceMappings";

export const GeneratedAlertsTable = ({filterValueState, 
                                    ruleAlertsGroup: {alert_instances, rule_data},
                                    toggleAlertMuteState, 
                                    openSlideover,
                                    setSlideoverFn}: 
                                    GeneratedAlertsTableProps): JSX.Element => {

    const alertTableHeaderCSS = [{
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
    },
    {
        "headerClassName": "px-3 py-3.5 text-left text-sm font-semibold text-gray-900",
    }];

    let muteHeader: string = "Mute";
    if (filterValueState["muted"] === "Muted") {
        muteHeader = "Unmute";
    }

    const alertTableColumnHeaders =  
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
        {
            header: muteHeader,
            accessor_key: "mute",
            allowSorting: false,
        }
    ];
    
    const muteFilterFn = function(alertInstance: alert_instance): boolean {
        const filterMutedStateVal = filterValueState["muted"]; 
        if (filterMutedStateVal === "Muted") {
            return alertInstance.muted;
        }
        return !alertInstance.muted;
    };
    const statusFilterFn = function(alertInstance: alert_instance): boolean {
        const filterStatusStateVal = filterValueState["status"]; 
        if (filterStatusStateVal === "All") {
            return true;
        }
        return alertInstance.status === "failed";
    };
    const accountFilterFn = function(alertInstance: alert_instance): boolean {
        const filterAccountStateVal = filterValueState["account"]; 
        if (filterAccountStateVal === "All") {
            return true;
        }
        return alertInstance.account_id === filterAccountStateVal;
    };
    
    var allTableRows = alert_instances.
        filter(alert_instance => statusFilterFn(alert_instance)).
        filter(alert_instance => muteFilterFn(alert_instance)).
        filter(alert_instance => accountFilterFn(alert_instance)).
        sort(function(a: alert_instance, b: alert_instance): number {
            if (a.status === b.status) {
                return 0
            }
            if (a.status === "failed") {
                return -1
            }
            return 1
        }).
        map((alert_instance, _) =>
            {
              return {
                  columns: [
                    {    
                        content: <ResourceDisplay
                            icon={<InlineIcon icon={labelImage(alert_instance.resource_type)} />}
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
                    {
                        content: <ToggleMuteButton 
                            key={alert_instance.resource_id} 
                            muted={alert_instance.muted} 
                            resource_id={alert_instance.resource_id} 
                            ruleDataId={rule_data.uid}
                            toggleAlertMuteState={toggleAlertMuteState}/>,
                        accessor_key: "mute",
                        value: alert_instance.muted,
                        ignoreComponentExpansion: false,
                    },
                  ],
                  rowId: alert_instance.resource_id,
                  handleRowClick:() => setSlideoverFn(alert_instance),
              }
          }
    );


    // Outside div tag as a ml-10 to keep the tables clear.
    return (
        <div className="ml-10 mb-5 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-visible sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div className="md:rounded-lg">
                        <TableComp
                            key={rule_data.uid+"_alerts_table"}
                            tableFixed={true}
                            tableColumnHeaders={alertTableColumnHeaders}
                            tableHeaderCSS={alertTableHeaderCSS}
                            tableRows={allTableRows}
                            />
                    </div>
                </div>
            </div>
        </div>
    )
};