import ReactMarkdown from "react-markdown";
import { StepInstruction, NormalInstruction } from "../Instructions";

// S3 Bucket Object level logging for  write events. 
export const S3BucketObjectLoggingWrites = () => {
   
    return (
        <>

            <StepInstruction stepNumber={"1."} instruction='To enable S3 bucket
            object-level logging: '/>
         
            <ReactMarkdown className="markdown markdown_blockquote">{
            `
    aws cloudtrail put-event-selectors 
    --region <region-name> 
    --trail-name <trail-name> 
    --event-selectors '[{ "ReadWriteType": "WriteOnly", 
        "IncludeManagementEvents":true, "DataResources": 
        [{ "Type": "AWS::S3::Object", 
        "Values": ["arn:aws:s3:::<s3-bucket-name>/"] }] }]'`
                }
            </ReactMarkdown>
     
        </>  
    )

}