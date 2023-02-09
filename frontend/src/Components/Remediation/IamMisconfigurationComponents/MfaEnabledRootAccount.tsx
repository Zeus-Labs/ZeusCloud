import { StepInstruction, NormalInstruction } from "../Instructions";

// MFA should be enabled for the root account.
export const MfaEnabledRootAccount = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to establish MFA for the root account:"/>

            <StepInstruction stepNumber={"1."} instruction='Sign in to the AWS Management Console and open the IAM console at
https://console.aws.amazon.com/iam/.'/>
            <StepInstruction stepNumber={"2."} instruction='Choose **Dashboard**, and under Security Status, expand Activate MFA on your root
account.'/>
            <StepInstruction stepNumber={"3."} instruction='Choose **Activate MFA**'/>
            <StepInstruction stepNumber={"4."} instruction='In the wizard, choose **A virtual MFA device** and then choose
            **Next Step**.'/>
            <StepInstruction stepNumber={"5."} instruction=" IAM generates and displays configuration information 
            for the virtual MFA device, including a QR code graphic. The graphic is a representation of the 
            \'secret configuration key\' that is available for manual entry on devices that do not 
            support QR codes."/>
            <StepInstruction stepNumber={"6."} instruction='Open your virtual MFA application. 
            (For a list of apps that you can use for hosting virtual MFA devices, see Virtual 
            MFA Applications.) If the virtual MFA application supports multiple accounts 
            (multiple virtual MFA devices), choose the option to create a new account 
            (a new virtual MFA device).'/>
            <StepInstruction stepNumber={"7."} instruction='Determine whether the MFA app supports 
            QR codes, and then do one of the following:'/>
            <StepInstruction stepNumber={"8."} instruction="Either: Use the app to scan the QR code. For example, you might choose the camera icon or
            choose an option similar to Scan code, and then use the device's camera to scan the
            code"/>
            <StepInstruction stepNumber={"9."} instruction="Or: In the Manage MFA Device wizard, 
            choose Show secret key for manual configuration, and then type the secret 
            configuration key into your MFA application"/>
            <StepInstruction stepNumber={"10."} instruction="When you are finished, 
            the virtual MFA device starts generating one-time passwords."/>


        </>  
    )

}