import { useEffect, useState } from "react"

import { PolicyInfo } from "./displayEdgeInfo"
import { GraphNodeType } from "../../Alerts/RuleGraph"
import { parseArn, InlineIcon, parseIAMPolicy } from "../../AssetsInventory/assetUtils"
import { TextWithTooltipIcon } from "../../Shared/TextWithTooltip"
import { log } from "console"

type IdentityPolicyInfoProps = {
    edgeInfo: PolicyInfo,
}

export function IdentityPolicyView({edgeInfo}:IdentityPolicyInfoProps){
    const [statements,setStatements] = useState<any>([])
   const [selectedArn,setSelectedArn] = useState("")
   useEffect(()=>{
    setStatements([])
   },[edgeInfo])
    return(
        
        <div className="flex flex-row justify-between max-h-[60vh] mt-8">
            <div className="mr-5 min-w-[25%] overflow-auto border border-gray-200">   
                <ul className="">
                    {edgeInfo.identity_policies.map(policy=>
                    <li key={policy.arn} 
                    className={`${selectedArn===policy.arn && "bg-gray-100"} p-2.5 cursor-pointer hover:bg-gray-50 border-b border-gray-100`}>
                        <div className="cursor-pointer" onClick={()=>{
                            setStatements(policy.policy_statements)
                            setSelectedArn(policy.arn)
                        }}>
                        <TextWithTooltipIcon 
                            icon={<InlineIcon icon="/images/iam-policy.svg" />}
                            text={parseIAMPolicy(policy.arn)[0]}
                            subText={"IAM " + parseIAMPolicy(policy.arn)[1]}
                            maxTruncationLength={200}
                        />
                        </div>
                    </li>
                    )}
                </ul>
            </div>
            
            {statements.length>0 &&
                <div className="w-[65%]">
                    <div className="w-full max-h-full flex bg-black text-white p-4 rounded-md">
                        <div className="overflow-auto w-full leading-7">
                            <code>
                                <pre>{JSON.stringify(statements,null,2)}</pre>
                            </code>
                        </div>  
                    </div>
                </div>  
            }
        </div>
            
    )
}