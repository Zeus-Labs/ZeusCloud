import { useEffect, useState } from 'react';
import { ComplianceTable } from './ComplianceTable'; 
import { getComplianceFramework } from './ComplianceApi';
import { ComplianceTableOpsProps, ComplianceFramework, ComplianceControlGroup } from './ComplianceTypes';


const ComplianceTableOps = ({reportType}: ComplianceTableOpsProps) => {
    let initComplianceControlGroups: Array<ComplianceControlGroup> = [];
    let initComplianceFramework: ComplianceFramework = {
        framework_name: reportType,
        compliance_control_groups: initComplianceControlGroups,
    };
    const [complianceFramework, setComplianceFramework] = useState(initComplianceFramework);

    useEffect(() => {
        getComplianceFramework(reportType, setComplianceFramework); 
    }, []);
    return (
    <div className="flex flex-col">        
       {complianceFramework.compliance_control_groups.map(compliance_control_group => {
            return (
                <ComplianceTable
                    control_group={compliance_control_group}
                    key={compliance_control_group.group_name} 
                    />
            )
        })}
    </div>

    )
}

export default ComplianceTableOps;