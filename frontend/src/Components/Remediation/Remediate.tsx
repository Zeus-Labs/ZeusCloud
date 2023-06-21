import { LogMetricUnauthorizedApiCalls } from "./MonitoringRemediationComponents/LogMetricUnauthorizedApiCalls";
import { LogMetricConsoleNoMfaSignIn } from "./MonitoringRemediationComponents/LogMetricConsoleNoMfaSignIn";
import { LogMetricRoot } from "./MonitoringRemediationComponents/LogMetricRoot";
import { RemediateProps } from "./RemediationTypes";
import { LogMetricIamPolicy } from "./MonitoringRemediationComponents/LogMetricIamPolicy";
import { LogMetricCloudtrailConfigChanges } from "./MonitoringRemediationComponents/LogMetricCloudtrailConfigChanges";
import { LogMetricConsoleAuthentication } from "./MonitoringRemediationComponents/LogMetricConsoleAuthentication";
import { LogCmkChanges } from "./MonitoringRemediationComponents/LogCmkChanges";
import { LogMetricS3BucketPolicyChanges } from "./MonitoringRemediationComponents/LogMetricS3BucketPolicyChanges";
import { LogMetricAwsConfig } from "./MonitoringRemediationComponents/LogMetricAwsConfig";
import { LogMetricSecurityGroupChanges } from "./MonitoringRemediationComponents/LogMetricSecurityGroupChanges";
import { LogMetricNaclChanges } from "./MonitoringRemediationComponents/LogMetricNaclChanges";
import { LogMetricNetworkGatewayChanges } from "./MonitoringRemediationComponents/LogMetricNetworkGatewayChanges";
import { LogRouteTableChanges } from "./MonitoringRemediationComponents/LogRouteTableChanges";
import { LogVpcChanges } from "./MonitoringRemediationComponents/LogVpcChanges";
import { LogMetricAwsOrgChanges } from "./MonitoringRemediationComponents/LogMetricAwsOrgChanges";
import { LogEc2DetailedMonitoring } from "./MonitoringRemediationComponents/LogEc2DetailedMonitoring";
import { Ec2PublicExposed } from "./PubliclyExposed/Ec2PublicExposed";
import { Ec2AmiExposed } from "./PubliclyExposed/Ec2AmiExposed";
import { EbsVolumeEncrypted } from "./PoorEncryptionComponents/EbsVolumeEncrypted";
import { EbsSnapshotEncrypted } from "./PoorEncryptionComponents/EbsSnapshotEncrypted";
import { ElasticsearchDomainEncryption } from "./PoorEncryptionComponents/ElasticsearchDomainEncryption";
import { ElbInsecureCypher } from "./PoorEncryptionComponents/ElbInsecureCypher";
import { IamGroupMinUser } from "./IamMisconfigurationComponents/IamGroupMinUser";
import { IamUserMinGroup } from "./IamMisconfigurationComponents/IamUserMinGroup";
import { IamPolicyGroupRole } from "./IamMisconfigurationComponents/IamPolicyGroupRole";
import { IamSupportPolicy } from "./IamMisconfigurationComponents/IamSupportPolicy";
import { IamPolicyNotAdmin } from "./IamMisconfigurationComponents/IamPolicyNotAdmin";
import { IamNoInlinePolicy } from "./IamMisconfigurationComponents/IamNoInlinePolicy";
import { AccessKeyRotationLimit } from "./IamMisconfigurationComponents/AccessKeyIamUserLimit";
import { RemoveExpiredCertificate } from "./PoorEncryptionComponents/RemoveExpiredCertificate";
import { MfaEnabledIamPassword } from "./IamMisconfigurationComponents/MfaEnabledIamPassword";
import { RemoveUnusedIamCredentials } from "./IamMisconfigurationComponents/RemoveUnusedIamCredentials";
import { CloudtrailEncryption } from "./PoorEncryptionComponents/CloudtrailEncryption";
import { LogEnabledCloudtrailS3Bucket } from "./MonitoringRemediationComponents/LogEnabledCloudtrailS3Bucket";
import { S3BucketObjectLoggingReads } from "./MonitoringRemediationComponents/S3BucketObjectLoggingReads";
import { S3BucketObjectLoggingWrites } from "./MonitoringRemediationComponents/S3BucketObjectLoggingWrites";
import { RdsPublicExposed } from "./PubliclyExposed/RdsPublicExposed";
import { IamAuthRds } from "./IamMisconfigurationComponents/IamAuthRds";
import { RdsAutoMinorVersionUpgrade } from "./PatchingComponents/RdsAutoMinorVersionUpgrade";
import { RdsInstancesEncrypted } from "./PoorEncryptionComponents/RdsInstancesEncrypted";
import { SecretEncryptionCustomerKms } from "./PoorEncryptionComponents/SecretEncryptionCustomerKms";
import { AutomaticSecretRotation } from "./IamMisconfigurationComponents/AutomaticSecretRotation";
import { SecretRotationNinetyDays } from "./IamMisconfigurationComponents/SecretRotationNinetyDays";
import { UnusedSecret } from "./IamMisconfigurationComponents/UnusedSecret";
import { S3PublicReadable } from "./PubliclyExposed/S3PublicReadable";
import { S3PublicWritable } from "./PubliclyExposed/S3PublicWritable";
import { S3ServerSideEncryption } from "./PoorEncryptionComponents/S3ServerSideEncryption";
import { S3BucketHttpsRequests } from "./PoorEncryptionComponents/S3BucketHttpsRequests";
import { S3BlockPublicSettings } from "./PubliclyExposed/S3BlockPublicSettings";
import { LogEnableS3ServerAccess } from "./MonitoringRemediationComponents/LogEnableS3ServerAccess";
import { SqsServerSideEncryption } from "./PoorEncryptionComponents/SqsServerSideEncryption";
import { SecurityGroupIngressPorts } from "./PubliclyExposed/SecurityGroupIngressPorts";
import { LogVpcFlow } from "./MonitoringRemediationComponents/LogVpcFlow";
import { S3BucketCloudtrailLog } from "./PubliclyExposed/S3BucketCloudtrailLog";
import { RootAccountAccessKeys } from "./IamMisconfigurationComponents/RootAccountAccessKeys";
import { MfaEnabledRootAccount } from "./IamMisconfigurationComponents/MfaEnabledRootAccount";
import { IamInitialSetupAccessKey } from "./IamMisconfigurationComponents/IamInitialSetupAccessKey";
import { PasswordPolicyUppercase } from "./IamMisconfigurationComponents/PasswordPolicyUppercase";
import { PasswordPolicyLowercase } from "./IamMisconfigurationComponents/PasswordPolicyLowercase";
import { PasswordPolicySymbol } from "./IamMisconfigurationComponents/PasswordPolicySymbol";
import { PasswordPolicyNumber } from "./IamMisconfigurationComponents/PasswordPolicyNumber";
import { PasswordPolicyLength } from "./IamMisconfigurationComponents/PasswordPolicyLength";
import { PasswordPolicyReuse } from "./IamMisconfigurationComponents/PasswordPolicyReuse";
import { PasswordPolicyExpiry } from "./IamMisconfigurationComponents/PasswordPolicyExpiry";
import { RotateCmkEnabled } from "./PoorEncryptionComponents/RotateCmkEnabled";
import { Ec2UnusedEipAddresses } from "./OtherComponents/Ec2UnusedEipAddresses";
import { EbsOptimizedEnabled } from "./OtherComponents/EbsOptimizedEnabled";
import { IamRootUsage } from "./OtherComponents/IamRootUsage";
import { CloudtrailCloudwatchIntegration } from "./MonitoringRemediationComponents/CloudtrailCloudwatchIntegration";
import { CloudtrailEnableAllRegions } from "./MonitoringRemediationComponents/CloudtrailEnableAllRegions";
import { SecurityHubEnabled } from "./MonitoringRemediationComponents/SecurityHubEnabled";
import { S3VersionedBuckets } from "./OtherComponents/S3VersionedBuckets";
import { VpcUnusedSecurityGroups } from "./OtherComponents/VpcUnusedSecurityGroups";
import { VpcEc2Classic } from "./OtherComponents/VpcEc2Classic";
import { SecurityGroupRestrictTraffic } from "./OtherComponents/SecurityGroupRestrictTraffic";
import { CloudtrailLogFileValidation } from "./MonitoringRemediationComponents/CloudtrailLogFileValidation";
import { S3MfaDelete } from "./OtherComponents/S3MfaDelete";
import { VpcExcessiveSecurityGroup } from "./OtherComponents/VpcExcessiveSecurityGroup";
import { ThirdPartyAdminPermissions } from "./AttackPathComponents/ThirdPartyAdminPermissions";
import { ThirdPartyHighPermissions } from "./AttackPathComponents/ThirdPartyHighPermissions";
import { PubliclyExposedVmAdminPermissions } from "./AttackPathComponents/PubliclyExposedVmAdminPermissions";
import { PubliclyExposedVmHighPermissions } from "./AttackPathComponents/PubliclyExposedVmHighPermissions";
import { PubliclyExposedServerlessAdminPermissions } from "./AttackPathComponents/PubliclyExposedServerlessAdminPermissions";
import { PubliclyExposedServerlessHighPermissions } from "./AttackPathComponents/PubliclyExposedServerlessHighPermissions";
import { PubliclyExposedServerlessPrivilegeEscalation } from "./AttackPathComponents/PubliclyExposedServerlessPrivilegeEscalation";
import { PubliclyExposedVmPrivilegeEscalation } from "./AttackPathComponents/PubliclyExposedVmPrivilegeEscalation";
import { PrivateServerlessAdminPermissions } from "./AttackPathComponents/PrivateServerlessAdminPermissions";
import { PubliclyExposedVmHighIMDSv1Enabled } from "./AttackPathComponents/PubliclyExposedVmHighIMDSv1Enabled";
import { PubliclyExposedVmAdminIMDSv1Enabled } from "./AttackPathComponents/PubliclyExposedVmAdminIMDSv1Enabled";
import { PubliclyExposedVmIMDSv1EnabledAccessCrownJewelS3 } from "./AttackPathComponents/PubliclyExposedVmIMDSv1EnabledAccessCrownJewelS3";


