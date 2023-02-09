import * as cdk from 'aws-cdk-lib';
import { Effect, PolicyStatement, AnyPrincipal } from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class S3Stack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
        new s3.Bucket(this, 'bucket', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        });

        new s3.Bucket(this, 'bucketVersioned', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            versioned: true,
        });

        new s3.Bucket(this, 'bucketPublicReadThroughPolicy', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            publicReadAccess: true,
        });

        new s3.Bucket(this, 'bucketPublicReadThroughACL', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            blockPublicAccess: new s3.BlockPublicAccess({
                blockPublicAcls: false,
                ignorePublicAcls: false,
                blockPublicPolicy: true,
                restrictPublicBuckets: true,
            }),
            accessControl: s3.BucketAccessControl.PUBLIC_READ,
        });

        new s3.Bucket(this, 'bucketS3ManagedEncryption', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        });

        const bucketEncryptedByPolicy = new s3.Bucket(this, 'bucketEncryptedByPolicy', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        });
        bucketEncryptedByPolicy.addToResourcePolicy(
            new PolicyStatement({
                effect: Effect.DENY,
                actions: ["s3:PutObject"],
                principals: [new AnyPrincipal()],
                conditions: {
                    "StringNotEquals": {
                        "s3:x-amz-server-side-encryption": "AES256"
                    }
                },
                resources: [bucketEncryptedByPolicy.arnForObjects("*")]
            })
        );
        bucketEncryptedByPolicy.addToResourcePolicy(
            new PolicyStatement({
                effect: Effect.DENY,
                actions: ["s3:PutObject"],
                principals: [new AnyPrincipal()],
                conditions: {
                    "Null": {
                        "s3:x-amz-server-side-encryption": "true"
                    }
                },
                resources: [bucketEncryptedByPolicy.arnForObjects("*")]
            })
        );
        bucketEncryptedByPolicy.addToResourcePolicy(
            new PolicyStatement({
                effect: Effect.DENY,
                actions: ["s3:*"],
                principals: [new AnyPrincipal()],
                conditions: {
                    "Bool": {
                        "aws:SecureTransport": "false" 
                    },
                },
                resources: [
                    bucketEncryptedByPolicy.arnForObjects("*"),
                    bucketEncryptedByPolicy.bucketArn
                ]
            })
        );
  };
}