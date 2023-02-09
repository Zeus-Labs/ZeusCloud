import { StepInstruction, NormalInstruction } from "../Instructions";

// IAM user should be associated with at least 1 group.
export const IamUserMinGroup = () => {
    return (
        <>
            <NormalInstruction instruction="Perform the following to ensure an 
            IAM user is associated with at least 1 group:"/>

            <StepInstruction stepNumber={"1."} instruction='Repeat the steps below for each group you want to add a user to:'/>
            <StepInstruction stepNumber={"2."} instruction='Navigate to **IAM**:'/>
            <StepInstruction stepNumber={"3."} instruction='In the left pane, 
            choose **Groups** and then choose the name of the group you want to
            add the user to.'/>
            <StepInstruction stepNumber={"4."} instruction='Choose the **Users** tab 
            and then choose **Add Users to Group**.'/>
            <StepInstruction stepNumber={"5."} instruction='Select the check box 
            next to the users you want to add.'/>
            <StepInstruction stepNumber={"6."} instruction='Choose **Add Users**.'/> 
        </>  
    )

}