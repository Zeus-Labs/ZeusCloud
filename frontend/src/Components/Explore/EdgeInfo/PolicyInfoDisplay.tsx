import { useEffect, useState } from "react"

import { PolicyInfo } from "./displayEdgeInfo"
import { GraphNodeType } from "../../Alerts/RuleGraph"
import { parseArn, InlineIcon, parseIAMPolicy } from "../../AssetsInventory/assetUtils"
import { TextWithTooltipIcon } from "../../Shared/TextWithTooltip"
import { IdentityPolicyView } from "./IdentityPolicyView"
import ResourcePolicyView from "./ResourcePolicyView"
import Tabs from "../../Shared/Tabs"

type PolicyInfoProps = {
    edgeInfo: PolicyInfo,
    src: GraphNodeType|null
    target: GraphNodeType|null
}

export function PolicyInfoDisplay({edgeInfo,src,target}:PolicyInfoProps){
    const [current, setCurrent] = useState("Identity Policy");
    const tabs = [
        {
            name: "Identity Policy",
            body: <IdentityPolicyView edgeInfo={edgeInfo} />
        },
        {
            name: "Resource Policy",
            body: <ResourcePolicyView edgeInfo={edgeInfo} />
        },
    ]
    console.log("identity policies = ",edgeInfo.identity_policies)
    return(
        <div>
            { edgeInfo.identity_policies!==undefined 
            ?           
            <Tabs tabs={tabs} current={current} setCurrent={setCurrent}/>
            :
            <ResourcePolicyView edgeInfo={edgeInfo} />
            }
        </div>
    )
}