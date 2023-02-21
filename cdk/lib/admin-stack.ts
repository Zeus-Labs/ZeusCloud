import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

export class AdminStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // User is member of non-admin group. User can assume a role,
    // which can assume a role, which can assume an admin role.
    const groupNotAdmin = new iam.Group(this, 'groupNotAdmin', {
        groupName: 'groupNotAdmin',
    });
    const user1 = new iam.User(this, 'user1', {
        userName: 'user1',
        groups: [groupNotAdmin],

    });
    const intermediateRole1 = new iam.Role(this, 'intermediateRole1', {
        assumedBy: user1,
    });
    const intermediateRole2 = new iam.Role(this, 'intermediateRole2', {
        assumedBy: intermediateRole1,
        managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AWSProtonReadOnlyAccess')]
    });
    const adminRole = new iam.Role(this, 'adminRole', {
        assumedBy: intermediateRole2,
    });
    adminRole.attachInlinePolicy(new iam.Policy(this, 'adminInlinePolicy', {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['iam:PutRolePolicy'],
            resources: ['*'],
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
            resources: [adminRole.roleArn],
          })
        ],
      })
    );



    // User is part of two groups, 1 of which is admin
    const groupAdmin = new iam.Group(this, 'groupAdmin', {
        groupName: 'groupAdmin',
        managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')]
    });
    const user2 = new iam.User(this, 'user2', {
        userName: 'user2',
        groups: [groupAdmin, groupNotAdmin],
    });
  };
}