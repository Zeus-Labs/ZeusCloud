import { StepInstruction, NormalInstruction } from "../Instructions";

// Password policy should require a minimum length of at least 14.
export const PasswordPolicyLength = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to set 
            the password policy as prescribed: Via AWS Console"/>

            <StepInstruction stepNumber={"1."} instruction='Login to AWS Console 
            (with appropriate permissions to View Identity Access Management Account Settings)'/>
            <StepInstruction stepNumber={"2."} instruction='Go to IAM Service on the AWS Console'/>
            <StepInstruction stepNumber={"3."} instruction='Click on Account Settings on the Left Pane'/>
            <StepInstruction stepNumber={"4."} instruction='Set "Minimum password length" to **14** or greater.'/>
            <StepInstruction stepNumber={"5."} instruction='Click "Apply password policy"'/>
        </>  
    )

}