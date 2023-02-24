import { NormalInstruction } from "../Instructions"
import { StepInstruction } from "../Instructions"

export const PubliclyExposedServerlessPrivilegeEscalation = () => {
    return <>
    <NormalInstruction instruction="Perform the following steps."/>

    <StepInstruction stepNumber={"1."} instruction="Check the role 
    associated with your publicly exposed serverless functions. An attacker can leverage the 
    role to escalate privileges to conduct an attack."/>

    <StepInstruction stepNumber={"2."} instruction="For the role, reduce the scope of the
    permissions in the associated policies. Avoid wildcard privileges."/>
</>

}