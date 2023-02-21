import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as targets from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';

import path = require('path/posix');

export class Elbv2WithLambdaStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC to house ELB
    const vpc = new ec2.Vpc(this, 'vpcForElb', {
        ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
        maxAzs: 2,
        natGateways: 0,
        subnetConfiguration: [
            {
              cidrMask: 24,
              name: 'subnetForElb',
              subnetType: ec2.SubnetType.PUBLIC,
            }
        ],
        vpcName: 'vpcForElb',
    });     

    // ALB
    const albForLambda = new elbv2.ApplicationLoadBalancer(this, 'ALBForLambda', {
        vpc,
        internetFacing: false,
    });

    // Listener
    const listener = albForLambda.addListener('lambdaListener', { port: 80 });

    // Lambda
    const fn = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'SampleLambda', {
        bundling: { minify: true, sourceMap: false, sourcesContent: false, target: 'ES2020' },
        runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
        entry: path.join(__dirname, 'sample-lambda/index.ts')
      });

    listener.addTargets('lambdaTarget', {
        targets: [
            new targets.LambdaTarget(fn),
        ],
    });
  };
}