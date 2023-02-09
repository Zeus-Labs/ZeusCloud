import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class SecurityGroupsStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC for our security groups
    const vpc = new ec2.Vpc(this, 'vpcSecurityGroups', {
        ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
        maxAzs: 2,
        natGateways: 0,
        subnetConfiguration: [
            {
              cidrMask: 24,
              name: 'vpcSecurityGroups',
              subnetType: ec2.SubnetType.PUBLIC,
            }
        ],
        vpcName: 'vpcSecurityGroups',
    });

    // Unused Security Group with ingress rule for any ipv4 on port 22
    const sgUnused = new ec2.SecurityGroup(this, 'sgUnused', {
        vpc: vpc,
        allowAllOutbound: false,
    });
    sgUnused.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'SSH from anywhere')
  };
}