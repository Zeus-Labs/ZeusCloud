import ReactMarkdown from "react-markdown";
import { StepInstruction, NormalInstruction } from "../Instructions";

// 2.9 Ensure VPC flow logging is enabled in all VPCs 
export const LogVpcFlow = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to determine if VPC Flow logs
            is enabled: Via the Management Console:"/>

            <StepInstruction stepNumber={"1."} instruction="Sign into the 
            management console"/>

            <StepInstruction stepNumber={"2."} instruction='Select Services 
            then VPC'/>

            <StepInstruction stepNumber={"3."} instruction='In the left navigation pane, 
            select Your VPCs'/>

            <StepInstruction stepNumber={"4."} instruction='Select a VPC'/>

            <StepInstruction stepNumber={"5."} instruction='In the right pane, 
            select the Flow Logs tab.'/>

            <StepInstruction stepNumber={"6."} instruction='If no Flow Log exists, 
            click Create Flow Log'/>

            <StepInstruction stepNumber={"7."} instruction='For Filter, 
            select Reject'/>

            <StepInstruction stepNumber={"8."} instruction='Enter in a Role and 
            Destination Log Group'/>

            <StepInstruction stepNumber={"9."} instruction='Click Create 
            Log Flow'/>

            <StepInstruction stepNumber={"10."} instruction='Click on CloudWatch 
            Logs Group'/>

        </>  
    )

}