export const Remediate = ({rule_data} : RemediateProps) => {
   const ruleId: string = rule_data.uid;
   switch (ruleId) {
      case "cloudwatch/unauthorized_api": 
         return <LogMetricUnauthorizedApiCalls/>
      case "cloudwatch/sign_in_without_mfa": 
         return <LogMetricConsoleNoMfaSignIn/>
      case "cloudwatch/root_account_usage": 
         return <LogMetricRoot/>
      case "cloudwatch/iam_policy_changes":
         return <LogMetricIamPolicy/>
      case "cloudwatch/cloudtrail_configuration_changes":
         return <LogMetricCloudtrailConfigChanges/>
      case "cloudwatch/aws_console_auth_failures": 
         return <LogMetricConsoleAuthentication/>
      case "cloudwatch/cmk_disable_or_delete": 
         return <LogCmkChanges/>
      case "cloudwatch/bucket_policy_changes":
         return  <LogMetricS3BucketPolicyChanges/>
      case "cloudwatch/config_configuration_changes": 
         return <LogMetricAwsConfig/>
      case "cloudwatch/security_group_changes": 
         return <LogMetricSecurityGroupChanges/>
      case "cloudwatch/nacl_changes": 
         return <LogMetricNaclChanges/>
      case "cloudwatch/network_gateway_changes": 
         return <LogMetricNetworkGatewayChanges/>
      case "cloudwatch/route_table_changes": 
         return <LogRouteTableChanges/>
      case "cloudwatch/vpc_changes": 
         return <LogVpcChanges/>
      case "cloudwatch/organization_changes": 
         return <LogMetricAwsOrgChanges/>
      case "ec2/detailed_monitoring_enabled": 
         return <LogEc2DetailedMonitoring/>
      case "ec2/no_public_amis": 
         return <Ec2AmiExposed/>
      case "ec2/avoid_public_ips": 
         return <Ec2PublicExposed/>
      case "ec2/ebs_at_rest_encrypted": 
         return <EbsVolumeEncrypted/>
      case "ec2/ebs_snapshot_encrypted": 
         return <EbsSnapshotEncrypted/>
      case "elasticsearch/domains_at_rest_encrypted": 
         return <ElasticsearchDomainEncryption/>
      case "elbv2/avoid_insecure_ciphers": 
         return <ElbInsecureCypher/>
      case "iam/non_empty_iam_groups": 
         return <IamGroupMinUser/>
      case "iam/user_attached_to_group": 
         return <IamUserMinGroup/>
      case "iam/no_user_policies": 
         return <IamPolicyGroupRole/>
      case "iam/support_policy": 
         return <IamSupportPolicy/>
      case "iam/no_star_policies": 
         return <IamPolicyNotAdmin/>
      case "iam/no_inline_policies": 
         return <IamNoInlinePolicy/>
      case "iam/user_active_access_keys": 
         return <AccessKeyRotationLimit/>
      case "iam/expired_server_certificates": 
         return <RemoveExpiredCertificate/>
      case "iam/mfa_enabled_for_console_access":
         return <MfaEnabledIamPassword/>
      case "iam/credentials_unused_90_days": 
         return <RemoveUnusedIamCredentials/>
      case "cloudtrail/trails_at_rest_encrypted": 
         return <CloudtrailEncryption/>
      case "cloudtrail/bucket_access_logging": 
         return <LogEnabledCloudtrailS3Bucket/>
      case "cloudtrail/log_s3_object_read_events":
         return <S3BucketObjectLoggingReads/>
      case "cloudtrail/log_s3_object_write_events":
         return <S3BucketObjectLoggingWrites/>
      case "rds/instance_not_publicly_accessible":
         return <RdsPublicExposed/>
      case "rds/instance_iam_authentication_enabled":
         return <IamAuthRds/>
      case "rds/instance_auto_minor_version_upgrade":
         return <RdsAutoMinorVersionUpgrade/>
      case "rds/instance_at_rest_encrypted":
         return <RdsInstancesEncrypted/>
      case "secretsmanager/secret_kms_cmk_encryption": 
         return <SecretEncryptionCustomerKms/>
      case "secretsmanager/secret_rotation_enabled": 
         return <AutomaticSecretRotation/>
      case "secretsmanager/secret_rotates_within_90_days": 
         return <SecretRotationNinetyDays/>
      case "secretsmanager/secret_unused_90_days": 
         return <UnusedSecret/>
      case "s3/restrict_publicly_readable": 
         return <S3PublicReadable/>
      case "s3/restrict_publicly_writable": 
         return <S3PublicWritable/>
      case "s3/enable_server_side_encryption":
         return <S3ServerSideEncryption/>
      case "s3/enforce_in_transit_encryption": 
         return <S3BucketHttpsRequests/>
      case "s3/block_public_access_config": 
         return <S3BlockPublicSettings/>
      case "s3/access_logging_enabled": 
         return <LogEnableS3ServerAccess/>
      case "sqs/enable_server_side_encryption_with_kms": 
         return <SqsServerSideEncryption/>
      case "vpc/block_public_server_admin_ingress_ipv4": 
         return <SecurityGroupIngressPorts/>
      case "vpc/enable_flow_logs": 
         return <LogVpcFlow/>
      case "cloudtrail/bucket_not_publicly_accessible": 
         return <S3BucketCloudtrailLog/>
      case "iam/access_keys_rotated_90_days": 
         return <AccessKeyRotationLimit/>
      case "iam/no_root_access_keys": 
         return <RootAccountAccessKeys/>
      case "iam/root_mfa_enabled": 
         return <MfaEnabledRootAccount/>
      case "iam/avoid_access_keys_at_setup": 
         return <IamInitialSetupAccessKey/>
      case "iam/password_uppercase_required": 
         return <PasswordPolicyUppercase/>
      case "iam/password_lowercase_required":
         return <PasswordPolicyLowercase/>
      case "iam/password_lowercase_required": 
         return <PasswordPolicyLowercase/>
      case "iam/password_symbols_required": 
         return <PasswordPolicySymbol/>
      case "iam/password_numbers_required": 
         return <PasswordPolicyNumber/>
      case "iam/password_min_length": 
         return <PasswordPolicyLength/>
      case "iam/password_reuse_prevention": 
         return <PasswordPolicyReuse/>
      case "iam/password_expiry": 
         return <PasswordPolicyExpiry/>
      case "kms/rotation_enabled_for_cmk": 
         return <RotateCmkEnabled/>
      case "ec2/unused_eip_addresses": 
         return <Ec2UnusedEipAddresses/>
      case "ec2/ebs_optimized_enabled": 
         return <EbsOptimizedEnabled/>
      case "iam/root_account_used": 
         return <IamRootUsage/>
      case "cloudtrail/delivered_to_cloudwatch": 
         return <CloudtrailCloudwatchIntegration/>
      case "cloudtrail/enabled_all_regions": 
         return <CloudtrailEnableAllRegions/>
      case "securityhub/enable_security_hub": 
         return <SecurityHubEnabled/>
      case "s3/buckets_versioned": 
         return <S3VersionedBuckets/>
      case "vpc/unused_security_groups": 
         return <VpcUnusedSecurityGroups/>
      case "vpc/no_classic_instances": 
         return <VpcEc2Classic/>
      case "vpc/default_security_groups_block_traffic":
         return <SecurityGroupRestrictTraffic/>
      case "cloudtrail/log_file_validation_enabled": 
         return <CloudtrailLogFileValidation/>
      case "s3/mfa_delete": 
         return <S3MfaDelete/>
      case "vpc/excessive_security_groups": 
         return <VpcExcessiveSecurityGroup/>
      case "attackpath/third_party_admin_permissions": 
         return <ThirdPartyAdminPermissions/>
      case "attackpath/third_party_high_permissions": 
         return <ThirdPartyHighPermissions/>
      case "attackpath/publicly_exposed_vm_admin_permissions": 
         return <PubliclyExposedVmAdminPermissions/>
      case "attackpath/publicly_exposed_vm_high_permissions":
         return <PubliclyExposedVmHighPermissions/>
      case "attackpath/publicly_exposed_serverless_admin_permissions": 
         return <PubliclyExposedServerlessAdminPermissions/>
      case "attackpath/publicly_exposed_serverless_high_permissions":
         return <PubliclyExposedServerlessHighPermissions/>
      case "attackpath/publicly_exposed_serverless_priv_escalation":
         return <PubliclyExposedServerlessPrivilegeEscalation/>
      case "attackpath/publicly_exposed_vm_priv_escalation":
         return <PubliclyExposedVmPrivilegeEscalation/>
      case "attackpath/private_serverless_admin_permissions": 
         return <PrivateServerlessAdminPermissions/>
      case "attackpath/publicly_exposed_vm_high_permissions_imdsv1_enabled":
         return <PubliclyExposedVmHighIMDSv1Enabled/>
      case "attackpath/publicly_exposed_vm_admin_permissions_imdsv1_enabled":
         return <PubliclyExposedVmAdminIMDSv1Enabled/>
      case "attackpath/publicly_exposed_vm_imdsv1_enabled_has_access_to_crown_jewel_s3_bucket":
         return <PubliclyExposedVmIMDSv1EnabledAccessCrownJewelS3 />
   }
   return (<></>)

}