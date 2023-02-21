package compliance

import (
	"github.com/Zeus-Labs/ZeusCloud/rules/cloudtrail"
	"github.com/Zeus-Labs/ZeusCloud/rules/cloudwatch"
	"github.com/Zeus-Labs/ZeusCloud/rules/ec2"
	"github.com/Zeus-Labs/ZeusCloud/rules/iam"
	"github.com/Zeus-Labs/ZeusCloud/rules/kms"
	"github.com/Zeus-Labs/ZeusCloud/rules/rds"
	"github.com/Zeus-Labs/ZeusCloud/rules/s3"
	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/Zeus-Labs/ZeusCloud/rules/vpc"
)

var Cis_1_4_0_Spec ComplianceFrameworkSpec = ComplianceFrameworkSpec{
	FrameworkName: "CIS 1.4.0",
	ComplianceControlGroupSpecs: []ComplianceControlGroupSpec{
		{
			GroupName: "1 Identity and Access Management",
			ComplianceControlSpecs: []ComplianceControlSpec{
				{
					ControlName:    "1.1 - Maintain current contact details",
					ZeusCloudRules: []types.Rule{},
					Comment:        "This control requires manual verification.",
				},
				{
					ControlName:    "1.2 - Ensure security contact information is registered",
					ZeusCloudRules: []types.Rule{},
					Comment:        "This control requires manual verification.",
				},
				{
					ControlName:    "1.3 - Ensure security questions are registered in the AWS account",
					ZeusCloudRules: []types.Rule{},
					Comment:        "This control requires manual verification.",
				},
				{
					ControlName: "1.4 - Ensure no 'root' user account access key exists ",
					ZeusCloudRules: []types.Rule{
						iam.NoRootAccessKeys{},
					},
				},
				{
					ControlName: "1.5 - Ensure MFA is enabled for the 'root' user account",
					ZeusCloudRules: []types.Rule{
						iam.RootMfaEnabled{},
					},
				},
				{
					ControlName:    "1.6 - Ensure hardware MFA is enabled for the 'root' user account",
					ZeusCloudRules: []types.Rule{},
					Comment:        "ZeusCloud is working on rule(s) to verify this control.",
				},
				{
					ControlName: "1.7 - Eliminate use of the 'root' user for administrative and daily tasks",
					ZeusCloudRules: []types.Rule{
						iam.RootAccountUsed{},
					},
				},
				{
					ControlName: "1.8 - Ensure IAM password policy requires minimum length of 14 or greater",
					ZeusCloudRules: []types.Rule{
						iam.PasswordMinLength{},
					},
				},
				{
					ControlName: "1.9 - Ensure IAM password policy prevents password reuse",
					ZeusCloudRules: []types.Rule{
						iam.PasswordReusePrevention{},
					},
				},
				{
					ControlName: "1.10 - Ensure multi-factor authentication (MFA) is enabled for all IAM users that have a console password",
					ZeusCloudRules: []types.Rule{
						iam.MfaEnabledForConsoleAccess{},
					},
				},
				{
					ControlName: "1.11 - Do not setup access keys during initial user setup for all IAM users that have a console password",
					ZeusCloudRules: []types.Rule{
						iam.AvoidAccessKeysAtSetup{},
					},
				},
				{
					ControlName: "1.12 - Ensure credentials unused for 45 days or greater are disabled",
					ZeusCloudRules: []types.Rule{
						iam.CredentialsUnused90Days{},
					},
				},
				{
					ControlName: "1.13 -  Ensure there is only one active access key available for any single IAM user",
					ZeusCloudRules: []types.Rule{
						iam.UserActiveAccessKeys{},
					},
				},
				{
					ControlName: "1.14 - Ensure access keys are rotated every 90 days or less",
					ZeusCloudRules: []types.Rule{
						iam.AccessKeysRotated90Days{},
					},
				},
				{
					ControlName: "1.15 - Ensure IAM Users Receive Permissions Only Through Groups",
					ZeusCloudRules: []types.Rule{
						iam.NoUserPolicies{},
					},
				},
				{
					ControlName: "1.16 - Ensure IAM policies that allow full \"*:*\" administrative privileges are not attached",
					ZeusCloudRules: []types.Rule{
						iam.PasswordExpiry{},
					},
				},
				{
					ControlName: "1.17 - Ensure a support role has been created to manage incidents with AWS Support",
					ZeusCloudRules: []types.Rule{
						iam.SupportPolicy{},
					},
				},
				{
					ControlName:    "1.18 - Ensure IAM instance roles are used for AWS resource access from instances",
					ZeusCloudRules: []types.Rule{},
					Comment:        "This control requires manual verification.",
				},
				{
					ControlName: "1.19 - Ensure that all the expired SSL/TLS certificates stored in AWS IAM are removed",
					ZeusCloudRules: []types.Rule{
						iam.ExpiredServerCertificates{},
					},
				},
				{
					ControlName:    "1.20 - Ensure that IAM Access analyzer is enabled for all regions",
					ZeusCloudRules: []types.Rule{},
					Comment:        "ZeusCloud is working on rule(s) to verify this control.",
				},
				{
					ControlName:    "1.21 - Ensure IAM users are managed centrally via identity federation or AWS Organizations for multi-account environments",
					ZeusCloudRules: []types.Rule{},
					Comment:        "This control requires manual verification.",
				},
			},
		},
		{
			GroupName: "2 Storage",
			ComplianceControlSpecs: []ComplianceControlSpec{
				{
					ControlName: "2.1.1 - Ensure all S3 buckets employ encryption-at-rest",
					ZeusCloudRules: []types.Rule{
						s3.EnableServerSideEncryption{},
					},
				},
				{
					ControlName: "2.1.2 - Ensure S3 Bucket Policy allows HTTPS requests",
					ZeusCloudRules: []types.Rule{
						s3.EnforceInTransitEncryption{},
					},
				},
				{
					ControlName: "2.1.3 - Ensure MFA Delete is enable on S3 buckets",
					ZeusCloudRules: []types.Rule{
						s3.MFADelete{},
					},
				},
				{
					ControlName:    "2.1.4 - Ensure all data in Amazon S3 has been discovered, classified and secured when required.",
					ZeusCloudRules: []types.Rule{},
					Comment:        "This control requires manual verification.",
				},
				{
					ControlName: "2.1.5 - Ensure that S3 Buckets are configured with 'Block public access (bucket settings)'",
					ZeusCloudRules: []types.Rule{
						s3.BlockPublicAccessConfig{},
					},
				},
				{
					ControlName: "2.2.1 - Ensure EBS volume encryption is enabled",
					ZeusCloudRules: []types.Rule{
						ec2.EBSAtRestEncrypted{},
					},
				},
				{
					ControlName: "2.3.1 - Ensure that encryption is enabled for RDS Instances",
					ZeusCloudRules: []types.Rule{
						rds.InstanceAtRestEncrypted{},
					},
				},
			},
		},
		{
			GroupName: "3 Logging",
			ComplianceControlSpecs: []ComplianceControlSpec{
				{
					ControlName: "3.1 – Ensure CloudTrail is enabled in all Regions",
					ZeusCloudRules: []types.Rule{
						cloudtrail.EnabledAllRegions{},
					},
				},
				{
					ControlName: "3.2 – Ensure CloudTrail log file validation is enabled",
					ZeusCloudRules: []types.Rule{
						cloudtrail.LogFileValidationEnabled{},
					},
				},
				{
					ControlName: "3.3 – Ensure the S3 bucket used to store CloudTrail logs is not publicly accessible",
					ZeusCloudRules: []types.Rule{
						cloudtrail.BucketNotPubliclyAccessible{},
					},
				},
				{
					ControlName: "3.4 – Ensure CloudTrail trails are integrated with CloudWatch Logs",
					ZeusCloudRules: []types.Rule{
						cloudtrail.DeliveredToCloudwatch{},
					},
				},
				{
					ControlName:    "3.5 – Ensure AWS Config is enabled in all regions",
					ZeusCloudRules: []types.Rule{},
					Comment:        "ZeusCloud is working on rule(s) to verify this control.",
				},
				{
					ControlName: "3.6 – Ensure S3 bucket access logging is enabled on the CloudTrail S3 bucket",
					ZeusCloudRules: []types.Rule{
						cloudtrail.BucketAccessLogging{},
					},
				},
				{
					ControlName: "3.7 – Ensure CloudTrail logs are encrypted at rest using KMS CMKs",
					ZeusCloudRules: []types.Rule{
						cloudtrail.TrailsAtRestEncrypted{},
					},
				},
				{
					ControlName: "3.8 - Ensure rotation for customer created CMKs is enabled",
					ZeusCloudRules: []types.Rule{
						kms.RotationEnabledForCMK{},
					},
				},
				{
					ControlName: "3.9 - Ensure VPC flow logging is enabled in all VPCs",
					ZeusCloudRules: []types.Rule{
						vpc.EnableFlowLogs{},
					},
				},
				{
					ControlName: "3.10 - Ensure that Object-level logging for write events is enabled for S3 bucket",
					ZeusCloudRules: []types.Rule{
						cloudtrail.LogS3ObjectWriteEvents{},
					},
				},
				{
					ControlName: "3.11 - Ensure that Object-level logging for read events is enabled for S3 bucket",
					ZeusCloudRules: []types.Rule{
						cloudtrail.LogS3ObjectReadEvents{},
					},
				},
			},
		},
		{
			GroupName: "4 Monitoring",
			ComplianceControlSpecs: []ComplianceControlSpec{
				{
					ControlName: "4.1 – Ensure a log metric filter and alarm exist for unauthorized API calls",
					ZeusCloudRules: []types.Rule{
						cloudwatch.UnauthorizedAPI{},
					},
				},
				{
					ControlName: "4.2 – Ensure a log metric filter and alarm exist for Management Console sign-in without MFA",
					ZeusCloudRules: []types.Rule{
						cloudwatch.SignInWithoutMFA{},
					},
				},
				{
					ControlName: "4.3 – Ensure a log metric filter and alarm exist for usage of 'root' account",
					ZeusCloudRules: []types.Rule{
						cloudwatch.RootAccountUsage{},
					},
				},
				{
					ControlName: "4.4 – Ensure a log metric filter and alarm exist for IAM policy changes",
					ZeusCloudRules: []types.Rule{
						cloudwatch.IAMPolicyChanges{},
					},
				},
				{
					ControlName: "4.5 – Ensure a log metric filter and alarm exist for CloudTrail configuration changes",
					ZeusCloudRules: []types.Rule{
						cloudwatch.CloudtrailConfigurationChanges{},
					},
				},
				{
					ControlName: "4.6 – Ensure a log metric filter and alarm exist for AWS Management Console authentication failures",
					ZeusCloudRules: []types.Rule{
						cloudwatch.AWSConsoleAuthFailures{},
					},
				},
				{
					ControlName: "4.7 – Ensure a log metric filter and alarm exist for disabling or scheduled deletion of customer created CMKs",
					ZeusCloudRules: []types.Rule{
						cloudwatch.CMKDisableOrDelete{},
					},
				},
				{
					ControlName: "4.8 - Ensure a log metric filter and alarm exist for S3 bucket policy changes",
					ZeusCloudRules: []types.Rule{
						cloudwatch.BucketPolicyChanges{},
					},
				},
				{
					ControlName: "4.9 – Ensure a log metric filter and alarm exist for AWS Config configuration changes",
					ZeusCloudRules: []types.Rule{
						cloudwatch.ConfigConfigurationChanges{},
					},
				},
				{
					ControlName: "4.10 – Ensure a log metric filter and alarm exist for security group changes",
					ZeusCloudRules: []types.Rule{
						cloudwatch.SecurityGroupChanges{},
					},
				},
				{
					ControlName: "4.11 - Ensure a log metric filter and alarm exist for changes to Network Access Control Lists (NACL)",
					ZeusCloudRules: []types.Rule{
						cloudwatch.NACLChanges{},
					},
				},
				{
					ControlName: "4.12 - Ensure a log metric filter and alarm exist for changes to network gateways",
					ZeusCloudRules: []types.Rule{
						cloudwatch.NetworkGatewayChanges{},
					},
				},
				{
					ControlName: "4.13 - Ensure a log metric filter and alarm exist for route table changes",
					ZeusCloudRules: []types.Rule{
						cloudwatch.RouteTableChanges{},
					},
				},
				{
					ControlName: "4.14 - Ensure a log metric filter and alarm exist for VPC changes",
					ZeusCloudRules: []types.Rule{
						cloudwatch.VPCChanges{},
					},
				},
				{
					ControlName: "4.15 - Ensure a log metric filter and alarm exists for AWS Organizations changes",
					ZeusCloudRules: []types.Rule{
						cloudwatch.OrganizationChanges{},
					},
				},
			},
		},
		{
			GroupName: "5 Networking",
			ComplianceControlSpecs: []ComplianceControlSpec{
				{
					ControlName:    "5.1 - Ensure no Network ACLs allow ingress from 0.0.0.0/0 to remote server administration ports",
					ZeusCloudRules: []types.Rule{},
					Comment:        "ZeusCloud is working on rule(s) to verify this control.",
				},
				{
					ControlName: "5.2 - Ensure no security groups allow ingress from 0.0.0.0/0 to remote server administration ports",
					ZeusCloudRules: []types.Rule{
						vpc.BlockPublicServerAdminIngressIpv4{},
					},
				},
				{
					ControlName: "5.3 - Ensure the default security group of every VPC restricts all traffic",
					ZeusCloudRules: []types.Rule{
						vpc.DefaultSecurityGroupsBlockTraffic{},
					},
				},
				{
					ControlName:    "5.4 - Ensure routing tables for VPC peering are \"least access\"",
					ZeusCloudRules: []types.Rule{},
					Comment:        "This control requires manual verification.",
				},
			},
		},
	},
}
