import ReactMarkdown from "react-markdown";
import { StepInstruction, NormalInstruction } from "../Instructions";

//  Ensure IAM policies that allow full "*:*" administrative privileges
// are not created
export const IamPolicyNotAdmin = () => {
    return (
        <>
            <NormalInstruction instruction="Perform the following to determine what policies are created:"/>
            <StepInstruction stepNumber={"1. Run the following to get a list of IAM policies:"} instruction=''/>
            <ReactMarkdown className="markdown markdown_blockquote">{        
    `
    aws iam list-policies --output text
    `
        }
            </ReactMarkdown>

            <StepInstruction stepNumber={"2."} instruction='For each policy returned, run the following command to determine if any policies is
allowing full administrative privileges on the account:'/>
            <ReactMarkdown className="markdown markdown_blockquote">{        
    `
    aws iam get-policy-version 
    --policy-arn <policy_arn> --version-id <version>
    `
        }
            </ReactMarkdown>

            <StepInstruction stepNumber={"3."} instruction='In output ensure policy 
            should not have any Statement block with **"Effect": "Allow"** and **Action** set to 
            **"*"** and **Resource** set to **"*"**'/>


            <NormalInstruction instruction="Using the GUI, perform the following 
            to detach the policy that has full administrative privileges:"/>
            <StepInstruction stepNumber={"1."} instruction='Sign in to the AWS Management Console and 
            open the IAM console at https://console.aws.amazon.com/iam/.'/>
            <StepInstruction stepNumber={"2."} instruction='In the navigation pane, 
            click Policies and then search for the policy name found with administrative privileges.'/>
            <StepInstruction stepNumber={"3."} instruction='Select the policy 
            that needs to be deleted.'/>
            <StepInstruction stepNumber={"4."} instruction='In the policy action menu, 
            select first **Detach**'/>
            <StepInstruction stepNumber={"5."} instruction="Select all Users, Groups,
            Roles that have this policy attached"/>
            <StepInstruction stepNumber={"6."} instruction='Click **Detach Policy**'/>
            <StepInstruction stepNumber={"7."} instruction='In the policy action menu, 
            select **Detach**'/>
        </>  
    )

}