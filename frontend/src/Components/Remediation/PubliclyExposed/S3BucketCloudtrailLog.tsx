import { StepInstruction, NormalInstruction } from "../Instructions";

// S3 buckets with Cloudtrail logs should not be publicly accessible
export const S3BucketCloudtrailLog = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to remove any public access 
            that has been granted to the bucket via an ACL or S3 bucket policy:"/>
            <StepInstruction stepNumber={"1."} instruction='Go to Amazon S3 console
            at https://console.aws.amazon.com/s3/home'/>

            <StepInstruction stepNumber={"2."} instruction='Right-click on the bucket 
            and click Properties'/>
            <StepInstruction stepNumber={"3."} instruction='In the **Properties** pane, 
            click the **Permissions** tab.'/>
            <StepInstruction stepNumber={"4."} instruction='The tab shows a list of grants, 
            one row per grant, in the bucket ACL. Each row identifies the grantee and the 
            permissions granted.'/>
            <StepInstruction stepNumber={"5."} instruction='Select the row that grants permission 
            to **Everyone** or **Any Authenticated User**.'/>
            <StepInstruction stepNumber={"6."} instruction='Uncheck all the permissions granted to 
            **Everyone** or **Any Authenticated User** (click x to delete the row).'/>
            <StepInstruction stepNumber={"7."} instruction='Click **Save** to save the ACL.'/>
            <StepInstruction stepNumber={"8."} instruction='If the **Edit bucket policy** button is present,
            click it'/>
            <StepInstruction stepNumber={"9."} instruction='Remove any **Statement** having an **Effect** set 
            to **Allow** and a **Principal** set to **"\*"** or **{"AWS" : "*"}**.'/>        
        </>  
    )

}