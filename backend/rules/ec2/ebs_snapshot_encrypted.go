package ec2

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

// TODO: Figure out how to test this with CDK.
type EBSSnapshotEncrypted struct{}

func (EBSSnapshotEncrypted) UID() string {
	return "ec2/ebs_snapshot_encrypted"
}

func (EBSSnapshotEncrypted) Description() string {
	return "EBS snapshots should be encrypted at rest."
}

func (EBSSnapshotEncrypted) Severity() types.Severity {
	return types.High
}

func (EBSSnapshotEncrypted) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PoorEncryption,
		types.DataAccess,
	}
}

func (EBSSnapshotEncrypted) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(s:EBSSnapshot)
		RETURN s.id as resource_id,
		'EBSSnapshot' as resource_type,
		a.id as account_id,
		CASE
			WHEN s.encrypted THEN 'passed'
			ELSE 'failed'
		END as status,
		CASE
			WHEN s.encrypted THEN 'The EBS snapshot is encrypted.'
			ELSE 'The EBS snapshot is not encrypted.'
		END as context`,
		nil,
	)
	if err != nil {
		return nil, err
	}
	var results []types.Result
	for records.Next() {
		record := records.Record()
		resourceID, _ := record.Get("resource_id")
		resourceIDStr, ok := resourceID.(string)
		if !ok {
			return nil, fmt.Errorf("resource_id %v should be of type string", resourceID)
		}
		resourceType, _ := record.Get("resource_type")
		resourceTypeStr, ok := resourceType.(string)
		if !ok {
			return nil, fmt.Errorf("resource_type %v should be of type string", resourceType)
		}
		accountID, _ := record.Get("account_id")
		accountIDStr, ok := accountID.(string)
		if !ok {
			return nil, fmt.Errorf("account_id %v should be of type string", accountID)
		}
		status, _ := record.Get("status")
		statusStr, ok := status.(string)
		if !ok {
			return nil, fmt.Errorf("status %v should be of type string", status)
		}
		context, _ := record.Get("context")
		contextStr, ok := context.(string)
		if !ok {
			return nil, fmt.Errorf("context %v should be of type string", context)
		}
		results = append(results, types.Result{
			ResourceID:   resourceIDStr,
			ResourceType: resourceTypeStr,
			AccountID:    accountIDStr,
			Status:       statusStr,
			Context:      contextStr,
		})
	}
	return results, nil
}

func (EBSSnapshotEncrypted) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (types.GraphPathResult, error) {
	return types.GraphPathResult{}, nil
}
