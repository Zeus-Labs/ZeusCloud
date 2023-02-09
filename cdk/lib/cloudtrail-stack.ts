import * as cdk from 'aws-cdk-lib';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import * as cloudtrail from 'aws-cdk-lib/aws-cloudtrail';
import { DataResourceType } from 'aws-cdk-lib/aws-cloudtrail';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class CloudtrailStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const accessLogsBucket = new s3.Bucket(this, 'accessLogsBucket', {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
        encryption: s3.BucketEncryption.S3_MANAGED,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });    

    const cloudtrailBucket = new s3.Bucket(this, 'cloudtrailBucket', {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
        encryption: s3.BucketEncryption.S3_MANAGED,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        serverAccessLogsBucket: accessLogsBucket,
    });

    const cloudtrailLogGroup = new logs.LogGroup(this, 'cloudtrailLogGroup', {
        retention: logs.RetentionDays.ONE_DAY,
        removalPolicy: RemovalPolicy.DESTROY 
    }); 

    /*const encryptionKey = new kms.Key(this, 'encryptionKey', {
      enabled: true,
      enableKeyRotation: true,
      pendingWindow: Duration.days(7),
      removalPolicy: RemovalPolicy.DESTROY,
    });*/

    const trail = new cloudtrail.Trail(this, 'regionalTrail', {
        bucket: cloudtrailBucket,
        isMultiRegionTrail: false,
        managementEvents: cloudtrail.ReadWriteType.WRITE_ONLY,
        enableFileValidation: false,
        sendToCloudWatchLogs: true,
        cloudWatchLogGroup: cloudtrailLogGroup,
        // TODO: CDK complains about not having enough permissions to access the key.
        // encryptionKey: encryptionKey,
    });
    trail.addS3EventSelector([
      {
        bucket: cloudtrailBucket,
        objectPrefix: 'example-prefix-1/',
      },
      {
        bucket: cloudtrailBucket,
        objectPrefix: 'example-prefix-2/',
      },
    ], {
      includeManagementEvents: false,
    });
    trail.addS3EventSelector([
      {
        bucket: cloudtrailBucket,
        objectPrefix: 'example-prefix-3/',
      },
    ], {
      includeManagementEvents: false,
    });
    trail.addEventSelector(
      DataResourceType.LAMBDA_FUNCTION,
      ['arn:aws:lambda'],
    )
  };
}
