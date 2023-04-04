import { TableRow } from "../Shared/Table";
import { EC2Instance } from "./Compute/EC2Intsance";
import { LambdaFunction } from "./Compute/LambdaFunctions";
import { IAMGroups } from "./IAM/IAM_groups";
import { IAMPolicies } from "./IAM/IAM_policies";
import { IAMRoles } from "./IAM/IAM_roles";
import { IAMUsers } from "./IAM/IAM_users";
import { ELBV2 } from "./Network/ELBV2";
import { InternetGateway } from "./Network/InternetGateway";
import { SecurityGroup } from "./Network/SecurityGroup";
import { VPC } from "./Network/VPC";
import { KMSKey } from "./Security/KMSKeys";
import { RDSInstance } from "./Storage/RDSInstance";
import { S3Bucket } from "./Storage/S3Bucket";

export enum assetCategoryMap {
    iamUsers= "IAM Users",
    iamGroups= "IAM Groups",
    iamRoles = "IAM Roles",
    iamPolicies= "IAM Policies",
    ec2Instances = "EC2 Instances",
    lambdaFunctions = "Lambda Functions",
    vpcs = "VPCs",
    securityGroups = "Security Groups",
    internetGateways = "Internet Gateways",
    elasticLoadBalancersV2 = "Elastic Load Balancers V2",
    rdsInstances = "RDS Instances",
    s3Buckets = "S3 Buckets",
    kmsKeys = "KMS Keys"
}

export const assetToObjects = {
    iamRoles: new IAMRoles(),
    iamUsers: new IAMUsers(),
    iamPolicies: new IAMPolicies(),
    iamGroups: new IAMGroups(),
    ec2Instances: new EC2Instance(),
    lambdaFunctions: new LambdaFunction(),
    s3Buckets: new S3Bucket(),
    vpcs: new VPC(),
    internetGateways: new InternetGateway(),
    securityGroups: new SecurityGroup(),
    elasticLoadBalancersV2: new ELBV2(),
    kmsKeys: new KMSKey(),
    rdsInstances: new RDSInstance()
}

export interface AssetCategoryInterface{
    name:string,
    tableHeaderCSS : Record<string,string>[],
    tableColumnHeaders: {
        header: string,
        accessor_key: string,
        allowSorting: boolean
    }[],
    getAllRows(assetCategoryInfo:any,setAssetCategory?:React.Dispatch<React.SetStateAction<string>>,
        setSearchFilter?:React.Dispatch<React.SetStateAction<string>>) : TableRow[],

}

export default assetCategoryMap;