package inventory

import (
	"log"
	"time"

	"github.com/Zeus-Labs/ZeusCloud/util"
	"github.com/hashicorp/go-multierror"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type ElasticLoadBalancerV2 struct {
	DnsName         *string    `json:"dns_name"`
	AccountId       *string    `json:"account_id"`
	Name            *string    `json:"name"`
	Scheme          *string    `json:"scheme"`
	PubliclyExposed *string    `json:"publicly_exposed"` // TODO: Standardize this across cartography, attack paths, asset inventory, and graph viz
	CreatedTime     *time.Time `json:"created_time"`
	Region          *string    `json:"region"`
}

func RetrieveElasticLoadBalancersV2(tx neo4j.Transaction) ([]interface{}, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(lbv2:LoadBalancerV2)
		RETURN lbv2.id as dns_name,
		a.id as account_id,
		lbv2.name as name,
		lbv2.scheme as scheme,
		CASE WHEN lbv2.exposed_internet THEN "Yes" ELSE "No" END as publicly_exposed,
		lbv2.createdtime as created_time,
		lbv2.region as region`,
		nil,
	)
	if err != nil {
		return nil, err
	}
	var retrievedElasticLoadBalancersV2 []interface{}
	for records.Next() {
		record := records.Record()

		var parsingErrs error
		dnsNameStr, err := util.ParseAsOptionalString(record, "dns_name")
		multierror.Append(parsingErrs, err)
		accountIDStr, err := util.ParseAsOptionalString(record, "account_id")
		multierror.Append(parsingErrs, err)
		nameStr, err := util.ParseAsOptionalString(record, "name")
		multierror.Append(parsingErrs, err)
		schemeStr, err := util.ParseAsOptionalString(record, "scheme")
		multierror.Append(parsingErrs, err)
		publiclyExposedStr, err := util.ParseAsOptionalString(record, "publicly_exposed")
		multierror.Append(parsingErrs, err)
		createdTime, err := util.ParseAsOptionalTime(record, "created_time")
		multierror.Append(parsingErrs, err)
		regionStr, err := util.ParseAsOptionalString(record, "region")
		multierror.Append(parsingErrs, err)
		if parsingErrs != nil {
			log.Printf("Encountered errors parsing resource: %v, continuing on...", parsingErrs.Error())
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
