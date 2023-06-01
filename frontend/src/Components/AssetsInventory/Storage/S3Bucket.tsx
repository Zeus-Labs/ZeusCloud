import { TableRow } from "../../Shared/Table";
import {TextWithTooltipIcon } from "../../Shared/TextWithTooltip";
import CrownElement from "../CrownElement";
import { InlineIcon } from "../assetUtils";

export declare type S3BucketFields={
    node_id: number
    name: string,
    account_id: string,
    region: string,
    default_encryption: boolean,
    versioning_status: string,
    mfa_delete: string,
    is_crown_jewel:boolean,
}

export enum S3BucketHeader{
    arn="S3 Bucket",
    region="Region",
    default_encryption = "Default Encryption",
    versioning_status = "Versioning Status",
    mfa_delete = "MFA Delete",
    crown_jewel = "Crown Jewel"
}

export class S3Bucket{
    name:string = "s3Buckets";

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
    }
]

    tableColumnHeaders = [
        {
            header: S3BucketHeader.arn,
            accessor_key: S3BucketHeader.arn,
            allowSorting: false
        },
        {
            header: S3BucketHeader.region,
            accessor_key: S3BucketHeader.region,
            allowSorting: false
        },
        {
            header: S3BucketHeader.default_encryption,
            accessor_key: S3BucketHeader.default_encryption,
            allowSorting: false
        },
        {
            header: S3BucketHeader.versioning_status,
            accessor_key: S3BucketHeader.versioning_status,
            allowSorting: false
        },
        {
            header: S3BucketHeader.mfa_delete,
            accessor_key: S3BucketHeader.mfa_delete,
            allowSorting: false
        },
        {
            header: S3BucketHeader.crown_jewel,
            accessor_key: S3BucketHeader.crown_jewel,
            allowSorting: false
        }
    ]

    getAllRows(assetCategoryInfo:any){
        let allTableRows:TableRow[] = assetCategoryInfo.data.map((dataTableRow:S3BucketFields,idx:number)=>{
            return {
                columns: [
                    {
                        content: <TextWithTooltipIcon 
                             icon={<InlineIcon icon="/images/s3-bucket.svg" />}
                             text={dataTableRow.name}
                             subText={dataTableRow.account_id}
                             maxTruncationLength={44}
                        />,
                        accessor_key: S3BucketHeader.arn,
                        value: [dataTableRow.name,dataTableRow.account_id],
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.region || "Null",
                        accessor_key: S3BucketHeader.region,
                        value: dataTableRow.region || "Null",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.default_encryption?.toString() || "Null",
                        accessor_key: S3BucketHeader.default_encryption,
                        value: dataTableRow.default_encryption?.toString() || "Null",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.versioning_status || "Null",
                        accessor_key: S3BucketHeader.versioning_status,
                        value: dataTableRow.versioning_status || "Null",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.mfa_delete || "Null",
                        accessor_key: S3BucketHeader.mfa_delete,
                        value: dataTableRow.mfa_delete || "Null",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: <CrownElement 
                        isCrownJewel={dataTableRow.is_crown_jewel || false}
                        nodeId={dataTableRow.node_id}
                        />,
                        accessor_key: S3BucketHeader.crown_jewel,
                        value: "",
                        ignoreComponentExpansion: true
                    }
                    
                ],
                rowId: dataTableRow.name
            }
        })
        return allTableRows;
    }
}