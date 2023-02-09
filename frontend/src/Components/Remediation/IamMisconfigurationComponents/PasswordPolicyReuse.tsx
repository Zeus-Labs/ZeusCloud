import { StepInstruction, NormalInstruction } from "../Instructions";

// Password policy should prevent password reuse: 24 or greater.
export const PasswordPolicyReuse = () => {
   
    return (
        <>
            <NormalInstruction instruction="To change the password policy in the 
            AWS Console you will need appropriate permissions to View Identity 
            Access Management Account Settings."/>

            <StepInstruction stepNumber={"1."} instruction='Log in to the 
            AWS Management Console as an IAM user at https://console.aws.amazon.com/iam/.'/>
            <StepInstruction stepNumber={"2."} instruction='Navigate to **IAM Services**.'/>
            <StepInstruction stepNumber={"3."} instruction='On the Left Pane click **Account Settings**.'/>
            <StepInstruction stepNumber={"4."} instruction='Select **Prevent password reuse**.'/>
            <StepInstruction stepNumber={"5."} instruction='For Number of passwords to remember" enter 24'/>
            <StepInstruction stepNumber={"6."} instruction='Click **Apply password policy**.'/>
        </>  
    )

}