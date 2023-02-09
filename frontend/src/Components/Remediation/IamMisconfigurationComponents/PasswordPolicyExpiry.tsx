import { StepInstruction, NormalInstruction } from "../Instructions";

// Password policy should expire passwords within 90 days or less.
export const PasswordPolicyExpiry = () => {
   
    return (
        <>
            <NormalInstruction instruction="To change the password policy in the 
            AWS Console you will need appropriate permissions to View Identity 
            Access Management Account Settings."/>

            <StepInstruction stepNumber={"1."} instruction='Log in to the 
            AWS Management Console as an IAM user at https://console.aws.amazon.com/iam/.'/>
            <StepInstruction stepNumber={"2."} instruction='Navigate to **IAM Services**.'/>
            <StepInstruction stepNumber={"3."} instruction='On the Left Pane click **Account Settings**.'/>
            <StepInstruction stepNumber={"4."} instruction='Select **Enable password expiration**.'/>
            <StepInstruction stepNumber={"5."} instruction='For **Password expiration period (in days)" enter 90** or less.'/>
            <StepInstruction stepNumber={"6."} instruction='Click **Apply password policy**.'/>
        </>  
    )

}