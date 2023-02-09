import { StepInstruction, NormalInstruction } from "../Instructions";

// Access keys should not be set up at initial user setup for IAM users with passwords..
export const IamInitialSetupAccessKey = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to delete the access keys
            of any users:"/>

            <StepInstruction stepNumber={"1."} instruction='Navigate to 
            **Services > IAM > Users > Security Credentials**.'/>
            <StepInstruction stepNumber={"2."} instruction='As an Administrator: 
            click **Delete** for keys that were created at the same time as the user 
            profile but have not been used;'/>
            
        </>  
    )

}