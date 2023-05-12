import { rule_info } from "../Rules/RuleTypes";

export interface alert_instance {
    resource_id: string;
    resource_type: string;
    account_id: string;
    context: string;
    status: string; 
    first_seen: Date;
    last_seen: Date;
    muted: boolean;
}

export interface rulealerts_group {
    rule_data: rule_info;
    alert_instances: Array<alert_instance>;
}

export interface RuleAlertsResponse {
    rule_alerts_group: Array<rulealerts_group>;
    error: string;
}

export interface GeneratedAlertsTableProps {
    ruleAlertsGroup: rulealerts_group;
    filterValueState: {
        [muted: string]: string;
    };
    toggleAlertMuteState: (alertId: AlertId, newMutedValue: boolean) => void;
    openSlideover: SlidoverStateData; 
    setSlideoverFn: (updatedVal: alert_instance) => void;
}

export interface UpdateAlertMuteStateData {
    alertId: AlertId;
    newMutedValue: boolean;
}

export interface AlertId {
    resource_id: string; 
    rule_data_uid: string;
}

export interface RowOpenState {
    rowId: string;
    open: boolean;
}

export interface SlidoverStateData {
    rule_data: rule_info;
    alert_instance: alert_instance;
    open: boolean;
    display_graph: DisplayGraph
}

export interface AlertSlideoverProps {
    slideoverData: SlidoverStateData;
    setOpen: () => void;
    ruleCategory: string;
}

export interface DisplayNode{
    node_label: string;
    resource_id: number;
    display_id:string;
}

export interface DisplayEdge{
    source_resource_id: number;
    target_resource_id: number;
    id: number | null;
    make_dotted: boolean | null;
}


export interface DisplayGraph{
    node_info: {[id:string]:DisplayNode};
    adjacency_list: {[id:string]:Array<DisplayEdge>};
}