import { StepInstruction, NormalInstruction } from "../Instructions";

// EBS Volume should be encrypted at rest.
export const EbsVolumeEncrypted = () => {
   
    return (
        <>
            <NormalInstruction instruction="To change the policy using the AWS Console, 
            follow these steps:"/>

            <StepInstruction stepNumber={"1."} instruction='Navigate to EC2.'/>

            <StepInstruction stepNumber={"2."} instruction='Select the Region in which you
             would like to create your volume.'/>

            <StepInstruction stepNumber={"3."} instruction='In the navigation pane, 
            select **ELASTIC BLOCK STORE**, Volumes.'/>

            <StepInstruction stepNumber={"4."} instruction='Select **Create Volume**.'/>

            <StepInstruction stepNumber={"5."} instruction='Select the desired values for 
            **Volume Type, Size, IOPS, Throughput,** and **Availability Zone**.'/>

            <StepInstruction stepNumber={"6."} instruction='To encrypt the volume, 
            select **Encrypt this volume**, and choose a CMK.'/>

            <StepInstruction stepNumber={"7."} instruction='Click **Create Volume**.'/>
        </>  
    )

}