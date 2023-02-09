import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class SimpleEC2Stack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // EC2 with detailed monitoring turned on is launched in a VPC public subnet.
    // EIP is attached to it.
    const vpc = new ec2.Vpc(this, 'vpcSimpleEC2', {
        ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
        maxAzs: 2,
        natGateways: 0,
        subnetConfiguration: [
            {
              cidrMask: 24,
              name: 'ec2',
              subnetType: ec2.SubnetType.PUBLIC,
            }
        ],
        vpcName: 'vpcSimpleEC2',
    });
    const instance = new ec2.Instance(this, 'simpleEC2', {
        vpc: vpc,
        instanceName: 'simpleEC2',
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.MICRO
        ),
        machineImage: ec2.MachineImage.latestAmazonLinux({
          generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        }),
        detailedMonitoring: true,
    });
    new ec2.CfnEIP(this, 'eip', {
        domain: 'vpc',
        instanceId: instance.instanceId,
    });

    // Unused EIP is provisioned.
    new ec2.CfnEIP(this, 'eipUnused');
  };
}