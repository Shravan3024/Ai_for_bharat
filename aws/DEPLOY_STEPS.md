# LexiLearn — Complete AWS Deployment Guide
# AI for Bharat Hackathon | Deadline: March 8, 2026

---

## Architecture Overview (what you're deploying)

```
Students/Teachers/Parents
        │
        ▼
  AWS Amplify (React frontend)          ← Git push auto-deploys
        │  HTTPS
        ▼
  Amazon ECS Fargate (FastAPI backend)  ← Docker container, no servers to manage
        │
        ├──► Amazon Cognito             ← Auth (ALREADY configured: us-east-1_eYn9ZPpa8)
        ├──► Amazon Bedrock Nova Lite   ← AI: simplify text, quiz gen, LexiBot chat
        ├──► DynamoDB (LexiLearn_AICache) ← AI response cache (saves Bedrock costs)
        ├──► Amazon S3                  ← PDF uploads from students
        └──► SQLite on ECS / RDS        ← User accounts, sessions, quiz results
```

**Why these services (not alternatives):**
| Service | Why LexiLearn uses it |
|---|---|
| **ECS Fargate** | FastAPI needs a persistent server (not event-driven like Lambda). Docker image already ready. |
| **RDS PostgreSQL** | You have SQLAlchemy with 5 relational tables + foreign keys. DynamoDB cannot do this. |
| **DynamoDB** | Already in `ai.py` as AI response cache. Perfect fit — key-value, serverless. |
| **S3** | Already in `processing.py` for PDF uploads. |
| **Bedrock Nova Lite** | Already wired. `us.amazon.nova-lite-v1:0` — cheapest at $0.06/1M tokens. |
| **Amplify** | React + Vite app. Git push = auto deploy. Free CDN. |
| **Cognito** | Already configured and working. User Pool: `us-east-1_eYn9ZPpa8`. |

**Estimated cost for the hackathon week: $8–20 total**

---

## PART 1: One-Time AWS Setup (do this first)

### Step 1 — Configure AWS CLI on your machine

```bash
# Install AWS CLI v2: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
# Then configure with your hackathon account credentials:
aws configure
# AWS Access Key ID:     <from AWS console → IAM → Security credentials>
# AWS Secret Access Key: <from AWS console → IAM → Security credentials>
# Default region:        us-east-1
# Default output format: json

# Verify it works:
aws sts get-caller-identity
```

---

### Step 2 — Enable Bedrock Model Access (CRITICAL — do this first)

1. Go to: https://console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess
2. Click **"Manage model access"**
3. Enable these models (check the boxes):
   - **Amazon Nova Lite** (`amazon.nova-lite-v1`) — primary AI model
   - **Amazon Nova Micro** (`amazon.nova-micro-v1`) — backup if lite throttles
4. Click **"Save changes"**
5. Wait 2–3 minutes for access to activate

> **If you see quota 0 TPM**: Switch to us-east-1 (already your region). If still 0, use the Gemini fallback — it's already wired in `ai.py`.

---

### Step 3 — Run the infrastructure setup script

```bash
# From the project root (Windows: use Git Bash or WSL)
cd "D:\Git\Dyslexia backup final git - Copy"
chmod +x aws/setup-infra.sh
bash aws/setup-infra.sh
```

This creates:
- **S3 bucket** for PDF uploads (e.g., `lexilearn-uploads-123456789`)
- **DynamoDB table** `LexiLearn_AICache` with 7-day TTL
- **ECR repository** for the Docker image
- **RDS PostgreSQL** `db.t3.micro` (~$15/mo, free-tier eligible if new account)

**Save the output!** You'll need the S3 bucket name and RDS connection string.

---

### Step 4 — Set up ECS Fargate cluster (AWS Console)

> This is faster to do in the console for a hackathon than writing CDK/CloudFormation.

1. Go to: https://console.aws.amazon.com/ecs/home?region=us-east-1
2. Click **"Clusters"** → **"Create cluster"**
3. Cluster name: `lexilearn-cluster`
4. Infrastructure: **AWS Fargate** (serverless)
5. Click **"Create"**

---

### Step 5 — Create ECS Task Definition

