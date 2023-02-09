import { StepInstruction, NormalInstruction } from "../Instructions";

// VpcEc2Classic: EC2 Classic should not be used and should be replaced by VPC.
export const VpcEc2Classic = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to implement the prescribed state:"/>
            <StepInstruction stepNumber={"1."} instruction='Log in to the AWS Management Console
            at https://console.aws.amazon.com/.'/>
            <StepInstruction stepNumber={"2."} instruction='Follow the instructions
            to migrate from EC2 classic to VPC group: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/vpc-migrate.html'/>
        </>  
    )

}