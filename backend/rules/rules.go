package rules

import (
	"fmt"
	"github.com/Zeus-Labs/ZeusCloud/rules/attackpath"
	"time"

	"github.com/Zeus-Labs/ZeusCloud/models"
	"github.com/Zeus-Labs/ZeusCloud/rules/cloudtrail"
	"github.com/Zeus-Labs/ZeusCloud/rules/cloudwatch"
	"github.com/Zeus-Labs/ZeusCloud/rules/ec2"
	"github.com/Zeus-Labs/ZeusCloud/rules/elasticsearch"
	"github.com/Zeus-Labs/ZeusCloud/rules/elbv2"
	"github.com/Zeus-Labs/ZeusCloud/rules/iam"
	"github.com/Zeus-Labs/ZeusCloud/rules/kms"
	"github.com/Zeus-Labs/ZeusCloud/rules/rds"
	"github.com/Zeus-Labs/ZeusCloud/rules/s3"
	"github.com/Zeus-Labs/ZeusCloud/rules/secretsmanager"
	"github.com/Zeus-Labs/ZeusCloud/rules/securityhub"
	"github.com/Zeus-Labs/ZeusCloud/rules/sqs"
	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/Zeus-Labs/ZeusCloud/rules/vpc"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var MisconfigurationRulesToExecute = []types.Rule{
	cloudtrail.LogFileValidationEnabled{},
	cloudtrail.TrailsAtRestEncrypted{},
	cloudtrail.DeliveredToCloudwatch{},
	cloudtrail.EnabledAllRegions{},
	cloudtrail.BucketNotPubliclyAccessible{},
	cloudtrail.BucketAccessLogging{},
	cloudtrail.LogS3ObjectReadEvents{},
	cloudtrail.LogS3ObjectWriteEvents{},
	cloudwatch.UnauthorizedAPI{},
	cloudwatch.SignInWithoutMFA{},
	cloudwatch.RootAccountUsage{},
	cloudwatch.IAMPolicyChanges{},
	cloudwatch.CloudtrailConfigurationChanges{},
	cloudwatch.AWSConsoleAuthFailures{},
	cloudwatch.CMKDisableOrDelete{},
	cloudwatch.BucketPolicyChanges{},
	cloudwatch.ConfigConfigurationChanges{},
	cloudwatch.SecurityGroupChanges{},
	cloudwatch.NACLChanges{},
	cloudwatch.NetworkGatewayChanges{},
	cloudwatch.RouteTableChanges{},
	cloudwatch.VPCChanges{},
	cloudwatch.OrganizationChanges{},
	ec2.UnusedEIPAddresses{},
	ec2.DetailedMonitoringEnabled{},
	ec2.EBSOptimizedEnabled{},
	ec2.NoPublicAMIs{},
	ec2.AvoidPublicIPs{},
	ec2.EBSAtRestEncrypted{},
	ec2.EBSSnapshotEncrypted{},
	elasticsearch.DomainsAtRestEncrypted{},
	elbv2.AvoidInsecureCiphers{},
	iam.NonEmptyIAMGroups{},
	iam.UserAttachedToGroup{},
	iam.NoUserPolicies{},
	iam.SupportPolicy{},
	iam.NoStarPolicies{},
	iam.NoInlinePolicies{},
	iam.UserActiveAccessKeys{},
	iam.ExpiredServerCertificates{},
	iam.RootAccountUsed{},
	iam.MfaEnabledForConsoleAccess{},
	iam.CredentialsUnused90Days{},
	iam.AccessKeysRotated90Days{},
	iam.NoRootAccessKeys{},
	iam.RootMfaEnabled{},
	iam.AvoidAccessKeysAtSetup{},
	iam.PasswordUppercaseRequired{},
	iam.PasswordLowercaseRequired{},
	iam.PasswordSymbolsRequired{},
	iam.PasswordNumbersRequired{},
	iam.PasswordMinLength{},
	iam.PasswordReusePrevention{},
	iam.PasswordExpiry{},
	kms.RotationEnabledForCMK{},
	rds.InstanceNotPubliclyAccessible{},
	rds.InstanceIAMAuthenticationEnabled{},
	rds.InstanceAutoMinorVersionUpgrade{},
	rds.InstanceAtRestEncrypted{},
	secretsmanager.SecretKmsCmkEncryption{},
	secretsmanager.SecretRotationEnabled{},
	secretsmanager.SecretRotatesWithin90Days{},
	secretsmanager.SecretUnused90Days{},
	securityhub.EnableSecurityHub{},
	s3.BucketsVersioned{},
	s3.MFADelete{},
	s3.RestrictPubliclyReadable{},
	s3.RestrictPubliclyWritable{},
	s3.EnableServerSideEncryption{},
	s3.EnforceInTransitEncryption{},
	s3.BlockPublicAccessConfig{},
	s3.AccessLoggingEnabled{},
	sqs.EnableServerSideEncryptionWithKMS{},
	vpc.UnusedSecurityGroups{},
	vpc.NoClassicInstances{},
	vpc.DefaultSecurityGroupsBlockTraffic{},
	vpc.ExcessiveSecurityGroups{},
	vpc.BlockPublicServerAdminIngressIpv4{},
	vpc.EnableFlowLogs{},
}

