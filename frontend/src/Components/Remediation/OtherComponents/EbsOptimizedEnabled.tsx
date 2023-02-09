import { StepInstruction, NormalInstruction } from "../Instructions";

// EBS optimization should be enabled for those EC2 instances that allow it.
export const EbsOptimizedEnabled = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to implement the prescribed state:"/>
            <StepInstruction stepNumber={"1."} instruction='Log in to the AWS Management Console
            at https://console.aws.amazon.com/.'/>

            <StepInstruction stepNumber={"2."} instruction='Open the Amazon EC2 console.'/>
            <StepInstruction stepNumber={"3."} instruction='Stop your EC2 instance.'/>
            <StepInstruction stepNumber={"4."} instruction='Select your instance and click on
            **Actions** at the top of your screen. Select **Instance Settings** in the drop down menu, 
            then select **Change Instance Type**.'/>
             <StepInstruction stepNumber={"5."} instruction='Modify your instance type to the one that 
            you prefer and click on **EBS optimized**. Some instance types are EBS optimized by default.'/>

        </>  
    )

}