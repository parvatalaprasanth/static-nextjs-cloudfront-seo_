import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import route53 = require('aws-cdk-lib/aws-route53');
import acm = require('aws-cdk-lib/aws-certificatemanager');
import cloudfront = require('aws-cdk-lib/aws-cloudfront');
import * as iam from 'aws-cdk-lib/aws-iam';
import { CfnOutput, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import * as cloudfront_origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';

export class CdkStack extends cdk.Stack {
  public readonly s3: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.s3 = new s3.Bucket(this, 'web-hoster', {
      bucketName: `nexttest-hoster`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(
      this,
      'cloudfront-OAI',
      {
        comment: `OAI for`
      }
    );

    this.s3.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [this.s3.arnForObjects('*')],
        principals: [
          new iam.CanonicalUserPrincipal(
            cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
          )
        ]
      })
    );

    const layer = new lambda.LayerVersion(this, 'YourLambdaLayer', {
      code: lambda.Code.fromAsset(join(__dirname, '../code')), // Path to your layer code
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X], // Use the appropriate runtime
      description: 'Your Lambda Layer Description',
    });

    const redirectFunction = new cloudfront.Function(
      this,
      "reredirect",
      {
        code: cloudfront.FunctionCode.fromFile({
          filePath: join(__dirname, 'handle.js')
        }),
      },
  )
    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      defaultRootObject: 'index.html',
      
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 403,
          responsePagePath: '/404.html',
          ttl: Duration.minutes(30)
        }
      ],
      
      defaultBehavior: {
        origin: new cloudfront_origins.S3Origin(this.s3, {
          originAccessIdentity: cloudfrontOAI
        }),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        functionAssociations: [
          {
            function: redirectFunction,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      }
    });

  }
}
