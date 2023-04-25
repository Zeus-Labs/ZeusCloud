import { GraphNodeType } from "../../Alerts/RuleGraph"
import { PolicyInfo } from "./displayEdgeInfo"

type ResourcePolicyProps = {
    edgeInfo: PolicyInfo,
}

export default function ResourcePolicyView({edgeInfo}:ResourcePolicyProps){
    const policyObj = JSON.parse(edgeInfo.resource_policy)
    const policyJsonStr = JSON.stringify(policyObj,null,2)
    return (
        <div className="max-h-[60vh] flex flex-row justify-start mt-8">
            <div className="w-full">
                <div className="max-h-full w-full flex bg-black text-white p-4 rounded-md">
                    <div className="overflow-auto w-full leading-7">
                        <code>
                            <pre>{policyJsonStr}</pre>
                        </code>
                    </div>  
                </div>
            </div>
        </div>
    )
}