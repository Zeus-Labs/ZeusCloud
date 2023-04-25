import { parseArn } from "../../AssetsInventory/assetUtils";


type PrivilegeEscalationProps={
    relationshipReason: string,
    targetNodeArn: string
}



export function PrivilegeEscalationInfoDisplay({relationshipReason,targetNodeArn}:PrivilegeEscalationProps){
    let permissions="";
    let command = "";

    switch(relationshipReason){
        case "PASS_ROLE_TO_CLOUDFORMATION_THROUGH_CREATE_STACK":
            permissions="iam:PassRole and cloudformation:CreateStack"
            command = `aws cloudformation create-stack --stack-name [INSERT_STACK] --template-url [INSERT_TEMPLATE_URL] --role-arn ${targetNodeArn}`
            break;
        case "PASS_ROLE_TO_CLOUDFORMATION_THROUGH_UPDATE_STACK":
            permissions = "iam:PassRole and cloudformation:UpdateStack"
            command = `aws cloudformation update-stack --stack-name [INSERT_STACK] --template-url [INSERT_TEMPLATE_URL] --role-arn ${targetNodeArn}`
            break;
        case "PASS_ROLE_TO_CLOUDFORMATION_THROUGH_CREATE_FUNCTION":
            permissions = "iam:PassRole and lambda:CreateFunction"
            command = `aws lambda create-function --function-name [INSERT_FUNCTION_NAME] --runtime [FUNCTION_RUNTIME_IDENTIFIER] --role ${targetNodeArn} --handler [INSERT_FILE_NAME] --zipfile [INSERT_PATH_TO_THE_ZIP_FILE]`
            break;
        case "PASS_ROLE_TO_CLOUDFORMATION_THROUGH_UPDATE_FUNCTION_CODE":
            permissions = "iam:PassRole and lambda:UpdateFunctionCode"
            command = `aws lambda update-function-code –-function-name [INSERT_TARGET_FUNCTION_NAME] –-zip-file [INSERT_PATH_TO_MODIFIED_FILE]`
            break;
        case "UPDATE_ASSUME_ROLE_POLICY":
            permissions="iam:UpdateAssumeRolePolicy and sts:AssumeRole"
            command = `aws iam update-assume-role-policy –-role-name ${parseArn(targetNodeArn)[0]} –-policy-document [INSERT_UPDATED_POLICY_DOC_PATH]`
            break;
        case "CREATE_OR_UPDATE_LOGIN_PROFILE":
            permissions = "iam:UpdateLoginProfile and iam:CreateLoginProfile"
            command = `aws iam create-login-profile/update-login-profile --user-name ${parseArn(targetNodeArn)[0]} --password [INSERT_NEW_PASSWORD]! --no-password-reset-require`
            break;
        case "CREATE_ACCESS_KEY":
            permissions="iam:CreateAccessKey"
            command = `aws iam create-access-key --user-name ${parseArn(targetNodeArn)[0]}`
            break;
        case "ADD_USER_TO_GROUP":
            permissions="iam:AddUserToGroup"
            command = `aws iam add-user-to-group –-group-name ${parseArn(targetNodeArn)[0]} –-user-name [INSERT_ATTACKER'S_USERNAME]`
            break;
        case "PASS_ROLE_TO_EC2_THROUGH_RUN_INSTANCES":
            permissions="iam:PassRole and ec2:RunInstances"
            command = `aws ec2 run-instances --image-id [INSERT_IMAGE_ID] --instance-type [INSERT_INSTANCE_TYPE]
            --iam-instance-profile Name=${parseArn(targetNodeArn)[0]} --key-name [INSERT_KEY_NAME] --security-group-ids [INSERT_SECURITY_GROUP]`
            break;
        default:
            permissions="None"
            command="None"
    }
    return (
        <div>
            <div className="mb-3">A privilege escalation is possible using the <b>{permissions}</b></div>
            <div className="mb-2">Here's an example command you could run:</div>
            <div className="bg-black text-white p-3 rounded-md">
                <div className="max-w-[60%] tracking-wide">{command}</div>
            </div>
        </div>
    )
}