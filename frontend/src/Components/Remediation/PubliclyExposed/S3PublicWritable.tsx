import { StepInstruction, NormalInstruction } from "../Instructions";

// S3 buckets should not be publicly writable.
export const S3PublicWritable = () => {
    return (
        <>
            <NormalInstruction instruction="To change the policy using the AWS Console, follow these steps:"/>
            <StepInstruction stepNumber={"1."} instruction='Log in to the AWS Management Console
            at https://console.aws.amazon.com/.'/>

            <StepInstruction stepNumber={"2."} instruction='Navigate to the S3 Console and 
            select the appropriate S3 bucket.'/>
            <StepInstruction stepNumber={"3."} instruction='Select **Permissions > Access Control** List.'/>
            <StepInstruction stepNumber={"4."} instruction='In **Public access**, select **Everyone** and uncheck:
            **List Objects, Write Objects, Read bucket permissions, Write bucket permissions**.'/>
            <StepInstruction stepNumber={"5."} instruction='Click **Save** and Select **Bucket Policy**'/>
            <StepInstruction stepNumber={"6."} instruction='Navigate to S3'/>
            <StepInstruction stepNumber={"7."} instruction='In the left navigation, 
                select **Block public access (account settings)**.'/>
            <StepInstruction stepNumber={"8."} instruction='Click **Edit**'/>
            <StepInstruction stepNumber={"9."} instruction='Check the **Block all public access** checkbox.'/>
            <StepInstruction stepNumber={"10."} instruction='Click **Save Changes**.'/>
            <StepInstruction stepNumber={"11."} instruction='Enter confirm and click **confirm**.'/>
        </>  
    )

}