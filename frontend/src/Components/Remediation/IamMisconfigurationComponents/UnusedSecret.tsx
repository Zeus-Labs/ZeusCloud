import ReactMarkdown from "react-markdown";
import { StepInstruction, NormalInstruction } from "../Instructions";

// Unused secret manager secrets should be removed.
export const UnusedSecret = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to delete secrets that are
            unused:"/>

            <StepInstruction stepNumber={"1."} instruction='Open the Secrets Manager 
            console on the AWS Console'/>
            <StepInstruction stepNumber={"2."} instruction='To locate the secret, 
            enter the secret name in the search box.'/>
            <StepInstruction stepNumber={"3."} instruction='Choose the secret to delete.'/>
            <StepInstruction stepNumber={"4."} instruction='Under **Secret details**,from Actions,
            choose **Delete secret**.'/>
            <StepInstruction stepNumber={"5."} instruction='Under **Schedule secret deletion**,
            enter the number of days to wait before the secret is deleted.'/>
            <StepInstruction stepNumber={"6."} instruction='Choose **Schedule deletion**.'/>

 
        </>  
    )

}