import { TableRow } from "../../Shared/Table";
import {TextWithTooltip, TextWithTooltipIcon } from "../../Shared/TextWithTooltip";
import {AssetModal, convertDateFormat, InlineIcon } from "../assetUtils";

export declare type ELBV2Fields={
    dns_name: string,
    account_id: string,
    name: string,
    scheme: string,
    publicly_exposed: string,
    created_time: string
    region: string,
}

export enum ELBV2Header{
    arn="Elastic Load Balancer V2",
    scheme="Scheme",
    publicly_exposed="Publicly Exposed",
    create_date="Created Date",
    region="Region"
}

export class ELBV2{
    name:string = "elasticLoadBalancersV2";

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
]

    tableColumnHeaders = [
        {
            header: ELBV2Header.arn,
            accessor_key: ELBV2Header.arn,
            allowSorting: false
        },
        {
            header: ELBV2Header.scheme,
            accessor_key: ELBV2Header.scheme,
            allowSorting: false
        },
        {
            header: ELBV2Header.publicly_exposed,
            accessor_key: ELBV2Header.publicly_exposed,
            allowSorting: false
        },
        {
            header: ELBV2Header.create_date,
            accessor_key: ELBV2Header.create_date,
            allowSorting: false
        },
        {
            header: ELBV2Header.region,
            accessor_key: ELBV2Header.region,
            allowSorting: false
        },
    ]

    getAllRows(assetCategoryInfo:any){
        let allTableRows:TableRow[] = assetCategoryInfo.data.map((dataTableRow:ELBV2Fields,idx:number)=>{
            return {
                columns: [
                    {
                        content: <TextWithTooltipIcon 
                             icon={<InlineIcon icon="/images/elastic-load-balancer.svg" />}
                             text={dataTableRow.dns_name}
                             subText={dataTableRow.account_id}
                             maxTruncationLength={44}
                        />,
                        accessor_key: ELBV2Header.arn,
                        value: [dataTableRow.dns_name,dataTableRow.account_id],
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.scheme || "Null",
                        accessor_key: ELBV2Header.scheme,
                        value: dataTableRow.scheme || "Null",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.publicly_exposed,
                        accessor_key: ELBV2Header.publicly_exposed,
                        value: dataTableRow.publicly_exposed ,
                        ignoreComponentExpansion: true
                    },
                    {
                        content: convertDateFormat(dataTableRow.created_time),
                        accessor_key: ELBV2Header.create_date,
                        value: convertDateFormat(dataTableRow.created_time),
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.region || "Null",
                        accessor_key: ELBV2Header.region,
                        value: dataTableRow.region || "Null",
                        ignoreComponentExpansion: true
                    },
                    
                    
                ],
                rowId: dataTableRow.dns_name
            }
        })
        return allTableRows;
    }
}