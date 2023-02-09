import { StepInstruction, NormalInstruction } from "../Instructions";

// There is at least 1 AWS IAM user per AWS IAM group.
export const IamGroupMinUser = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to setup:"/>

            <StepInstruction stepNumber={"1."} instruction='Sign in to the AWS Management Console.'/>

            <StepInstruction stepNumber={"2."} instruction='Navigate to Amazon IAM console
             at https://console.aws.amazon.com/iam/.'/>
            
            <StepInstruction stepNumber={"3."} instruction='In the navigation panel, 
            under **Access management**, choose **User groups**.'/>

            <StepInstruction stepNumber={"4."} instruction='Click on the name (link) of the 
            Amazon IAM group that you want to examine.'/>

            <StepInstruction stepNumber={"5."} instruction='Select the **Users** tab and search 
            for any IAM users attached to the selected group. If there are no IAM users attached
            to the group and the Amazon IAM console shows the following message:
            **No resources to display**., the selected IAM group is orphaned and is considered unused.'/>

            <StepInstruction stepNumber={"6."} instruction='Select the unused Amazon IAM group
             that you want to remove.'/>

            <StepInstruction stepNumber={"7."} instruction='Click on the Delete button from the 
            console top menu to initiate the group removal.'/>

            <StepInstruction stepNumber={"8."} instruction='Inside the **Delete <group-name>** 
            confirmation box, enter the name of the selected group in the text input field, 
            then choose **Delete** to remove the unused IAM group from your AWS cloud account.'/>

        </>  
    )

}