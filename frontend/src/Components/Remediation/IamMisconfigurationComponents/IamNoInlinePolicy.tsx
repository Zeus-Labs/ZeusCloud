import { StepInstruction, NormalInstruction } from "../Instructions";

// IAM groups, users, and roles should not have any inline policies.
export const IamNoInlinePolicy = () => {
   
    return (
        <>

            <NormalInstruction instruction="To determine if your IAM groups 
            have any inline policies attached, perform the following (you can apply
            this for IAM users and IAM roles):"/>

            <StepInstruction stepNumber={"1."} instruction='Sign in to the AWS Management Console.'/>
            <StepInstruction stepNumber={"2."} instruction='Navigate to IAM dashboard at 
            https://console.aws.amazon.com/iam/.'/>
            <StepInstruction stepNumber={"3."} instruction='In the left navigation panel, choose **Groups**.'/>
            <StepInstruction stepNumber={"4."} instruction='Select the IAM group that has inline policies 
            attached (see Audit section) and click on the group name to access its configuration page.'/>
            <StepInstruction stepNumber={"5."} instruction='On the IAM group configuration page, 
            select the **Permissions** tab.'/>
            <StepInstruction stepNumber={"6."} instruction='Inside **Inline Policies** section, 
            click on each **Show Policy** link and copy each policy document displayed in a text file. 
            Once all the available policies are copied, click the **Remove Policy** link for each 
            inline policy to remove them from the group configuration.'/>
            <StepInstruction stepNumber={"7."} instruction='In the left navigation panel, 
            choose **Policies** and click **Create Policy** button from the IAM dashboard top menu.'/>
            <StepInstruction stepNumber={"8."} instruction='On the **Create Policy** page, 
            select **Create Your Own Policy** to create your own managed policies using the 
            data taken from your inline policies. You can also select an AWS predefined 
            policy or create a brand new one using the AWS Policy Generator.'/>
            <StepInstruction stepNumber={"9."} instruction='On the **Review Policy** page, 
            perform the following:'/>
            <StepInstruction stepNumber={"10."} instruction='In the **Policy Name** box, 
            enter a name for your new managed policy. Choose a unique name that will 
            reflect the policy usage.'/>
            <StepInstruction stepNumber={"11."} instruction='In the **Description** textbox, 
            enter a short description for the policy (optional).'/>
            <StepInstruction stepNumber={"12."} instruction='In the Policy Document textbox,
            paste the inline policy content copied earlier.'/>
            <StepInstruction stepNumber={"13."} instruction='Click **Validate Policy** button 
            to validate the policy then click **Create Policy** to save it.'/>
            <StepInstruction stepNumber={"14."} instruction='In the left navigation panel,
            choose **Groups** and click on the selected IAM group name to access 
            its configuration page.'/>
            <StepInstruction stepNumber={"15."} instruction='On the configuration page, 
            select the **Permissions** tab and click **Attach Policy** button to attach the 
            new managed policy created earlier.'/>
            <StepInstruction stepNumber={"16."} instruction='Select Customer Managed 
            Policies from the Filter dropdown menu and select your newly created policy.'/>
            <StepInstruction stepNumber={"17."} instruction='Click **Attach Policy** to attach
            the selected policy to your IAM group.'/>
        </>  
    )

}