import { StepInstruction, NormalInstruction } from "../Instructions";

// Security groups should not allow ingress to 0.0.0.0/0 on ports 22 and 3389.
export const SecurityGroupIngressPorts = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to implement the prescribed state:"/>
            <StepInstruction stepNumber={"1."} instruction='Login to the AWS Management Console at
                https://console.aws.amazon.com/vpc/home'/>

            <StepInstruction stepNumber={"2."} instruction='In the left pane, click **Security Groups**'/>
            <StepInstruction stepNumber={"3."} instruction='For each security group, perform the following:'/>
            <StepInstruction stepNumber={"4."} instruction='Select the security group'/>
            <StepInstruction stepNumber={"5."} instruction='Click the **Inbound Rules** tab'/>
            <StepInstruction stepNumber={"6."} instruction='Identify the rules to be removed'/>
            <StepInstruction stepNumber={"7."} instruction='Click the **x** in the **Remove** column'/>
            <StepInstruction stepNumber={"8."} instruction='Click **Save**'/>
        </>  
    )

}