import { TableRow } from "../../Shared/Table";
import {TextWithTooltip, TextWithTooltipIcon } from "../../Shared/TextWithTooltip";
import {AssetModal, InlineIcon } from "../assetUtils";

export declare type VPCFields={
    id: string,
    account_id: string,
    primary_cidr_block: string,
    state: string,
    is_default: boolean,
    region: string,
    subnet_ids: string[]
}

export enum VPCHeader{
    arn="VPC",
    primary_cidr_block="Primary CIDR Block",
    state="State",
    is_default="Is Default",
    region="Region",
    subnet_ids="Subnet Ids"
}

export class VPC{
    name:string = "vpcs";

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
]

    tableColumnHeaders = [
        {
            header: VPCHeader.arn,
            accessor_key: VPCHeader.arn,
            allowSorting: false
        },
        {
            header: VPCHeader.primary_cidr_block,
            accessor_key: VPCHeader.primary_cidr_block,
            allowSorting: false
        },
        {
            header: VPCHeader.state,
            accessor_key: VPCHeader.state,
            allowSorting: false
        },
        {
            header: VPCHeader.is_default,
            accessor_key: VPCHeader.is_default,
            allowSorting: false
        },
        {
            header: VPCHeader.region,
            accessor_key: VPCHeader.region,
            allowSorting: false
        },
        {
            header: VPCHeader.subnet_ids,
            accessor_key: VPCHeader.subnet_ids,
            allowSorting: false
        },
    ]

    getAllRows(assetCategoryInfo:any){
        let allTableRows:TableRow[] = assetCategoryInfo.data.map((dataTableRow:VPCFields,idx:number)=>{
            return {
                columns: [
                    {
                        content: <TextWithTooltipIcon 
                             icon={<InlineIcon icon="/images/vpc.svg" />}
                             text={dataTableRow.id}
                             subText={dataTableRow.account_id}
                             maxTruncationLength={44}
                        />,
                        accessor_key: VPCHeader.arn,
                        value: [dataTableRow.id,dataTableRow.account_id],
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.primary_cidr_block || "Null",
                        accessor_key: VPCHeader.primary_cidr_block,
                        value: dataTableRow.primary_cidr_block || "Null",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.state || "Null",
                        accessor_key: VPCHeader.state,
                        value: dataTableRow.state || "Null",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.is_default?.toString() || "Null",
                        accessor_key: VPCHeader.is_default,
                        value: dataTableRow.is_default?.toString() || "Null",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.region || "Null",
                        accessor_key: VPCHeader.region,
                        value: dataTableRow.region || "Null",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.subnet_ids ?
                        
                        <AssetModal text={`${dataTableRow.subnet_ids.length} ` + `${dataTableRow.subnet_ids.length==1 ? "Subnet Id" : "Subnet Ids"}`}>
                                <ul>
                                    {
                                        dataTableRow.subnet_ids.map((subnet,idx)=>
                                        <li className="mb-2" key={idx}>
                                            <TextWithTooltip 
                                                 text={subnet}
                                                 maxTruncationLength={200}
                                             />
                                        </li>
                                    )}
                                </ul>      
                            </AssetModal> 
                    : "None",
                        accessor_key: VPCHeader.subnet_ids,
                        value: dataTableRow.subnet_ids || "None",
                        ignoreComponentExpansion: true
                    }
                    
                ],
                rowId: dataTableRow.id
            }
        })
        return allTableRows;
    }
}