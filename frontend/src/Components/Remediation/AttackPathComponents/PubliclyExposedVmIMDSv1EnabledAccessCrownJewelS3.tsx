import { NormalInstruction } from "../Instructions"
import { StepInstruction } from "../Instructions"

export const PubliclyExposedVmIMDSv1EnabledAccessCrownJewelS3 = () => {
    return <>
    <NormalInstruction instruction="Perform the following steps."/>

    <StepInstruction stepNumber={"1."} instruction="Check the resource policy associated with the S3 bucket
     and decide whether the publicly exposed VM should have access to it."/>

    <StepInstruction stepNumber={"2."} instruction="Disable IMDSv1 by requiring IMDSv2 credentials for the publicly exposed VM."/>

    <StepInstruction stepNumber={"3."} instruction="Open the Amazon EC2 console at https://console.aws.amazon.com/ec2/."/>

    <StepInstruction stepNumber={"4."} instruction="In the navigation pane, choose Instances."/>

    <StepInstruction stepNumber={"5."} instruction="Select your instance."/>

    <StepInstruction stepNumber={"6."} instruction="Choose Actions, Instance settings, Modify instance metadata options."/>

    <StepInstruction stepNumber={"7."} instruction="In the Modify instance metadata options dialog box, do the following:"/>

    <StepInstruction stepNumber={"a."} subInstruction={true} instruction="For Instance metadata service, select Enable."/>

    <StepInstruction stepNumber={"b."} subInstruction={true} instruction="For IMDSv2, choose Required."/>

    <StepInstruction stepNumber={"c."} subInstruction={true} instruction="Choose Save."/>

</>

}