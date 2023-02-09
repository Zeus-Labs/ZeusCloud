import { StepInstruction, NormalInstruction } from "../Instructions";

// RDS instances should have minor version upgrades.
export const RdsAutoMinorVersionUpgrade = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to enable 
            auto RDS minor version upgrade:"/>

            <StepInstruction stepNumber={"1."} instruction="Sign in to the AWS Management Console 
            and open the Rds console at https://console.aws.amazon.com/rds."/>

            <StepInstruction stepNumber={"2."} instruction='In the navigation pane, 
                choose **Instances**.'/>

            <StepInstruction stepNumber={"3."} instruction='Select the database 
                instance you wish to configure.'/>

            <StepInstruction stepNumber={"4."} instruction='From the **Instance actions** menu, 
                select **Modify**.'/>

            <StepInstruction stepNumber={"5."} instruction='Under the **Maintenance** section, 
                choose **Yes for Auto minor version upgrade**.'/>

            <StepInstruction stepNumber={"5."} 
                instruction='Select **Continue** and then **Modify DB Instance**.'/>
        </>  
    )

}