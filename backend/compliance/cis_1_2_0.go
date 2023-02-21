package compliance

import (
	"github.com/Zeus-Labs/ZeusCloud/rules/cloudtrail"
	"github.com/Zeus-Labs/ZeusCloud/rules/cloudwatch"
	"github.com/Zeus-Labs/ZeusCloud/rules/iam"
	"github.com/Zeus-Labs/ZeusCloud/rules/kms"
	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/Zeus-Labs/ZeusCloud/rules/vpc"
)

var Cis_1_2_0_Spec ComplianceFrameworkSpec = ComplianceFrameworkSpec{
	FrameworkName: "CIS 1.2.0",
	ComplianceControlGroupSpecs: []ComplianceControlGroupSpec{
		{
			GroupName: "1 Identity and Access Management",
			ComplianceControlSpecs: []ComplianceControlSpec{
				{
					ControlName: "1.1 - Avoid the use of the \"root\" account",
					ZeusCloudRules: []types.Rule{
						iam.RootAccountUsed{},
					},
				},
				{
					ControlName: "1.2 - Ensure multi-factor authentication (MFA) is enabled for all IAM users that have a console password",
					ZeusCloudRules: []types.Rule{
						iam.MfaEnabledForConsoleAccess{},
					},
				},
				{
					ControlName: "1.3 - Ensure credentials unused for 90 days or greater are disabled",
					ZeusCloudRules: []types.Rule{
						iam.CredentialsUnused90Days{},
					},
				},
				{
					ControlName: "1.4 - Ensure access keys are rotated every 90 days or less",
					ZeusCloudRules: []types.Rule{
						iam.AccessKeysRotated90Days{},
					},
				},
				{
					ControlName: "1.5 - Ensure IAM password policy requires at least one uppercase letter",
					ZeusCloudRules: []types.Rule{
						iam.PasswordUppercaseRequired{},
					},
				},
				{
					ControlName: "1.6 - Ensure IAM password policy require at least one lowercase letter",
					ZeusCloudRules: []types.Rule{
						iam.PasswordLowercaseRequired{},
					},
				},
				{
					ControlName: "1.7 - Ensure IAM password policy require at least one symbol",
					ZeusCloudRules: []types.Rule{
						iam.PasswordSymbolsRequired{},
					},
				},
				{
					ControlName: "1.8 - Ensure IAM password policy require at least one number",
					ZeusCloudRules: []types.Rule{
						iam.PasswordNumbersRequired{},
					},
				},
				{
					ControlName: "1.9 - Ensure IAM password policy requires minimum length of 14 or greater",
					ZeusCloudRules: []types.Rule{
						iam.PasswordMinLength{},
					},
				},
				{
					ControlName: "1.10 - Ensure IAM password policy prevents password reuse",
					ZeusCloudRules: []types.Rule{
						iam.PasswordReusePrevention{},
					},
				},
				{
					ControlName: "1.11 - Ensure IAM password policy expires passwords within 90 days or less",
					ZeusCloudRules: []types.Rule{
						iam.PasswordExpiry{},
					},
				},
				{
					ControlName: "1.12 – Ensure no root user access key exists",
					ZeusCloudRules: []types.Rule{
						iam.NoRootAccessKeys{},
					},
				},
				{
					ControlName: "1.13 - Ensure MFA is enabled for the \"root\" account ",
					ZeusCloudRules: []types.Rule{
						iam.RootMfaEnabled{},
					},
				},
				{
					ControlName:    "1.14 - Ensure hardware MFA is enabled for the \"root\" account",
					ZeusCloudRules: []types.Rule{},
					Comment:        "ZeusCloud is working on rule(s) to verify this control.",
				},
				{
					ControlName:    "1.15 - Ensure security questions are registered in the AWS account",
					ZeusCloudRules: []types.Rule{},
					Comment:        "This control requires manual verification.",
				},
				{
					ControlName: "1.16 - Ensure IAM policies are attached only to groups or roles",
					ZeusCloudRules: []types.Rule{
						iam.NoUserPolicies{},
					},
				},
				{
					ControlName:    "1.17 - Maintain current contact details",
					ZeusCloudRules: []types.Rule{},
					Comment:        "This control requires manual verification.",
				},
				{
					ControlName:    "1.18 - Ensure security contact information is registered",
					ZeusCloudRules: []types.Rule{},
					Comment:        "This control requires manual verification.",
				},
				{
					ControlName:    "1.19 - Ensure IAM instance roles are used for AWS resource access from instances",
					ZeusCloudRules: []types.Rule{},
					Comment:        "This control requires manual verification.",
				},
				{
					ControlName: "1.20 - Ensure a support role has been created to manage incidents with AWS Support",
					ZeusCloudRules: []types.Rule{
						iam.SupportPolicy{},
					},
				},
				{
					ControlName: "1.21 - Do not setup access keys during initial user setup for all IAM users that have a console password",
					ZeusCloudRules: []types.Rule{
						iam.AvoidAccessKeysAtSetup{},
					},
				},
				{
					ControlName: "1.22 - Ensure IAM policies that allow full \"*:*\" administrative privileges are not created",
					ZeusCloudRules: []types.Rule{
						iam.NoStarPolicies{},
					},
				},
			},
		},
		{
			GroupName: "2 Logging",
			ComplianceControlSpecs: []ComplianceControlSpec{
				{
					ControlName: "2.1 – Ensure CloudTrail is enabled in all Regions",
					ZeusCloudRules: []types.Rule{
						cloudtrail.EnabledAllRegions{},
					},
				},
				{
					ControlName: "2.2 – Ensure CloudTrail log file validation is enabled",
					ZeusCloudRules: []types.Rule{
						cloudtrail.LogFileValidationEnabled{},
					},
				},
				{
					ControlName: "2.3 – Ensure the S3 bucket used to store CloudTrail logs is not publicly accessible",
					ZeusCloudRules: []types.Rule{
						cloudtrail.BucketNotPubliclyAccessible{},
					},
				},
				{
					ControlName: "2.4 – Ensure CloudTrail trails are integrated with Amazon CloudWatch Logs",
					ZeusCloudRules: []types.Rule{
						cloudtrail.DeliveredToCloudwatch{},
					},
				},
				{
					ControlName:    "2.5 – Ensure AWS Config is enabled",
					ZeusCloudRules: []types.Rule{},
					Comment:        "ZeusCloud is working on rule(s) to verify this control.",
				},
				{
					ControlName: "2.6 – Ensure S3 bucket access logging is enabled on the CloudTrail S3 bucket",
					ZeusCloudRules: []types.Rule{
						cloudtrail.BucketAccessLogging{},
					},
				},
				{
					ControlName: "2.7 – Ensure CloudTrail logs are encrypted at rest using AWS KMS keys",
					ZeusCloudRules: []types.Rule{
						cloudtrail.TrailsAtRestEncrypted{},
					},
				},
				{
					ControlName: "2.8 – Ensure rotation for customer-created KMS keys is enabled",
					ZeusCloudRules: []types.Rule{
						kms.RotationEnabledForCMK{},
					},
				},
				{
					ControlName: "2.9 – Ensure VPC flow logging is enabled in all VPCs",
					ZeusCloudRules: []types.Rule{
						vpc.EnableFlowLogs{},
					},
				},
			},
		},
		{
			GroupName: "3 Monitoring",
			ComplianceControlSpecs: []ComplianceControlSpec{
				{
					ControlName: "3.1 – Ensure a log metric filter and alarm exist for unauthorized API calls",
					ZeusCloudRules: []types.Rule{
						cloudwatch.UnauthorizedAPI{},
					},
				},
				{
					ControlName: "3.2 – Ensure a log metric filter and alarm exist for Management Console sign-in without MFA",
					ZeusCloudRules: []types.Rule{
						cloudwatch.SignInWithoutMFA{},
					},
				},
				{
					ControlName: "3.3 – Ensure a log metric filter and alarm exist for usage of \"root\" account",
					ZeusCloudRules: []types.Rule{
						cloudwatch.RootAccountUsage{},
					},
				},
				{
					ControlName: "3.4 – Ensure a log metric filter and alarm exist for IAM policy changes",
					ZeusCloudRules: []types.Rule{
						cloudwatch.IAMPolicyChanges{},
					},
				},
				{
					ControlName: "3.5 – Ensure a log metric filter and alarm exist for CloudTrail configuration changes",
					ZeusCloudRules: []types.Rule{
						cloudwatch.CloudtrailConfigurationChanges{},
					},
				},
				{
					ControlName: "3.6 – Ensure a log metric filter and alarm exist for AWS Management Console authentication failures",
					ZeusCloudRules: []types.Rule{
						cloudwatch.AWSConsoleAuthFailures{},
					},
				},
				{
					ControlName: "3.7 – Ensure a log metric filter and alarm exist for disabling or scheduled deletion of customer created CMKs",
					ZeusCloudRules: []types.Rule{
						cloudwatch.CMKDisableOrDelete{},
					},
				},
				{
					ControlName: "3.8 – Ensure a log metric filter and alarm exist for S3 bucket policy changes",
					ZeusCloudRules: []types.Rule{
						cloudwatch.BucketPolicyChanges{},
					},
				},
				{
					ControlName: "3.9 – Ensure a log metric filter and alarm exist for AWS Config configuration changes",
					ZeusCloudRules: []types.Rule{
						cloudwatch.ConfigConfigurationChanges{},
					},
				},
				{
					ControlName: "3.10 – Ensure a log metric filter and alarm exist for security group changes",
					ZeusCloudRules: []types.Rule{
						cloudwatch.SecurityGroupChanges{},
					},
				},
				{
					ControlName: "3.11 - Ensure a log metric filter and alarm exist for changes to Network Access Control Lists (NACL)",
					ZeusCloudRules: []types.Rule{
						cloudwatch.NACLChanges{},
					},
				},
				{
					ControlName: "3.12 - Ensure a log metric filter and alarm exist for changes to network gateways",
					ZeusCloudRules: []types.Rule{
						cloudwatch.NetworkGatewayChanges{},
					},
				},
				{
					ControlName: "3.13 - Ensure a log metric filter and alarm exist for route table changes",
					ZeusCloudRules: []types.Rule{
						cloudwatch.RouteTableChanges{},
					},
				},
				{
					ControlName: "3.14 - Ensure a log metric filter and alarm exist for VPC changes",
					ZeusCloudRules: []types.Rule{
						cloudwatch.VPCChanges{},
					},
				},
			},
		},
		{
			GroupName: "4 Networking",
			ComplianceControlSpecs: []ComplianceControlSpec{
				{
					ControlName: "4.1 - Ensure no security groups allow ingress from 0.0.0.0/0 to port 22",
					ZeusCloudRules: []types.Rule{
						vpc.BlockPublicServerAdminIngressIpv4{},
					},
				},
				{
					ControlName: "4.2 - Ensure no security groups allow ingress from 0.0.0.0/0 to port 3389 ",
					ZeusCloudRules: []types.Rule{
						vpc.BlockPublicServerAdminIngressIpv4{},
					},
				},
				{
					ControlName: "4.3 - Ensure the default security group of every VPC restricts all traffic",
					ZeusCloudRules: []types.Rule{
						vpc.DefaultSecurityGroupsBlockTraffic{},
					},
				},
				{
					ControlName:    "4.4 - Ensure routing tables for VPC peering are \"least access\"",
					ZeusCloudRules: []types.Rule{},
					Comment:        "This control requires manual verification.",
				},
			},
		},
	},
}
