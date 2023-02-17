import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

// IamStack sets up an IAM group with users and 
// one without any users.
export class IamStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Group with 2 users. user1 has an active and inactive access key
    // user2 has 2 active access keys
    const groupWithUsers = new iam.Group(this, 'groupWithUsers', {
      groupName: 'groupWithUsers',
    });
    const user1 = new iam.User(this, 'user1', {
      groups: [groupWithUsers],
      userName: 'user1',
    });
    new iam.AccessKey(this, 'user1AccessKey1', { 
      user: user1
    });
    new iam.AccessKey(this, 'user1AccessKey2', { 
      user: user1,
      status: iam.AccessKeyStatus.INACTIVE
     });
    const user2 = new iam.User(this, 'user2', {
      groups: [groupWithUsers],
      userName: 'user2',
    });
    new iam.AccessKey(this, 'user2AccessKey1', { 
      user: user2
    });
    new iam.AccessKey(this, 'user2AccessKey2', { 
      user: user2
     });

    // Group with no users
    new iam.Group(this, 'groupWithoutUsers', {
      groupName: 'groupWithoutUsers',
    });

    // User not assigned to group with an inline policy
    const userNoGroup = new iam.User(this, 'userNoGroup', {
      userName: 'userNoGroup',
    });
    userNoGroup.attachInlinePolicy(new iam.Policy(this, 'userInlinePolicy', {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.DENY,
            actions: ['*'],
            resources: ['*']
          })
        ],
      })
    );

    // Support role assumable by to userNoGroup
    new iam.Role(this, 'supportRole', {
      assumedBy: userNoGroup,
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AWSSupportAccess')]
    });
  }
}

