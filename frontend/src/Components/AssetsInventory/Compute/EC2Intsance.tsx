import { TableRow } from "../../Shared/Table";
import { TextWithTooltip, TextWithTooltipIcon } from "../../Shared/TextWithTooltip";
import CrownElement from "../CrownElement";
import { AssetModal, AssetsModalWrapper, convertDateFormat, formatDateAgo, InlineIcon, parseArn } from "../assetUtils";

export declare type EC2Fields={
    node_id: number,
    instance_id: string,
    account_id: string,
    launch_time: string,
    state: string,
    publicly_exposed: string,
    iam_roles: string[],
    key_pairs: string[],
    vpc: string,
    region:string,
    is_crown_jewel:boolean,
}

export enum EC2Header{
    instance_id = "EC2 Instance",
    launch_time = "Launch Time",
    state = "State",
    publicly_exposed="Publicly Exposed",
    iam_roles = "IAM Roles",
    key_pairs = "Key Pairs",
    vpc = "VPC",
    region = "Region",
    crown_jewel = "Crown Jewel"
}

export class EC2Instance{
    name:string = "ec2Instances";

    tableHeaderCSS = 
    [{
        "headerClassName": "px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900 sm:pl-6",
        "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
        "chevronClassName": "h-5 w-5",
    },
    {
        "headerClassName": "px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
        "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
        "chevronClassName": "invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
    },
    {
        "headerClassName": "px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
        "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
        "chevronClassName": "invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
    },
    {
        "headerClassName": "px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
        "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
        "chevronClassName": "h-5 w-5",
    },
    {
        "headerClassName": "px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
        "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
        "chevronClassName": "invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
    },
    {
        "headerClassName": "px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
        "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
        "chevronClassName": "invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
    },
    {
        "headerClassName": "px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
        "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
        "chevronClassName": "invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
    },
    {
        "headerClassName": "px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
        "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
        "chevronClassName": "invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
    },
    {
        "headerClassName": "px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
        "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
        "chevronClassName": "invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
    }
]

    tableColumnHeaders = [
        {
            header: EC2Header.instance_id,
            accessor_key: EC2Header.instance_id,
            allowSorting: false
        },
        {
            header: EC2Header.launch_time,
            accessor_key: EC2Header.launch_time,
            allowSorting: false
        },
        {
            header: EC2Header.state,
            accessor_key: EC2Header.state,
            allowSorting: false
        },
        {
            header: EC2Header.publicly_exposed,
            accessor_key: EC2Header.publicly_exposed,
            allowSorting: false
        },
        {
            header: EC2Header.iam_roles,
            accessor_key: EC2Header.iam_roles,
            allowSorting: false
        },
        {
            header: EC2Header.key_pairs,
            accessor_key: EC2Header.key_pairs,
            allowSorting: false
        },
        {
            header: EC2Header.vpc,
            accessor_key: EC2Header.vpc,
            allowSorting: false
        },
        {
            header: EC2Header.region,
            accessor_key: EC2Header.region,
            allowSorting: false
        },
        {
            header: EC2Header.crown_jewel,
            accessor_key: EC2Header.crown_jewel,
            allowSorting: false
        },
    ]

    getAllRows(assetCategoryInfo:any,setAssetCategory?:any,setSearchFilter?:any){
        let allTableRows:TableRow[] = assetCategoryInfo.data.map((dataTableRow:EC2Fields,idx:number)=>{
            return {
                columns: [
                    {
                        content: <TextWithTooltipIcon 
                             icon={<InlineIcon icon="/images/aws-ec2.svg" />}
                             text={dataTableRow.instance_id}
                             subText={dataTableRow.account_id}
                             maxTruncationLength={44}
                        />,
                        accessor_key: EC2Header.instance_id,
                        value: [dataTableRow.instance_id,dataTableRow.account_id],
                        ignoreComponentExpansion: true
                    },
                    {
                        content: formatDateAgo(dataTableRow.launch_time),
                        accessor_key: EC2Header.launch_time,
                        value: formatDateAgo(dataTableRow.launch_time),
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.state,
                        accessor_key: EC2Header.state,
                        value: dataTableRow.state,
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.publicly_exposed,
                        accessor_key: EC2Header.publicly_exposed,
                        value: dataTableRow.publicly_exposed,
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.iam_roles ?
                        
                        <AssetModal text={`${dataTableRow.iam_roles.length} ` + `${dataTableRow.iam_roles.length==1 ? "IAM Role" : "IAM Roles"}`}>
                                <ul>
                                    {
                                        dataTableRow.iam_roles.map((role,idx)=>
                                        <li className="mb-2" key={idx}>
                                            <AssetsModalWrapper
                                                setAssetCategory={setAssetCategory}
                                                assetCategory={"iamRoles"}
                                                setSearchFilter={setSearchFilter}
                                                searchFilter={role}
                                            >
                                                <TextWithTooltipIcon 
                                                    icon={<InlineIcon icon="/images/iam-role.svg" />}
                                                    text={parseArn(role)[0]}
                                                    subText={parseArn(role)[1]}
                                                    maxTruncationLength={200}
                                                />
                                             </AssetsModalWrapper>
                                        </li>
                                    )}
                                </ul>      
                            </AssetModal> 
                    : "None",
                        accessor_key: EC2Header.iam_roles,
                        value: dataTableRow.iam_roles || "None",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.key_pairs ?
                        
                        <AssetModal text={`${dataTableRow.key_pairs.length} ` + `${dataTableRow.key_pairs.length==1 ? "Key Pair" : "Key Pairs"}`}>
                                <ul>
                                    {
                                        dataTableRow.iam_roles.map((pair,idx)=>
                                        <li className="mb-2" key={idx}>
                                            <AssetsModalWrapper
                                                setAssetCategory={setAssetCategory}
                                                assetCategory={"kmsKeys"}
                                                setSearchFilter={setSearchFilter}
                                                searchFilter={pair}
                                            >
                                                <TextWithTooltipIcon 
                                                    text={parseArn(pair)[0]}
                                                    maxTruncationLength={200} 
                                                    icon={<InlineIcon icon="/images/kms.svg" />}     
                                                    subText={parseArn(pair)[1]}
                                                 />
                                            </AssetsModalWrapper>
                                        </li>
                                    )}
                                </ul>      
                            </AssetModal> 
                    : "None",
                        accessor_key: EC2Header.key_pairs,
                        value: dataTableRow.key_pairs || "None",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: (dataTableRow.vpc && dataTableRow.vpc!=="") ? 
                        <AssetsModalWrapper
                            setAssetCategory={setAssetCategory}
                            assetCategory={"vpcs"}
                            setSearchFilter={setSearchFilter}
                            searchFilter={dataTableRow.vpc}
                        >
                            {dataTableRow.vpc}
                        </AssetsModalWrapper> 
                        : "None",
                        accessor_key: EC2Header.vpc,
                        value: (dataTableRow.vpc && dataTableRow.vpc!=="") ? dataTableRow.vpc : "None",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.region,
                        accessor_key: EC2Header.region,
                        value: dataTableRow.region,
                        ignoreComponentExpansion: true
                    },
                    {
                        content: <CrownElement 
                        isCrownJewel={dataTableRow.is_crown_jewel ?? false}
                        nodeId={dataTableRow.node_id}
                        />,
                        accessor_key: EC2Header.crown_jewel,
                        value: "",
                        ignoreComponentExpansion: true
                    }
                ],
                rowId: dataTableRow.instance_id
            }
        })
        return allTableRows;
    }
}