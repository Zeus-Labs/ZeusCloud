import { StepInstruction, NormalInstruction } from "../Instructions";

// RDS instances should have at rest encryption enabled. 
export const RdsInstancesEncrypted = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to setup so that 
            your RDS instance is encrypted:"/>

            <StepInstruction stepNumber={"1."} instruction="Log in to the AWS Management 
            Console at [https://console.aws.amazon.com/]."/>

            <StepInstruction stepNumber={"1."} instruction="When creating an RDS instance,
            make sure storage-encrypted parameter is set to true."/>

            <StepInstruction stepNumber={"2."} instruction="You cannot modify an existing 
            database or Aurora database cluster to enable encryption. You need to migrate
             to a new RDS instance. Navigate to RDS."/>

            <StepInstruction stepNumber={"3."} instruction="In the left navigation, 
            select Snapshots."/>

            <StepInstruction stepNumber={"4."} instruction="Create a database snapshot."/>

            <StepInstruction stepNumber={"5."} instruction="Make a copy of the snapshot 
            and make sure to enable encryption."/>           
        </>  
    )

}