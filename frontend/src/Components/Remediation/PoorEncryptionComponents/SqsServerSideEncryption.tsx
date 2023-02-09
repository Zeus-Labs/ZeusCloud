import { StepInstruction, NormalInstruction } from "../Instructions";

// SQS queues should have at rest encryption enabled with AWS KMS.
export const SqsServerSideEncryption = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to 
            enable SQS queue encryption at rest via the Management Console:"/>

            <StepInstruction stepNumber={"1."} instruction="Navigate to **SQS**."/>

            <StepInstruction stepNumber={"2."} instruction="Select an existing queue."/>

            <StepInstruction stepNumber={"3."} instruction="From **Queue Actions**, 
            select **Configure Queue**."/>

            <StepInstruction stepNumber={"4."} instruction="Under **Server-Side Encryption (SSE)
            Settings**, check **Use SSE**."/>

            <StepInstruction stepNumber={"5."} instruction="Next to AWS KMS Customer Master Key (CMK), 
            select a key."/>

            <StepInstruction stepNumber={"6."} instruction="Select **Save Changes**."/>

        </>  
    )

}