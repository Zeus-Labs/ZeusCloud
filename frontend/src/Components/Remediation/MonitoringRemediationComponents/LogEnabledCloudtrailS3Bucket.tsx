import { StepInstruction, NormalInstruction } from "../Instructions";

// 2.6 Ensure S3 bucket access logging is enabled on the CloudTrail S3
// bucket
export const LogEnabledCloudtrailS3Bucket = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to enable S3 bucket logging:"/>

            <StepInstruction stepNumber={"1."} instruction="Sign in to the AWS Management Console 
            and open the S3 console at https://console.aws.amazon.com/s3."/>

            <StepInstruction stepNumber={"2."} instruction='Under All Buckets click on 
            the target S3 bucket'/>

            <StepInstruction stepNumber={"3."} instruction='Click on Properties in 
            the top right of the console'/>

            <StepInstruction stepNumber={"4."} instruction='Under Bucket: 
            <s3_bucket_for_cloudtrail> click on Logging'/>

            <StepInstruction stepNumber={"5."} instruction='Configure bucket logging
            by clicking on enabled checkbox, selecting target bucket from list, and
            entering a target prefix'/>

            <StepInstruction stepNumber={"6."} instruction='Click Save'/>

        </>  
    )

}