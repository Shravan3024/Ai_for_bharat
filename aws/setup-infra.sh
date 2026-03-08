#!/usr/bin/env bash
# =============================================================================
#  LexiLearn – AWS Infrastructure Setup
#  Run ONCE before first deployment.
#  Prerequisites: AWS CLI v2 installed and configured (`aws configure`)
# =============================================================================
set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────────────────
AWS_REGION="${AWS_REGION:-us-east-1}"
APP_NAME="lexilearn"

# S3 – PDF uploads (one bucket per app)
S3_BUCKET="${APP_NAME}-uploads-$(aws sts get-caller-identity --query Account --output text)"

# DynamoDB – AI response cache (already used in ai.py)
DYNAMODB_TABLE="LexiLearn_AICache"

# ECR – Docker image registry for ECS
ECR_REPO="${APP_NAME}-backend"

# RDS – PostgreSQL for SQLAlchemy models (Users, Sessions, Quizzes)
RDS_INSTANCE="${APP_NAME}-db"
RDS_DB_NAME="lexilearn"
RDS_USER="lexilearn_admin"
RDS_CLASS="db.t3.micro"   # Free-tier eligible, ~$15/mo otherwise

echo ""
echo "========================================"
echo "  LexiLearn AWS Infrastructure Setup"
echo "  Region: $AWS_REGION"
echo "========================================"
echo ""

# ─── 1. S3 Bucket for PDF uploads ────────────────────────────────────────────
echo "[1/5] Creating S3 bucket: $S3_BUCKET"
if aws s3api head-bucket --bucket "$S3_BUCKET" 2>/dev/null; then
  echo "      ✓ Bucket already exists, skipping."
else
  if [ "$AWS_REGION" = "us-east-1" ]; then
    aws s3api create-bucket \
      --bucket "$S3_BUCKET" \
      --region "$AWS_REGION"
  else
    aws s3api create-bucket \
      --bucket "$S3_BUCKET" \
      --region "$AWS_REGION" \
      --create-bucket-configuration LocationConstraint="$AWS_REGION"
  fi

  # Block all public access (PDFs are private per-user)
  aws s3api put-public-access-block \
    --bucket "$S3_BUCKET" \
    --public-access-block-configuration \
      BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

  # Enable server-side encryption
  aws s3api put-bucket-encryption \
    --bucket "$S3_BUCKET" \
    --server-side-encryption-configuration '{
      "Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]
    }'

  # Lifecycle rule: delete uncompleted multipart uploads after 7 days
  aws s3api put-bucket-lifecycle-configuration \
    --bucket "$S3_BUCKET" \
    --lifecycle-configuration '{
      "Rules": [{
        "ID": "CleanupMultipart",
        "Status": "Enabled",
        "AbortIncompleteMultipartUpload": {"DaysAfterInitiation": 7}
      }]
    }'

  echo "      ✓ S3 bucket created: $S3_BUCKET"
fi

# ─── 2. DynamoDB – AI Response Cache ─────────────────────────────────────────
echo "[2/5] Creating DynamoDB table: $DYNAMODB_TABLE"
if aws dynamodb describe-table --table-name "$DYNAMODB_TABLE" --region "$AWS_REGION" 2>/dev/null; then
  echo "      ✓ Table already exists, skipping."
else
  aws dynamodb create-table \
    --table-name "$DYNAMODB_TABLE" \
    --attribute-definitions AttributeName=prompt_hash,AttributeType=S \
    --key-schema AttributeName=prompt_hash,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "$AWS_REGION"

  # TTL: auto-expire cached responses after 7 days to save costs
  aws dynamodb update-time-to-live \
    --table-name "$DYNAMODB_TABLE" \
    --time-to-live-specification "Enabled=true,AttributeName=ttl" \
    --region "$AWS_REGION"

  echo "      ✓ DynamoDB table created with TTL: $DYNAMODB_TABLE"
fi

# ─── 3. ECR Repository ───────────────────────────────────────────────────────
echo "[3/5] Creating ECR repository: $ECR_REPO"
if aws ecr describe-repositories --repository-names "$ECR_REPO" --region "$AWS_REGION" 2>/dev/null; then
  echo "      ✓ ECR repo already exists, skipping."
