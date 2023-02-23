import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as targets from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import * as iam from 'aws-cdk-lib/aws-iam';

import path = require('path/posix');

// Be EXTRA CAREFUL if you deploy this
export class PublicLambdaWithHighPrivilegeStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC to house resources
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

    // public alb to non-high lambda
    const securityGroup = new ec2.SecurityGroup(
      this,
      'public-lambda-sg',
      {
        vpc: vpc,
        allowAllOutbound: false,
        securityGroupName: 'public-lambda-sg',
      }
    )
    securityGroup.addIngressRule(
        ec2.Peer.anyIpv4(),
        ec2.Port.tcp(80),
        'Allows HTTP access from Internet'
    )
    const publicAlbForNonHighLambda = new elbv2.ApplicationLoadBalancer(this, 'publicAlbForNonHighLambda', {
        vpc,
        internetFacing: true,
        securityGroup: securityGroup,
    });
    const nonHighListener = publicAlbForNonHighLambda.addListener('nonHighlambdaListener', { port: 80 });
    const nonHighFn = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'nonHighLambda', {
        bundling: { minify: true, sourceMap: false, sourcesContent: false, target: 'ES2020' },
        runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
        entry: path.join(__dirname, 'sample-lambda/index.ts')
      });
    nonHighListener.addTargets('nonHighLambdaTarget', {
        targets: [
            new targets.LambdaTarget(nonHighFn),
        ],
    });

    // public alb to high lambda
    const publicAlbForHighLambda = new elbv2.ApplicationLoadBalancer(this, 'publicAlbForHighLambda', {
      vpc,
      internetFacing: true,
      securityGroup: securityGroup,
    });
    const highListener = publicAlbForHighLambda.addListener('highLambdaListener', { port: 80 });
    const lambdaHighRole = new iam.Role(this, 'lambdaHighRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });    
    lambdaHighRole.attachInlinePolicy(new iam.Policy(this, 'lambdaHighRolePolicy', {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['rds:*'],
            resources: ['arn:aws:rds:::*'],
          })
        ],
      })
    );
    const highFn = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'highLambda', {
        bundling: { minify: true, sourceMap: false, sourcesContent: false, target: 'ES2020' },
        runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
        entry: path.join(__dirname, 'sample-lambda/index.ts'),
        role: lambdaHighRole,
    });
    highListener.addTargets('highLambdaTarget', {
        targets: [
            new targets.LambdaTarget(highFn),
        ],
    });

    // private alb to non-high lambda
    const privateAlbForNonHighLambda = new elbv2.ApplicationLoadBalancer(this, 'privateAlbForNonHighLambda', {
        vpc,
        internetFacing: false,
    });
    const nonHighListenerPrivateLambda = privateAlbForNonHighLambda.addListener(
      'nonHighListenerPrivateLambda',
      { port: 80 }
    );
    const nonHighFnV2 = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'nonHighLambdaV2', {
        bundling: { minify: true, sourceMap: false, sourcesContent: false, target: 'ES2020' },
        runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
        entry: path.join(__dirname, 'sample-lambda/index.ts')
    });
    nonHighListenerPrivateLambda.addTargets('nonHighLambdaV2Target', {
        targets: [
            new targets.LambdaTarget(nonHighFnV2),
        ],
    });

    // high lambda without alb
    const highFnV2 = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'highLambdaV2', {
      bundling: { minify: true, sourceMap: false, sourcesContent: false, target: 'ES2020' },
      runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
      entry: path.join(__dirname, 'sample-lambda/index.ts'),
      role: lambdaHighRole,
    });    
  };
}