import { NormalInstruction } from "../Instructions"
import { StepInstruction } from "../Instructions"

export const PubliclyExposedVmAdminIMDSv1Enabled = () => {
    return <>
    <NormalInstruction instruction="Perform the following steps."/>

    <StepInstruction stepNumber={"1."} instruction="Check the administrative role 
    associated with your publicly exposed VM."/>

    <StepInstruction stepNumber={"2."} instruction="For the role, reduce the scope of the
    permissions in the associated policies."/>

    <StepInstruction stepNumber={"3."} instruction="Disable IMDSv1 by enabling IMDSv2 credentials for the publicly exposed VM."/>
</>

}