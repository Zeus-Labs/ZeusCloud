import { navigationProps } from "../Shared/SideBarNav/sideBarUtils"

const IAMUsersNavigation=[
    {
        name: "Show Outbound Paths",
        data: "reachableFrom"
    },
    {
        name: "Show Inbound Paths",
        data: "reachableTo"
    },
]

const IAMRolesNavigation=[
    {
        name: "Show Outbound Paths",
        data: "reachableFrom"
    },
    {
        name: "Show Inbound Paths",
        data: "reachableTo"
    },
]

export const S3ActionList = [
    "s3:GetObject",
    "s3:GetObjectAcl",
    "s3:GetBucketAcl",
    "s3:GetBucketPolicy",
    "s3:GetLifecycleConfiguration",
    "s3:ListBucket",
    "s3:ListBucketVersions",
    "s3:PutObject",
    "s3:PutObjectAcl",
    "s3:PutBucketAcl",
    "s3:PutBucketPolicy",
    "s3:PutLifecycleConfiguration",
    "s3:DeleteObject",
    "s3:DeleteBucket",
    "s3:DeleteBucketPolicy"
]

// const S3BucketNavigation = [
//     {
//         name: <div><span>Show how IAM Principals can effectively perform</span> <span></span>  <span>on this S3 Bucket</span></div>,
//         data:"reachableAction",
//     }
// ]

const EC2Navigation = [
    {
        name: "Show Outbound Paths",
        data: "reachableFrom"
    },
    // {
    //     name: "Show how IAM Principals can effectively perform these [AWS actions] on the [selected__resource]",
    //     children:[
    //         {name: "Launching the instance"},
    //         {name: "Stopping the instance"},
    //     ]
    // }
]



export const exploreNavMap:{[category:string]:{
    name:React.ReactNode,
    data?:string,
    children?:{name:string,data?:string}[]
}[]} = {
    "iamUsers": IAMUsersNavigation,
    "iamRoles": IAMRolesNavigation,
    "ec2Instances": EC2Navigation,
    "": []
}

export const assetsImageMap:{[category:string]:string}={
    "iamUsers": "/images/iam-user.svg",
    "iamRoles": "/images/iam-role.svg",
    "s3Buckets": "/images/s3-bucket.svg",
    "ec2Instances": "/images/aws-ec2.svg",
}

export const AutoCompleteInlineIcon = ({ icon }: {icon:string}) => {
    return <img className="pr-1 mr-0 w-5" style={{filter:"invert(1)"}} src={icon} />
}