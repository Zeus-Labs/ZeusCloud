import { SecretsManagerRotationEvent, SecretsManagerRotationHandler } from 'aws-lambda';
import {
   SecretsManagerClient,
   GetSecretValueCommand,
   GetRandomPasswordCommand,
   PutSecretValueCommand,
   ResourceExistsException,
} from '@aws-sdk/client-secrets-manager';

type VersionStage = 'AWSCURRENT' | 'AWSPENDING' | 'AWSPREVIOUS';

const secretsManagerClient = new SecretsManagerClient({});

const handler: SecretsManagerRotationHandler = async (event: SecretsManagerRotationEvent) => {
   // event initialize
   const secretId = event.SecretId;
   const clientRequestToken = event.ClientRequestToken;
   const step = event.Step;

   // step handle
   switch (step) {
      case 'createSecret':
         await createSecret(secretId, clientRequestToken);
         console.log('handler: createSecret completed');
         break;
      case 'setSecret':
         console.log('handler: setSecret is not implemented here. so passthrough');
         break;
      case 'testSecret':
         console.log('handler: testSecret is not implemented here. so passthrough');
         break;
      case 'finishSecret':
         await finishSecret(secretId, clientRequestToken);
         console.log('handler: finishSecret completed. rotate secret done.');
         break;
      default:
         throw Error(`handler: Invalid step parameter. Step: ${step}`);
   }
};

const createSecret = async (secretId: string, clientRequestToken: string) => {
   // generate random value
   const secretString = await secretsManagerClient.send(
      new GetRandomPasswordCommand({}),
   );

   // put new secret value. this will automatically change version stages. It's idempotent
   // @see https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_PutSecretValue.html
   try {
      await secretsManagerClient.send(
         new PutSecretValueCommand({
            SecretId: secretId,
            ClientRequestToken: clientRequestToken,
            SecretString: secretString.RandomPassword,
         }),
      );
   } catch (e) {
      // filter duplicated lambda invoke.
      if (e instanceof ResourceExistsException) console.log('createSecret: secret already exist. considered as duplicated lambda invoke.');
      // other error handle
      else throw Error(`createSecret: ${e}`);
   }
};

const finishSecret = async (secretId: string, clientRequestToken: string) => {
   // check if putSecretValue has been done successfully.
   await secretsManagerClient.send(
      new GetSecretValueCommand({ SecretId: secretId, VersionId: clientRequestToken, VersionStage: 'AWSCURRENT' as VersionStage }),
   );
};

export { handler };
