import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';

export class VpcStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC with flow log enabled
    const vpc = new ec2.Vpc(this, 'vpcFlowLogsEnabled', {
        ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
        maxAzs: 2,
        natGateways: 0,
        subnetConfiguration: [
            {
              cidrMask: 24,
              name: 'subnet',
              subnetType: ec2.SubnetType.PUBLIC,
            }
        ],
        vpcName: 'vpcFlowLogsEnabled',
    });

    const logGroup = new logs.LogGroup(this, 'flowLogLogGroup', {
        retention: logs.RetentionDays.ONE_DAY,
        removalPolicy: RemovalPolicy.DESTROY 
    });

    const role = new iam.Role(this, 'VpcRole', {
      assumedBy: new iam.ServicePrincipal('vpc-flow-logs.amazonaws.com')
    });
    
    new ec2.FlowLog(this, 'FlowLog', {
      resourceType: ec2.FlowLogResourceType.fromVpc(vpc),
      destination: ec2.FlowLogDestination.toCloudWatchLogs(logGroup, role)
    });

    // VPC without flow log enabled
    new ec2.Vpc(this, 'vpcFlowLogsDisabled', {
        ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
        maxAzs: 2,
        natGateways: 0,
        subnetConfiguration: [
            {
              cidrMask: 24,
              name: 'subnet',
              subnetType: ec2.SubnetType.PUBLIC,
            }
        ],
        vpcName: 'vpcFlowLogsDisabled',
    });
    
  };
}