var AttackPathsRulesToExecute = []types.Rule{
	attackpath.PubliclyExposedVmAdmin{},
	attackpath.PubliclyExposedVmPrivEsc{},
	attackpath.PubliclyExposedVmHigh{},
	attackpath.PubliclyExposedServerlessAdmin{},
	attackpath.PubliclyExposedServerlessPrivEsc{},
	attackpath.PubliclyExposedServerlessHigh{},
}

func IsRuleActive(postgresDb *gorm.DB, r types.Rule) (bool, error) {
	tx := postgresDb.Limit(1).Where("uid = ? AND active = false", r.UID()).Find(&models.RuleData{})
	if tx.Error != nil {
		return false, tx.Error
	}
	return tx.RowsAffected == 0, nil
}

// ExecuteRule executes rule logic
func ExecuteRule(driver neo4j.Driver, r types.Rule) ([]types.Result, error) {
	session := driver.NewSession(neo4j.SessionConfig{
		AccessMode:   neo4j.AccessModeRead,
		DatabaseName: "neo4j",
	})
	defer session.Close()

	results, err := session.ReadTransaction(func(tx neo4j.Transaction) (interface{}, error) {
		return r.Execute(tx)
	})
	if err != nil {
		return nil, err
	}
	resultsArr, ok := results.([]types.Result)
	if !ok {
		return nil, fmt.Errorf("issue type casting results %v", results)
	}
	return resultsArr, nil
}

// UpsertRuleData inserts / replaces rule data struct
func UpsertRuleData(postgresDb *gorm.DB, r types.Rule, ruleCategory string) (models.RuleData, error) {
	rd := models.RuleData{
		UID:            r.UID(),
		Description:    r.Description(),
		Active:         true,
		LastRun:        time.Now(),
		Severity:       string(r.Severity()),
		RuleCategory:   ruleCategory,
		RiskCategories: r.RiskCategories().AsStringArray(),
	}
	tx := postgresDb.Clauses(clause.OnConflict{
		UpdateAll: true,
	}).Create(rd)
	return rd, tx.Error
}

// UpsertRuleResults inserts / updates rule results appropriately
func UpsertRuleResults(postgresDb *gorm.DB, rd models.RuleData, results []types.Result) error {
	if len(results) == 0 {
		return nil
	}
	var rrLst []models.RuleResult
	for _, res := range results {
		rrLst = append(rrLst, models.RuleResult{
			RuleData:     rd,
			RuleDataUID:  rd.UID,
			ResourceID:   res.ResourceID,
			ResourceType: res.ResourceType,
			AccountID:    res.AccountID,
			Status:       res.Status,
			Context:      res.Context,
			FirstSeen:    rd.LastRun,
			LastSeen:     rd.LastRun,
			Muted:        false,
		})
	}
	tx := postgresDb.Omit("RuleData").Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "rule_data_uid"}, {Name: "resource_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"resource_type", "account_id", "status", "context", "last_seen"}),
	}).Create(rrLst)
	return tx.Error
}

// DeleteStaleRuleResults deletes rule results for the given rule that are old
func DeleteStaleRuleResults(postgresDb *gorm.DB, rd models.RuleData) error {
	tx := postgresDb.Where("rule_data_uid = ? and last_seen < ?", rd.UID, rd.LastRun).Delete(&models.RuleResult{})
	return tx.Error
}
