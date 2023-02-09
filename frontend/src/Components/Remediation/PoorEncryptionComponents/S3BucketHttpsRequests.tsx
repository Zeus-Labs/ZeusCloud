import ReactMarkdown from "react-markdown";
import { StepInstruction, NormalInstruction } from "../Instructions";

// S3 Buckets should deny Http requests.
export const S3BucketHttpsRequests = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to setup:"/>

            <StepInstruction stepNumber={"1."} instruction="Set bucket policy 
            to only allow HTTPS requests on an S3 Bucket:"/>

            <ReactMarkdown className="markdown markdown_blockquote">{
            `
            aws s3api put-bucket-policy
            --bucket <bucket value> 
            --policy '{"Version":"2012-10-17",
                "Statement":[{"Effect":"Allow",
                "Principal":{"AWS":["<account id>"]},
                "Action":"s3:Get*","Resource":"<bucket arn>/*"},
                {"Effect":"Deny","Principal":"*",
                "Action":"*","Resource":"<bucket arn>/*",
                "Condition":{"Bool":{"aws:SecureTransport":"false"}}}]}'`
            }
            </ReactMarkdown>
        </>  
    )

}