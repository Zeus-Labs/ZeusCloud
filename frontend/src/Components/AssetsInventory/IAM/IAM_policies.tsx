import { TableRow } from "../../Shared/Table";
import { TextWithTooltipIcon } from "../../Shared/TextWithTooltip";
import { AssetModal, AssetsModalWrapper, InlineIcon, parseArn } from "../assetUtils";

export declare type IAMPoliciesFields={
    id: string,
    account_id: string,
    name: string,
    policy_type: string,
    iam_users: string[],
    iam_groups: string[],
    iam_roles: string[],
}

export enum IAMPoliciesHeader{
    id="Policies",
    policy_type="Policy Type",
    iam_users ="IAM Users",
    iam_groups="IAM Groups",
    iam_roles="IAM Roles"
}

export class IAMPolicies{
    name:string = "iamPolicies";

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
            header: IAMPoliciesHeader.id,
            accessor_key: IAMPoliciesHeader.id,
            allowSorting: false
        },
        {
            header: IAMPoliciesHeader.policy_type,
            accessor_key: IAMPoliciesHeader.policy_type,
            allowSorting: false
        },
        {
            header: IAMPoliciesHeader.iam_users,
            accessor_key: IAMPoliciesHeader.iam_users,
            allowSorting: false
        },
        {
            header: IAMPoliciesHeader.iam_groups,
            accessor_key: IAMPoliciesHeader.iam_groups,
            allowSorting: false
        },
        {
            header: IAMPoliciesHeader.iam_roles,
            accessor_key: IAMPoliciesHeader.iam_roles,
            allowSorting: false
        },
    ]

    getAllRows(assetCategoryInfo:any,setAssetCategory:any,setSearchFilter:any){
        let allTableRows:TableRow[] = assetCategoryInfo.data.map((dataTableRow:IAMPoliciesFields,idx:number)=>{
            return {
                columns: [
                    {
                        content: <TextWithTooltipIcon 
                             icon={<InlineIcon icon="/images/iam-policy.svg" />}
                             text={dataTableRow.name}
                             subText={dataTableRow.account_id}
                             maxTruncationLength={44}
                        />,
                        accessor_key: IAMPoliciesHeader.id,
                        value: dataTableRow.id,
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.policy_type,
                        accessor_key: IAMPoliciesHeader.policy_type,
                        value: dataTableRow.policy_type,
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
                        accessor_key: IAMPoliciesHeader.iam_users,
                        value: dataTableRow.iam_users,
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.iam_groups ?
                        
                        <AssetModal text={`${dataTableRow.iam_groups.length} ` + `${dataTableRow.iam_groups.length==1 ? "IAM Group" : "IAM Groups"}`}>
                                <ul>
                                    {
                                        dataTableRow.iam_groups.map((group,idx)=>
                                        <li className="mb-2" key={idx}>
                                            <AssetsModalWrapper
                                                setAssetCategory={setAssetCategory}
                                                assetCategory={"iamGroups"}
                                                setSearchFilter={setSearchFilter}
                                                searchFilter={group}
                                            >
                                                <TextWithTooltipIcon 
                                                    icon={<InlineIcon icon="/images/iam-group.svg" />}
                                                    text={parseArn(group)[0]}
                                                    subText={parseArn(group)[1]}
                                                    maxTruncationLength={200}
                                                />
                                             </AssetsModalWrapper>
                                        </li>
                                    )}
                                </ul>      
                            </AssetModal> 
                    : "None",
                        accessor_key: IAMPoliciesHeader.iam_groups,
                        value: dataTableRow.iam_groups,
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
                        accessor_key: IAMPoliciesHeader.iam_roles,
                        value: dataTableRow.iam_roles,
                        ignoreComponentExpansion: true
                    },
                    
                ],
                rowId: dataTableRow.id
            }
        })
        return allTableRows;
    }
}