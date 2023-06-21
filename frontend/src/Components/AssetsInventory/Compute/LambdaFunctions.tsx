import { TableRow } from "../../Shared/Table";
import { TextWithTooltip, TextWithTooltipIcon } from "../../Shared/TextWithTooltip";
import CrownElement from "../CrownElement";
import { AssetModal, AssetsModalWrapper, convertDateFormat, formatDateAgo, InlineIcon, parseArn } from "../assetUtils";

export declare type LambdaFnFields={
    node_id: number,
    arn: string,
    account_id: string,
    name: string,
    modified_date: string,
    state: string,
    runtime: string,
    iam_roles: string[],
    is_crown_jewel:boolean,
}

export enum LambdaFnHeader{
    arn="Lambda Function",
    modified_date="Modified Date",
    state="State",
    runtime = "Runtime",
    iam_roles="IAM Roles",
    crown_jewel = "Crown Jewel"
}

export class LambdaFunction{
    name:string = "lambdaFunctions";

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
            header: LambdaFnHeader.arn,
            accessor_key: LambdaFnHeader.arn,
            allowSorting: false
        },
        {
            header: LambdaFnHeader.modified_date,
            accessor_key: LambdaFnHeader.modified_date,
            allowSorting: false
        },
        {
            header: LambdaFnHeader.state,
            accessor_key: LambdaFnHeader.state,
            allowSorting: false
        },
        {
            header: LambdaFnHeader.runtime,
            accessor_key: LambdaFnHeader.runtime,
            allowSorting: false
        },
        {
            header: LambdaFnHeader.iam_roles,
            accessor_key: LambdaFnHeader.iam_roles,
            allowSorting: false
        },
        {
            header: LambdaFnHeader.crown_jewel,
            accessor_key: LambdaFnHeader.crown_jewel,
            allowSorting: false
        },
    ]

    getAllRows(assetCategoryInfo:any,setAssetCategory:any,setSearchFilter:any){
        let allTableRows:TableRow[] = assetCategoryInfo.data.map((dataTableRow:LambdaFnFields,idx:number)=>{
            return {
                columns: [
                    {
                        content: <TextWithTooltipIcon 
                             icon={<InlineIcon icon="/images/lambda-function.svg" />}
                             text={dataTableRow.name}
                             subText={dataTableRow.account_id}
                             maxTruncationLength={44}
                        />,
                        accessor_key: LambdaFnHeader.arn,
                        value: [dataTableRow.name,dataTableRow.account_id],
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.modified_date ? formatDateAgo(dataTableRow.modified_date) : "Null",
                        accessor_key: LambdaFnHeader.modified_date,
                        value: dataTableRow.modified_date ? formatDateAgo(dataTableRow.modified_date) : "Null",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.state || "Null",
                        accessor_key: LambdaFnHeader.state,
                        value: dataTableRow.state || "Null",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.runtime,
                        accessor_key: LambdaFnHeader.runtime,
                        value: dataTableRow.runtime,
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
                        accessor_key: LambdaFnHeader.iam_roles,
                        value: dataTableRow.iam_roles || "None",
                        ignoreComponentExpansion: true
                    },
                    {
                        content: <CrownElement 
                        isCrownJewel={dataTableRow.is_crown_jewel ?? false}
                        nodeId={dataTableRow.node_id}
                        />,
                        accessor_key: LambdaFnHeader.crown_jewel,
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