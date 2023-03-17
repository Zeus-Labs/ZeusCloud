package inventory

import (
	"fmt"
	"time"

	"github.com/Zeus-Labs/ZeusCloud/util"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type ElasticLoadBalancerV2 struct {
	DnsName         string    `json:"dns_name"`
	AccountId       string    `json:"account_id"`
	Name            string    `json:"name"`
	Scheme          string    `json:"scheme"`
	PubliclyExposed string    `json:"publicly_exposed"` // TODO: Standardize this across cartography, attack paths, asset inventory, and graph viz
	CreatedTime     time.Time `json:"created_time"`
	Region          string    `json:"region"`
}

func RetrieveElasticLoadBalancersV2(tx neo4j.Transaction) ([]interface{}, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(lbv2:LoadBalancerV2)
		RETURN lbv2.id as dns_name,
		a.id as account_id,
		lbv2.name as name,
		lbv2.scheme as scheme,
		CASE WHEN lbv2.exposed_internet THEN "Yes" ELSE "No" END as publicly_exposed,
		lbv2.createdtime as created_time
		lbv2.region as region`,
		nil,
	)
	if err != nil {
		return nil, err
	}
	var retrievedElasticLoadBalancersV2 []interface{}
	for records.Next() {
		record := records.Record()
		dnsName, _ := record.Get("dns_name")
		dnsNameStr, ok := dnsName.(string)
		if !ok {
			return nil, fmt.Errorf("dns_name %v should be of type string", dnsNameStr)
		}
		accountID, _ := record.Get("account_id")
		accountIDStr, ok := accountID.(string)
		if !ok {
			return nil, fmt.Errorf("account_id %v should be of type string", accountIDStr)
		}
		name, _ := record.Get("name")
		nameStr, ok := name.(string)
		if !ok {
			return nil, fmt.Errorf("name %v should be of type string", nameStr)
		}
		scheme, _ := record.Get("scheme")
		schemeStr, ok := scheme.(string)
		if !ok {
			return nil, fmt.Errorf("scheme %v should be of type string", schemeStr)
		}
		publiclyExposed, _ := record.Get("publicly_exposed")
		publiclyExposedStr, ok := publiclyExposed.(string)
		if !ok {
			return nil, fmt.Errorf("publicly_exposed %v should be of type string", publiclyExposedStr)
		}
		createdTime, err := util.ParseAsTime(record, "created_time")
		if err != nil {
			return nil, err
		}
		region, _ := record.Get("region")
		regionStr, ok := region.(string)
		if !ok {
			return nil, fmt.Errorf("region %v should be of type string", regionStr)
		}
		retrievedElasticLoadBalancersV2 = append(retrievedElasticLoadBalancersV2, ElasticLoadBalancerV2{
			DnsName:         dnsNameStr,
			AccountId:       accountIDStr,
			Name:            nameStr,
			Scheme:          schemeStr,
			PubliclyExposed: publiclyExposedStr,
			CreatedTime:     createdTime,
			Region:          regionStr,
		})
	}

	return retrievedElasticLoadBalancersV2, nil
}
