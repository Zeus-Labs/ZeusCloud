import { StepInstruction, NormalInstruction } from "../Instructions";

// Default security groups should block all inbound and outbound traffic.
export const SecurityGroupRestrictTraffic = () => {
    return (
        <>
            <NormalInstruction instruction="Perform the following to implement the prescribed state:"/>
            <StepInstruction stepNumber={"1."} instruction='Log in to the AWS Management Console
            at https://console.aws.amazon.com/.'/>
            <StepInstruction stepNumber={"2."} instruction='Create a set of least privilege security groups for those resources.'/>
            <StepInstruction stepNumber={"3."} instruction='Place the resources in those security groups.'/>
            <StepInstruction stepNumber={"4."} instruction='Remove the relevant resources from the default security group.'/>
            <StepInstruction stepNumber={"5."} instruction='Open the Amazon VPC console.'/>
            <StepInstruction stepNumber={"6."} instruction='Repeat the next steps for all VPCs, including the default VPC in each AWS region:'/>
            <StepInstruction stepNumber={"7."} instruction='In the left pane, click **Security Groups**.'/>
            <StepInstruction stepNumber={"8."} instruction='For each default security group, perform the following:'/>
            <StepInstruction stepNumber={"9."} instruction='Select the default security group.'/>
            <StepInstruction stepNumber={"10."} instruction='Click **Inbound Rules**.'/>
            <StepInstruction stepNumber={"11."} instruction='Remove any inbound rules.'/>
            <StepInstruction stepNumber={"12."} instruction='Click **Outbound Rules**.'/>
            <StepInstruction stepNumber={"13."} instruction='Remove any outbound rules.'/>
        </>  
    )

}