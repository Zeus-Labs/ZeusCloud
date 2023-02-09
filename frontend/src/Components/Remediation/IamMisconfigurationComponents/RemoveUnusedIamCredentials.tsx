import { StepInstruction, NormalInstruction } from "../Instructions";

// IAM credentials (access keys and passwords) unused for 90 days or 
// more should be disabled.
export const RemoveUnusedIamCredentials = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to setup:"/>

            <StepInstruction stepNumber={"1."} instruction='Login to the AWS Management 
            Console.'/>

            <StepInstruction stepNumber={"2."} instruction='Click **Services**'/>
            
            <StepInstruction stepNumber={"3."} instruction='Click **IAM**'/>
            
            <StepInstruction stepNumber={"4."} instruction='Click on **Users**'/>

            <StepInstruction stepNumber={"5."} instruction='Click on **Security Credentials**'/>

            <StepInstruction stepNumber={"6."} instruction='As an Administrator: 
            Click on **Make Inactive** for credentials that have not been used in 90 Days'/>

            <StepInstruction stepNumber={"7."} instruction='As an IAM User: 
            Click on **Make Inactive** or **Delete** for credentials which have not 
            been used in 90 Days'/>
        </>  
    )

}