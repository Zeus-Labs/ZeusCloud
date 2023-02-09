import { StepInstruction, NormalInstruction } from "../Instructions";

// Cloudtrails should have at rest enabled encryption.
export const CloudtrailEncryption = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to setup:"/>

            <StepInstruction stepNumber={"1."} instruction="Log in to the AWS Management 
            Console at [https://console.aws.amazon.com/]."/>

            <StepInstruction stepNumber={"2."} instruction="Open the Amazon 
            CloudTrail console."/>

            <StepInstruction stepNumber={"3."} instruction="In the left navigation pane, 
            click **Trails**."/>

            <StepInstruction stepNumber={"4."} instruction="Select a **Trail**."/>

            <StepInstruction stepNumber={"5."} instruction="Navigate to the **S3** section, 
            click the edit button (pencil icon)."/>

            <StepInstruction stepNumber={"6."} instruction="Click **Advanced**."/>

            <StepInstruction stepNumber={"7."} instruction="From the **KMS Key Id** drop-down menu, 
            select an existing CMK."/>

            <StepInstruction stepNumber={"8."} instruction="For CloudTrail as a service to encrypt
             and decrypt log files using the CMK provided, 
             apply a KMS Key policy on the selected CMK."/>

            <StepInstruction stepNumber={"9."} instruction="Click **Save**."/>
            <StepInstruction stepNumber={"10."} instruction="You will see a notification message 
            stating that you need to have decrypt permissions on the specified KMS key to decrypt 
            log files. Click **Yes**."/>
           
        </>  
    )

}