import { TableRow } from "../../Shared/Table";
import {TextWithTooltip, TextWithTooltipIcon } from "../../Shared/TextWithTooltip";
import CrownElement from "../CrownElement";
import {AssetModal, convertDateFormat, InlineIcon } from "../assetUtils";

export declare type RDSInstanceFields={
    node_id: number
    arn: string,
    account_id: string,
    user_identifier: string,
    availability_zone: string,
    endpoint_address: string,
    endpoint_port: number
    engine: string,
    create_time:string,
    publicly_accessible:boolean,
    storage_encrypted:boolean
    is_crown_jewel:boolean,
}

export enum RDSInstanceHeader{
    arn="RDS Instance",
    availability_zone="Availaibility Zone",
    endpoint_address="Enpoint Address",
    endpoint_port="Endpoint Port",
    engine="Engine",
    create_date="Created Date",
    publicly_accessible="Publicly Accessible",
    storage_encrypted="Storage Encrypted",
    crown_jewel = "Crown Jewel"
}

export class RDSInstance{
    name:string = "rdsInstances";

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
            header: RDSInstanceHeader.arn,
            accessor_key: RDSInstanceHeader.arn,
            allowSorting: false
        },
        {
            header: RDSInstanceHeader.availability_zone,
            accessor_key: RDSInstanceHeader.availability_zone,
            allowSorting: false
        },
        {
            header: RDSInstanceHeader.endpoint_address,
            accessor_key: RDSInstanceHeader.endpoint_address,
            allowSorting: false
        },
        {
            header: RDSInstanceHeader.endpoint_port,
            accessor_key: RDSInstanceHeader.endpoint_port,
            allowSorting: false
        },
        {
            header: RDSInstanceHeader.engine,
            accessor_key: RDSInstanceHeader.engine,
            allowSorting: false
        },
        {
            header: RDSInstanceHeader.create_date,
            accessor_key: RDSInstanceHeader.create_date,
            allowSorting: false
        },
        {
            header: RDSInstanceHeader.publicly_accessible,
            accessor_key: RDSInstanceHeader.publicly_accessible,
            allowSorting: false
        },
        {
            header: RDSInstanceHeader.storage_encrypted,
            accessor_key: RDSInstanceHeader.storage_encrypted,
            allowSorting: false
        },
        {
            header: RDSInstanceHeader.crown_jewel,
            accessor_key: RDSInstanceHeader.crown_jewel,
            allowSorting: false
        }
    ]

    getAllRows(assetCategoryInfo:any){
        let allTableRows:TableRow[] = assetCategoryInfo.data.map((dataTableRow:RDSInstanceFields,idx:number)=>{
            return {
                columns: [
                    {
                        content: <TextWithTooltipIcon 
                             icon={<InlineIcon icon="/images/rds.svg" />}
                             text={dataTableRow.user_identifier}
                             subText={dataTableRow.account_id}
                             maxTruncationLength={44}
                        />,
                        accessor_key: RDSInstanceHeader.arn,
                        value: dataTableRow.arn,
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.availability_zone || "Null",
                        accessor_key: RDSInstanceHeader.availability_zone,
                        value: dataTableRow.availability_zone || "Null",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: <TextWithTooltip text={dataTableRow.endpoint_address} maxTruncationLength={44} />,
                        accessor_key: RDSInstanceHeader.endpoint_address,
                        value: dataTableRow.endpoint_address,
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.endpoint_port || "Null",
                        accessor_key: RDSInstanceHeader.endpoint_port,
                        value: dataTableRow.endpoint_port.toString() || "Null",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.engine || "Null",
                        accessor_key: RDSInstanceHeader.engine,
                        value: dataTableRow.engine || "Null",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: convertDateFormat(dataTableRow.create_time),
                        accessor_key: RDSInstanceHeader.create_date,
                        value: convertDateFormat(dataTableRow.create_time),
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.publicly_accessible?.toString() || "Null",
                        accessor_key: RDSInstanceHeader.publicly_accessible,
                        value: dataTableRow.publicly_accessible?.toString() || "Null",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.storage_encrypted?.toString() || "Null",
                        accessor_key: RDSInstanceHeader.storage_encrypted,
                        value: dataTableRow.storage_encrypted?.toString() || "Null",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: <CrownElement 
                        isCrownJewel={dataTableRow.is_crown_jewel || false}
                        nodeId={dataTableRow.node_id}
                        />,
                        accessor_key: RDSInstanceHeader.crown_jewel,
                        value: "",
                        ignoreComponentExpansion: true
                    }
                    
                    
                ],
                rowId: dataTableRow.arn
            }
        })
        return allTableRows;
    }
}