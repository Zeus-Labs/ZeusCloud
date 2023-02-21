package cloudtrail

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type EnabledAllRegions struct{}

func (EnabledAllRegions) UID() string {
	return "cloudtrail/enabled_all_regions"
}

func (EnabledAllRegions) Description() string {
	return "Each account should have Cloudtrail enabled across all regions"
}

func (EnabledAllRegions) Severity() types.Severity {
	return types.High
}

func (EnabledAllRegions) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.InsufficientMonitoring,
	}
}

// TODO add logic checking event selectors
func (EnabledAllRegions) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})
		OPTIONAL MATCH (a)<-[:MONITORS]-(t:CloudTrail)
		WHERE t.is_multi_region_trail AND t.is_logging
		WITH a, sum(CASE WHEN t IS NULL THEN 0 ELSE 1 END) as num_qualified_trails
		RETURN a.id as resource_id, 
		'AWSAccount' as resource_type,
		a.id as account_id,
		CASE 
			WHEN num_qualified_trails > 0 THEN 'passed'
			ELSE 'failed'
		END as status,
		CASE 
			WHEN num_qualified_trails > 0 THEN 'The account has ' + toString(num_qualified_trails) + ' multi-region trails currently logging API calls.'
			ELSE 'The account has no multi-region trails currently logging API calls.'
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
