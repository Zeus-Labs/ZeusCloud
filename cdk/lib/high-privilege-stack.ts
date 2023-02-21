import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

export class HighPrivilegeStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // User is member of non-high-privilege group. User can assume a role,
    // which can assume a role, which can assume a high privilege role.
    const groupNotHighPrivilege = new iam.Group(this, 'groupNotHighPrivilege', {
        groupName: 'groupNotHighPrivilege',
    });
    const user1 = new iam.User(this, 'user1', {
        userName: 'user1',
        groups: [groupNotHighPrivilege],

    });
    const intermediateRole1 = new iam.Role(this, 'intermediateRole1', {
        assumedBy: user1,
    });
    const intermediateRole2 = new iam.Role(this, 'intermediateRole2', {
        assumedBy: intermediateRole1,
        managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AWSProtonReadOnlyAccess')]
    });
    const highPrivilegeRole = new iam.Role(this, 'highPrivilegeRole', {
        assumedBy: intermediateRole2,
    });
    highPrivilegeRole.attachInlinePolicy(new iam.Policy(this, 'highPrivilegeRoleInlinePolicy', {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['s3:*'],
            resources: ['arn:aws:s3:::*'],
          })
        ],
      })
    );
    user1.attachInlinePolicy(new iam.Policy(this, 'user1AssumePolicy', {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['sts:AssumeRole'],
            resources: [intermediateRole1.roleArn],
          })
        ],
      })
    );
    intermediateRole1.attachInlinePolicy(new iam.Policy(this, 'intermediateRole1AssumePolicy', {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['sts:AssumeRole'],
            resources: [intermediateRole2.roleArn],
          })
        ],
      })
    );
    intermediateRole2.attachInlinePolicy(new iam.Policy(this, 'intermediateRole2AssumePolicy', {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['sts:AssumeRole'],
            resources: [highPrivilegeRole.roleArn],
          })
        ],
      })
    );



    // User is part of two groups, 1 of which is high privilege
    const groupHighPrivilege = new iam.Group(this, 'groupHighPrivilege', {
        groupName: 'groupHighPrivilege',
    });
    groupHighPrivilege.attachInlinePolicy(new iam.Policy(this, 'highPrivilegeGroupInlinePolicy', {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['rds:*'],
            resources: ['*'],
          })
        ],
      })
    );
    const user2 = new iam.User(this, 'user2', {
        userName: 'user2',
        groups: [groupHighPrivilege, groupNotHighPrivilege],
    });
  };
}