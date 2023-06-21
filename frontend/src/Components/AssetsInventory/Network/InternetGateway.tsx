import { TableRow } from "../../Shared/Table";
import { TextWithTooltip, TextWithTooltipIcon } from "../../Shared/TextWithTooltip";
import CrownElement from "../CrownElement";
import { AssetModal, AssetsModalWrapper, convertDateFormat, formatDateAgo, InlineIcon, parseArn } from "../assetUtils";

export declare type InternetGatewayFields={
    node_id: number,
    arn: string,
    account_id: string,
    vpc: string,
    region:string,
    is_crown_jewel:boolean,
}

export enum InternetGatewayHeader{
    arn = "Internet Gateway",
    vpc = "VPC",
    region = "Region",
    crown_jewel = "Crown Jewel"
}

export class InternetGateway{
    name:string = "internetGateways";

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
            header: InternetGatewayHeader.arn,
            accessor_key: InternetGatewayHeader.arn,
            allowSorting: false
        },
        {
            header: InternetGatewayHeader.vpc,
            accessor_key: InternetGatewayHeader.vpc,
            allowSorting: false
        },
        {
            header: InternetGatewayHeader.region,
            accessor_key: InternetGatewayHeader.region,
            allowSorting: false
        },
        {
            header: InternetGatewayHeader.crown_jewel,
            accessor_key: InternetGatewayHeader.crown_jewel,
            allowSorting: false
        },
    ]

    getAllRows(assetCategoryInfo:any,setAssetCategory:any,setSearchFilter:any){
        let allTableRows:TableRow[] = assetCategoryInfo.data.map((dataTableRow:InternetGatewayFields,idx:number)=>{
            return {
                columns: [
                    {
                        content: <TextWithTooltipIcon 
                             icon={<InlineIcon icon="/images/internet-gateway.svg" />}
                             text={parseArn(dataTableRow.arn)[0]}
                             subText={parseArn(dataTableRow.arn)[1]}
                             maxTruncationLength={44}
                        />,
                        accessor_key: InternetGatewayHeader.arn,
                        value: dataTableRow.arn,
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
                        accessor_key: InternetGatewayHeader.vpc,
                        value: (dataTableRow.vpc && dataTableRow.vpc!=="") ? dataTableRow.vpc : "None",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.region,
                        accessor_key: InternetGatewayHeader.region,
                        value: dataTableRow.region,
                        ignoreComponentExpansion: true
                    },
                    {
                        content: <CrownElement 
                        isCrownJewel={dataTableRow.is_crown_jewel ?? false}
                        nodeId={dataTableRow.node_id}
                        />,
                        accessor_key: InternetGatewayHeader.crown_jewel,
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