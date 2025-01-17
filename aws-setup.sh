#!/bin/bash

# Exit on error
set -e

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Use default profile if AWS_PROFILE is not set
AWS_PROFILE=${AWS_PROFILE:-default}
echo "Using AWS Profile: $AWS_PROFILE"

# Configuration variables
REGION="us-east-1"
APP_NAME="chat-ui"
ENVIRONMENT="dev"

# Create S3 bucket for hosting
BUCKET_NAME="$APP_NAME-$ENVIRONMENT"
echo "Creating S3 bucket: $BUCKET_NAME"
aws s3api create-bucket \
    --bucket $BUCKET_NAME \
    --region $REGION \
    --profile $AWS_PROFILE

# Disable S3 Block Public Access
echo "Disabling S3 Block Public Access..."
aws s3api put-public-access-block \
    --bucket $BUCKET_NAME \
    --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
    --profile $AWS_PROFILE

# Enable static website hosting
echo "Enabling static website hosting..."
aws s3api put-bucket-website \
    --bucket $BUCKET_NAME \
    --website-configuration '{"IndexDocument":{"Suffix":"index.html"},"ErrorDocument":{"Key":"index.html"}}' \
    --profile $AWS_PROFILE

# Create bucket policy for public read access
echo "Setting bucket policy..."
POLICY='{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::'$BUCKET_NAME'/*"
        }
    ]
}'

# Apply bucket policy
aws s3api put-bucket-policy \
    --bucket $BUCKET_NAME \
    --policy "$POLICY" \
    --profile $AWS_PROFILE

echo "Creating CloudFront distribution..."
# Create temporary file for CloudFront config
TEMP_CONFIG="/tmp/cloudfront-config-$APP_NAME.json"
cat > "$TEMP_CONFIG" << EOF
{
    "CallerReference": "$(date +%s)",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3Origin",
                "DomainName": "$BUCKET_NAME.s3.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3Origin",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
            "Quantity": 2,
            "Items": ["GET", "HEAD"],
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"]
            }
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 3600,
        "MaxTTL": 86400
    },
    "Comment": "$APP_NAME Distribution",
    "Enabled": true,
    "DefaultRootObject": "index.html",
    "PriceClass": "PriceClass_100",
    "ViewerCertificate": {
        "CloudFrontDefaultCertificate": true
    },
    "CustomErrorResponses": {
        "Quantity": 1,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    }
}
EOF

# Create CloudFront distribution using the config file
DISTRIBUTION_INFO=$(aws cloudfront create-distribution \
    --distribution-config "file://$TEMP_CONFIG" \
    --profile $AWS_PROFILE \
    --output json)

# Clean up temporary file
rm -f "$TEMP_CONFIG"

# Extract and display the CloudFront domain name
DOMAIN_NAME=$(echo $DISTRIBUTION_INFO | jq -r '.Distribution.DomainName')
echo "Setup completed successfully!"
echo "CloudFront Distribution Domain: $DOMAIN_NAME"
echo "Note: It may take up to 30 minutes for the CloudFront distribution to be fully deployed."
