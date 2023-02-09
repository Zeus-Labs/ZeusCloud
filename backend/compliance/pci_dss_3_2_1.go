package compliance

import (
	"github.com/IronLeap/IronCloud/rules/cloudtrail"
	"github.com/IronLeap/IronCloud/rules/cloudwatch"
	"github.com/IronLeap/IronCloud/rules/ec2"
	"github.com/IronLeap/IronCloud/rules/elasticsearch"
	"github.com/IronLeap/IronCloud/rules/elbv2"
	"github.com/IronLeap/IronCloud/rules/iam"
	"github.com/IronLeap/IronCloud/rules/kms"
	"github.com/IronLeap/IronCloud/rules/rds"
	"github.com/IronLeap/IronCloud/rules/s3"
	"github.com/IronLeap/IronCloud/rules/secretsmanager"
	"github.com/IronLeap/IronCloud/rules/securityhub"
	"github.com/IronLeap/IronCloud/rules/sqs"
	"github.com/IronLeap/IronCloud/rules/types"
	"github.com/IronLeap/IronCloud/rules/vpc"
)

var Pci_dss_3_2_1_Spec ComplianceFrameworkSpec = ComplianceFrameworkSpec{
	FrameworkName: "PCI DSS 3.2.1",
	ComplianceControlGroupSpecs: []ComplianceControlGroupSpec{
		{
			GroupName: "Requirement 1: Install and maintain a firewall configuration to protect cardholder data",
			ComplianceControlSpecs: []ComplianceControlSpec{
				{
					ControlName: "1.2.1 - Restrict inbound and outbound traffic to that which is necessary for the cardholder data environment, and specifically deny all other traffic.",
					IronCloudRules: []types.Rule{
						vpc.BlockPublicServerAdminIngressIpv4{},
						ec2.AvoidPublicIPs{},
						rds.InstanceNotPubliclyAccessible{},
						s3.RestrictPubliclyReadable{},
						s3.RestrictPubliclyWritable{},
						s3.BlockPublicAccessConfig{},
					},
				},
				{
					ControlName: "1.3 - Prohibit direct public access between the Internet and any system component in the cardholder data environment.",
					IronCloudRules: []types.Rule{
						iam.RootMfaEnabled{},
						ec2.AvoidPublicIPs{},
						rds.InstanceNotPubliclyAccessible{},
						s3.RestrictPubliclyReadable{},
						s3.RestrictPubliclyWritable{},
						s3.BlockPublicAccessConfig{},
						vpc.DefaultSecurityGroupsBlockTraffic{},
						vpc.BlockPublicServerAdminIngressIpv4{},
					},
				},
			},
		},
		{
			GroupName: "Requirement 2: Do not use vendor-supplied defaults for system passwords and other security parameters",
			ComplianceControlSpecs: []ComplianceControlSpec{
				{
					ControlName: "2.1 - Always change vendor-supplied defaults and remove or disable unnecessary default accounts before installing a system on the network. This applies to ALL default passwords, including but not limited to those used by operating systems, software that provides security services, application and system accounts, point-of-sale (POS) terminals, payment applications, Simple Network Management Protocol (SNMP) community strings, etc.).",
					IronCloudRules: []types.Rule{
						vpc.DefaultSecurityGroupsBlockTraffic{},
					},
				},
				{
					ControlName: "2.2 - Develop configuration standards for all system components. Assure that these standards address all known security vulnerabilities and are consistent with industry-accepted system hardening standards. Sources of industry-accepted system hardening standards may include, but are not limited to: • Center for Internet Security (CIS) • International Organization for Standardization (ISO) • SysAdmin Audit Network Security (SANS) Institute • National Institute of Standards Technology (NIST).",
					IronCloudRules: []types.Rule{
						cloudtrail.EnabledAllRegions{},
						iam.AccessKeysRotated90Days{},
						ec2.AvoidPublicIPs{},
						cloudtrail.DeliveredToCloudwatch{},
						cloudtrail.TrailsAtRestEncrypted{},
						cloudtrail.LogFileValidationEnabled{},
						cloudtrail.LogS3ObjectReadEvents{},
						cloudtrail.LogS3ObjectWriteEvents{},
						kms.RotationEnabledForCMK{},
						ec2.EBSAtRestEncrypted{},
						iam.NoInlinePolicies{},
						iam.NoStarPolicies{},
						iam.NoRootAccessKeys{},
						iam.NoUserPolicies{},
						iam.CredentialsUnused90Days{},
						iam.MfaEnabledForConsoleAccess{},
						iam.RootMfaEnabled{},
						s3.BlockPublicAccessConfig{},
						s3.AccessLoggingEnabled{},
						s3.RestrictPubliclyReadable{},
						s3.RestrictPubliclyWritable{},
						s3.EnableServerSideEncryption{},
						s3.EnforceInTransitEncryption{},
						vpc.BlockPublicServerAdminIngressIpv4{},
						vpc.EnableFlowLogs{},
						vpc.DefaultSecurityGroupsBlockTraffic{},
					},
				},
				{
					ControlName: "2.2.2 - Enable only necessary services, protocols, daemons, etc., as required for the function of the system.",
					IronCloudRules: []types.Rule{
						vpc.BlockPublicServerAdminIngressIpv4{},
						vpc.DefaultSecurityGroupsBlockTraffic{},
					},
				},
				{
					ControlName:    "2.2.3 - Implement additional security features for any required services, protocols, or daemons that are considered to be insecure.",
					IronCloudRules: []types.Rule{},
					Comment:        "IronCloud is working on rule(s) to verify this control.",
				},
				{
					ControlName: "2.3 - Encrypt all non-console administrative access using strong cryptography.",
					IronCloudRules: []types.Rule{
						elbv2.AvoidInsecureCiphers{},
						s3.EnforceInTransitEncryption{},
					},
				},
				{
					ControlName: "2.4 - Maintain an inventory of system components that are in scope for PCI DSS.",
					IronCloudRules: []types.Rule{
						ec2.UnusedEIPAddresses{},
						vpc.UnusedSecurityGroups{},
					},
				},
			},
		},
		{
			GroupName: "Requirement 3: Protect stored cardholder data",
			ComplianceControlSpecs: []ComplianceControlSpec{
				{
					ControlName:    "3.1 - Keep cardholder data storage to a minimum by implementing data retention and disposal policies, procedures and processes that include at least the following for all cardholder data (CHD) storage: • Limiting data storage amount and retention time to that which is required for legal, regulatory, and/or business requirements • Specific retention requirements for cardholder data • Processes for secure deletion of data when no longer needed • A quarterly process for identifying and securely deleting stored cardholder data that exceeds defined retention.",
					IronCloudRules: []types.Rule{},
					Comment:        "IronCloud is working on rule(s) to verify this control.",
				},
				{
					ControlName: "3.4 - Render PAN unreadable anywhere it is stored (including on portable digital media, backup media, and in logs) by using any of the following approaches: • One-way hashes based on strong cryptography, (hash must be of the entire PAN) • Truncation (hashing cannot be used to replace the truncated segment of PAN) • Index tokens and pads (pads must be securely stored) • Strong cryptography with associated key-management processes and procedures. Note: It is a relatively trivial effort for a malicious individual to reconstruct original PAN data if they have access to both the truncated and hashed version of a PAN. Where hashed and truncated versions of the same PAN are present in an entity’s environment, additional controls must be in place to ensure that the hashed and truncated versions cannot be correlated to reconstruct the original PAN.",
					IronCloudRules: []types.Rule{
						cloudtrail.TrailsAtRestEncrypted{},
						ec2.EBSAtRestEncrypted{},
						ec2.EBSSnapshotEncrypted{},
						s3.EnableServerSideEncryption{},
						rds.InstanceAtRestEncrypted{},
						sqs.EnableServerSideEncryptionWithKMS{},
					},
				},
				{
					ControlName:    "3.5.2 - Restrict access to cryptographic keys to the fewest number of custodians necessary.",
					IronCloudRules: []types.Rule{},
					Comment:        "IronCloud is working on rule(s) to verify this control.",
				},
				{
					ControlName: "3.5.3 - Store secret and private keys used to encrypt/decrypt cardholder data in one (or more) of the following forms at all times: • Encrypted with a key-encrypting key that is at least as strong as the data- encrypting key, and that is stored separately from the data-encrypting key • Within a secure cryptographic device (such as a hardware (host) security module (HSM) or PTS-approved point-of-interaction device) • As at least two full-length key components or key shares, in accordance with an industry- accepted method Note: It is not required that public keys be stored in one of these forms.",
					IronCloudRules: []types.Rule{
						s3.EnableServerSideEncryption{},
					},
				},
				{
					ControlName: "3.6.4 - Cryptographic key changes for keys that have reached the end of their cryptoperiod (for example, after a defined period of time has passed and/or after a certain amount of cipher-text has been produced by a given key), as defined by the associated application vendor or key owner, and based on industry best practices and guidelines (for example, NIST Special Publication 800-57).",
					IronCloudRules: []types.Rule{
						kms.RotationEnabledForCMK{},
					},
				},
				{
					ControlName: "3.6.5 - Retirement or replacement (for example, archiving, destruction, and/or revocation) of keys as deemed necessary when the integrity of the key has been weakened (for example, departure of an employee with knowledge of a clear-text key component), or keys are suspected of being compromised. Note: If retired or replaced cryptographic keys need to be retained, these keys must be securely archived (for example, by using a key-encryption key). Archived cryptographic keys should only be used for decryption/verification purposes.",
					IronCloudRules: []types.Rule{
						cloudwatch.CMKDisableOrDelete{},
					},
				},
				{
					ControlName: "3.6.7 - Prevention of unauthorized substitution of cryptographic keys.",
					IronCloudRules: []types.Rule{
						cloudwatch.CMKDisableOrDelete{},
					},
				},
			},
		},
		{
			GroupName: "Requirement 4: Encrypt transmission of cardholder data across open, public networks",
			ComplianceControlSpecs: []ComplianceControlSpec{
				{
					ControlName: "4.1 - Use strong cryptography and security protocols to safeguard sensitive cardholder data during transmission over open, public networks, including the following: • Only trusted keys and certificates are accepted. • The protocol in use only supports secure versions or configurations. • The encryption strength is appropriate for the encryption methodology in use. Examples of open, public networks include but are not limited to: • The Internet • Wireless technologies, including 802.11 and Bluetooth • Cellular technologies, for example, Global System for Mobile communications (GSM), Code division multiple access (CDMA) • General Packet Radio Service (GPRS) • Satellite communications",
					IronCloudRules: []types.Rule{
						elbv2.AvoidInsecureCiphers{},
						s3.EnforceInTransitEncryption{},
					},
				},
			},
		},
		{
			GroupName: "Requirement 6: Develop and maintain secure systems and applications",
			ComplianceControlSpecs: []ComplianceControlSpec{
				{
					ControlName: "6.2 - Ensure that all system components and software are protected from known vulnerabilities by installing applicable vendor- supplied security patches. Install critical security patches within one month of release. Note: Critical security patches should be identified according to the risk ranking process defined in Requirement 6.1.",
					IronCloudRules: []types.Rule{
						rds.InstanceAutoMinorVersionUpgrade{},
					},
				},
				{
					ControlName:    "6.3.2 - Review custom code prior to release to production or customers in order to identify any potential coding vulnerability (using either manual or automated processes) to include at least the following: • Code changes are reviewed by individuals other than the originating code author, and by individuals knowledgeable about code-review techniques and secure coding practices. • Code reviews ensure code is developed according to secure coding guidelines • Appropriate corrections are implemented prior to release. • Code-review results are reviewed and approved by management prior to release.",
					IronCloudRules: []types.Rule{},
					Comment:        "IronCloud is working on rule(s) to verify this control.",
				},
				{
					ControlName:    "6.6 - For public-facing web applications, address new threats and vulnerabilities on an ongoing basis and ensure these applications are protected against known attacks by either of the following methods: • Reviewing public-facing web applications via manual or automated application vulnerability security assessment tools or methods, at least annually and after any changes Note: This assessment is not the same as the vulnerability scans performed for Requirement 11.2. • Installing an automated technical solution that detects and prevents web- based attacks (for example, a web- application firewall) in front of public- facing web applications, to continually check all traffic.",
					IronCloudRules: []types.Rule{},
					Comment:        "IronCloud is working on rule(s) to verify this control.",
				},
			},
		},
		{
			GroupName: "Requirement 7: Restrict access to cardholder data by business need-to-know",
			ComplianceControlSpecs: []ComplianceControlSpec{
				{
					ControlName: "7.1 - Limit access to system components and cardholder data to only those individuals whose job requires such access.",
					IronCloudRules: []types.Rule{
						iam.NoUserPolicies{},
						iam.UserAttachedToGroup{},
						iam.NoRootAccessKeys{},
						iam.NoStarPolicies{},
						iam.NoInlinePolicies{},
						iam.NonEmptyIAMGroups{},
					},
				},
				{
					ControlName: "7.2 - Establish an access control system(s) for systems components that restricts access based on a user’s need to know, and is set to \"deny all\" unless specifically allowed.",
					IronCloudRules: []types.Rule{
						iam.NoUserPolicies{},
						iam.UserAttachedToGroup{},
						iam.NoRootAccessKeys{},
						iam.NoStarPolicies{},
						iam.NoInlinePolicies{},
						iam.NonEmptyIAMGroups{},
					},
				},
				{
					ControlName:    "7.2.3 - Default “deny-all” setting.",
					IronCloudRules: []types.Rule{},
					Comment:        "IronCloud is working on rule(s) to verify this control.",
				},
			},
		},
		{
			GroupName: "Requirement 8: Identify and authenticate access to system components",
			ComplianceControlSpecs: []ComplianceControlSpec{
				{
					ControlName: "8.1.1 - Assign all users a unique ID before allowing them to access system components or cardholder data.",
					IronCloudRules: []types.Rule{
						iam.NoRootAccessKeys{},
					},
				},
				{
					ControlName: "8.1.4 - Remove/disable inactive user accounts within 90 days.",
					IronCloudRules: []types.Rule{
						iam.CredentialsUnused90Days{},
					},
				},
				{
					ControlName: "8.2.1 - Using strong cryptography, render all authentication credentials (such as passwords/phrases) unreadable during transmission and storage on all system components.",
					IronCloudRules: []types.Rule{
						ec2.EBSAtRestEncrypted{},
						ec2.EBSSnapshotEncrypted{},
						elasticsearch.DomainsAtRestEncrypted{},
						rds.InstanceAtRestEncrypted{},
						secretsmanager.SecretKmsCmkEncryption{},
						s3.EnableServerSideEncryption{},
						s3.EnforceInTransitEncryption{},
						elbv2.AvoidInsecureCiphers{},
					},
				},
				{
					ControlName: "8.2.3 - Passwords/passphrases must meet the following: • Require a minimum length of at least seven characters. • Contain both numeric and alphabetic characters. Alternatively, the passwords/ passphrases must have complexity and strength at least equivalent to the parameters specified above.",
					IronCloudRules: []types.Rule{
						iam.PasswordNumbersRequired{},
						iam.PasswordMinLength{},
					},
				},
				{
					ControlName: "8.2.4 - Change user passwords/passphrases at least once every 90 days.",
					IronCloudRules: []types.Rule{
						secretsmanager.SecretRotatesWithin90Days{},
						iam.AccessKeysRotated90Days{},
						iam.PasswordExpiry{},
					},
				},
				{
					ControlName: "8.2.5 - Do not allow an individual to submit a new password/passphrase that is the same as any of the last four passwords/passphrases he or she has used.",
					IronCloudRules: []types.Rule{
						iam.PasswordReusePrevention{},
					},
				},
				{
					ControlName: "8.3.1 - Incorporate multi-factor authentication for all non-console access into the CDE for personnel with administrative access.",
					IronCloudRules: []types.Rule{
						iam.MfaEnabledForConsoleAccess{},
						iam.RootMfaEnabled{},
					},
				},
				{
					ControlName: "8.3.2 - Incorporate multi-factor authentication for all remote network access (both user and administrator, and including third-party access for support or maintenance) originating from outside the entity’s network.",
					IronCloudRules: []types.Rule{
						iam.MfaEnabledForConsoleAccess{},
						iam.RootMfaEnabled{},
					},
				},
			},
		},
		{
			GroupName: "Requirement 10: Track and monitor all access to network resources and cardholder data",
			ComplianceControlSpecs: []ComplianceControlSpec{
				{
					ControlName: "10.1 - Implement audit trails to link all access to system components to each individual user.",
					IronCloudRules: []types.Rule{
						cloudtrail.EnabledAllRegions{},
						s3.AccessLoggingEnabled{},
						cloudtrail.LogS3ObjectReadEvents{},
						cloudtrail.LogS3ObjectWriteEvents{},
						vpc.EnableFlowLogs{},
					},
				},
				{
					ControlName: "10.5.2 - Protect audit trail files from unauthorized modifications.",
					IronCloudRules: []types.Rule{
						s3.EnableServerSideEncryption{},
						cloudtrail.TrailsAtRestEncrypted{},
					},
				},
				{
					ControlName: "10.5.3 - Promptly back up audit trail files to a centralized log server or media that is difficult to alter.",
					IronCloudRules: []types.Rule{
						cloudtrail.DeliveredToCloudwatch{},
					},
				},
				{
					ControlName: "10.5.5 - Use file-integrity monitoring or change-detection software on logs to ensure that existing log data cannot be changed without generating alerts (although new data being added should not cause an alert).",
					IronCloudRules: []types.Rule{
						cloudtrail.LogFileValidationEnabled{},
						s3.BucketsVersioned{},
					},
				},
				{
					ControlName:    "10.7 - Retain audit trail history for at least one year, with a minimum of three months immediately available for analysis (for example, online, archived, or restorable from backup).",
					IronCloudRules: []types.Rule{},
					Comment:        "IronCloud is working on rule(s) to verify this control.",
				},
			},
		},
		{
			GroupName: "Requirement 11: Regularly test security systems and processes",
			ComplianceControlSpecs: []ComplianceControlSpec{
				{
					ControlName:    "11.2.3 - Perform internal and external scans, and rescans as needed, after any significant change. Scans must be performed by qualified personnel.",
					IronCloudRules: []types.Rule{},
					Comment:        "IronCloud is working on rule(s) to verify this control.",
				},
				{
					ControlName:    "11.4 - Use intrusion-detection and/or intrusion-prevention techniques to detect and/or prevent intrusions into the network. Monitor all traffic at the perimeter of the cardholder data environment as well as at critical points in the cardholder data environment, and alert personnel to suspected compromises. Keep all intrusion-detection and prevention engines, baselines, and signatures up to date.",
					IronCloudRules: []types.Rule{},
					Comment:        "IronCloud is working on rule(s) to verify this control.",
				},
				{
					ControlName: "11.5 - Deploy a change-detection mechanism (for example, file-integrity monitoring tools) to alert personnel to unauthorized modification (including changes, additions, and deletions) of critical system files, configuration files, or content files; and configure the software to perform critical file comparisons at least weekly.",
					IronCloudRules: []types.Rule{
						securityhub.EnableSecurityHub{},
						cloudtrail.LogFileValidationEnabled{},
					},
				},
			},
		},
	},
}
