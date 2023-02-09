import * as cdk from 'aws-cdk-lib';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as kms from 'aws-cdk-lib/aws-kms';
import { openStdin } from 'process';
import path = require('path/posix');

// SecretsStack sets up secrets manager secrets.
export class SecretsStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Secret encrypted by CMK
    const encryptionKey = new kms.Key(this, 'encryptionKey', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      enableKeyRotation: true,
    });
    new secretsmanager.Secret(this, 'secretWithCmkEncryption', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      encryptionKey: encryptionKey
    });

    // Secret with default encryption with rotation lambda set to every day
    const s1 = new secretsmanager.Secret(this, 'secretWithDefaultEncryption', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const fn = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'RotationLambda', {
      bundling: { minify: true, sourceMap: false, sourcesContent: false, target: 'ES2020' },
      runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
      entry: path.join(__dirname, 'secret-rotation-lambda/index.ts')
    });
    s1.addRotationSchedule('RotationSchedule', {
      rotationLambda: fn,
      automaticallyAfter: cdk.Duration.days(1)
    });
  }
}
