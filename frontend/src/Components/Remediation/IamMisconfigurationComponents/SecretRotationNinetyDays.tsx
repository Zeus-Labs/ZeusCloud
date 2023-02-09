import { StepInstruction, NormalInstruction } from "../Instructions";

// Secret manager secrets should be configured to and should 
// successfully rotate within 90 days.
export const SecretRotationNinetyDays = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to setup:"/>

            <StepInstruction stepNumber={"1."} instruction='Sign in to AWS Management Console.'/>
            <StepInstruction stepNumber={"2."} instruction='Navigate to AWS Secrets Manager service 
            dashboard at https://console.aws.amazon.com/secretsmanager/.'/>
            <StepInstruction stepNumber={"3."} instruction='In the navigation panel, 
            select **Secrets**.'/>
            <StepInstruction stepNumber={"4."} instruction='Choose the secret that you 
            want to reconfigure (see Audit section part I to identify the right resource), 
            then click on its name (link) to access the secret configuration details.'/>
            <StepInstruction stepNumber={"5."} instruction='On the selected secret configuration page, 
            within **Rotation configuration** section, click **Edit rotation** to initiate the automatic rotation
            setup process.'/>
            
            
            <StepInstruction stepNumber={"6."} instruction='Inside **Edit rotation configuration** 
            dialog box, perform the following:'/>
            <StepInstruction stepNumber={"7."} instruction='Select **Enable automatic rotation** to enable the feature.'/>
            <StepInstruction stepNumber={"8."} instruction='Select a predefined (e.g. 30, 60, 90 days) or a custom value 
            for the rotation interval from the **Select rotation interval** dropdown list.'/>
            <StepInstruction stepNumber={"9."} instruction='Select **Create a new Lambda function
            to perform rotation** option to create your own custom Lambda function for rotation or select 
            **Use an existing Lambda function to perform rotation** to implement an AWS Lambda function that you have 
            previously created for rotating this type of secret.' />
            <StepInstruction stepNumber={"10."} instruction='Click **Save** to apply the changes. 
            Once enabled, the Secrets Manager console should display the following confirmation message:
            "**Your secret <secret-name> has been successfully stored and secret rotation is enabled**".' />
            <StepInstruction stepNumber={"11."} instruction='Repeat steps no. 4 – 6 for each Secrets Manager secret
            that you want to reconfigure to use automatic rotation, available in the current AWS region.' />
        </>  
    )

}