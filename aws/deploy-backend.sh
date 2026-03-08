#!/usr/bin/env bash
# =============================================================================
#  LexiLearn – deploy-backend.sh
#  Builds the Docker image, pushes to ECR, and forces a new ECS deployment.
#  Run this every time you make backend changes.
#
#  Prerequisites:
#    - AWS CLI v2 configured (aws configure)
#    - Docker Desktop running
#    - setup-infra.sh already run once
# =============================================================================
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
APP_NAME="lexilearn"
ECR_REPO="${APP_NAME}-backend"
ECS_CLUSTER="${APP_NAME}-cluster"
ECS_SERVICE="${APP_NAME}-service"
IMAGE_TAG="latest"

# ── Get AWS account ID ────────────────────────────────────────────────────────
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URI="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"

echo ""
echo "========================================"
echo "  LexiLearn Backend Deploy"
echo "  Region:  $AWS_REGION"
echo "  ECR URI: $ECR_URI"
echo "========================================"
echo ""

# ── 1. Authenticate Docker to ECR ────────────────────────────────────────────
echo "[1/4] Logging in to ECR..."
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# ── 2. Build image from server/ directory ────────────────────────────────────
echo "[2/4] Building Docker image..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

docker build \
  --platform linux/amd64 \
  -t "${ECR_REPO}:${IMAGE_TAG}" \
  "${PROJECT_ROOT}/server"

# Tag for ECR
docker tag "${ECR_REPO}:${IMAGE_TAG}" "${ECR_URI}:${IMAGE_TAG}"
docker tag "${ECR_REPO}:${IMAGE_TAG}" "${ECR_URI}:$(date +%Y%m%d-%H%M%S)"

# ── 3. Push to ECR ────────────────────────────────────────────────────────────
echo "[3/4] Pushing image to ECR..."
docker push "${ECR_URI}:${IMAGE_TAG}"

# ── 4. Force new ECS deployment ───────────────────────────────────────────────
echo "[4/4] Triggering ECS rolling deployment..."
aws ecs update-service \
  --cluster "$ECS_CLUSTER" \
  --service "$ECS_SERVICE" \
  --force-new-deployment \
  --region "$AWS_REGION" \
  --output text \
  --query "service.serviceName"

echo ""
echo "✓ Deployment triggered. Monitor at:"
echo "  https://console.aws.amazon.com/ecs/home?region=${AWS_REGION}#/clusters/${ECS_CLUSTER}/services/${ECS_SERVICE}/tasks"
echo ""
echo "  ECS will pull the new image and restart with zero downtime."
echo "  Typically takes 2-3 minutes."
