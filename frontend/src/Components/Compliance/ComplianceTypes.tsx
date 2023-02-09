
import { rulealerts_group } from "../Alerts/AlertsTypes";

export interface ComplianceTableOpsProps {
    reportType: string;
}

export interface ComplianceTableProps {
    control_group: ComplianceControlGroup;
}

export interface ComplianceRuleTableProps {
    compliance_control: ComplianceControl;
}

export interface ComplianceResourceTableProps {
    rule_alerts: rulealerts_group;
}

export interface ComplianceFramework {
    framework_name: string;
    compliance_control_groups: Array<ComplianceControlGroup>;
}

export interface ComplianceControlGroup {
    group_name: string; 
    compliance_controls: Array<ComplianceControl>;
}

export interface ComplianceControl {
    control_name:     string;      
	rule_alerts_group: Array<rulealerts_group>; 
	comment:         string;   
}   

export interface ComplianceFrameworkStats {
	framework_name:          string; 
    rule_passing_percentage: number;
    loading: boolean;
}