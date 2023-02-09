import { StepInstruction, NormalInstruction } from "../Instructions";

// Root Account should not be actively used
export const IamRootUsage = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to implement the prescribed state:"/>
            <StepInstruction stepNumber={"1."} instruction='Log in to the AWS Management Console
            at https://console.aws.amazon.com/.'/>

            <StepInstruction stepNumber={"2."} instruction='Replace usage of the 
            AWS root with IAM users with minimal set of permissions necessary to access and manage just
            the required AWS resources and services'/>

            <StepInstruction stepNumber={"3."} instruction='For example, you can add an MFA enabled user 
            that can perform a limited set of privileged activities. Consider also using the 
            IAM Administrator Managed Policy.'/>

        </>  
    )

}