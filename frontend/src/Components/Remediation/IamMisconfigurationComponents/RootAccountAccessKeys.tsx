import { StepInstruction, NormalInstruction } from "../Instructions";

// No root account access keys should exist.
export const RootAccountAccessKeys = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to delete or disable active root access keys being
            via AWS Console."/>

            <StepInstruction stepNumber={"1."} instruction='Sign in to the AWS Management Console 
            as Root and open the IAM console at console.aws.amazon.com/iam/.'/>
            <StepInstruction stepNumber={"2."} instruction='Click on **<Root_Account_Name>** at the top right
            and select **Security Credentials** from the drop down list'/>
            <StepInstruction stepNumber={"3."} instruction='On the pop out screen 
            Click on **Continue to Security Credential**'/>
            <StepInstruction stepNumber={"4."} instruction='Click on **Access Keys** 
            (Access Key ID and Secret Access Key)'/>
            <StepInstruction stepNumber={"5."} instruction="Under the **Status** column 
            if there are any Keys which are Active:"/>
            <StepInstruction stepNumber={"6."} instruction='Click on **Make Inactive** - 
            (Temporarily disable Key - may be needed again)'/>
            <StepInstruction stepNumber={"7."} instruction='Click **Delete** - (Deleted keys cannot be recovered)'/>

        </>  
    )

}