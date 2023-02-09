import { StepInstruction, NormalInstruction } from "../Instructions";

// VpcUnusedSecurityGroups: Non-default security groups that are unused should be removed
export const VpcUnusedSecurityGroups = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to implement the prescribed state:"/>
            <StepInstruction stepNumber={"1."} instruction='Log in to the AWS Management Console
            at https://console.aws.amazon.com/.'/>
            <StepInstruction stepNumber={"2."} instruction='Go to EC2 console and navigate to security groups'/>
            <StepInstruction stepNumber={"3."} instruction='Select unused security group to delete'/>
            <StepInstruction stepNumber={"4."} instruction='Click delete'/>
        </>  
    )

}