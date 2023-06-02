import { NormalInstruction } from "../Instructions"
import { StepInstruction } from "../Instructions"

export const PubliclyExposedVmHighIMDSv1Enabled = () => {
    return <>
    <NormalInstruction instruction="Perform the following steps."/>
    <StepInstruction stepNumber={"1."} instruction="Check the highly privileged role 
    associated with your publicly exposed VM."/>

    <StepInstruction stepNumber={"2."} instruction="For the role, reduce the scope of the
    permissions in the associated policies. Avoid wildcard privileges."/>
    
    <StepInstruction stepNumber={"3."} instruction="Disable IMDSv1 by requiring IMDSv2 credentials for the publicly exposed VM."/>

    <StepInstruction stepNumber={"4."} instruction="Open the Amazon EC2 console at https://console.aws.amazon.com/ec2/."/>

    <StepInstruction stepNumber={"5."} instruction="In the navigation pane, choose Instances."/>

    <StepInstruction stepNumber={"6."} instruction="Select your instance."/>

    <StepInstruction stepNumber={"7."} instruction="Choose Actions, Instance settings, Modify instance metadata options."/>

    <StepInstruction stepNumber={"8."} instruction="In the Modify instance metadata options dialog box, do the following:"/>

    <StepInstruction stepNumber={"a."} subInstruction={true} instruction="For Instance metadata service, select Enable."/>

    <StepInstruction stepNumber={"b."} subInstruction={true} instruction="For IMDSv2, choose Required."/>

    <StepInstruction stepNumber={"c."} subInstruction={true} instruction="Choose Save."/>
</>

}