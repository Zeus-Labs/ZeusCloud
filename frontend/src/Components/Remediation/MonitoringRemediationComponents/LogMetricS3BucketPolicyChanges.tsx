import ReactMarkdown from "react-markdown";
import { StepInstruction, NormalInstruction } from "../Instructions";

// 3.8 Ensure a log metric filter and alarm exist for S3 bucket policy
// changes
export const LogMetricS3BucketPolicyChanges = () => {
   
    return (
        <>
            <NormalInstruction instruction="Perform the following to setup the metric 
            filter, alarm, SNS topic, and subscription:"/>

            <StepInstruction stepNumber={"1."} instruction="Create a metric filter based 
    on filter pattern provided which checks for S3 bucket
    policy changes and the <cloudtrail_log_group_name> taken from audit step 1."/>

            <ReactMarkdown className="markdown markdown_blockquote">{
    `
    aws logs put-metric-filter 
    --log-group-name <cloudtrail_log_group_name> 
    --filter-name \`<s3_bucket_policy_changes_metric>\` 
    --metric-transformations metricName= 
        \`<s3_bucket_policy_changes_metric>\`
    ,metricNamespace='CISBenchmark',metricValue=1 
    --filter-pattern '{($.eventSource = s3.amazonaws.com) && 
        (($.eventName = PutBucketAcl) ||
        ($.eventName = PutBucketPolicy) ||
        ($.eventName = PutBucketCors) ||
        ($.eventName = PutBucketLifecycle) || 
        ($.eventName = PutBucketReplication) ||
        ($.eventName = DeleteBucketPolicy) || 
        ($.eventName = DeleteBucketCors) ||
        ($.eventName = DeleteBucketLifecycle) || 
        ($.eventName = DeleteBucketReplication)) }'`
    }
            </ReactMarkdown>

            <StepInstruction stepNumber={"2."} instruction='Create an SNS topic that 
            the alarm will notify.'/>
         
            <ReactMarkdown className="markdown markdown_blockquote">{
                `
    aws sns create-topic --name <sns_topic_name>`
                }
            </ReactMarkdown>

            <StepInstruction stepNumber={"3."} instruction='Create an SNS 
            subscription to the topic created in step 2'/>

            <ReactMarkdown className="markdown markdown_blockquote">{
            `
    aws sns subscribe --topic-arn <sns_topic_arn> 
    --protocol <protocol_for_sns> 
    --notification-endpoint <sns_subscription_endpoints>`
                }
            </ReactMarkdown>

            <StepInstruction stepNumber={"4."} instruction='Create an alarm that 
    is associated with the CloudWatch Logs Metric Filter created in step 1 and an 
    SNS topic created in step 2'/>

            <ReactMarkdown className="markdown markdown_blockquote">{
    `
    aws cloudwatch put-metric-alarm 
    --alarm-name \`<s3_bucket_policy_changes_alarm>\` 
    --metric-name \`<s3_bucket_policy_changes_metric>\` 
    --statistic Sum --period 300 --threshold 1 
    --comparison-operator GreaterThanOrEqualToThreshold 
    --evaluation-periods 1 --namespace 'CISBenchmark' 
    --alarm-actions <sns_topic_arn>
    `
    }
            </ReactMarkdown>
        </>  
    )

}