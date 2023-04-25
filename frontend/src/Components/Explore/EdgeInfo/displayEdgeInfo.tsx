import { GraphNodeType } from "../../Alerts/RuleGraph"
import { parseArn } from "../../AssetsInventory/assetUtils"
import {PolicyInfoDisplay } from "./PolicyInfoDisplay"
import { PrivilegeEscalationInfoDisplay } from "./PrivelegeEscalationInfoDisplay"

type EdgeInfoProps = {
    edgeInfo: {
        data: any,
        edgeID: number | null | undefined,
        error: string,
        source:GraphNodeType|null,
        target:GraphNodeType|null
    },
}

type PrivelgeEscalationInfo = {
    edge_type: string,
    relationship_reason: string
}

export type PolicyInfo = {
    edge_type: string,
    identity_policies: {
        arn: string,
        policy_type: string,
        policy_statements:{
            Sid: any,
            Resource: any,
            Effect:any,
            Action:any,
            NotAction:any,
            Condition:any,
            NotResource:any
        }[]
    }[],
    resource_policy: string
}

const edgeTypes = ["PRIVILEGE_ESCALATION", "STS_ASSUME_ROLE_ALLOW","HAS_POLICY_ACCESS"]



export default function DisplayEdgeInfo({ edgeInfo }: EdgeInfoProps) {
    const edgeID = edgeInfo.edgeID
    if (edgeInfo.edgeID === undefined) return null
    else if (edgeID == null) return <div>There is no edge information to display</div>
    else {
        switch (edgeInfo.data["edge_type"]) {
            case edgeTypes[0]:
                const privelegeEdge:PrivelgeEscalationInfo = edgeInfo.data
                return <PrivilegeEscalationInfoDisplay relationshipReason={privelegeEdge.relationship_reason} targetNodeArn={edgeInfo.target?.display_id as string} />
            case edgeTypes[1]:
                var policyInfo:PolicyInfo = edgeInfo.data
                return (edgeInfo.source?.label=="EC2 Instance"
                    ? 
                    <div>
                        <div className="mb-3">
                            <span>EC2 Instance </span> 
                            <b>{edgeInfo.source?.display_id as string}</b> 
                            {` can assume role `} 
                            <b>{parseArn(edgeInfo.target?.display_id as string)[0]}</b>
                        </div>
                        <div className="mb-3">
                            Below is the associated relevant Resource Policy
                        </div>
                        <PolicyInfoDisplay edgeInfo={policyInfo} src={edgeInfo.source} target={edgeInfo.target} />
                    </div>
                    : 
                    <div>
                        <div className="mb-3">
                            <span>{edgeInfo.source?.label==="IAM User" ? "User " : "Role "}</span> 
                            <b>{parseArn(edgeInfo.source?.display_id as string)[0]}</b> 
                            {` can assume role `} 
                            <b>{parseArn(edgeInfo.target?.display_id as string)[0]}</b>
                        </div>
                        <div className="mb-3">
                            Below are the associated relevant IAM Policies and Resource Policy
                        </div>
                        <PolicyInfoDisplay edgeInfo={policyInfo} src={edgeInfo.source} target={edgeInfo.target} />
                    </div>
                )
            case edgeTypes[2]:
                var policyInfo:PolicyInfo = edgeInfo.data
                return (
                    <div>
                        <div className="mb-3">
                            <span>{edgeInfo.source?.label==="IAM User" ? "User " : "Role "}</span> 
                            <b>{parseArn(edgeInfo.source?.display_id as string)[0]}</b> 
                            {` can access the S3 Bucket `} 
                            <b>{edgeInfo.target?.display_id as string}</b>
                        </div>
                        <div className="mb-3">
                            Below are the associated relevant IAM Policies and Resource Policy
                        </div>
                        <PolicyInfoDisplay edgeInfo={policyInfo} src={edgeInfo.source} target={edgeInfo.target} />
                    </div>
                )
            default:
                return <div>{edgeInfo.data["edge_type"]}</div>
        }
    }

} 