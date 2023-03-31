import { TableRow } from "../../Shared/Table";
import { TextWithTooltip, TextWithTooltipIcon } from "../../Shared/TextWithTooltip";
import {AssetsModalWrapper, InlineIcon, parseArn } from "../assetUtils";

export declare type SecurityGroupFields={
    id: string,
    account_id: string,
    name: string
    vpc: string,
    region:string
}

export enum SecurityGroupHeader{
    arn = "Security Group",
    name = "Name",
    vpc = "VPC",
    region = "Region"
}

export class SecurityGroup{
    name:string = "securityGroups";

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
        "chevronClassName": "invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
    },
]

    tableColumnHeaders = [
        {
            header: SecurityGroupHeader.arn,
            accessor_key: SecurityGroupHeader.arn,
            allowSorting: false
        },
        {
            header: SecurityGroupHeader.name,
            accessor_key: SecurityGroupHeader.name,
            allowSorting: false
        },
        {
            header: SecurityGroupHeader.vpc,
            accessor_key: SecurityGroupHeader.vpc,
            allowSorting: false
        },
        {
            header: SecurityGroupHeader.region,
            accessor_key: SecurityGroupHeader.region,
            allowSorting: false
        },
    ]

    getAllRows(assetCategoryInfo:any,setAssetCategory:any,setSearchFilter:any){
        let allTableRows:TableRow[] = assetCategoryInfo.data.map((dataTableRow:SecurityGroupFields,idx:number)=>{
            return {
                columns: [
                    {
                        content: <TextWithTooltipIcon 
                             icon={<InlineIcon icon="/images/security-group.svg" />}
                             text={dataTableRow.id}
                             subText={dataTableRow.account_id}
                             maxTruncationLength={44}
                        />,
                        accessor_key: SecurityGroupHeader.arn,
                        value:[dataTableRow.id,dataTableRow.account_id],
                        ignoreComponentExpansion: true
                    },
                    {
                        content: <TextWithTooltip 
                                    text={dataTableRow.name}
                                    maxTruncationLength={44}    
                                />,
                        accessor_key: SecurityGroupHeader.name,
                        value: dataTableRow.name,
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
                        accessor_key: SecurityGroupHeader.vpc,
                        value: (dataTableRow.vpc && dataTableRow.vpc!=="") ? dataTableRow.vpc : "None",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.region,
                        accessor_key: SecurityGroupHeader.region,
                        value: dataTableRow.region,
                        ignoreComponentExpansion: true
                    },
                ],
                rowId: dataTableRow.id
            }
        })
        return allTableRows;
    }
}