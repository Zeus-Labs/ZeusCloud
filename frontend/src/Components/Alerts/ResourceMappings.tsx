type graphResourceMapType={
    [label:string]: {category:string,image:string}
}


export const graphResourceMap:graphResourceMapType={
    "AWS Account": {category:"IAM",image:"/images/aws-account.svg"},
    "AWS Principal":{category:"IAM",image:"/images/aws-principal.svg"},
    "AWS Role": {category:"IAM", image:"/images/iam-role.svg"},
    "Ip Range": {category:"Network",image:"/images/ip.svg"},
    "Security Group": {category:"Network", image:"/images/security-group.svg"},
    "EC2 Instance": {category:"Compute",image:"/images/aws-ec2.svg"},
    "Load Balancer": {category:"Network",image:"/images/elastic-load-balancer.svg"}
}

export const categoryToColor:{[category:string]:string}={
    "IAM": "#0000FF",
    "Storage": "#FF0000",
    "Compute": "#00CC00",
    "Network": "#FF8000",
    "Security": "#7F00FF"
}

type alertsResourceMapType={
    [label:string]: {image:string}
}

export const alertsResourceImageMap:alertsResourceMapType={
    "Account Password Policy": {image:"/images/account-password-policy.svg"},
    "AWS Account": {image: "/images/aws-account.svg"},
    "IAM Group": {image: "/images/iam-group.svg"},
    "AWS Region": {image:"/images/region.svg"},
    "IAM Policy":{image:"/images/iam-policy.svg"},
    "IAM Principal": {image:"/images/aws-principal.svg"},
    "IAM User": {image:"/images/iam-user.svg"},
    "AWS VPC":{image: "/images/vpc.svg"},
    "CloudTrail Trail": {image:"/images/cloudtrail.svg"},
    "EC2 Image": {image: "/images/ec2-image.svg"},
    "EC2 Instance": {image:"/images/aws-ec2.svg"},
    "EC2 Security Group":{image: "/images/security-group.svg"},
    "EBS Volume": {image:"/images/ebs-volume.svg"},
    "EBS Snapshot": {image:"/images/snapshot.svg"},
    "Elastic IP Address": {image:"/images/ip.svg"},
    "ES Domain": {image:"/images/es-domain.svg"},
    "KMS Key": {image:"/images/kms.svg"},
    "Load Balancer V2": {image:"/images/elastic-load-balancer.svg"},
    "RDS Instance": {image:"/images/rds.svg"},
    "S3 Bucket": {image:"/images/s3-bucket.svg"},
    "Secrets Manager Secret": {image:"secret.svg"},
    "Server Certificate": {image:"certificate.svg"},
    "SQS Queue": {image: "sqs-queue.svg"}
}