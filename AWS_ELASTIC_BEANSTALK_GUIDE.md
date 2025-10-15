# AWS Elastic Beanstalk Deployment Guide (Easiest Option)

## Overview
This guide uses AWS Elastic Beanstalk for the simplest possible deployment. Elastic Beanstalk automatically handles deployment, scaling, and monitoring - perfect for testing!

**Estimated Time**: 20-30 minutes  
**Cost**: $0 within Free Tier (750 hours/month t2.micro)  
**Difficulty**: Beginner-friendly

---

## What is Elastic Beanstalk?

Elastic Beanstalk is AWS's Platform-as-a-Service (PaaS) that:
- Automatically provisions EC2 instances, load balancers, and scaling
- Handles deployment with a single command
- Provides monitoring dashboards out of the box
- Manages application versions and rollbacks
- **You only pay for the underlying resources** (covered by Free Tier for testing)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              AWS Elastic Beanstalk                      │
│                                                         │
│  ┌────────────────┐         ┌──────────────────────┐  │
│  │  Environment 1  │         │   Environment 2      │  │
│  │   (Backend)     │         │   (Frontend)         │  │
│  │                 │         │                      │  │
│  │  ┌───────────┐  │         │  ┌────────────────┐ │  │
│  │  │ EC2 t2.   │  │         │  │  EC2 t2.micro  │ │  │
│  │  │  micro    │  │         │  │  (nginx)       │ │  │
│  │  │ Node.js + │  │         │  │  React build   │ │  │
│  │  │ Docker    │  │         │  │                │ │  │
│  │  └───────────┘  │         │  └────────────────┘ │  │
│  │   Port: 5000    │         │    Port: 80         │  │
│  └────────────────┘         └──────────────────────┘  │
│          │                           │                 │
│          └──────────┬────────────────┘                 │
│                     │                                  │
│              ┌──────▼──────┐                          │
│              │  RDS         │                          │
│              │  PostgreSQL  │                          │
│              │  db.t3.micro │                          │
│              └──────────────┘                          │
└─────────────────────────────────────────────────────────┘
```

---

## Prerequisites

1. AWS Free Tier account
2. AWS CLI installed ([Download here](https://aws.amazon.com/cli/))
3. EB CLI installed
4. Your FlowTracker application code

---

## Part 1: Install Required Tools

### Step 1: Install AWS CLI

**Windows (PowerShell - Run as Administrator):**
```powershell
# Download and run the MSI installer
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi
```

**Mac:**
```bash
brew install awscli
```

**Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

**Verify installation:**
```powershell
aws --version
```

### Step 2: Configure AWS CLI

```powershell
aws configure
```

You'll need:
- **AWS Access Key ID**: Get from IAM Console → Users → Security credentials → Create access key
- **AWS Secret Access Key**: Shown when you create the access key (save it!)
- **Default region**: Choose closest to you (e.g., `us-east-1`, `us-west-2`, `eu-west-1`)
- **Output format**: `json`

### Step 3: Install EB CLI

**Windows (PowerShell):**
```powershell
pip install awsebcli --upgrade --user
```

**Mac:**
```bash
brew install awsebcli
```

**Linux:**
```bash
pip install awsebcli --upgrade --user
```

**Verify installation:**
```powershell
eb --version
```

---

## Part 2: Prepare Backend for Deployment

### Step 4: Create Backend Deployment Configuration

Navigate to your backend directory:
```powershell
cd backend
```

Create `.ebextensions` directory for configuration:
```powershell
mkdir .ebextensions
```

Create `01_environment.config`:
```powershell
New-Item -Path .ebextensions\01_environment.config -ItemType File
```

Edit and add:
```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    PORT: 5000
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
  aws:autoscaling:launchconfiguration:
    IamInstanceProfile: aws-elasticbeanstalk-ec2-role
    InstanceType: t2.micro
```

### Step 5: Create Dockerrun.aws.json (if using Docker)

If you want to use your existing Dockerfile:

```json
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "flowtracker-backend",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": 5000,
      "HostPort": 5000
    }
  ],
  "Volumes": [
    {
      "HostDirectory": "/var/app/uploads",
      "ContainerDirectory": "/app/uploads"
    }
  ]
}
```

**OR** use Node.js platform directly (simpler):

Create `Procfile`:
```
web: npm start
```

---

## Part 3: Create RDS PostgreSQL Database

### Step 6: Create RDS Database via Console

1. **Go to RDS Console** in AWS
2. **Click "Create database"**
3. **Configure:**
   ```
   Engine: PostgreSQL
   Version: PostgreSQL 15.x
   Template: Free tier
   DB instance identifier: flowtracker-db
   Master username: flowtracker
   Master password: [secure password]
   DB instance class: db.t3.micro
   Storage: 20 GB gp2
   Public access: No (will be in same VPC as EB)
   ```
4. **Create database**
5. **Save the endpoint URL** (looks like: `flowtracker-db.xxxxxxxxx.us-east-1.rds.amazonaws.com`)

### Step 7: Initialize Database Schema

Once RDS is created, connect and run schema:

```powershell
# Install PostgreSQL client (if not already installed)
# Windows: Download from https://www.postgresql.org/download/windows/

