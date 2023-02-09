import { TextWithTooltip, TextWithTooltipIcon } from "./TextWithTooltip";

function displayType(type: string): string {
    const displayMap: { [id: string]: string; } = {};
    displayMap["AccountPasswordPolicy"] = "Account Password Policy"
    displayMap["AWSAccount"] = "AWS Account"
    displayMap["AWSGroup"] = "IAM Group"
    displayMap["AWSRegion"] = "AWS Region"
    displayMap["AWSPolicy"] = "IAM Policy"
    displayMap["AWSPrincipal"] = "IAM Principal"
    displayMap["AWSUser"] = "IAM User"
    displayMap["AWSVpc"] = "AWS VPC"
    displayMap["CloudTrail"] = "CloudTrail Trail"
    displayMap["EC2Image"] = "EC2 Image"
    displayMap["EC2Instance"] = "EC2 Instance"
    displayMap["EC2SecurityGroup"] = "EC2 Security Group"
    displayMap["EBSVolume"] = "EBS Volume"
    displayMap["EBSSnapshot"] = "EBS Snapshot"
    displayMap["ElasticIPAddress"] = "Elastic IP Address"
    displayMap["ESDomain"] = "ES Domain"
    displayMap["KMSKey"] = "KMS Key"
    displayMap["LoadBalancerV2"] = "Load Balancer V2"
    displayMap["RDSInstance"] = "RDS Instance"
    displayMap["S3Bucket"] = "S3 Bucket"
    displayMap["SecretsManagerSecret"] = "Secrets Manager Secret"
    displayMap["ServerCertificate"] = "Server Certificate"
    displayMap["SQSQueue"] = "SQS Queue"
    if (type in displayMap) {
        return displayMap[type]
    }
    return type
}

export interface ResourceDisplayProps {
    text: string;
    type: string;
    maxTruncationLength: number;
    icon?: React.ReactNode;
};

export const ResourceDisplay = ({text, type, maxTruncationLength, icon}: ResourceDisplayProps) => {
    
    var textWithToolTipNode: React.ReactNode; 
    if(icon === null) {
        textWithToolTipNode = <TextWithTooltip key={text} text={text} maxTruncationLength={maxTruncationLength}/>
    } else {
        textWithToolTipNode = <TextWithTooltipIcon key={text} text={text} maxTruncationLength={maxTruncationLength}
            icon={icon}/>
    }
    return (
        <>
            {textWithToolTipNode}
            <div className="text-gray-400">{displayType(type)}</div>
        </>
    )
}