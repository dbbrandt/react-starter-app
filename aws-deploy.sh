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
APP_NAME="chat-ui"
ENVIRONMENT="dev"
BUCKET_NAME="$APP_NAME-$ENVIRONMENT"

# Build the React application
echo "Building React application..."
npm run build

# Sync build folder with S3 bucket
echo "Deploying to S3..."
aws s3 sync build/ s3://$BUCKET_NAME --delete --profile $AWS_PROFILE

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
DISTRIBUTION_ID=$(aws cloudfront list-distributions --profile $AWS_PROFILE \
    --query "DistributionList.Items[?Origins.Items[?DomainName=='$BUCKET_NAME.s3.amazonaws.com']].Id" \
    --output text | awk '{print $1}')

if [ ! -z "$DISTRIBUTION_ID" ]; then
    aws cloudfront create-invalidation \
        --distribution-id $DISTRIBUTION_ID \
        --paths "/*" \
        --profile $AWS_PROFILE
    echo "CloudFront invalidation created."
else
    echo "Warning: Could not find CloudFront distribution for $BUCKET_NAME"
fi

echo "Deployment completed!"