# Connect to RDS
psql -h flowtracker-db.xxxxxxxxx.us-east-1.rds.amazonaws.com -U flowtracker -d postgres

# Run your schema
\i database/schema.sql
```

---

## Part 4: Deploy Backend to Elastic Beanstalk

### Step 8: Initialize EB Application

From your `backend` directory:

```powershell
eb init
```

Follow the prompts:
```
1. Select a default region: [Choose your region, e.g., 1 for us-east-1]
2. Application name: flowtracker
3. Platform: Docker (or Node.js if not using Docker)
4. Platform version: Latest
5. SSH keypair: [Create new or use existing]
```

### Step 9: Create Environment

```powershell
eb create flowtracker-backend-env
```

This will:
- Create a new environment
- Provision EC2 instance (t2.micro)
- Set up load balancer
- Deploy your application
- Takes 5-10 minutes

### Step 10: Set Environment Variables

```powershell
# Set database connection
eb setenv DATABASE_URL=postgresql://flowtracker:YOUR_PASSWORD@flowtracker-db.xxxxxxxxx.us-east-1.rds.amazonaws.com:5432/flowtracker

# Set JWT secret (generate with: openssl rand -base64 32)
eb setenv JWT_SECRET=your_random_jwt_secret_here

# Set CORS and frontend URL (will update after frontend is deployed)
eb setenv CORS_ORIGIN=http://your-frontend-url.elasticbeanstalk.com
eb setenv FRONTEND_URL=http://your-frontend-url.elasticbeanstalk.com

# Email configuration (optional for testing)
eb setenv SMTP_HOST=smtp.gmail.com SMTP_PORT=587 SMTP_USER=your-email@gmail.com SMTP_PASS=your-app-password FROM_EMAIL=noreply@flowtracker.com
```

### Step 11: Deploy Backend

```powershell
eb deploy
```

Get your backend URL:
```powershell
eb status
```

Look for "CNAME" - that's your backend URL (e.g., `flowtracker-backend-env.us-east-1.elasticbeanstalk.com`)

Test it:
```powershell
curl http://flowtracker-backend-env.us-east-1.elasticbeanstalk.com/api/health
```

---

## Part 5: Deploy Frontend to Elastic Beanstalk

### Step 12: Prepare Frontend

Navigate to your project root:
```powershell
cd ..  # Back to project root
```

Create frontend build configuration:

**Option A: Static Site (Simpler)**

Create `.ebextensions/01_static.config`:
```yaml
option_settings:
  aws:elasticbeanstalk:environment:proxy:staticfiles:
    /: build
```

Create `Buildfile`:
```
build: npm install && npm run build
```

**Option B: Nginx with Docker**

Create `Dockerfile.frontend` (if you don't have one):
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `Dockerrun.aws.json` in project root:
```json
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "flowtracker-frontend",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": 80,
      "HostPort": 80
    }
  ]
}
```

### Step 13: Update Frontend API URL

Edit your `.env` or create `.env.production`:
```
VITE_API_URL=http://flowtracker-backend-env.us-east-1.elasticbeanstalk.com/api
```

### Step 14: Initialize and Deploy Frontend

```powershell
# Initialize EB for frontend
eb init

# Follow prompts (same as before but for frontend)
# Application name: flowtracker (same app, different environment)
# Platform: Docker (or Node.js)

# Create frontend environment
eb create flowtracker-frontend-env

# Deploy
eb deploy
```

### Step 15: Update Backend CORS

Get your frontend URL:
```powershell
eb status
```

Update backend CORS settings:
```powershell
cd backend
eb setenv CORS_ORIGIN=http://your-frontend-url.elasticbeanstalk.com FRONTEND_URL=http://your-frontend-url.elasticbeanstalk.com
eb deploy
```

---

## Part 6: Testing Your Deployment

### Step 16: Access Your Application

**Frontend URL:**
```
http://flowtracker-frontend-env.[region].elasticbeanstalk.com
```

**Backend API URL:**
```
http://flowtracker-backend-env.[region].elasticbeanstalk.com/api
```

### Step 17: Monitor Your Application

**View logs:**
```powershell
eb logs
```

**Open EB Console:**
```powershell
eb console
```

From the console you can:
- View health status
- Monitor requests
- Check application logs
- Configure scaling
- Set up alarms

---

## Part 7: Database Connectivity

### Step 18: Configure Security Groups

Your RDS database needs to allow connections from EB environments:

1. **Go to RDS Console** → Your database → Connectivity & security
2. **Click on the Security Group**
3. **Edit inbound rules**
4. **Add rule:**
   ```
   Type: PostgreSQL
   Protocol: TCP
   Port: 5432
   Source: [EB security group ID]
   ```

Get EB security group ID:
```powershell
eb config
```

Look for `SecurityGroups` in the output.

---

## Monitoring and Maintenance

### Useful EB CLI Commands

```powershell
# View environment status
eb status

# Open application in browser
eb open

# View logs
eb logs

# SSH into instance
eb ssh

# Update environment variables
eb setenv KEY=value

# Deploy new version
eb deploy

