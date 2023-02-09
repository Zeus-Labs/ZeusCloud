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
