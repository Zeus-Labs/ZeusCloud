import { StepInstruction, NormalInstruction } from "../Instructions";

// ELBv2 listeners should avoid using policies with insecure ciphers.
export const ElbInsecureCypher = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to 
            ensure ELBs do not allow insecure cyphers/protocls via the Management Console:"/>

            <StepInstruction stepNumber={"1."} instruction="Log in to the AWS Management Console
            at https://console.aws.amazon.com/."/>
            <StepInstruction stepNumber={"2."} instruction="Open the Amazon EC2 console."/>
            <StepInstruction stepNumber={"3."} instruction="On the left menu, 
            click **Load Balancers**."/>
            <StepInstruction stepNumber={"4."} instruction="Select the load balancer 
            for review."/>
            <StepInstruction stepNumber={"5."} instruction="Select the **Listeners** tab."/>
            <StepInstruction stepNumber={"6."} instruction="On the **HTTPS listener**, 
            select the **Cipher** column."/>
            <StepInstruction stepNumber={"7."} instruction="Select **Change**."/>
            <StepInstruction stepNumber={"8."} instruction="Navigate to the **Select a Cipher** 
            panel and select one of the acceptable predefined security policies (listed above). 
            Alternatively, create a custom security policy based on the recommended ciphers listed in AWS documentation."/>
            <StepInstruction stepNumber={"9."} instruction="Scroll down and click **Save**."/>
  
        </>  
    )

}