# Terminate environment (when done testing)
eb terminate

# List all environments
eb list
```

### CloudWatch Monitoring

Elastic Beanstalk automatically sends metrics to CloudWatch:
- CPU utilization
- Network traffic
- Request count
- HTTP status codes
- Application errors

Access via AWS Console → CloudWatch → Dashboards

### Setting Up Alarms

```powershell
# Create alarm for high CPU usage
aws cloudwatch put-metric-alarm \
  --alarm-name "EB-High-CPU" \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ElasticBeanstalk \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

---

## Cost Optimization

### Free Tier Usage

- **EC2**: 750 hours/month t2.micro (covers 24/7 for one instance)
- **RDS**: 750 hours/month db.t3.micro
- **Load Balancer**: Not included in free tier (~$16-20/month)

**To save costs during testing:**

1. **Single instance**: No load balancer needed
   ```powershell
   eb config
   # Set environment type to "SingleInstance"
   ```

2. **Stop when not testing:**
   ```powershell
   eb scale 0  # Stop instances
   eb scale 1  # Start again
   ```

3. **Use RDS snapshot instead of running 24/7:**
   - Take snapshot when done testing
   - Delete RDS instance
   - Restore from snapshot when needed

---

## Troubleshooting

### Deployment Fails

```powershell
# View detailed logs
eb logs

# Check recent events
eb health
```

### Database Connection Errors

1. Verify security group rules allow EB → RDS
2. Check DATABASE_URL is correct
3. Test connection from EB instance:
   ```powershell
   eb ssh
   telnet your-rds-endpoint 5432
   ```

### Application Not Accessible

1. Check health status: `eb health`
2. Verify security group allows inbound HTTP (port 80)
3. Check application logs: `eb logs`

### Out of Memory

t2.micro has limited memory (1GB). If your app needs more:
```powershell
# Upgrade instance type (will cost more)
eb scale --instance-type t3.small
```

---

## Security Best Practices

### Step 19: Secure Your Deployment

1. **HTTPS Setup:**
   ```powershell
   # Request free SSL certificate from AWS Certificate Manager
   # Then attach to load balancer in EB console
   eb config
   # Update listener to HTTPS
   ```

2. **Environment Variables:**
   - Never commit secrets to git
   - Use EB environment variables for sensitive data
   - Store in AWS Secrets Manager for production

3. **Database Security:**
   - Keep RDS in private subnet (no public access)
   - Use strong passwords
   - Enable encryption at rest

4. **IAM Roles:**
   - Use principle of least privilege
   - EB automatically creates roles, but review them

---

## Cleanup (When Done Testing)

### Step 20: Terminate Resources

**To avoid charges after testing:**

```powershell
# Terminate EB environments
cd backend
eb terminate flowtracker-backend-env

cd ..
eb terminate flowtracker-frontend-env

# Delete RDS database
aws rds delete-db-instance \
  --db-instance-identifier flowtracker-db \
  --skip-final-snapshot
```

**Or snapshot RDS for later:**
```powershell
# Create snapshot
aws rds create-db-snapshot \
  --db-instance-identifier flowtracker-db \
  --db-snapshot-identifier flowtracker-backup

# Then delete instance
aws rds delete-db-instance \
  --db-instance-identifier flowtracker-db \
  --skip-final-snapshot
```

---

## Next Steps for Production

Once you're happy with testing on EB:

1. **Custom Domain:**
   - Register domain in Route 53
   - Configure DNS to point to EB environment
   - Set up SSL certificate

2. **High Availability:**
   - Switch to load-balanced environment
   - Enable auto-scaling
   - Multi-AZ RDS deployment

3. **CI/CD Integration:**
   - Connect your GitHub repository
   - Auto-deploy on push to main branch
   - Your existing GitHub Actions can deploy to EB

4. **Monitoring:**
   - Set up CloudWatch dashboards
   - Configure SNS for alerts
   - Integrate with your existing monitoring

5. **Backup Strategy:**
   - Enable RDS automated backups
   - Configure snapshot schedule
   - Test restore procedures

---

## Comparison: EB vs EC2 Direct

| Feature | Elastic Beanstalk | EC2 with Docker Compose |
|---------|-------------------|-------------------------|
| Setup Time | 20-30 min | 30-45 min |
| Difficulty | Easier | Moderate |
| Auto-scaling | Built-in | Manual setup |
| Monitoring | Built-in dashboards | Manual setup |
| Load Balancing | Automatic | Manual setup |
| Updates | `eb deploy` | SSH + docker-compose |
| Free Tier | Yes (EC2 + RDS) | Yes (EC2 only) |
| Cost (beyond free tier) | ~$30-50/month | ~$8-20/month |
| Best For | Production-ready testing | Learning, simple testing |

---

## Additional Resources

- **EB CLI Documentation**: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html
- **EB Platform Guide**: https://docs.aws.amazon.com/elasticbeanstalk/latest/platforms/
- **RDS PostgreSQL**: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/
- **AWS Free Tier**: https://aws.amazon.com/free/

---

**Last Updated**: October 2025  
**Version**: 1.0  
**Recommended for**: Testing, demos, small-scale production