1. Go to **Task definitions** → **"Create new task definition"**
2. Task definition family: `lexilearn-backend`
3. Launch type: **Fargate**
4. CPU: `0.5 vCPU`, Memory: `1 GB`
5. Task role: Create a new IAM role (or use existing) with these permissions:
   - `AmazonBedrockFullAccess`
   - `AmazonDynamoDBFullAccess`
   - `AmazonS3FullAccess`
   - `AmazonCognitoPowerUser`
   - `SecretsManagerReadWrite`
6. Under **"Container"**:
   - Name: `lexilearn-backend`
   - Image URI: `<YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/lexilearn-backend:latest`
   - Port: `8000`
7. Under **"Environment variables"**, add:
   ```
   ENVIRONMENT          = production
   DATABASE_URL         = postgresql://lexilearn_admin:<PASSWORD>@<RDS_HOST>:5432/lexilearn
   AWS_REGION           = us-east-1
   BEDROCK_MODEL_ID     = us.amazon.nova-lite-v1:0
   S3_BUCKET_NAME       = lexilearn-uploads-<YOUR_ACCOUNT_ID>
   DYNAMODB_CACHE_TABLE = LexiLearn_AICache
   COGNITO_REGION       = us-east-1
   COGNITO_USER_POOL_ID = us-east-1_eYn9ZPpa8
   COGNITO_APP_CLIENT_ID= 1134vvpqs0ib4k5odjpf7jkgak
   SECRET_KEY           = <generate: python3 -c "import secrets; print(secrets.token_hex(32))">
   FRONTEND_URL         = https://main.<YOUR_AMPLIFY_ID>.amplifyapp.com
   VITE_GEMINI_API_KEY  = AIzaSyBc4E9At2EGgnd0jyiFTnUEmoxDZnB8x6E
   ```
8. Click **"Create"**

---

### Step 6 — Create ECS Service

1. In your cluster, click **"Create service"**
2. Launch type: **Fargate**
3. Task definition: `lexilearn-backend` (latest)
4. Service name: `lexilearn-service`
5. Desired tasks: `1`
6. Networking:
   - Use default VPC and any available subnets
   - Security group: Allow inbound TCP on port `8000` from anywhere (0.0.0.0/0)
   - Auto-assign public IP: **ENABLED**
7. Click **"Create"**

> After creating, click on the running task → note the **Public IP** address. Your backend URL is `http://<PUBLIC_IP>:8000`

---

## PART 2: Deploy the Backend

### Step 7 — First deploy (and every time you make backend changes)

```bash
# From project root (Git Bash / WSL on Windows):
cd "D:\Git\Dyslexia backup final git - Copy"
chmod +x aws/deploy-backend.sh
bash aws/deploy-backend.sh
```

This:
1. Authenticates Docker to ECR
2. Builds `server/Dockerfile` → Docker image
3. Pushes to ECR
4. Forces a new ECS rolling deployment (zero downtime)

**Test your backend is live:**
```bash
curl http://<ECS_PUBLIC_IP>:8000/api/health
# Expected: {"status":"ok","version":"0.1.0"}
```

---

## PART 3: Deploy the Frontend (AWS Amplify)

### Step 8 — Connect your GitHub repo to Amplify

1. Push your project to GitHub (public repo):
   ```bash
   cd "D:\Git\Dyslexia backup final git - Copy"
   git add .
   git commit -m "Deploy LexiLearn to AWS"
   git push origin main
   ```

2. Go to: https://console.aws.amazon.com/amplify/home?region=us-east-1
3. Click **"New app"** → **"Host web app"**
4. Connect to **GitHub** → authorize and select your repo
5. Branch: `main`
6. Build settings — Amplify will auto-detect `amplify.yml` (already in project root)
7. Under **"Environment variables"**, add:
   ```
   VITE_API_URL          = http://<ECS_PUBLIC_IP>:8000/api
   VITE_COGNITO_REGION   = us-east-1
   VITE_COGNITO_USER_POOL_ID  = us-east-1_eYn9ZPpa8
   VITE_COGNITO_APP_CLIENT_ID = 1134vvpqs0ib4k5odjpf7jkgak
   VITE_GEMINI_API_KEY   = AIzaSyBc4E9At2EGgnd0jyiFTnUEmoxDZnB8x6E
   ```
8. Click **"Save and deploy"**

