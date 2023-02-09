import { StepInstruction, NormalInstruction } from "../Instructions";

// Cloudtrail trails should be delivered to Cloudwatch
export const CloudtrailEnableAllRegions = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to implement the prescribed state:"/>
            <StepInstruction stepNumber={"1."} instruction='Log in to the AWS Management Console
            at https://console.aws.amazon.com/.'/>

            <StepInstruction stepNumber={"2."} instruction='Navigate to CloudTrail'/>
            <StepInstruction stepNumber={"3."} instruction='Choose the trail name. 
            If you choose a trail that applies to all regions, you will be redirected 
            to the region in which the trail was created.'/>
            <StepInstruction stepNumber={"4."} instruction='For CloudWatch Logs, choose **Edit**.'/>
            <StepInstruction stepNumber={"5."} instruction='For New or existing log group, type the log group name, 
            and then choose Continue.'/>
            <StepInstruction stepNumber={"6."} instruction='For the IAM role, 
            choose an existing role or create one. If you create an IAM role, type a role name.'/>

        </>  
    )

}