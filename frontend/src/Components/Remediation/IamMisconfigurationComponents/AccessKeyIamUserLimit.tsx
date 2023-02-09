import { StepInstruction, NormalInstruction } from "../Instructions";

// IAM users should each only have at most one active access key.
export const AccessKeyRotationLimit = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following on the AWS console:"/>

            <StepInstruction stepNumber={"1."} instruction='Login to the AWS Management Console:'/>

            <StepInstruction stepNumber={"2."} instruction='Navigate to Amazon IAM console at https://console.aws.amazon.com/iam/.'/>
            
            <StepInstruction stepNumber={"3."} instruction='In the navigation panel, 
            under Access management, choose Users.'/>

            <StepInstruction stepNumber={"4."} instruction='Click on the name (link) of the IAM user 
            that you want to examine.'/>

            <StepInstruction stepNumber={"5."} instruction='Select the Security credentials
            tab to access the configuration information available for the IAM user credentials.'/>

            <StepInstruction stepNumber={"6."} instruction='In the Access keys section, 
            check the status for each access key associated with the selected IAM user, 
            available in the Status column. If the selected Amazon IAM user has more than one active access key, the IAM user access configuration does not follow the AWS cloud security best practices and the risk of accidental exposure is high.'/>

            <StepInstruction stepNumber={"7."} instruction='Choose the IAM access key that will 
            be used to provide access to your AWS cloud resources, and update your application(s)
            code to use only the chosen key pair. Test your application(s) to make sure that the
            chosen IAM access key is working.'/>
            
            <StepInstruction stepNumber={"8."} instruction='Identify the non-operational IAM access key
             (other than the one chosen at the previous steps) and 
             deactivate the key pair by choosing Make inactive.'/>
            
            <StepInstruction stepNumber={"9."} instruction='In the Deactivate <access-key-id>? 
            confirmation box, choose Deactivate to decommission the selected key.'/>

            <StepInstruction stepNumber={"10."} instruction='Repeat steps no. 4 – 9 
            for each Amazon IAM user available in your AWS cloud account.'/>
        </>  
    )

}