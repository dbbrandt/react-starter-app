#!/bin/bash

# Use default profile if AWS_PROFILE is not set
AWS_PROFILE=${AWS_PROFILE:-default}
echo "Using AWS Profile: $AWS_PROFILE"

# Configuration variables
APP_NAME="chat-ui"
ENVIRONMENT="dev"
BUCKET_NAME="$APP_NAME-$ENVIRONMENT"

# Get the distribution ID
DISTRIBUTION_ID=$(aws cloudfront list-distributions --profile $AWS_PROFILE \
    --query "DistributionList.Items[?Origins.Items[?DomainName=='$BUCKET_NAME.s3.amazonaws.com']].Id" \
    --output text | awk '{print $1}')

if [ -z "$DISTRIBUTION_ID" ]; then
    echo "No CloudFront distribution found for $BUCKET_NAME"
    exit 1
fi

echo "Found Distribution ID: $DISTRIBUTION_ID"

# Get distribution status
DISTRIBUTION_INFO=$(aws cloudfront get-distribution --id $DISTRIBUTION_ID --profile $AWS_PROFILE)
STATUS=$(echo $DISTRIBUTION_INFO | jq -r '.Distribution.Status')
DOMAIN_NAME=$(echo $DISTRIBUTION_INFO | jq -r '.Distribution.DomainName')

echo "Distribution Status: $STATUS"
echo "Domain Name: $DOMAIN_NAME"

if [ "$STATUS" = "Deployed" ]; then
    echo "✅ CloudFront distribution is fully deployed and ready to use!"
    echo "You can access your site at: https://$DOMAIN_NAME"
else
    echo "⏳ Distribution is still deploying... This can take up to 30 minutes."
fi
