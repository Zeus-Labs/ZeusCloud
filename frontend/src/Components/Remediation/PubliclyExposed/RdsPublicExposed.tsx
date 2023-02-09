import { StepInstruction, NormalInstruction } from "../Instructions";

// RDS instances should not be publicly accessible
export const RdsPublicExposed = () => {
   
    return (
        <>
            <NormalInstruction instruction="To change the policy using the AWS Console, follow these steps:"/>
            <StepInstruction stepNumber={"1."} instruction='Log in to the AWS Management Console
            at https://console.aws.amazon.com/.'/>

            <StepInstruction stepNumber={"2."} instruction='Open the Amazon RDS console.'/>
            <StepInstruction stepNumber={"3."} instruction='On the navigation pane, 
            click **Snapshots**.'/>
            <StepInstruction stepNumber={"4."} instruction='Select the snapshot to encrypt.'/>
            <StepInstruction stepNumber={"5."} instruction='Navigate to **Snapshot Actions**, 
            select **Copy Snapshot**.'/>
            <StepInstruction stepNumber={"6."} instruction='Select your **Destination Region**, 
            then enter your **New DB Snapshot Identifier**.'/>
            <StepInstruction stepNumber={"7."} instruction='Set Enable Encryption to Yes.'/>
            <StepInstruction stepNumber={"8."} instruction='Select your **Master Key** from the list, 
            then select **Copy Snapshot**.'/>
        </>  
    )

}