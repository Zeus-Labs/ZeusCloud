import { NormalInstruction } from "../Instructions"
import { StepInstruction } from "../Instructions"

export const PubliclyExposedVmHighPermissionsCriticalCVE = () => {
    return <>
    <NormalInstruction instruction="Perform the following steps."/>

    <StepInstruction stepNumber={"1."} instruction="Check the highly privileged role 
    associated with your publicly exposed VM."/>

    <StepInstruction stepNumber={"2."} instruction="For the role, reduce the scope of the
    permissions in the associated policies. Avoid wildcard privileges."/>

    <StepInstruction stepNumber={"3."} instruction="Fix the CVE vulnerabilities associated with the resource."/>
</>

}