import { StepInstruction, NormalInstruction } from "../Instructions";

// EBS Snapshot should be encrypted at rest.
export const EbsSnapshotEncrypted = () => {
   
    return (
        <>
            <NormalInstruction instruction="To change the policy using the AWS Console, 
            follow these steps:"/>

            <StepInstruction stepNumber={"1."} instruction="Log in to the AWS Management 
            Console at https://console.aws.amazon.com/."/>

            <StepInstruction stepNumber={"2."} instruction='Open the Amazon EC2 
            console.'/>

            <StepInstruction stepNumber={"3."} instruction='From the navigation bar, 
            select **Region**.'/>

            <StepInstruction stepNumber={"4."} instruction='From the navigation pane, 
            select **EC2 Dashboard**.'/>

            <StepInstruction stepNumber={"5."} instruction='In the upper-right corner of the page, 
            click **Account Attributes**, then **EBS encryption**.'/>

            <StepInstruction stepNumber={"6."} instruction='click **Manage**.'/>

            <StepInstruction stepNumber={"7."} instruction='For Default encryption key, 
            select a symmetric customer managed CMK.'/>

            <StepInstruction stepNumber={"8."} instruction='Click Update **EBS encryption**.'/>
        </>  
    )

}