import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

export class PrivilegeEscalationStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // Target role to escalate to
    const targetRole = new iam.Role(this, 'targetRole', {
        assumedBy: new iam.ServicePrincipal('cloudformation.amazonaws.com'),
    });

    // user that can be escalated
    const userEscalatable = new iam.User(this, 'userEscalatable', {
        userName: 'userEscalatable',
    });
    userEscalatable.attachInlinePolicy(
        new iam.Policy(this, 'userEscalatablePolicy', {
            statements: [
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: ['cloudformation:CreateStack'],
                    resources: ['*']
                }),
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: ['iam:PassRole'],
                    resources: [targetRole.roleArn]
                }),
            ],
        })
    );

    // user that cannot be escalated
    const userNotEscalatable = new iam.User(this, 'userNotEscalatable', {
        userName: 'userNotEscalatable',
    });
    userNotEscalatable.attachInlinePolicy(
        new iam.Policy(this, 'userNotEscalatablePolicy', {
            statements: [
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: ['iam:PassRole'],
                    resources: [targetRole.roleArn]
                }),
            ],
        })
    );
  };
}