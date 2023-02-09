import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class EbsStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new ec2.Volume(this, 'unencryptedVolume', {
        availabilityZone: 'us-west-2a',
        encrypted: false,
        removalPolicy: RemovalPolicy.DESTROY,
        size: cdk.Size.gibibytes(1),
        volumeType: ec2.EbsDeviceVolumeType.GP3,
    });

    new ec2.Volume(this, 'encryptedVolume', {
        availabilityZone: 'us-west-2a',
        encrypted: true,
        removalPolicy: RemovalPolicy.DESTROY,
        size: cdk.Size.gibibytes(1),
        volumeType: ec2.EbsDeviceVolumeType.GP3,
    });
  };
}