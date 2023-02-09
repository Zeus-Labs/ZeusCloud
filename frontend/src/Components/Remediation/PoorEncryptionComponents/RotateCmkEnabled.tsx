import { StepInstruction, NormalInstruction } from "../Instructions";

// Customer created KMS CMK's should have rotation enabled.
export const RotateCmkEnabled = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to setup:"/>

            <StepInstruction stepNumber={"1."} instruction="Log in to the AWS Management 
            Console at [https://console.aws.amazon.com/]."/>

            <StepInstruction stepNumber={"2."} instruction="Open the Amazon KMS console
            [https://console.aws.amazon.com/kms/home]."/>

            <StepInstruction stepNumber={"3."} instruction="In the left navigation pane, 
            select **customer managed keys**."/>

            <StepInstruction stepNumber={"4."} instruction="Select the customer master 
            key (CMK) in scope."/>

            <StepInstruction stepNumber={"5."} instruction="Navigate to the 
            **Key Rotation** tab."/>

            <StepInstruction stepNumber={"6."} instruction="Select 
            **Rotate this key every year**."/>

            <StepInstruction stepNumber={"7."} instruction="Click **Save**."/>           
        </>  
    )

}