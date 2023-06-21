import { TableRow } from "../../Shared/Table";
import { TextWithTooltip, TextWithTooltipIcon } from "../../Shared/TextWithTooltip";
import assetCategoryMap, { AssetCategoryInterface } from "../AssetCategoryMap";
import CrownElement from "../CrownElement";
import { AssetModal, convertDateFormat, InlineIcon, parseIAMPolicy, parseArn, replaceUnderscore, stringAfterLastSlash, stringBetweenLastTwoSlashes, ToolTipForList, AssetsModalWrapper } from "../assetUtils";

export enum IAMRolesHeader{
    arn= "Roles",
    create_date= "Created Date",
    iam_roles = "IAM Roles",
    iam_policies = "IAM Policies",
    trusted_principals = "Trusted Principals",
    crown_jewel = "Crown Jewel"
}

export declare type IAMRolesFields={
    node_id: number,
    arn: string,
    account_id: string,
    create_date: string,
    iam_roles : string[],
    iam_policies: string[],
    trusted_principals : string[],
    is_crown_jewel:boolean,
}

export class IAMRoles implements AssetCategoryInterface{

    name:string = "iamRoles";

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
    }]

    tableColumnHeaders = [
        {
            header: IAMRolesHeader.arn,
            accessor_key: IAMRolesHeader.arn,
            allowSorting: false
        },
        {
            header: IAMRolesHeader.create_date,
            accessor_key: IAMRolesHeader.create_date,
            allowSorting: false
        },
        {
            header: IAMRolesHeader.iam_roles,
            accessor_key: IAMRolesHeader.iam_roles,
            allowSorting: false
        },
        {
            header: IAMRolesHeader.iam_policies,
            accessor_key: IAMRolesHeader.iam_policies,
            allowSorting: false
        },
        {
            header: IAMRolesHeader.trusted_principals,
            accessor_key: IAMRolesHeader.trusted_principals,
            allowSorting: false
        },
        {
            header: IAMRolesHeader.crown_jewel,
            accessor_key: IAMRolesHeader.crown_jewel,
            allowSorting: false
        }
    ]
   
   getAllRows(assetCategoryInfo:any,setAssetCategory?:React.Dispatch<React.SetStateAction<string>>,
    setSearchFilter?:React.Dispatch<React.SetStateAction<string>>){
       let allTableRows:TableRow[] = assetCategoryInfo.data.map((dataTableRow:IAMRolesFields,idx:number)=>{
           return {
               columns: [
                   {
                       content: <TextWithTooltipIcon 
                            icon={<InlineIcon icon="/images/iam-role.svg" />}
                            text={parseArn(dataTableRow.arn)[0]}
                            subText={parseArn(dataTableRow.arn)[1]}
                            maxTruncationLength={44}
                       />,
                       accessor_key: IAMRolesHeader.arn,
                       value: dataTableRow.arn,
                       ignoreComponentExpansion: true
                   },
                   {
                       content: convertDateFormat(dataTableRow.create_date),
                       accessor_key: IAMRolesHeader.create_date,
                       value: convertDateFormat(dataTableRow.create_date),
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
                       accessor_key: IAMRolesHeader.iam_roles,
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
                                                    assetCategory="iamPolicies"
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
                       accessor_key: IAMRolesHeader.iam_policies,
                       ignoreComponentExpansion: true
                   },
                   {
                       content: dataTableRow.trusted_principals ?
                       
                       <AssetModal text={`${dataTableRow.trusted_principals.length} ` + `${dataTableRow.trusted_principals.length==1 ? "Trusted Principal" : "Trusted Principal"}`}>
                               <ul>
                                   {
                                       dataTableRow.trusted_principals.map((principal,idx)=>
                                       <li className="mb-2" key={idx}>
                                           <TextWithTooltip 
                                           text={stringAfterLastSlash(principal)}
                                           maxTruncationLength={200}
                                           />
                                       </li>
                                   )}
                               </ul>      
                           </AssetModal> 
                  
                  
                   : "None",
                       accessor_key: IAMRolesHeader.trusted_principals,
                       value: dataTableRow.trusted_principals,
                       ignoreComponentExpansion: true
                   },
                   {
                    content: <CrownElement 
                    isCrownJewel={dataTableRow.is_crown_jewel ?? false}
                    nodeId={dataTableRow.node_id}
                    />,
                    accessor_key: IAMRolesHeader.crown_jewel,
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

