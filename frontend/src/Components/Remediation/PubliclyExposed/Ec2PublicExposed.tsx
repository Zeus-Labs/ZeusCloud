import { StepInstruction, NormalInstruction } from "../Instructions";

// EC2 instances shouldn't have public IPs to prevent public exposure
export const Ec2PublicExposed = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to implement 
            control whether your instance receives a public IP address as required."/>
            <StepInstruction stepNumber={"1."} instruction='Log in to the AWS Management Console
            at https://console.aws.amazon.com/.'/>

            <StepInstruction stepNumber={"2."} instruction='Open the Amazon VPC console.'/>
            <StepInstruction stepNumber={"3."} instruction='In the navigation pane, 
            select **Subnets**.'/>
            <StepInstruction stepNumber={"4."} instruction='Select a subnet, 
            then select **Subnet Actions > Modify auto-assign IP** settings.'/>
            <StepInstruction stepNumber={"5."} instruction='Select **auto-assign public IPv4** 
            address. When selected, requests a public IPv4 address for all instances launched
            into the selected subnet. Select or clear the setting as required.'/>
            <StepInstruction stepNumber={"6."} instruction='Click **Save**.'/>
        </>  
    )

}