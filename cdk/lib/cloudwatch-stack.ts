import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudtrail from 'aws-cdk-lib/aws-cloudtrail';
import { FilterPattern } from 'aws-cdk-lib/aws-logs';

export class CloudWatchStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket and cloudtrail log group to send events to
    const cloudtrailBucket = new s3.Bucket(this, 'cloudtrailBucket', {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
        encryption: s3.BucketEncryption.S3_MANAGED,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    const cloudtrailLogGroup = new logs.LogGroup(this, 'cloudtrailLogGroup', {
        retention: logs.RetentionDays.ONE_DAY,
        removalPolicy: RemovalPolicy.DESTROY 
    }); 

    // Cloudtrail Trail
    new cloudtrail.Trail(this, 'cloudtrailTrail', {
        bucket: cloudtrailBucket,
        isMultiRegionTrail: true,
        managementEvents: cloudtrail.ReadWriteType.ALL,
        enableFileValidation: true,
        sendToCloudWatchLogs: true,
        cloudWatchLogGroup: cloudtrailLogGroup,
    });  

    // Unauthorized API Calls
    const unauthorizedAPIMetricFilter = new logs.MetricFilter(this, 'unauthorizedAPIMetricFilter', {
        logGroup: cloudtrailLogGroup,
        metricNamespace: 'testMetricNamespace',
        metricName: 'unauthorizedAPI',
        filterPattern: FilterPattern.literal('{ ($.errorCode = *UnauthorizedOperation) || ($.errorCode = AccessDenied*) }'),
    });
    new cloudwatch.Alarm(this, 'unauthorizedAPIAlarm', {
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 1,
        evaluationPeriods: 1,
        metric: unauthorizedAPIMetricFilter.metric(),
    });

    // Sign In Without MFA
    const signInWithoutMFAMetricFilter = new logs.MetricFilter(this, 'signInWithoutMFAMetricFilter', {
        logGroup: cloudtrailLogGroup,
        metricNamespace: 'testMetricNamespace',
        metricName: 'signInWithoutMFA',
        filterPattern: FilterPattern.literal('{ ($.eventName = ConsoleLogin) && ($.additionalEventData.MFAUsed != Yes) }'),
    });
    new cloudwatch.Alarm(this, 'signInWithoutMFAAlarm', {
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 1,
        evaluationPeriods: 1,
        metric: signInWithoutMFAMetricFilter.metric(),
    });

    // Root Account Usage
    const rootAccountUsageMetricFilter = new logs.MetricFilter(this, 'rootAccountUsageMetricFilter', {
      logGroup: cloudtrailLogGroup,
      metricNamespace: 'testMetricNamespace',
      metricName: 'rootAccountUsage',
      filterPattern: FilterPattern.literal('{ $.userIdentity.type = Root && $.userIdentity.invokedBy NOT EXISTS && $.eventType != AwsServiceEvent }'),
    });
    new cloudwatch.Alarm(this, 'rootAccountUsageAlarm', {
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 1,
        evaluationPeriods: 1,
        metric: rootAccountUsageMetricFilter.metric(),
    });

    // IAM Policy Changes
    const iamPolicyChangesMetricFilter = new logs.MetricFilter(this, 'iamPolicyChangesMetricFilter', {
      logGroup: cloudtrailLogGroup,
      metricNamespace: 'testMetricNamespace',
      metricName: 'iamPolicyChanges',
      filterPattern: FilterPattern.literal('{($.eventName=DeleteGroupPolicy\)||($.eventName=DeleteRolePolicy)||($.eventName=DeleteUserPolicy)||($.eventName=PutGroupPolicy)||($.eventName=PutRolePolicy)||($.eventName=PutUserPolicy)||($.eventName=CreatePolicy)||($.eventName=DeletePolicy)||($.eventName=CreatePolicyVersion)||($.eventName=DeletePolicyVersion)||($.eventName=AttachRolePolicy)||($.eventName=DetachRolePolicy)||($.eventName=AttachUserPolicy)||($.eventName=DetachUserPolicy)||($.eventName=AttachGroupPolicy)||($.eventName=DetachGroupPolicy)}'),
    });
    new cloudwatch.Alarm(this, 'iamPolicyChangesAlarm', {
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 1,
        evaluationPeriods: 1,
        metric: iamPolicyChangesMetricFilter.metric(),
    });

    // Cloudtrail Configuration Changes
    const cloudtrailConfigurationChangesMetricFilter = new logs.MetricFilter(this, 'cloudtrailConfigurationChangesMetricFilter', {
      logGroup: cloudtrailLogGroup,
      metricNamespace: 'testMetricNamespace',
      metricName: 'cloudtrailConfigurationChanges',
      filterPattern: FilterPattern.literal('{ ($.eventName = CreateTrail) || ($.eventName = UpdateTrail) || ($.eventName = DeleteTrail) || ($.eventName = StartLogging) || ($.eventName = StopLogging) }'),
    });
    new cloudwatch.Alarm(this, 'cloudtrailConfigurationChangesAlarm', {
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 1,
        evaluationPeriods: 1,
        metric: cloudtrailConfigurationChangesMetricFilter.metric(),
    });

    // AWS Console Auth Failures
    const awsConsoleAuthFailuresMetricFilter = new logs.MetricFilter(this, 'awsConsoleAuthFailuresMetricFilter', {
      logGroup: cloudtrailLogGroup,
      metricNamespace: 'testMetricNamespace',
      metricName: 'awsConsoleAuthFailures',
      filterPattern: FilterPattern.literal('{ ($.eventName = ConsoleLogin) && ($.errorMessage = "Failed authentication") }'),
    });
    new cloudwatch.Alarm(this, 'awsConsoleAuthFailuresAlarm', {
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 1,
        evaluationPeriods: 1,
        metric: awsConsoleAuthFailuresMetricFilter.metric(),
    });

    // CMK Disable Or Delete
    const cmkDisableOrDeleteMetricFilter = new logs.MetricFilter(this, 'cmkDisableOrDeleteMetricFilter', {
      logGroup: cloudtrailLogGroup,
      metricNamespace: 'testMetricNamespace',
      metricName: 'cmkDisableOrDelete',
      filterPattern: FilterPattern.literal('{($.eventSource = kms.amazonaws.com) && (($.eventName=DisableKey)||($.eventName=ScheduleKeyDeletion)) }'),
    });
    new cloudwatch.Alarm(this, 'cmkDisableOrDeleteAlarm', {
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 1,
        evaluationPeriods: 1,
        metric: cmkDisableOrDeleteMetricFilter.metric(),
    });

    // Bucket Policy Changes
    const bucketPolicyChangesMetricFilter = new logs.MetricFilter(this, 'bucketPolicyChangesMetricFilter', {
      logGroup: cloudtrailLogGroup,
      metricNamespace: 'testMetricNamespace',
      metricName: 'bucketPolicyChanges',
      filterPattern: FilterPattern.literal('{ ($.eventSource = s3.amazonaws.com) && (($.eventName = PutBucketAcl) || ($.eventName = PutBucketPolicy) || ($.eventName = PutBucketCors) || ($.eventName = PutBucketLifecycle) || ($.eventName = PutBucketReplication) || ($.eventName = DeleteBucketPolicy) || ($.eventName = DeleteBucketCors) || ($.eventName = DeleteBucketLifecycle) || ($.eventName = DeleteBucketReplication)) }'),
    });
    new cloudwatch.Alarm(this, 'bucketPolicyChangesAlarm', {
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 1,
        evaluationPeriods: 1,
        metric: bucketPolicyChangesMetricFilter.metric(),
    });

    // Config Configuration Changes
    const configConfigurationChangesMetricFilter = new logs.MetricFilter(this, 'configConfigurationChangesMetricFilter', {
      logGroup: cloudtrailLogGroup,
      metricNamespace: 'testMetricNamespace',
      metricName: 'configConfigurationChanges',
      filterPattern: FilterPattern.literal('{($.eventSource = config.amazonaws.com) && (($.eventName=StopConfigurationRecorder)||($.eventName=DeleteDeliveryChannel)||($.eventName=PutDeliveryChannel)||($.eventName=PutConfigurationRecorder))}'),
    });
    new cloudwatch.Alarm(this, 'configConfigurationChangesAlarm', {
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 1,
        evaluationPeriods: 1,
        metric: configConfigurationChangesMetricFilter.metric(),
    });

    // Security Group Changes
    const securityGroupChangesMetricFilter = new logs.MetricFilter(this, 'securityGroupChangesMetricFilter', {
      logGroup: cloudtrailLogGroup,
      metricNamespace: 'testMetricNamespace',
      metricName: 'securityGroupChanges',
      filterPattern: FilterPattern.literal('{ ($.eventName = AuthorizeSecurityGroupIngress) || ($.eventName = AuthorizeSecurityGroupEgress) || ($.eventName = RevokeSecurityGroupIngress) || ($.eventName = RevokeSecurityGroupEgress) || ($.eventName = CreateSecurityGroup) || ($.eventName = DeleteSecurityGroup)}'),
    });
    new cloudwatch.Alarm(this, 'securityGroupChangesAlarm', {
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 1,
        evaluationPeriods: 1,
        metric: securityGroupChangesMetricFilter.metric(),
    });

    // NACL Changes
    const naclChangesMetricFilter = new logs.MetricFilter(this, 'naclChangesMetricFilter', {
      logGroup: cloudtrailLogGroup,
      metricNamespace: 'testMetricNamespace',
      metricName: 'naclChanges',
      filterPattern: FilterPattern.literal('{ ($.eventName = CreateNetworkAcl) || ($.eventName = CreateNetworkAclEntry) || ($.eventName = DeleteNetworkAcl) || ($.eventName = DeleteNetworkAclEntry) || ($.eventName = ReplaceNetworkAclEntry) || ($.eventName = ReplaceNetworkAclAssociation) }'),
    });
    new cloudwatch.Alarm(this, 'naclChangesAlarm', {
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 1,
        evaluationPeriods: 1,
        metric: naclChangesMetricFilter.metric(),
    });

    // Network Gateway Changes
    const networkGatewayChangesMetricFilter = new logs.MetricFilter(this, 'networkGatewayChangesMetricFilter', {
      logGroup: cloudtrailLogGroup,
      metricNamespace: 'testMetricNamespace',
      metricName: 'networkGatewayChanges',
      filterPattern: FilterPattern.literal('{ ($.eventName = CreateCustomerGateway) || ($.eventName = DeleteCustomerGateway) || ($.eventName = AttachInternetGateway) || ($.eventName = CreateInternetGateway) || ($.eventName = DeleteInternetGateway) || ($.eventName = DetachInternetGateway) }'),
    });
    new cloudwatch.Alarm(this, 'networkGatewayChangesAlarm', {
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 1,
        evaluationPeriods: 1,
        metric: networkGatewayChangesMetricFilter.metric(),
    });

    // Route Table Changes
    const routeTableChangesMetricFilter = new logs.MetricFilter(this, 'routeTableChangesMetricFilter', {
      logGroup: cloudtrailLogGroup,
      metricNamespace: 'testMetricNamespace',
      metricName: 'routeTableChanges',
      filterPattern: FilterPattern.literal('{ ($.eventName = CreateRoute) || ($.eventName = CreateRouteTable) || ($.eventName = ReplaceRoute) || ($.eventName = ReplaceRouteTableAssociation) || ($.eventName = DeleteRouteTable) || ($.eventName = DeleteRoute) || ($.eventName = DisassociateRouteTable) }'),
    });
    new cloudwatch.Alarm(this, 'routeTableChangesAlarm', {
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 1,
        evaluationPeriods: 1,
        metric: routeTableChangesMetricFilter.metric(),
    });

    // VPC Changes
    const vpcChangesMetricFilter = new logs.MetricFilter(this, 'vpcChangesMetricFilter', {
      logGroup: cloudtrailLogGroup,
      metricNamespace: 'testMetricNamespace',
      metricName: 'vpcChanges',
      filterPattern: FilterPattern.literal('{ ($.eventName = CreateVpc) || ($.eventName = DeleteVpc) || ($.eventName = ModifyVpcAttribute) || ($.eventName = AcceptVpcPeeringConnection) || ($.eventName = CreateVpcPeeringConnection) || ($.eventName = DeleteVpcPeeringConnection) || ($.eventName = RejectVpcPeeringConnection) || ($.eventName = AttachClassicLinkVpc) || ($.eventName = DetachClassicLinkVpc) || ($.eventName = DisableVpcClassicLink) || ($.eventName = EnableVpcClassicLink) }'),
    });
    new cloudwatch.Alarm(this, 'vpcChangesAlarm', {
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 1,
        evaluationPeriods: 1,
        metric: vpcChangesMetricFilter.metric(),
    });

    // Organization Changes
    const organizationChangesMetricFilter = new logs.MetricFilter(this, 'organizationChangesMetricFilter', {
      logGroup: cloudtrailLogGroup,
      metricNamespace: 'testMetricNamespace',
      metricName: 'organizationChanges',
      filterPattern: FilterPattern.literal('{ ($.eventSource = organizations.amazonaws.com) && (($.eventName = "AcceptHandshake") || ($.eventName = "AttachPolicy") || ($.eventName = "CreateAccount") || ($.eventName = "CreateOrganizationalUnit") || ($.eventName = "CreatePolicy") || ($.eventName = "DeclineHandshake") || ($.eventName = "DeleteOrganization") || ($.eventName = "DeleteOrganizationalUnit") || ($.eventName = "DeletePolicy") || ($.eventName = "DetachPolicy") || ($.eventName = "DisablePolicyType") || ($.eventName = "EnablePolicyType") || ($.eventName = "InviteAccountToOrganization") || ($.eventName = "LeaveOrganization") || ($.eventName = "MoveAccount") || ($.eventName = "RemoveAccountFromOrganization") || ($.eventName = "UpdatePolicy") || ($.eventName = "UpdateOrganizationalUnit")) }'),
    });
    new cloudwatch.Alarm(this, 'organizationChangesAlarm', {
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 1,
        evaluationPeriods: 1,
        metric: organizationChangesMetricFilter.metric(),
    });
  };
}
