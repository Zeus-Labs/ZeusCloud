import { StepInstruction, NormalInstruction } from "../Instructions";

// Buckets should be configured with block public access settings.
export const S3BlockPublicSettings = () => {
   
    return (
        <>
            <NormalInstruction instruction="To enable block public access settings at the bucket level:
using the AWS Console, follow these steps:"/>
            <StepInstruction stepNumber={"1."} instruction='Log in to the AWS Management Console
            at https://console.aws.amazon.com/.'/>

            <StepInstruction stepNumber={"2."} instruction='Navigate to the S3 Console and 
            select the appropriate S3 bucket.'/>
            <StepInstruction stepNumber={"3."} instruction='In the **Bucket name** list, 
            choose the name of the bucket that you want.'/>
            <StepInstruction stepNumber={"4."} instruction='Choose **Permissions**.'/>
            <StepInstruction stepNumber={"5."} instruction='Choose **Edit** 
            to change the public access settings for the bucket.'/>
            <StepInstruction stepNumber={"6."} instruction='Check the box for
             **Block all public access**.'/>
            <StepInstruction stepNumber={"7."} instruction='Click **Save**'/>
            <StepInstruction stepNumber={"8."} instruction='When you’re asked for confirmation, 
            enter confirm. Then choose **Confirm** to save your changes.'/>
        </>  
    )
}