Your site will be live at: `https://main.<random-id>.amplifyapp.com`

---

### Step 9 — Update Cognito to allow your Amplify URL

1. Go to: https://console.aws.amazon.com/cognito/home?region=us-east-1
2. Click **User Pools** → `us-east-1_eYn9ZPpa8`
3. Go to **App clients** → `1134vvpqs0ib4k5odjpf7jkgak`
4. Under **"Hosted UI"** / **"Callback URLs"**, add:
   ```
   https://main.<YOUR_AMPLIFY_ID>.amplifyapp.com
   https://main.<YOUR_AMPLIFY_ID>.amplifyapp.com/login
   ```
5. Under **"Sign-out URLs"**, add the same.
6. Save.

---

### Step 10 — Update ECS Backend FRONTEND_URL

Go back to your ECS task definition, create a new revision, and update:
```
FRONTEND_URL = https://main.<YOUR_AMPLIFY_ID>.amplifyapp.com
```

Then re-deploy (rerun `deploy-backend.sh`).

---

## PART 4: Continuous Deployment (every change auto-deploys)

### Frontend (Zero effort after setup)
```bash
git add .
git commit -m "your message"
git push origin main
# Amplify auto-builds and deploys in ~2 minutes
```

### Backend (One command)
```bash
bash aws/deploy-backend.sh
# Builds new Docker image, pushes to ECR, ECS rolling update (~2-3 min)
```

---

## PART 5: Cost Monitoring

**Set a $50 budget alarm so you never exceed $100:**

1. Go to: https://console.aws.amazon.com/billing/home#/budgets
2. Click **"Create budget"**
3. Budget type: **Cost budget**
4. Amount: `$50`
5. Alert threshold: `80%` → notify your email
6. Click **"Create"**

**Expected costs for the hackathon week:**
| Service | Estimated Cost |
|---|---|
| ECS Fargate (1 task, 0.5vCPU/1GB) | ~$0.50/day |
| RDS db.t3.micro (PostgreSQL) | ~$0.70/day |
| S3 (PDF uploads) | < $0.01 |
| DynamoDB (AI cache, PAY_PER_REQUEST) | < $0.10 |
| Bedrock Nova Lite | ~$0.06/1M tokens |
| Amplify (frontend hosting) | Free tier |
| Cognito | Free (< 50K MAU) |
| **Total for ~5 days** | **~$6–12** |

---

## PART 6: What Judges Will See (Submission Checklist)

- [ ] Live URL: `https://main.<id>.amplifyapp.com` — working, not localhost
- [ ] Login as Student → reads text → AI simplifies it → Bedrock is doing real work
- [ ] LexiBot chat → powered by Bedrock Nova Lite
- [ ] Quiz generation → AI generated, not hardcoded
- [ ] PDF upload → goes to S3
- [ ] Architecture diagram in README / deck showing all AWS services
- [ ] GitHub repo: public, has `README.md` explaining AWS architecture

**For the architecture slide in your deck:**
- Compute: ECS Fargate
- Storage: S3 (PDFs)
- Database: RDS PostgreSQL (relational data) + DynamoDB (AI cache)
- AI: Amazon Bedrock Nova Lite (primary) + Gemini (fallback)
- Auth: Amazon Cognito
- Frontend: AWS Amplify
- Why AI is required: Removes AI → app becomes a plain text reader with no adaptation
- Cost efficiency: DynamoDB caches every Bedrock response (hash of prompt → response)

---

## Troubleshooting

**"ThrottlingException" from Bedrock:**
> The app has exponential backoff built in (3 retries). If it still fails, Gemini kicks in automatically. You don't need to do anything.

**ECS task keeps stopping:**
> Check task logs in CloudWatch. Most common cause: `DATABASE_URL` env var is wrong. Verify RDS host is correct and the security group allows port 5432 from the ECS task's security group.

**Amplify build fails:**
> Check the build log in Amplify console. Most common: `bun` not found. The `amplify.yml` already installs bun first.

**CORS error in browser:**
> Update `FRONTEND_URL` env var in ECS task definition to your exact Amplify URL and redeploy backend.

**Cognito "redirect_uri mismatch":**
> Add your Amplify URL to Cognito App Client callback URLs (Step 9 above).
