#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f .env.production ]; then
    source .env.production
else
    echo "Error: .env.production file not found"
    echo "Please create .env.production file with required variables (see .env.production.example)"
    exit 1
fi

# Use default profile if AWS_PROFILE is not set
AWS_PROFILE=${AWS_PROFILE:-default}
echo "Using AWS Profile: $AWS_PROFILE"

# Check required environment variables
if [ -z "$REACT_APP_DOMAIN" ]; then
    echo "Error: REACT_APP_DOMAIN environment variable is not set"
    exit 1
fi

# Configuration variables
DOMAIN="$REACT_APP_DOMAIN"
REGION="us-east-1"  # ACM certificates for CloudFront must be in us-east-1
APP_NAME="chat-ui"
ENVIRONMENT="dev"
BUCKET_NAME="$APP_NAME-$ENVIRONMENT"

# Request SSL certificate
echo "Requesting SSL certificate for $DOMAIN..."
CERTIFICATE_ARN=$(aws acm request-certificate \
    --domain-name "$DOMAIN" \
    --validation-method DNS \
    --region $REGION \
    --profile $AWS_PROFILE \
    --query 'CertificateArn' \
    --output text)

echo "Certificate ARN: $CERTIFICATE_ARN"

# Wait for certificate details to be available
echo "Waiting for certificate details..."
sleep 10

# Get the DNS validation record details
VALIDATION_RECORD=$(aws acm describe-certificate \
    --certificate-arn "$CERTIFICATE_ARN" \
    --region $REGION \
    --profile $AWS_PROFILE \
    --query 'Certificate.DomainValidationOptions[0].ResourceRecord')

VALIDATION_NAME=$(echo $VALIDATION_RECORD | jq -r '.Name')
VALIDATION_VALUE=$(echo $VALIDATION_RECORD | jq -r '.Value')

echo "Please create the following DNS record in your Route 53 hosted zone:"
echo "Record Name: $VALIDATION_NAME"
echo "Record Type: CNAME"
echo "Record Value: $VALIDATION_VALUE"

# Get the hosted zone ID for prodagen.com
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name \
    --dns-name "prodagen.com" \
    --profile $AWS_PROFILE \
    --query 'HostedZones[0].Id' \
    --output text)

# Create the DNS validation record
echo "Creating DNS validation record..."
aws route53 change-resource-record-sets \
    --hosted-zone-id "$HOSTED_ZONE_ID" \
    --change-batch "{
        \"Changes\": [{
            \"Action\": \"UPSERT\",
            \"ResourceRecordSet\": {
                \"Name\": \"$VALIDATION_NAME\",
                \"Type\": \"CNAME\",
                \"TTL\": 300,
                \"ResourceRecords\": [{
                    \"Value\": \"$VALIDATION_VALUE\"
                }]
            }
        }]
    }" \
    --profile $AWS_PROFILE

echo "Waiting for certificate validation (this may take several minutes)..."
aws acm wait certificate-validated \
    --certificate-arn "$CERTIFICATE_ARN" \
    --region $REGION \
    --profile $AWS_PROFILE

echo "Certificate validated successfully!"

# Get the CloudFront distribution ID
DISTRIBUTION_ID=$(aws cloudfront list-distributions --profile $AWS_PROFILE \
    --query "DistributionList.Items[?Origins.Items[?DomainName=='$BUCKET_NAME.s3.amazonaws.com']].Id" \
    --output text | awk '{print $1}')

echo "Updating CloudFront distribution..."
# Get current distribution config
aws cloudfront get-distribution-config \
    --id "$DISTRIBUTION_ID" \
    --profile $AWS_PROFILE \
    --query 'DistributionConfig' > dist-config.json

# Get the ETag
ETAG=$(aws cloudfront get-distribution-config \
    --id "$DISTRIBUTION_ID" \
    --profile $AWS_PROFILE \
    --query 'ETag' \
    --output text)

# Update the configuration with the new domain and certificate
jq --arg domain "$DOMAIN" \
   --arg cert "$CERTIFICATE_ARN" \
   '.Aliases.Quantity = 1 | 
    .Aliases.Items = [$domain] |
    .ViewerCertificate = {
        "ACMCertificateArn": $cert,
        "SSLSupportMethod": "sni-only",
        "MinimumProtocolVersion": "TLSv1.2_2021",
        "Certificate": $cert,
        "CertificateSource": "acm"
    }' dist-config.json > dist-config-updated.json

# Update the distribution
aws cloudfront update-distribution \
    --id "$DISTRIBUTION_ID" \
    --distribution-config file://dist-config-updated.json \
    --if-match "$ETAG" \
    --profile $AWS_PROFILE

# Clean up temporary files
rm dist-config.json dist-config-updated.json

# Create DNS record for the custom domain
echo "Creating DNS record for $DOMAIN..."
DISTRIBUTION_DOMAIN=$(aws cloudfront get-distribution \
    --id "$DISTRIBUTION_ID" \
    --profile $AWS_PROFILE \
    --query 'Distribution.DomainName' \
    --output text)

aws route53 change-resource-record-sets \
    --hosted-zone-id "$HOSTED_ZONE_ID" \
    --change-batch "{
        \"Changes\": [{
            \"Action\": \"UPSERT\",
            \"ResourceRecordSet\": {
                \"Name\": \"$DOMAIN\",
                \"Type\": \"A\",
                \"AliasTarget\": {
                    \"HostedZoneId\": \"Z2FDTNDATAQYW2\",
                    \"DNSName\": \"$DISTRIBUTION_DOMAIN\",
                    \"EvaluateTargetHealth\": false
                }
            }
        }]
    }" \
    --profile $AWS_PROFILE

echo "Setup completed!"
echo "Your site will be available at https://$DOMAIN once the DNS changes propagate (usually 5-30 minutes)"
echo "You can check the CloudFront distribution status with ./check-cloudfront.sh"
