const labelInfoMap: { [label: string]: { [dataType :string] : string } } = {
    "AccountPasswordPolicy": {
        "display": "Account Password Policy",
        "image": "/images/account-password-policy.svg",
        "category": "IAM",
    },
    "AWSAccount": {
        "display": "AWS Account",
        "image": "/images/aws-account.svg",
        "category": "IAM",
    },
    "AWSGroup": {
        "display": "IAM Group",
        "image": "/images/iam-group.svg",
        "category": "IAM",
    },
    "AWSRegion": {
        "display": "AWS Region",
        "image": "/images/region.svg",
        "category": "Network",
    },
    "AWSPolicy": {
        "display": "IAM Policy",
        "image": "/images/iam-policy.svg",
        "category": "IAM",
    },
    "AWSPrincipal": {
        "display": "IAM Principal",
        "image": "/images/aws-principal.svg",
        "category": "IAM",
    },
    "AWSUser": {
        "display": "IAM User",
        "image": "/images/iam-user.svg",
        "category": "IAM",
    },
    "AWSRole": {
        "display": "IAM Role",
        "image": "/images/iam-role.svg",
        "category": "IAM",
    },
    "AWSVpc": {
        "display": "AWS VPC",
        "image": "/images/vpc.svg",
        "category": "Network",
    },
    "CloudTrail": {
        "display": "CloudTrail Trail",
        "image": "/images/cloudtrail.svg",
        "category": "Security",
    },
    "EC2Image": {
        "display": "EC2 Image",
        "image": "/images/ec2-image.svg",
        "category": "Compute",
    },
    "EC2Instance": {
        "display": "EC2 Instance",
        "image": "/images/aws-ec2.svg",
        "category": "Compute",
    },
    "EC2SecurityGroup": {
        "display": "Security Group",
        "image": "/images/security-group.svg",
        "category": "Network",
    },
    "EBSVolume": {
        "display": "EBS Volume",
        "image": "/images/ebs-volume.svg",
        "category": "Storage",
    },
    "EBSSnapshot": {
        "display": "EBS Snapshot",
        "image": "/images/snapshot.svg",
        "category": "Storage",
    },
    "ElasticIPAddress": {
        "display": "Elastic IP Address",
        "image": "/images/ip.svg",
        "category": "Network",
    },
    "ESDomain": {
        "display": "ES Domain",
        "image": "/images/es-domain.svg",
        "category": "Storage",
    },
    "KMSKey": {
        "display": "KMS Key",
        "image": "/images/kms.svg",
        "category": "Security",
    },
    "AWSLambda": {
        "display": "AWS Lambda",
        "image": "/images/lambda-function.svg",
        "category": "Compute",
    },
    "IpRange": {
        "display": "IP Range",
        "image": "/images/ip.svg",
        "category": "Network",
    },
    "LoadBalancerV2": {
        "display": "Load Balancer V2",
        "image": "/images/elastic-load-balancer.svg",
        "category": "Network",
    },
    "RDSInstance": {
        "display": "RDS Instance",
        "image": "/images/rds.svg",
        "category": "Storage",
    },
    "S3Bucket": {
        "display": "S3 Bucket",
        "image": "/images/s3-bucket.svg",
        "category": "Storage",
    },
    "SecretsManagerSecret": {
        "display": "Secrets Manager Secret",
        "image": "/images/secret.svg",
        "category": "Security",
    },
    "ServerCertificate": {
        "display": "Server Certificate",
        "image": "/images/certificate.svg",
        "category": "Security",
    },
    "SQSQueue": {
        "display": "SQS Queue",
        "image": "/images/sqs-queue.svg",
        "category": "Storage",
    }
};

export function labelDisplay(label: string): string {

    if (label in labelInfoMap) {
        return labelInfoMap[label]["display"]
    }
    return label
}

export function labelImage(label: string): string {

    if (label in labelInfoMap) {
        return labelInfoMap[label]["image"]
    }
    // TODO: Put a default image
    return "/images/question-mark.svg"
}

export function labelCategory(label: string): string {

    if (label in labelInfoMap) {
        return labelInfoMap[label]["category"]
    }
    return "IAM"
}

export const categoryToColor:{[category:string]:string}={
    "IAM": "#0000FF",
    "Storage": "#FF0000",
    "Compute": "#00CC00",
    "Network": "#FF8000",
    "Security": "#7F00FF"
}
