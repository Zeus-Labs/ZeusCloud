import { PrivilegeEscalationInfoDisplay } from "./PrivelegeEscalationInfoDisplay"

type EdgeInfoProps = {
    edgeInfo: {
        data: any,
        edgeID: number | null | undefined,
        error: string,
        source:string,
        target:string
    },
}

type PrivelgeEscalationInfo = {
    edge_type: string,
    relationship_reason: string
}

type AssumeRoleInfo = {
    edge_type: string
}

const edgeTypes = ["PRIVILEGE_ESCALATION", "STS_ASSUME_ROLE_ALLOW"]



export default function DisplayEdgeInfo({ edgeInfo }: EdgeInfoProps) {
    const edgeID = edgeInfo.edgeID
    if (edgeInfo.edgeID === undefined) return null
    else if (edgeID == null) return <div>There is no edge information to display</div>
    else {
        switch (edgeInfo.data["edge_type"]) {
            case edgeTypes[0]:
                const privelegeEdge:PrivelgeEscalationInfo = edgeInfo.data
                return <PrivilegeEscalationInfoDisplay relationshipReason={privelegeEdge.relationship_reason} targetNodeArn={edgeInfo.target} />
            case edgeTypes[1]:
                const assumeRoleEdge:AssumeRoleInfo = edgeInfo.data
                return <div>{assumeRoleEdge.edge_type}</div>
            default:
                return <div>{edgeInfo.data["edge_type"]}</div>
        }
    }

} 