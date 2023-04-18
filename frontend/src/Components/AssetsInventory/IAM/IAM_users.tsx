import { TableRow } from "../../Shared/Table";
import { TextWithTooltip, TextWithTooltipIcon } from "../../Shared/TextWithTooltip";
import { InlineIcon, parseArn, convertDateFormat, AssetModal, parseIAMPolicy, stringAfterLastSlash, formatDateAgo, AssetsModalWrapper } from "../assetUtils";


export declare type IAMUsersFields={
    arn: string,
    account_id: string,
    friendly_name: string,
    create_date: string,
    password_last_used: string,
    iam_groups: string[],
    iam_policies: string[],
    iam_roles: string[],
    access_keys: string[]
}

export enum IAMUsersHeader{
    arn= "Users",
    create_date= "Created Date",
    password_last_used= "Password Last Used",
    iam_groups = "IAM Groups",
    iam_policies = "IAM Policies",
    iam_roles = "IAM Roles",
    access_keys = "Access Keys"
}

export class IAMUsers{
    name:string = "iamUsers";

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
        "chevronClassName": "invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
    }]

    tableColumnHeaders = [
        {
            header: IAMUsersHeader.arn,
            accessor_key: IAMUsersHeader.arn,
            allowSorting: false
        },
        {
            header: IAMUsersHeader.create_date,
            accessor_key: IAMUsersHeader.create_date,
            allowSorting: false
        },
        {
            header: IAMUsersHeader.password_last_used,
            accessor_key: IAMUsersHeader.password_last_used,
            allowSorting: false
        },
        {
            header: IAMUsersHeader.iam_groups,
            accessor_key: IAMUsersHeader.iam_groups,
            allowSorting: false
        },
        {
            header: IAMUsersHeader.iam_policies,
            accessor_key: IAMUsersHeader.iam_policies,
            allowSorting: false
        },
        {
            header: IAMUsersHeader.iam_roles,
            accessor_key: IAMUsersHeader.iam_roles,
            allowSorting: false
        },
        {
            header: IAMUsersHeader.access_keys,
            accessor_key: IAMUsersHeader.access_keys,
            allowSorting: false
        }
    ]

    getAllRows(assetCategoryInfo:any,setAssetCategory?:any,setSearchFilter?:any){
        let allTableRows:TableRow[] = assetCategoryInfo.data.map((dataTableRow:IAMUsersFields,idx:number)=>{
            return {
                columns: [
                    {
                        content: <TextWithTooltipIcon 
                             icon={<InlineIcon icon="/images/iam-user.svg" />}
                             text={parseArn(dataTableRow.arn)[0]}
                             subText={parseArn(dataTableRow.arn)[1]}
                             maxTruncationLength={44}
                        />,
                        accessor_key: IAMUsersHeader.arn,
                        value: dataTableRow.arn,
                        ignoreComponentExpansion: true
                    },
                    {
                        content: convertDateFormat(dataTableRow.create_date),
                        accessor_key: IAMUsersHeader.create_date,
                        value: convertDateFormat(dataTableRow.create_date),
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.password_last_used ? formatDateAgo(dataTableRow.password_last_used) : "Never",
                        accessor_key: IAMUsersHeader.password_last_used,
                        value: convertDateFormat(dataTableRow.password_last_used),
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
                        accessor_key: IAMUsersHeader.iam_groups,
                        value: dataTableRow.iam_groups,
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
                                                        text={parseIAMPolicy(policy)[0]}
                                                        subText={"IAM " + parseIAMPolicy(policy)[1]}
                                                        maxTruncationLength={200}
                                                        />
                                                    </AssetsModalWrapper>
                                             </li>
                                         )}
                                     </ul>      
                                 </AssetModal> 
                        
                        
                         : "None",
                         value: dataTableRow.iam_policies,
                        accessor_key: IAMUsersHeader.iam_policies,
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
                        accessor_key: IAMUsersHeader.iam_roles,
                        value: dataTableRow.iam_roles,
                        ignoreComponentExpansion: true
                    },
                    {
                        content: dataTableRow.access_keys ?
                        
                        <AssetModal text={`${dataTableRow.access_keys.length} ` + `${dataTableRow.access_keys.length==1 ? "Access Keys" : "Access Keys"}`}>
                                <ul>
                                    {
                                        dataTableRow.access_keys.map((key,idx)=>
                                        <li className="mb-2" key={idx}>
                                            <TextWithTooltip 
                                            text={key}
                                            maxTruncationLength={200}
                                            />
                                        </li>
                                    )}
                                </ul>      
                            </AssetModal> 
                   
                   
                    : "None",
                        accessor_key: IAMUsersHeader.access_keys,
                        value: dataTableRow.access_keys,
                        ignoreComponentExpansion: true
                    },
                    
                ],
                rowId: dataTableRow.arn
            }
        })
        return allTableRows;
    }
}