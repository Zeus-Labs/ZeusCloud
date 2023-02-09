import { StepInstruction, NormalInstruction } from "../Instructions";
import ReactMarkdown from "react-markdown";

// The number of security groups within a region should be be minimized for easier management.
export const VpcExcessiveSecurityGroup = () => {
    return (
        <>
            <NormalInstruction instruction="Perform the following to implement the prescribed state:"/>
            <StepInstruction stepNumber={"1."} instruction='Sign in to the AWS Management Console.'/>
            <StepInstruction stepNumber={"2."} instruction='Navigate to EC2 dashboard at https://console.aws.amazon.com/ec2/.'/>
            <StepInstruction stepNumber={"3."} instruction='In the navigation panel, 
            under **Network & Security** section, choose **Security Groups**.'/>
            <StepInstruction stepNumber={"4."} instruction='Select the unnecessary/obsolete 
            EC2 security group that you want to remove (regardless of the platform on which 
            this was created - EC2-VPC or EC2-Classic).'/>
            <StepInstruction stepNumber={"5."} instruction='Click the **Actions** dropdown 
            button from the dashboard top menu and select **Delete Security Group**.'/>
            <StepInstruction stepNumber={"6."} instruction='In the **Delete Security Group** dialog box,
            review the security group details (ID and name) and click **Yes**, 
            Delete to confirm the action. Once the selected security group is removed from your 
            account, the EC2 security group list is updated.'/>
        </>  
    )

}