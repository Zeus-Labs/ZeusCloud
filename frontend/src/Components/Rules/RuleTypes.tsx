export interface rule_info {
    uid: string;
    description: string;
    severity: string;
    risk_categories: Array<string>;
    active: boolean;
}

export interface RuleInfoData {
    data: Array<rule_info>;
    error: string;
}

