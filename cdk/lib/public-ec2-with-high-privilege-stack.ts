import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';

// Be EXTRA CAREFUL if you deploy this
export class PublicEc2WithHighPrivilegeStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC to house everything
    const vpc = new ec2.Vpc(this, 'vpcForPublicEc2WithHighPrivilege', {
        ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
        maxAzs: 2,
        natGateways: 0,
        subnetConfiguration: [
            {
              cidrMask: 24,
              name: 'publicSubnet',
              subnetType: ec2.SubnetType.PUBLIC,
            },
            {
                cidrMask: 24,
                name: 'privateSubnet',
                subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
            }
        ],
        vpcName: 'vpcForPublicEc2WithHighPrivilege',
    });
    
    // Public EC2 with high privilege
    const highRole = new iam.Role(
        this,
        'ec2-high-role',
        { assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com') }
    )
    highRole.attachInlinePolicy(new iam.Policy(this, 'highEc2InlinePolicy', {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['rds:*'],
            resources: ['arn:aws:rds:::*'],
          })
        ],
      })
    );
    const securityGroup = new ec2.SecurityGroup(
        this,
        'public-ec2-sg',
        {
          vpc: vpc,
          allowAllOutbound: false,
          securityGroupName: 'public-ec2-sg',
        }
    )
    securityGroup.addIngressRule(
        ec2.Peer.anyIpv4(),
        ec2.Port.tcp(80),
        'Allows HTTP access from Internet'
    )
    new ec2.Instance(this, 'directPublicEC2', {
        vpc: vpc,
        role: highRole,
        securityGroup: securityGroup,
        instanceName: 'directEC2',
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.MICRO
        ),
        machineImage: ec2.MachineImage.latestAmazonLinux({
          generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        }),
        vpcSubnets: {
            subnetType: ec2.SubnetType.PUBLIC
        }
    });

    // Public EC2 without high
    new ec2.Instance(this, 'EC2NoHigh', {
        vpc: vpc,
        securityGroup: securityGroup,
        instanceName: 'EC2NoHigh',
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.MICRO
        ),
        machineImage: ec2.MachineImage.latestAmazonLinux({
          generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        }),
        vpcSubnets: {
            subnetType: ec2.SubnetType.PUBLIC
        }
    });

    // Private EC2 with high
    new ec2.Instance(this, 'privateEC2WithHigh', {
        vpc: vpc,
        role: highRole,
        securityGroup: securityGroup,
        instanceName: 'privateEC2WithHigh',
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.MICRO
        ),
        machineImage: ec2.MachineImage.latestAmazonLinux({
          generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        }),
        vpcSubnets: {
            subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        }
    });


    // Public through ALB + no high
    const alb = new elbv2.ApplicationLoadBalancer(this, 'publicALB', {
        vpc,
        internetFacing: true,
        securityGroup: securityGroup,
    });
    const listener = alb.addListener('ec2Listener', { port: 80 });
    const asg = new autoscaling.AutoScalingGroup(this, `asg`, {
        vpc: vpc,
        allowAllOutbound: false,
        minCapacity: 1,
        maxCapacity: 1,
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.MICRO
        ),
        machineImage: ec2.MachineImage.latestAmazonLinux({
          generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        }),
        vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    })
    listener.addTargets('asgTarget', {
        port: 80,
        targets: [ asg ],
    });
  };
}