#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { IamStack } from '../lib/iam-stack';
import { RdsPublicAccessStack } from '../lib/rds-public-access-stack';
import { SecretsStack } from '../lib/secrets-stack';
import { SimpleEC2Stack } from '../lib/simple-ec2-stack';
import { SecurityGroupsStack } from '../lib/security-groups-stack';
import { S3Stack } from '../lib/s3-stack';
import { SQSStack } from '../lib/sqs-stack';
import { SecurityHubStack } from '../lib/securityhub-stack';
import { EbsStack } from '../lib/ebs-stack';
import { ElasticSearchStack } from '../lib/elasticsearch-stack';
// import { Elbv2Stack } from '../lib/elbv2-stack';
import { CloudtrailStack } from '../lib/cloudtrail-stack';
import { CloudWatchStack } from '../lib/cloudwatch-stack';
import { KmsStack } from '../lib/kms-stack';
import { VpcStack } from '../lib/vpc-stack';
import { PublicLambdaWithAdminStack } from '../lib/public-lambda-with-admin-stack';
import { PublicLambdaWithHighPrivilegeStack } from '../lib/public-lambda-with-high-privilege-stack'
import { PublicLambdaWithPrivilegeEscalationStack } from '../lib/public-lambda-with-privilege-escalation-stack'
import { PrivilegeEscalationStack } from '../lib/privilege-escalation-stack';
import { AdminStack } from '../lib/admin-stack';
import { HighPrivilegeStack } from '../lib/high-privilege-stack';
import { PublicEc2WithAdminStack } from '../lib/public-ec2-with-admin-stack';
import { PublicEc2WithHighPrivilegeStack } from '../lib/public-ec2-with-high-privilege-stack';
import { PublicEc2WithPrivilegeEscalationStack } from '../lib/public-ec2-with-privilege-escalation-stack';
import { IamPrincipalsVersion1Stack } from '../lib/iam-principals-version-1-stack';

const app = new cdk.App();
new IamStack(app, 'IamStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
new RdsPublicAccessStack(app, 'RdsPublicAccessStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
new SecretsStack(app, 'SecretsStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
new SimpleEC2Stack(app, 'SimpleEC2Stack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
new SecurityGroupsStack(app, 'SecurityGroupsStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
new S3Stack(app, 'S3Stack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
new SQSStack(app, 'SQSStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
new SecurityHubStack(app, 'SecurityHubStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
new EbsStack(app, 'EbsStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
new ElasticSearchStack(app, 'ElasticSearchStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
/*
// Need to add certificate to stack to make this work.
new Elbv2Stack(app, 'Elbv2Stack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
*/
new CloudtrailStack(app, 'CloudtrailStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
new CloudWatchStack(app, 'CloudWatchStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
new KmsStack(app, 'KmsStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
new VpcStack(app, 'VpcStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
new PrivilegeEscalationStack(app, 'PrivilegeEscalationStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
new AdminStack(app, 'AdminStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
new HighPrivilegeStack(app, 'HighPrivilegeStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
new PublicLambdaWithAdminStack(app, 'PublicLambdaWithAdminStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
new PublicLambdaWithHighPrivilegeStack(app, 'PublicLambdaWithHighPrivilegeStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
new PublicLambdaWithPrivilegeEscalationStack(app, 'PublicLambdaWithPrivilegeEscalationStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
new PublicEc2WithAdminStack(app, 'PublicEc2WithAdminStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
new PublicEc2WithHighPrivilegeStack(app, 'PublicEc2WithHighPrivilegeStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
new PublicEc2WithPrivilegeEscalationStack(app, 'PublicEc2WithPrivilegeEscalationStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
new IamPrincipalsVersion1Stack(app, 'IamPrincipalsVersion1Stack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})

