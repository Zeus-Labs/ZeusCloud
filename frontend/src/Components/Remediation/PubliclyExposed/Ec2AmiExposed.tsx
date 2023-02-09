import { StepInstruction, NormalInstruction } from "../Instructions";

// EC2 AMIs owned by you should not be set to public
export const Ec2AmiExposed = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to implement the prescribed state:"/>
            <StepInstruction stepNumber={"1."} instruction='Log in to the AWS Management Console
            at https://console.aws.amazon.com/.'/>

            <StepInstruction stepNumber={"2."} instruction='Open the Amazon EC2 console.'/>
            <StepInstruction stepNumber={"3."} instruction='Go to the Navigation pane, 
            under **IMAGES** section, choose **AMIs**.'/>
            <StepInstruction stepNumber={"4."} instruction='Select the AMI that you want to make private.'/>
            <StepInstruction stepNumber={"5."} instruction='Go to the 
            **Permissions** tab from the dashboard bottom panel and click **Edit** to update the selected image launch permissions.'/>
            <StepInstruction stepNumber={"6."} instruction='In the Modify Image Permissions dialog box, 
            select Private then click **Save**.'/>
        </>  
    )

}