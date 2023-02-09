import { StepInstruction, NormalInstruction } from "../Instructions";

// IAM policies should not be connected to IAM users, but rather groups and roles.
export const IamPolicyGroupRole = () => {
   
    return (
        <>

            <NormalInstruction instruction="Perform the following to create an 
            IAM group and assign a policy to it:"/>

            <StepInstruction stepNumber={"1."} instruction='Sign in to the AWS Management
            Console and open the IAM console at https://console.aws.amazon.com/iam/.'/>
            <StepInstruction stepNumber={"2."} instruction='In the navigation pane, 
            click **Groups** and then click **Create New Group**'/>
            <StepInstruction stepNumber={"3."} instruction='In the **Group Name** box, 
            type the name of the group and then click **Next Step**.'/>
            <StepInstruction stepNumber={"4."} instruction='In the list of policies, 
            select the check box for each policy that you want to apply to all members
             of the group. Then click **Next Step**.'/>
            <StepInstruction stepNumber={"5."} instruction='Click **Create Group**'/>

            <NormalInstruction instruction="Perform the following to add a user to a given group:"/>

            <StepInstruction stepNumber={"1."} instruction='Sign in to the AWS Management Console 
            and open the IAM console at https://console.aws.amazon.com/iam/.'/>
            <StepInstruction stepNumber={"2."} instruction='In the navigation pane, click **Groups**'/>
            <StepInstruction stepNumber={"3."} instruction='Select the group to add a user to'/>
            <StepInstruction stepNumber={"4."} instruction='Click **Add Users To Group**'/>
            <StepInstruction stepNumber={"5."} instruction='Select the users to be added to the group'/>
            <StepInstruction stepNumber={"6."} instruction='Click **Add Users**'/>


            <NormalInstruction instruction="Perform the following to remove a direct association between a user and policy:"/>

            <StepInstruction stepNumber={"1."} instruction='Sign in to the AWS Management Console and open the IAM console at
https://console.aws.amazon.com/iam/.'/>
            <StepInstruction stepNumber={"2."} instruction='In the left navigation pane, click on Users'/>
            <StepInstruction stepNumber={"3."} instruction='For each user:'/>
            <StepInstruction stepNumber={"4."} instruction='Select the user'/>
            <StepInstruction stepNumber={"5."} instruction='Click on the **Permissions** tab'/>
            <StepInstruction stepNumber={"6."} instruction='Expand **Managed Policies**'/>
            <StepInstruction stepNumber={"7."} instruction='Click **Detach Policy** for each policy'/>
            <StepInstruction stepNumber={"8."} instruction='Expand **Inline Policies**'/>
            <StepInstruction stepNumber={"9."} instruction='Click **Remove Policy** for each policy'/>
        </>  
    )

}