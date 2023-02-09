
import { twMerge } from 'tailwind-merge';

// eslint-disable-next-line import/prefer-default-export
export function classNames(...classes: (string | undefined)[]) {
  return twMerge(...classes);
}

export function extractServiceName(ruleId: string) {

  // Extract the service before the first forward slash
  var rulePrefix = ruleId.substring(0, ruleId.indexOf('/'));
  switch (rulePrefix) {
    case 'iam':
      return 'IAM';
    case 'cloudwatch':
      return 'CloudWatch';
    case 'ec2': 
      return "EC2";
    case 'elasticsearch': 
      return 'Elasticsearch';
    case 'elbv2':
      return 'ELBv2';
    case 'rds': 
      return 'RDS'; 
    case 'secretsmanager':
      return 'Secrets Manager';
    case 'securityhub':
      return 'Security Hub';
    case 's3':
      return 'S3';
    case 'sqs': 
      return 'SQS';
    case 'vpc':
      return 'VPC'; 
    case 'cloudtrail':
      return 'CloudTrail';
    case 'iam': 
      return 'IAM';
    case 'kms': 
      return 'KMS';
  }
  return '';
}
