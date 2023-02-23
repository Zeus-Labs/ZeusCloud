import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as targets from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import * as iam from 'aws-cdk-lib/aws-iam';

import path = require('path/posix');

// Be EXTRA CAREFUL if you deploy this
export class PublicLambdaWithPrivilegeEscalationStack extends cdk.Stack {
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

    // public alb to non-escalatable lambda
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
    const publicAlbForNonEscalatableLambda = new elbv2.ApplicationLoadBalancer(this, 'publicALBForNonEscalatableLambda', {
        vpc,
        internetFacing: true,
        securityGroup: securityGroup,
    });
    const nonEscalatableListener = publicAlbForNonEscalatableLambda.addListener('nonEscalatablelambdaListener', { port: 80 });
    const nonEscalatableFn = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'nonEscalatableLambda', {
        bundling: { minify: true, sourceMap: false, sourcesContent: false, target: 'ES2020' },
        runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
        entry: path.join(__dirname, 'sample-lambda/index.ts')
      });
    nonEscalatableListener.addTargets('nonEscalatableLambdaTarget', {
        targets: [
            new targets.LambdaTarget(nonEscalatableFn),
        ],
    });

    // public alb to escalatable lambda
    const publicAlbForEscalatableLambda = new elbv2.ApplicationLoadBalancer(this, 'publicALBForEscalatableLambda', {
      vpc,
      internetFacing: true,
      securityGroup: securityGroup,
    });
    const escalatableListener = publicAlbForEscalatableLambda.addListener('escalatableLambdaListener', { port: 80 });
    // lambda role -ASSUMES- intermediate role -PRIVILEGE_ESCALATION- target role
    const lambdaRole = new iam.Role(this, 'lambdaRole', {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });
    const intermediateRole = new iam.Role(this, 'intermediateRole', {
        assumedBy: lambdaRole,
    });
    const targetRole = new iam.Role(this, 'targetRole', {
        assumedBy: new iam.ServicePrincipal('cloudformation.amazonaws.com'),
    });
    lambdaRole.attachInlinePolicy(new iam.Policy(this, 'lambdaRoleAssumePolicy', {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['sts:AssumeRole'],
            resources: [intermediateRole.roleArn],
          })
        ],
      })
    );
    intermediateRole.attachInlinePolicy(
        new iam.Policy(this, 'roleEscalatablePolicy', {
            statements: [
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: ['cloudformation:CreateStack'],
                    resources: ['*']
                }),
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: ['iam:PassRole'],
                    resources: [targetRole.roleArn]
                }),
            ],
        })
    );
    const escalatableFn = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'escalatableLambda', {
        bundling: { minify: true, sourceMap: false, sourcesContent: false, target: 'ES2020' },
        runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
        entry: path.join(__dirname, 'sample-lambda/index.ts'),
        role: lambdaRole,
    });
    escalatableListener.addTargets('escalatableLambdaTarget', {
        targets: [
            new targets.LambdaTarget(escalatableFn),
        ],
    });

    // private alb to non-escalatable lambda
    const privateAlbForNonEscalatableLambda = new elbv2.ApplicationLoadBalancer(this, 'privateAlbForNonEscalatableLambda', {
        vpc,
        internetFacing: false,
    });
    const nonEscalatableListenerPrivateLambda = privateAlbForNonEscalatableLambda.addListener(
      'nonEscalatableListenerPrivateLambda',
      { port: 80 }
    );
    const nonEscalatableFnV2 = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'nonEscalatableLambdaV2', {
        bundling: { minify: true, sourceMap: false, sourcesContent: false, target: 'ES2020' },
        runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
        entry: path.join(__dirname, 'sample-lambda/index.ts')
    });
    nonEscalatableListenerPrivateLambda.addTargets('nonEscalatableLambdaV2Target', {
        targets: [
            new targets.LambdaTarget(nonEscalatableFnV2),
        ],
    });

    // escalatable lambda without alb
    const escalatableFnV2 = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'escalatableFnV2', {
      bundling: { minify: true, sourceMap: false, sourcesContent: false, target: 'ES2020' },
      runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
      entry: path.join(__dirname, 'sample-lambda/index.ts'),
      role: lambdaRole,
    });    
  };
}