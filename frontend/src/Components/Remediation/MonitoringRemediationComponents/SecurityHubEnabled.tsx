import { StepInstruction, NormalInstruction } from "../Instructions";

// Security Hub should be enabled.
export const SecurityHubEnabled = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to implement the prescribed state:"/>
            <StepInstruction stepNumber={"1."} instruction='Log in to the AWS Management Console
            at https://console.aws.amazon.com/.'/>
            <StepInstruction stepNumber={"2."} instruction='Navigate to CloudTrail'/>
            <StepInstruction stepNumber={"3."} instruction='Navigate to Amazon Security Hub 
            console at https://console.aws.amazon.com/securityhub/.'/>
            <StepInstruction stepNumber={"4."} instruction='Choose Go to Security Hub 
            under Get started with Security Hub.'/>
            <StepInstruction stepNumber={"5."} instruction="On the Enable AWS Security Hub setup page, 
            select the security standards that you want to use for the current AWS account, 
            then choose Enable Security Hub to enable the security service. 
            Once Amazon Security Hub is enabled, the service immediately begins to run continuous 
            and automated checks on your AWS environment's resources against the rules included 
            in the enabled standards. Security Hub generates findings based on the results of the
            checks defined within the enabled standards."/>
        </>  
    )

}