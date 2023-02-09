import * as cdk from 'aws-cdk-lib';
import { aws_securityhub as securityhub } from 'aws-cdk-lib';

export class SecurityHubStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new securityhub.CfnHub(this, 'sampleHub');
  };
}