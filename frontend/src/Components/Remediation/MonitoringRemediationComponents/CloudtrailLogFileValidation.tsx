import { StepInstruction, NormalInstruction } from "../Instructions";

export const CloudtrailLogFileValidation = () => {
    return (
        <>
            <NormalInstruction instruction="Perform the following to implement the prescribed state:"/>
            <StepInstruction stepNumber={"1."} instruction='Log in to the AWS Management Console
            at https://console.aws.amazon.com/.'/>
            <StepInstruction stepNumber={"2."} instruction='Open the IAM console.'/>
            <StepInstruction stepNumber={"3."} instruction='On the left navigation pane, click **Trails**.'/>
            <StepInstruction stepNumber={"4."} instruction='Select the target trail.'/>
            <StepInstruction stepNumber={"5."} instruction='Navigate to the **S3** section, click the edit icon (pencil).'/>
            <StepInstruction stepNumber={"6."} instruction='Click **Advanced**.'/>
            <StepInstruction stepNumber={"7."} instruction='In the **Enable log file validation** section, select **Yes**.'/>
            <StepInstruction stepNumber={"8."} instruction='Click **Save**.'/>
        </>  
    )

}