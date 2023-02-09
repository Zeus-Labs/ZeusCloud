import ReactMarkdown from "react-markdown";
import { StepInstruction, NormalInstruction } from "../Instructions";

// Expired SSL/TLS certificates stored in AWS IAM should be removed.
export const RemoveExpiredCertificate = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following via AWS cli to delete
            an expired certificate."/>

            <StepInstruction stepNumber={"1."} instruction="To delete the SSL/TLS certificate
            call the following CLI command with the certificate_name."/>

            <ReactMarkdown className="markdown markdown_blockquote">{
            `
            aws iam delete-server-certificate 
            --server-certificate-name <certificate_name>`
            }
            </ReactMarkdown>
        </>  
    )

}