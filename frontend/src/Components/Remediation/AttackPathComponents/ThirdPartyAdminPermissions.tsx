import { NormalInstruction } from "../Instructions"
import { StepInstruction } from "../Instructions"

export const ThirdPartyAdminPermissions = () => {
    return <>
        <NormalInstruction instruction="Perform the following steps."/>

        <StepInstruction stepNumber={"1."} instruction="Check the highlighted relevant role's 
        trust policy with the external parties account. "/>

        <StepInstruction stepNumber={"2."} instruction="A few steps can be taken once the
        risky role and it's trust policy have been discovered."/>

        <StepInstruction stepNumber={"3."} instruction="Remove the relevant role if it is unused or unnecessary."/>

        <StepInstruction stepNumber={"4."} instruction="Consider limiting the permissions of the role's associated
        policy."/>
    </>


}