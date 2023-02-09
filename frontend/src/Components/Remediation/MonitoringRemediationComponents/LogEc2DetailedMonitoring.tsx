import ReactMarkdown from "react-markdown";
import { StepInstruction, NormalInstruction } from "../Instructions";

// Detailed monitoring should be enabled for EC2 instances.
export const LogEc2DetailedMonitoring = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to setup detailed
            monitoring on an EC2:"/>

            <StepInstruction stepNumber={"1."} instruction="Sign in to the 
            AWS Management Console."/>

            <StepInstruction stepNumber={"2."} instruction='Navigate to Amazon EC2 console 
            at https://console.aws.amazon.com/ec2/.'/>

            <StepInstruction stepNumber={"3."} instruction='In the navigation panel, 
            under **Instances**, choose **Instances**.'/>

            <StepInstruction stepNumber={"4."} instruction='Select the Amazon EC2
            instance that you want to reconfigure (see Audit section part I to 
            identify the right EC2 resource).'/>

            <StepInstruction stepNumber={"5."} instruction='Click on the **Actions** dropdown
            button from the console top menu, choose **Monitor and troubleshoot**, 
            and select **Manage** detailed monitoring.'/>

            <StepInstruction 
                stepNumber={"6."} 
                instruction="On the Detailed monitoring configuration page, 
                    select the Enable checkbox available under Detailed monitoring
                    to enable the feature. Choose Save to apply the changes. After you 
                    enable Detailed Monitoring, the Amazon EC2 console displays monitoring
                    graphs with a 1-minute period for the selected instance. 
                    For the Amazon EC2 instances where you\'ve enabled 
                    Detailed Monitoring, you can also get aggregated data across groups of 
                    similar instances. Enabling Detailed Monitoring on an EC2 instance does
                    not affect the monitoring of the EBS volumes attached to that instance."/>
            
            <StepInstruction stepNumber={"7."} instruction='Click on the **Actions** dropdown
                button from the console top menu, choose **Monitor and troubleshoot**, 
                and select **Manage** detailed monitoring.'/>
        </>  
    )

}