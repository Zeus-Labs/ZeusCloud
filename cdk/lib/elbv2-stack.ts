import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

// TODO: Need to add certificate to listener to make this work.

/*export class Elbv2Stack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC to house ELBs
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

    const albWithSecureCiphers = new elbv2.ApplicationLoadBalancer(this, 'ALBWithSecureCiphers', {
        vpc,
        internetFacing: false,
    });
    albWithSecureCiphers.addListener('httpsListener', {
        open: false,
        protocol: elbv2.ApplicationProtocol.HTTPS,
        sslPolicy: elbv2.SslPolicy.TLS13_EXT1,
        defaultAction: elbv2.ListenerAction.fixedResponse(200, {
            contentType: 'text/plain',
            messageBody: 'OK'
        })
    });
    albWithSecureCiphers.addListener('httpListener', {
        open: false,
        protocol: elbv2.ApplicationProtocol.HTTP,
        defaultAction: elbv2.ListenerAction.fixedResponse(200, {
            contentType: 'text/plain',
            messageBody: 'OK'
        })
    });

    const albWithInsecureCiphers = new elbv2.ApplicationLoadBalancer(this, 'albWithInsecureCiphers', {
        vpc,
        internetFacing: false,
    });
    albWithInsecureCiphers.addListener('httpsListener', {
        open: false,
        protocol: elbv2.ApplicationProtocol.HTTPS,
        sslPolicy: elbv2.SslPolicy.LEGACY,
        defaultAction: elbv2.ListenerAction.fixedResponse(200, {
            contentType: 'text/plain',
            messageBody: 'OK'
        })
    });

  };
}*/