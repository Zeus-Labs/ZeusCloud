import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';

// RdsPublicAccessStack sets up a publicly accessible RDS instance.
// Note, however, that the default security group doesn't allow any
// ingress traffic.
export class RdsPublicAccessStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'vpcPublicRDS', {
        ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
        maxAzs: 2,
        natGateways: 0,
        subnetConfiguration: [
            {
              cidrMask: 24,
              name: 'rds',
              subnetType: ec2.SubnetType.PUBLIC,
            }
        ],
        vpcName: 'vpcPublicRDS',
    });

    new rds.DatabaseInstance(this, 'publicRDS', {
        engine: rds.DatabaseInstanceEngine.postgres({
            version: rds.PostgresEngineVersion.VER_14_3,
        }),
        vpc: vpc,
        allocatedStorage: 20,
        backupRetention: cdk.Duration.days(0),
        credentials: rds.Credentials.fromGeneratedSecret('postgres'),
        databaseName: 'publicRDS',
        deleteAutomatedBackups: true,
        deletionProtection: false,
        instanceType: ec2.InstanceType.of(
            ec2.InstanceClass.T4G,
            ec2.InstanceSize.MICRO,
        ),
        publiclyAccessible: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        storageEncrypted: true,
        storageType: rds.StorageType.GP2,
        vpcSubnets: {
            subnetType: ec2.SubnetType.PUBLIC,
        },
    });
  }
}