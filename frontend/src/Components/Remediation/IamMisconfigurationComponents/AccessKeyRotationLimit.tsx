import { StepInstruction, NormalInstruction } from "../Instructions";

// 1.4 Ensure access keys are rotated every 90 days or less.
export const AccessKeyRotationLimit = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to setup:"/>

            <StepInstruction stepNumber={"1."} instruction='Login to the AWS Management Console:'/>

            <StepInstruction stepNumber={"2."} instruction='Click **Services**'/>
            
            <StepInstruction stepNumber={"3."} instruction='Click **IAM**'/>

            <StepInstruction stepNumber={"4."} instruction='Click on **Users**'/>

            <StepInstruction stepNumber={"5."} instruction='Click on **Security Credentials**'/>

            <StepInstruction stepNumber={"6."} instruction='As an Administrator: 
            Click on **Make Inactive** for keys that have not been rotated in 90 Days'/>

            <StepInstruction stepNumber={"7."} instruction='As an IAM User: 
            Click on **Make Inactive** or Delete for keys which have not been rotated or used in 90
            Days'/>

            <StepInstruction stepNumber={"8."} instruction='Click on Create Access Key'/>

            <StepInstruction stepNumber={"9."} instruction='Update programmatic call 
            with new Access Key credentials'/>
        </>  
    )

}