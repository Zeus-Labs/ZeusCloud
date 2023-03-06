import axios from 'axios';
import { ComplianceFramework, ComplianceFrameworkStats } from './ComplianceTypes';


export async function getComplianceFramework(complianceFramework: string, 
    setComplianceFramework: (value: ComplianceFramework) => void) {
  
    try {
        // @ts-ignore
        const complianceFrameworkEndpoint = window._env_.REACT_APP_API_DOMAIN + "/api/getComplianceFramework";
        const response = await axios.get(complianceFrameworkEndpoint, {
            params: {
                "framework_id": complianceFramework
            }
          });
        setComplianceFramework(response.data);
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
            message = "Error in retrieving compliance framework information."
        }
        // setComplianceFrameworkInfo({
        //     rule_alerts_group: [],
        //     error: ''
        // });
    }
}


export async function getComplianceFrameworkStats(complianceFramework: string,
    setComplianceFrameworkStats: (value: ComplianceFrameworkStats) => void) {
  
    try {
        // @ts-ignore
        const complianceFrameworkEndpointStats = window._env_.REACT_APP_API_DOMAIN + "/api/getComplianceFrameworkStats";
        const response = await axios.get(complianceFrameworkEndpointStats, {
            params: {
                "framework_id": complianceFramework
            }
          });
        setComplianceFrameworkStats({
                framework_name: response.data.framework_name,
                rule_passing_percentage: response.data.rule_passing_percentage,
                loading: false,
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
            message = "Error in retrieving compliance framework stats."
        }
        setComplianceFrameworkStats({
            framework_name: '',
            rule_passing_percentage: 0,
            loading: false,
        });
    }
}