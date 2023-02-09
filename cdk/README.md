## CDK Setup

1. Install typescript globally (e.g. version 4.9.4)

```
sudo npm install -g typescript
```

2. Install aws cdk toolkit globally (e.g. version 2.54.0)
```
sudo npm install -g aws-cdk
```

3. Bootstrap cdk when running the first time
```
cdk bootstrap aws://ACCOUNT-NUMBER/REGION --profile PROFILE
```

4. CDK init
```
cd cdk
cdk init app --language typescript --profile PROFILE
```

## CDK Usage

1. CDK synth and deploy
```
cdk synth STACK --profile PROFILE
cdk deploy STACK --profile PROFILE
```

2. CDK destroy
```
cdk destroy STACK --profile PROFILE 
```

# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
