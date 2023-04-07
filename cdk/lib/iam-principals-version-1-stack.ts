import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class IamPrincipalsVersion1Stack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Set up user and role assumption chain
    const user1 = new iam.User(this, 'user1', {
        userName: 'user1',
    });
    const role1 = new iam.Role(this, 'role1', {
        assumedBy: user1,
    });
    const role2 = new iam.Role(this, 'role2', {
        assumedBy: role1,
    });
    const role3 = new iam.Role(this, 'role3', {
      assumedBy: new iam.ServicePrincipal('cloudformation.amazonaws.com'),
    });
    role2.attachInlinePolicy(
        new iam.Policy(this, 'roleEscalatablePolicy', {
            statements: [
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: ['cloudformation:CreateStack'],
                    resources: ['*']
                }),
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: ['iam:PassRole'],
                    resources: [role3.roleArn]
                }),
            ],
        })
    );
    const role4 = new iam.Role(this, 'role4', {
        assumedBy: role3,
    });
    const role5 = new iam.Role(this, 'role5', {
        assumedBy: role1,
        managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')]
    });
    role2.assumeRolePolicy?.addStatements(
        new PolicyStatement(
            {
                actions: ['sts:AssumeRole'],
                effect: iam.Effect.ALLOW,
                principals: [role4],
            }
        )
    )
    // These below policies should not be needed. But cartography may have a bug.
    // TODO: Delete these
    user1.attachInlinePolicy(new iam.Policy(this, 'user1AssumeRolePolicy', {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['sts:AssumeRole'],
            resources: [role1.roleArn],
          })
        ],
      })
    );
    role1.attachInlinePolicy(new iam.Policy(this, 'role1AssumeRolePolicy', {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['sts:AssumeRole'],
            resources: [role2.roleArn, role5.roleArn],
          })
        ],
      })
    );
    role2.attachInlinePolicy(new iam.Policy(this, 'role2AssumeRolePolicy', {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['sts:AssumeRole'],
            resources: [role3.roleArn],
          })
        ],
      })
    );
    role3.attachInlinePolicy(new iam.Policy(this, 'role3AssumeRolePolicy', {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['sts:AssumeRole'],
            resources: [role4.roleArn],
          })
        ],
      })
    );
    role4.attachInlinePolicy(new iam.Policy(this, 'role4AssumeRolePolicy', {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['sts:AssumeRole'],
            resources: [role2.roleArn],
          })
        ],
      })
    );
  };
}