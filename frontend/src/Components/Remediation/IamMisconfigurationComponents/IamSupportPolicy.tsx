import { StepInstruction, NormalInstruction } from "../Instructions";

// An IAM user, group, or role has specific permissions to coordinate AWS support.
export const IamSupportPolicy = () => {
   
    return (
        <>

            <NormalInstruction instruction="Perform the following to create an 
            IAM group and assign a policy to it:"/>

            <StepInstruction stepNumber={"1."} instruction='Sign in to the AWS Management
            Console and open the IAM console at https://console.aws.amazon.com/iam/.'/>
            <StepInstruction stepNumber={"2."} instruction='To provide full access to AWS 
            support to an IAM user, attach **AWSSupportAccess** managed policy to the relevant
            IAM group or user.'/>
            
        </>  
    )

}