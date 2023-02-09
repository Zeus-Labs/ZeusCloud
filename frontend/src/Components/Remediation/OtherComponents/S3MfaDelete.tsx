import { StepInstruction, NormalInstruction } from "../Instructions";
import ReactMarkdown from "react-markdown";

export const S3MfaDelete = () => {
    return (
        <>
            <NormalInstruction instruction="Perform the following to implement the prescribed state:"/>
            <StepInstruction stepNumber={"1."} instruction='Use the AWS cli to enable MFA for S3 Delete.'/>
            <StepInstruction stepNumber={"2."} instruction='Refer to: https://docs.aws.amazon.com/AmazonS3/latest/userguide/MultiFactorAuthenticationDelete.html 
            for additional instructions '/>
            <ReactMarkdown className="markdown markdown_blockquote">{        
    `
    aws s3api put-bucket-versioning --bucket DOC-EXAMPLE-BUCKET1 --versioning-configuration Status=Enabled,MFADelete=Enabled --mfa "SERIAL 123456"`
                }
            </ReactMarkdown>
        </>  
    )

}