import { StepInstruction, NormalInstruction } from "../Instructions";

// 1.2 Ensure multi-factor authentication (MFA) is enabled for all IAM
// users that have a console password
export const MfaEnabledIamPassword = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to setup:"/>

            <StepInstruction stepNumber={"1."} instruction='Sign in to the AWS Management Console
             and open the IAM console at https://console.aws.amazon.com/iam/.'/>

            <StepInstruction stepNumber={"2."} instruction='In the navigation pane, 
            choose Users.'/>
            
            <StepInstruction stepNumber={"3."} instruction='In the User Name list, 
            choose the name of the intended MFA user'/>

            <StepInstruction stepNumber={"4."} instruction='Choose the Security Credentials tab, 
            and then choose Manage MFA Device.'/>

            <StepInstruction stepNumber={"5."} instruction="In the Manage MFA Device wizard, 
            choose A virtual MFA device, and then choose Next Step. IAM generates and displays 
            configuration information for the virtual MFA device, including a QR code graphic. 
            The graphic is a representation of the 'secret configuration key' that is available
            for manual entry on devices that do not support QR codes."/>

            <StepInstruction stepNumber={"6."} instruction="Open your virtual MFA application. 
            (For a list of apps that you can use for hosting virtual MFA devices, see Virtual MFA 
            Applications.) If the virtual MFA application supports multiple accounts (multiple 
            virtual MFA devices), choose the option to create a new (a new virtual MFA device)."/>

            <StepInstruction stepNumber={"7."} instruction="Determine whether the MFA app supports 
            QR codes. Use the app to scan the QR code. For example, you might choose the camera icon or
            choose an option similar to Scan code, and then use the device's camera to scan the
            code. In the Manage MFA Device wizard, choose Show secret key for manual
            configuration, and then type the secret configuration key into your MFA application"/>
            
            <StepInstruction stepNumber={"8."} instruction="In the Manage MFA Device wizard, in the Authentication Code 1 box, type the one-time
            password that currently appears in the virtual MFA device. Wait up to 30 seconds for the
            device to generate a new one-time password. Then type the second one-time password into
            the Authentication Code 2 box. Choose Active Virtual MFA." />
        </>  
    )

}