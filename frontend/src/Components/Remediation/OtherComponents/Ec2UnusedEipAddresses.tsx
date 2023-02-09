import { StepInstruction, NormalInstruction } from "../Instructions";

// Elastic IP addresses should be removed if they are unused.
export const Ec2UnusedEipAddresses = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to implement the prescribed state:"/>
            <StepInstruction stepNumber={"1."} instruction='Log in to the AWS Management Console
            at https://console.aws.amazon.com/.'/>

            <StepInstruction stepNumber={"2."} instruction='Open the Amazon EC2 console.'/>
            <StepInstruction stepNumber={"3."} instruction='If you have any unallocated Public IPs, 
            they will show no value for Association ID.'/>
            <StepInstruction stepNumber={"4."} instruction='Select them and choose **Release Elastic IP Address**'/>
        </>  
    )

}