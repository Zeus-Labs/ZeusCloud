import ReactMarkdown from "react-markdown";
import { StepInstruction, NormalInstruction } from "../Instructions";

// LogEnableS3ServerAccess: S3 buckets should have server access
// logging.
export const LogEnableS3ServerAccess = () => {
    return (
        <>
            <NormalInstruction instruction='To enable server access logging on 
            the AWS management console.'/>

            <StepInstruction stepNumber={"1."} instruction='Sign in to the AWS 
            Management Console and open the Amazon S3 console at https://console.aws.amazon.com/s3/.'/>

            <StepInstruction stepNumber={"2."} instruction='In the Buckets list, 
            choose the name of the bucket that you want to enable server access logging for.'/>

            <StepInstruction stepNumber={"3."} instruction='Choose properites.'/>

            <StepInstruction stepNumber={"4."} instruction='In the Server access 
            logging section, choose Edit.'/>

            <StepInstruction stepNumber={"5."} instruction='Under Server access logging, 
            select Enable.'/>

            <StepInstruction stepNumber={"6."} instruction='For Target bucket, 
            enter the name of the bucket that you want to receive the log record objects.
            The target bucket must be in the same Region as the source bucket and 
            must not have a default retention period configuration.'/>

            <StepInstruction stepNumber={"7."} instruction='Choose Save changes.'/>
        </>  
    )

}