import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as targets from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import * as iam from 'aws-cdk-lib/aws-iam';

import path = require('path/posix');

// Be EXTRA CAREFUL if you deploy this
export class PublicLambdaWithAdminStack extends cdk.Stack {
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

    // public alb to non-admin lambda
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
    const publicAlbForNonAdminLambda = new elbv2.ApplicationLoadBalancer(this, 'publicALBForNonAdminLambda', {
        vpc,
        internetFacing: true,
        securityGroup: securityGroup,
    });
    const nonAdminListener = publicAlbForNonAdminLambda.addListener('nonAdminlambdaListener', { port: 80 });
    const nonAdminFn = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'nonAdminLambda', {
        bundling: { minify: true, sourceMap: false, sourcesContent: false, target: 'ES2020' },
        runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
        entry: path.join(__dirname, 'sample-lambda/index.ts')
      });
    nonAdminListener.addTargets('nonAdminLambdaTarget', {
        targets: [
            new targets.LambdaTarget(nonAdminFn),
        ],
    });

    // public alb to admin lambda
    const publicAlbForAdminLambda = new elbv2.ApplicationLoadBalancer(this, 'publicALBForAdminLambda', {
      vpc,
      internetFacing: true,
      securityGroup: securityGroup,
    });
    const adminListener = publicAlbForAdminLambda.addListener('adminLambdaListener', { port: 80 });
    const lambdaAdminRole = new iam.Role(this, 'lambdaAdminRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });    
    lambdaAdminRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));
    const adminFn = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'adminLambda', {
        bundling: { minify: true, sourceMap: false, sourcesContent: false, target: 'ES2020' },
        runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
        entry: path.join(__dirname, 'sample-lambda/index.ts'),
        role: lambdaAdminRole,
    });
    adminListener.addTargets('adminLambdaTarget', {
        targets: [
            new targets.LambdaTarget(adminFn),
        ],
    });

    // private alb to non-admin lambda
    const privateAlbForNonAdminLambda = new elbv2.ApplicationLoadBalancer(this, 'privateAlbForNonAdminLambda', {
        vpc,
        internetFacing: false,
    });
    const nonAdminListenerPrivateLambda = privateAlbForNonAdminLambda.addListener(
      'nonAdminListenerPrivateLambda',
      { port: 80 }
    );
    const nonAdminFnV2 = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'nonAdminLambdaV2', {
        bundling: { minify: true, sourceMap: false, sourcesContent: false, target: 'ES2020' },
        runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
        entry: path.join(__dirname, 'sample-lambda/index.ts')
    });
    nonAdminListenerPrivateLambda.addTargets('nonAdminLambdaV2Target', {
        targets: [
            new targets.LambdaTarget(nonAdminFnV2),
        ],
    });

    // admin lambda without alb
    const adminFnV2 = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'adminLambdaV2', {
      bundling: { minify: true, sourceMap: false, sourcesContent: false, target: 'ES2020' },
      runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
      entry: path.join(__dirname, 'sample-lambda/index.ts'),
      role: lambdaAdminRole,
    });    
  };
}