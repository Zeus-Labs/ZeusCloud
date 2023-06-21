import { TableRow } from "../../Shared/Table";
import {TextWithTooltip, TextWithTooltipIcon } from "../../Shared/TextWithTooltip";
import CrownElement from "../CrownElement";
import {AssetModal, convertDateFormat, InlineIcon } from "../assetUtils";

export declare type KmsKeyFields={
    node_id: number,
    id: string,
    account_id: string,
    creation_date: string,
    enabled: boolean,
    is_crown_jewel:boolean,
}

export enum KmsKeyHeader{
    arn="KMS Key",
    creation_date="Creation Date",
    enabled="Enabled",
    crown_jewel = "Crown Jewel"
}

export class KMSKey{
    name:string = "kmsKeys";

    tableHeaderCSS = 
    [{
        "headerClassName": "w-1/2 px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900 sm:pl-6",
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
            header: KmsKeyHeader.arn,
            accessor_key: KmsKeyHeader.arn,
            allowSorting: false
        },
        {
            header: KmsKeyHeader.creation_date,
            accessor_key: KmsKeyHeader.creation_date,
            allowSorting: false
        },
        {
            header: KmsKeyHeader.enabled,
            accessor_key: KmsKeyHeader.enabled,
            allowSorting: false
        },
        {
            header: KmsKeyHeader.crown_jewel,
            accessor_key: KmsKeyHeader.crown_jewel,
            allowSorting: false
        },
    ]

    getAllRows(assetCategoryInfo:any){
        let allTableRows:TableRow[] = assetCategoryInfo.data.map((dataTableRow:KmsKeyFields,idx:number)=>{
            return {
                columns: [
                    {
                        content: <TextWithTooltipIcon 
                             icon={<InlineIcon icon="/images/kms.svg" />}
                             text={dataTableRow.id}
                             subText={dataTableRow.account_id}
                             maxTruncationLength={44}
                        />,
                        accessor_key: KmsKeyHeader.arn,
                        value: [dataTableRow.id,dataTableRow.account_id],
                        ignoreComponentExpansion: true
                    },
                    {
                        content: convertDateFormat(dataTableRow.creation_date),
                        accessor_key: KmsKeyHeader.creation_date,
                        value: convertDateFormat(dataTableRow.creation_date),
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.enabled?.toString() || "Null",
                        accessor_key: KmsKeyHeader.enabled,
                        value: dataTableRow.enabled?.toString() || "Null",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: <CrownElement 
                        isCrownJewel={dataTableRow.is_crown_jewel ?? false}
                        nodeId={dataTableRow.node_id}
                        />,
                        accessor_key: KmsKeyHeader.crown_jewel,
                        value: "",
                        ignoreComponentExpansion: true
                    }
                ],
                rowId: dataTableRow.id
            }
        })
        return allTableRows;
    }
}