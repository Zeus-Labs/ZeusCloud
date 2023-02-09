import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as es from 'aws-cdk-lib/aws-elasticsearch';

export class ElasticSearchStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new es.Domain(this, 'unencryptedDomain', {
        version: es.ElasticsearchVersion.V7_4,
        encryptionAtRest: {
          enabled: false,
        },
        removalPolicy: RemovalPolicy.DESTROY,
    });

    new es.Domain(this, 'encryptedDomain', {
        version: es.ElasticsearchVersion.V7_4,
        encryptionAtRest: {
          enabled: true,
        },
        removalPolicy: RemovalPolicy.DESTROY,
    });  
  };
}