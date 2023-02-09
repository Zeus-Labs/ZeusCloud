import { StepInstruction, NormalInstruction } from "../Instructions";

// S3 buckets should have versioning enabled to help recover from data loss.
export const S3VersionedBuckets = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to implement the prescribed state:"/>
            <StepInstruction stepNumber={"1."} instruction='Log in to the AWS Management Console
            at https://console.aws.amazon.com/.'/>
            <StepInstruction stepNumber={"2."} instruction='Navigate to S3'/>
            <StepInstruction stepNumber={"3."} instruction='Select the bucket that you want to configure.'/>
            <StepInstruction stepNumber={"4."} instruction='Select the **Properties** tab.'/>
            <StepInstruction stepNumber={"5."} instruction='Navigate to the **Permissions** section.'/>
            <StepInstruction stepNumber={"6."} instruction='Select **Edit bucket policy**. 
            If the selected bucket does not have an access policy, click **Add bucket policy**.'/>
            <StepInstruction stepNumber={"7."} instruction='Select the **Versioning** tab from the **Properties** panel, 
            and expand the **feature configuration** section.'/>
            <StepInstruction stepNumber={"8."} instruction='To activate object versioning for the selected bucket, 
            click **Enable Versioning**, then click **OK**. The **feature status** should change to **versioning is currently 
            enabled on this bucket**.'/>

        </>  
    )

}