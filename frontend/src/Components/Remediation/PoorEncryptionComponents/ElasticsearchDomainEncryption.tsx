import { StepInstruction, NormalInstruction } from "../Instructions";

// Elasticsearch domains are encrypted
export const ElasticsearchDomainEncryption = () => {
   
    return (
        <>
            <NormalInstruction instruction="To change the policy using the AWS Console, 
            follow these steps:"/>

            <StepInstruction stepNumber={"1."} instruction='Open the domain in the AWS console, 
            then choose **Actions** and **Edit security configuration**.'/>

            <StepInstruction stepNumber={"2."} instruction='Under **Encryption**, 
            select **Enable encryption of data at rest**.'/>

            <StepInstruction stepNumber={"3."} instruction='Choose an AWS KMS key to use, 
            then choose **Save changes**.'/>
        </>  
    )

}