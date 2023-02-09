import { StepInstruction, NormalInstruction } from "../Instructions";

// 
export const CloudtrailCloudwatchIntegration = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to implement the prescribed state:"/>
            <StepInstruction stepNumber={"1."} instruction='Log in to the AWS Management Console
            at https://console.aws.amazon.com/.'/>

            <StepInstruction stepNumber={"2."} instruction='Navigate to CloudTrail'/>

            <StepInstruction stepNumber={"3."} instruction='Click the trail name.'/>

            <StepInstruction stepNumber={"4."} instruction='Navigate to the Cloudwatch Logs section,
            and click Edit.'/>

            <StepInstruction stepNumber={"5."} instruction='Select the Enabled box for Cloudwatch logs.'/>

            <StepInstruction stepNumber={"6."} instruction='For the log group, select an existing log group
            or create a new one, and enter the log group name.'/>

            <StepInstruction stepNumber={"7."} instruction='For the **IAM role**, 
            select an existing role or create a new one, and enter the role name.' />

            <StepInstruction stepNumber={"8."} instruction='Click **Save changes**.' />




        </>  
    )

}