else
  aws ecr create-repository \
    --repository-name "$ECR_REPO" \
    --image-scanning-configuration scanOnPush=true \
    --region "$AWS_REGION"

  # Lifecycle: keep only the last 5 images to avoid storage costs
  aws ecr put-lifecycle-policy \
    --repository-name "$ECR_REPO" \
    --lifecycle-policy-text '{
      "rules": [{
        "rulePriority": 1,
        "description": "Keep last 5 images",
        "selection": {"tagStatus": "any", "countType": "imageCountMoreThan", "countNumber": 5},
        "action": {"type": "expire"}
      }]
    }' \
    --region "$AWS_REGION"

  echo "      ✓ ECR repo created: $ECR_REPO"
fi

# ─── 4. RDS PostgreSQL (for SQLAlchemy: Users, Sessions, Quizzes) ─────────────
echo "[4/5] Creating RDS PostgreSQL instance: $RDS_INSTANCE"
echo "      NOTE: This will take ~5 minutes. RDS is used because LexiLearn"
echo "      uses SQLAlchemy with relational models (users, FK relationships)."
echo "      DynamoDB is NOT suitable for this — it's only used for AI caching."
echo ""

# Generate a random password
RDS_PASSWORD=$(python3 -c "import secrets,string; print(''.join(secrets.choice(string.ascii_letters+string.digits) for _ in range(20)))")

if aws rds describe-db-instances --db-instance-identifier "$RDS_INSTANCE" --region "$AWS_REGION" 2>/dev/null; then
  echo "      ✓ RDS instance already exists, skipping."
else
  aws rds create-db-instance \
    --db-instance-identifier "$RDS_INSTANCE" \
    --db-instance-class "$RDS_CLASS" \
    --engine postgres \
    --engine-version "16.3" \
    --master-username "$RDS_USER" \
    --master-user-password "$RDS_PASSWORD" \
    --db-name "$RDS_DB_NAME" \
    --allocated-storage 20 \
    --storage-type gp2 \
    --no-multi-az \
    --publicly-accessible \
    --region "$AWS_REGION"

  echo ""
  echo "  ╔══════════════════════════════════════════════════════════════╗"
  echo "  ║  SAVE THESE CREDENTIALS — shown only once!                  ║"
  echo "  ║  RDS Host:     (run describe-db-instances after ~5 min)     ║"
  echo "  ║  DB Name:      $RDS_DB_NAME                                 ║"
  echo "  ║  DB User:      $RDS_USER                                    ║"
  echo "  ║  DB Password:  $RDS_PASSWORD                                ║"
  echo "  ╚══════════════════════════════════════════════════════════════╝"
  echo ""
  echo "  Once RDS is available, set this in your ECS task env vars:"
  echo "  DATABASE_URL=postgresql://$RDS_USER:$RDS_PASSWORD@<RDS_HOST>:5432/$RDS_DB_NAME"
fi

# ─── 5. Enable Amazon Bedrock model access ───────────────────────────────────
echo "[5/5] Bedrock model access"
echo "      Amazon Bedrock models require manual console approval."
echo "      Go to: https://console.aws.amazon.com/bedrock/home#/modelaccess"
echo "      Enable: amazon.nova-lite-v1  (cheapest, fast, ~\$0.06/1M tokens)"
echo "      Also enable: anthropic.claude-3-haiku (backup, ~\$0.25/1M tokens)"

# ─── Summary ─────────────────────────────────────────────────────────────────
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URI="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"

echo ""
echo "========================================"
echo "  Setup Complete! Save these values:"
echo "========================================"
echo "  S3_BUCKET_NAME=$S3_BUCKET"
echo "  DYNAMODB_CACHE_TABLE=$DYNAMODB_TABLE"
echo "  ECR_URI=$ECR_URI"
echo "  AWS_REGION=$AWS_REGION"
echo ""
echo "  Next step: run ./aws/deploy-backend.sh"
echo "========================================"
