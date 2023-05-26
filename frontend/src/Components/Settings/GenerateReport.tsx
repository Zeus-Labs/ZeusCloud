import { useState } from "react";
import RadioComp from "../Shared/RadioComp";
import axios from "axios";
import { RuleAlertsResponse, rulealerts_group } from "../Alerts/AlertsTypes";

async function getAllActiveAlertsInfoData(): Promise<RuleAlertsResponse> {
    try {
        // @ts-ignore
        const ruleAlertsEndpoint = window._env_.REACT_APP_API_DOMAIN + "/api/getAllAlerts";

        const miscongigResponse = await axios.get(ruleAlertsEndpoint,
            { params: { rulecategory: "misconfiguration" } }
        );
        const misconfig_rule_alerts_group = miscongigResponse.data.rule_alerts_group.filter((group: rulealerts_group) => group.rule_data.active)

        const attackResponse = await axios.get(ruleAlertsEndpoint,
            { params: { rulecategory: "attackpath" } }
        );
        const attack_rule_alerts_group = attackResponse.data.rule_alerts_group.filter((group: rulealerts_group) => group.rule_data.active)

        
        return {
            rule_alerts_group: [...misconfig_rule_alerts_group,...attack_rule_alerts_group],
            error: ''
        };
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
            message = "Error in retrieving alerts information."
        }

        return {
            rule_alerts_group: [],
            error: message,
        };
    }
}


export default function GenerateReport(){
    const [downloadFormat,setDownloadFormat] = useState("json")

    const downloadReport = async ()=>{
        const activeAlerts = await getAllActiveAlertsInfoData()
        // Convert the JavaScript object to a JSON string
        const jsonData = JSON.stringify(activeAlerts.rule_alerts_group, null, 2);

        // Create a Blob object from the JSON string
        const blob = new Blob([jsonData], { type: 'application/json' });

        // Create a temporary anchor element
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);

        // Set the file name for the download
        link.download = 'alert_findings.json';

        // Programmatically click the anchor element to trigger the download
        link.click();

        // Clean up the temporary anchor element
        URL.revokeObjectURL(link.href);
    }
    return (
        <div className="pt-8">
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Generate Report</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Generate and export a report of all your alert findings
                </p>
            </div>
            <div className="mt-8">
                <RadioComp 
                    id="json"
                    label="JSON"
                    defaultChecked={true}
                    data="json"
                    setData={setDownloadFormat}
                />
            </div>
            <div className="mt-12">
                <button className="bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm"
                onClick={downloadReport}
                >
                    Download Report
                </button>
            </div>
        </div>
    )
}