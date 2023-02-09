import { StepInstruction, NormalInstruction } from "../Instructions";

// S3 buckets should have at-rest server side encryption enabled by default.
export const S3ServerSideEncryption = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to 
            enable default S3 server side encryption via the Management Console:"/>

            <StepInstruction stepNumber={"1."} instruction="Navigate to **S3**."/>

            <StepInstruction stepNumber={"2."} instruction="Select the S3 bucket."/>

            <StepInstruction stepNumber={"3."} instruction="Select the **Properties** 
            tab."/>

            <StepInstruction stepNumber={"4."} instruction="Select **Default Encryption**."/>

            <StepInstruction stepNumber={"5."} instruction="Select either **AES-256** or 
            **AWS-KMS** encryption and click **Save**."/>
        </>  
    )

}