import { parse } from "url";
import { TableRow } from "../../Shared/Table";
import { TextWithTooltipIcon } from "../../Shared/TextWithTooltip";
import { AssetModal, AssetsModalWrapper, convertDateFormat, InlineIcon, parseArn } from "../assetUtils";

export declare type IAMGroupsFields={
    arn: string,
    account_id: string,
    friendly_name: string,
    create_date: string,
    iam_users: string[],
    iam_roles: string[],
    iam_policies: string[]
}

export enum IAMGroupsHeader{
    arn="Groups",
    create_date="Created Date",
    iam_users ="IAM Users",
    iam_roles="IAM Roles",
    iam_policies="IAM Policies"
}

export class IAMGroups{
    name:string = "iamGroups";

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
    }]

    tableColumnHeaders = [
        {
            header: IAMGroupsHeader.arn,
            accessor_key: IAMGroupsHeader.arn,
            allowSorting: false
        },
        {
            header: IAMGroupsHeader.create_date,
            accessor_key: IAMGroupsHeader.create_date,
            allowSorting: false
        },
        {
            header: IAMGroupsHeader.iam_users,
            accessor_key: IAMGroupsHeader.iam_users,
            allowSorting: false
        },
        {
            header: IAMGroupsHeader.iam_roles,
            accessor_key: IAMGroupsHeader.iam_roles,
            allowSorting: false
        },
        {
            header: IAMGroupsHeader.iam_policies,
            accessor_key: IAMGroupsHeader.iam_policies,
            allowSorting: false
        },
    ]

    getAllRows(assetCategoryInfo:any,setAssetCategory:any,setSearchFilter:any){
        let allTableRows:TableRow[] = assetCategoryInfo.data.map((dataTableRow:IAMGroupsFields,idx:number)=>{
            return {
                columns: [
                    {
                        content: <TextWithTooltipIcon 
                             icon={<InlineIcon icon="/images/iam-group.svg" />}
                             text={parseArn(dataTableRow.arn)[0]}
                             subText={parseArn(dataTableRow.arn)[1]}
                             maxTruncationLength={44}
                        />,
                        accessor_key: IAMGroupsHeader.arn,
                        value: [dataTableRow.arn],
                        ignoreComponentExpansion: true
                    },
                    {
                        content: convertDateFormat(dataTableRow.create_date),
                        accessor_key: IAMGroupsHeader.create_date,
                        value: convertDateFormat(dataTableRow.create_date),
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.iam_users ?
                        
                        <AssetModal text={`${dataTableRow.iam_users.length} ` + `${dataTableRow.iam_users.length==1 ? "IAM User" : "IAM Users"}`}>
                                <ul>
                                    {
                                        dataTableRow.iam_users.map((user,idx)=>
                                        <li className="mb-2" key={idx}>
                                            <AssetsModalWrapper
                                                setAssetCategory={setAssetCategory}
                                                assetCategory={"iamUsers"}
                                                setSearchFilter={setSearchFilter}
                                                searchFilter={user}
                                            >
                                                <TextWithTooltipIcon 
                                                    icon={<InlineIcon icon="/images/iam-user.svg" />}
                                                    text={parseArn(user)[0]}
                                                    subText={parseArn(user)[1]}
                                                    maxTruncationLength={200}
                                                />
                                             </AssetsModalWrapper>
                                        </li>
                                    )}
                                </ul>      
                            </AssetModal> 
                    : "None",
                        accessor_key: IAMGroupsHeader.iam_users,
                        value: dataTableRow.iam_users,
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
                        accessor_key: IAMGroupsHeader.iam_roles,
                        value: dataTableRow.iam_roles,
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.iam_policies ?
                        
                        <AssetModal text={`${dataTableRow.iam_policies.length} ` + `${dataTableRow.iam_policies.length==1 ? "IAM Policy" : "IAM Policies"}`}>
                                <ul>
                                    {
                                        dataTableRow.iam_policies.map((policy,idx)=>
                                        <li className="mb-2" key={idx}>
                                            <AssetsModalWrapper
                                                setAssetCategory={setAssetCategory}
                                                assetCategory={"iamPolicies"}
                                                setSearchFilter={setSearchFilter}
                                                searchFilter={policy}
                                            >
                                                <TextWithTooltipIcon 
                                                    icon={<InlineIcon icon="/images/iam-policy.svg" />}
                                                    text={parseArn(policy)[0]}
                                                    subText={parseArn(policy)[1]}
                                                    maxTruncationLength={200}
                                                />
                                             </AssetsModalWrapper>
                                        </li>
                                    )}
                                </ul>      
                            </AssetModal> 
                    : "None",
                        accessor_key: IAMGroupsHeader.iam_policies,
                        value: dataTableRow.iam_policies,
                        ignoreComponentExpansion: true
                    },
                ],
                rowId: dataTableRow.arn
            }
        })
        return allTableRows;
    }
}