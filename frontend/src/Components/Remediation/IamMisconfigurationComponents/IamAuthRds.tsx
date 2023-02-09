import { StepInstruction, NormalInstruction } from "../Instructions";

// RDS instances should have IAM authentication enabled.
export const IamAuthRds = () => {
   
    return (
        <> 
            <NormalInstruction instruction="Perform the following to set 
            the RDS instance via AWS Console"/>

            <StepInstruction stepNumber={"1."} instruction='
            Open the Amazon RDS console at https://console.aws.amazon.com/rds/.'/>
            <StepInstruction stepNumber={"2."} instruction='
            In the navigation pane, choose **Databases**.'/>
            <StepInstruction stepNumber={"3."} instruction='
            Choose the DB instance that you want to modify.'/>
            <StepInstruction stepNumber={"4."} instruction='Choose Modify'/>
            <StepInstruction stepNumber={"5."} instruction='
            In the **Database authentication** section, choose **Password and IAM database
            authentication** to enable IAM database authentication.'/>
            <StepInstruction stepNumber={"6."} instruction='Choose **Continue**.'/>
            <StepInstruction stepNumber={"7."} instruction='To apply the changes **immediately**, 
            choose **Immediately** in the **Scheduling of modifications** section.'/>
            <StepInstruction stepNumber={"8."} instruction='Choose **Modify DB instance**.'/>
        </>  
    )

}