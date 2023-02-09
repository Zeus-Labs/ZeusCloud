import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class SQSStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new sqs.Queue(this, 'defaultQueue', {
        removalPolicy: RemovalPolicy.DESTROY
    });

    new sqs.Queue(this, 'queueEncryptedKMS', {
        encryption: sqs.QueueEncryption.KMS_MANAGED,
        removalPolicy: RemovalPolicy.DESTROY
    });
  };
}