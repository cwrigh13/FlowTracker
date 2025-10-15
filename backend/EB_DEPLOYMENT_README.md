# Elastic Beanstalk Deployment Guide

## ✅ Setup Complete!

You now have:
- ✅ AWS CLI installed and configured
- ✅ EB CLI installed (v3.25.1)
- ✅ Elastic Beanstalk configuration files created:
  - `.ebextensions/01_environment.config` - Environment settings
  - `Procfile` - Process configuration
  - `.ebignore` - Files to exclude from deployment

## 🚀 Next Steps

### Step 1: Create RDS PostgreSQL Database

Before deploying the backend, you need a database:

1. **Go to AWS RDS Console**: https://console.aws.amazon.com/rds/
2. **Click "Create database"**
3. **Configuration:**
   - **Engine**: PostgreSQL
   - **Version**: PostgreSQL 15.x or 16.x
   - **Template**: **Free tier** ⭐
   - **DB instance identifier**: `flowtracker-db`
   - **Master username**: `flowtracker`
   - **Master password**: Choose a secure password (save it!)
   - **DB instance class**: `db.t3.micro` (Free Tier eligible)
   - **Storage**: 20 GB gp2 (Free Tier: up to 20 GB)
   - **Public access**: **No** (will be in same VPC as EB)
   - **VPC security group**: Create new or use default
4. **Click "Create database"** (takes 5-10 minutes)
5. **Save the endpoint URL** when ready (looks like: `flowtracker-db.xxxxxxxxx.us-east-1.rds.amazonaws.com`)

### Step 2: Initialize Elastic Beanstalk Application

From the `backend` directory, run:

```powershell
eb init
```

**Follow the prompts:**
1. **Select a default region**: Choose your region (e.g., `1` for us-east-1)
2. **Application name**: `flowtracker` (or your preferred name)
3. **Platform**: Select **Node.js**
4. **Platform branch**: Latest stable version (e.g., "Node.js 20 running on 64bit Amazon Linux 2023")
5. **CodeCommit**: `n` (no)
6. **SSH**: `y` (yes, recommended for debugging)
7. **Keypair**: Select existing or create new

### Step 3: Create Elastic Beanstalk Environment

```powershell
eb create flowtracker-backend-env
```

This will:
- Create a new environment
- Provision EC2 instance (t2.micro - Free Tier eligible)
- Set up load balancer
- Deploy your application
- **Takes 5-10 minutes**

### Step 4: Configure Environment Variables

After the environment is created, set your environment variables:

```powershell
# Generate a JWT secret
$jwtSecret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
Write-Host "JWT Secret: $jwtSecret"

# Set environment variables (replace values with your actual values)
eb setenv `
  NODE_ENV=production `
  PORT=8080 `
  DATABASE_URL="postgresql://flowtracker:YOUR_PASSWORD@flowtracker-db.xxxxxxxxx.us-east-1.rds.amazonaws.com:5432/flowtracker" `
  JWT_SECRET="$jwtSecret" `
  CORS_ORIGIN="*" `
  FRONTEND_URL="http://your-frontend-url.com"
```

**Important:** Replace these values:
- `YOUR_PASSWORD` - Your RDS master password
- `flowtracker-db.xxxxxxxxx.us-east-1.rds.amazonaws.com` - Your actual RDS endpoint
- `FRONTEND_URL` - Will update after frontend deployment

Optional email settings (for contact form):
```powershell
eb setenv `
  SMTP_HOST=smtp.gmail.com `
  SMTP_PORT=587 `
  SMTP_USER=your-email@gmail.com `
  SMTP_PASS=your-app-password `
  FROM_EMAIL=noreply@flowtracker.com
```

### Step 5: Initialize Database Schema

Once RDS is ready, you need to run the database schema:

**Option A: Using psql from your local machine**

First, modify the RDS security group to allow your IP:
1. Go to RDS Console
2. Click your database instance
3. Click the VPC security group
4. Add inbound rule: PostgreSQL (5432) from **My IP**

Then connect and run schema:
```powershell
# Install PostgreSQL client if needed (https://www.postgresql.org/download/windows/)
psql -h flowtracker-db.xxxxxxxxx.us-east-1.rds.amazonaws.com -U flowtracker -d postgres -f database/schema.sql
```

**Option B: Using EB SSH**

After deployment, SSH into your instance:
```powershell
eb ssh
```

Then run:
```bash
cd /var/app/current
PGPASSWORD=YOUR_PASSWORD psql -h flowtracker-db.xxxxxxxxx.us-east-1.rds.amazonaws.com -U flowtracker -d postgres -f database/schema.sql
```

### Step 6: Deploy Your Application

```powershell
eb deploy
```

### Step 7: Check Status and Get URL

```powershell
# Check environment status
eb status

# Get logs if there are issues
eb logs

# Open application in browser
eb open
```

Your backend URL will look like:
`http://flowtracker-backend-env.us-east-1.elasticbeanstalk.com`

### Step 8: Test the Backend

Test the health endpoint:
```powershell
curl http://flowtracker-backend-env.us-east-1.elasticbeanstalk.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-11T...",
  "uptime": 123.456
}
```

## 📊 Monitoring

View your application in the AWS Console:
```powershell
eb console
```

This opens the Elastic Beanstalk dashboard where you can:
- Monitor health status
- View logs
- Check metrics
- Configure scaling
- Manage environment variables

## 🔄 Updating Your Application

When you make changes to your code:

```powershell
# Make your changes
npm run build  # Build TypeScript if needed

# Deploy updates
eb deploy
```

## 💰 Cost Monitoring

**Free Tier includes:**
- 750 hours/month of t2.micro EC2 instances
- 750 hours/month of db.t3.micro RDS
- 20 GB of database storage
- 5 GB of data transfer out

**After Free Tier:**
- t2.micro EC2: ~$8-10/month
- db.t3.micro RDS: ~$12-15/month

Monitor your costs: https://console.aws.amazon.com/billing/

## 🛠️ Useful Commands

```powershell
# View environment status
eb status

# View recent logs
eb logs

# Open app in browser
eb open

# SSH into instance
eb ssh

# View environment info
eb printenv

# Set environment variable
eb setenv KEY=VALUE

# Terminate environment (when done testing)
eb terminate flowtracker-backend-env

# List environments
eb list

# Health check
eb health
```

## 🚨 Troubleshooting

### Application won't start
```powershell
# Check logs
eb logs

# Common issues:
# 1. Missing environment variables
# 2. Database connection failed
# 3. Port mismatch (should use PORT env variable)
```

### Database connection failed
1. Check RDS security group allows connections from EB
2. Verify DATABASE_URL is correct
3. Ensure RDS is in same VPC as EB environment

### "502 Bad Gateway"
- Application failed to start on port 8080
- Check logs: `eb logs`
- Verify Procfile exists and is correct

## 🔒 Security Recommendations

1. **Don't commit sensitive data**: Never commit `.env` files with secrets
2. **Use environment variables**: Always set secrets via `eb setenv`
3. **Restrict RDS access**: Keep RDS in private subnet, only accessible from EB
4. **Enable HTTPS**: Add a custom domain and SSL certificate (via AWS Certificate Manager)
5. **Regular updates**: Keep dependencies updated

## 📝 Configuration Files Created

### `.ebextensions/01_environment.config`
- Sets Node.js environment to production
- Configures port to 8080 (EB standard)
- Sets instance type to t2.micro (Free Tier)
- Enables nginx proxy

### `Procfile`
- Tells EB how to start your application
- Command: `npm start` → runs `node dist/server.js`

### `.ebignore`
- Excludes unnecessary files from deployment
- Keeps deployment package small
- Similar to `.gitignore` but for EB

## 🎯 What's Next?

After backend deployment:
1. Deploy frontend (separate EB environment or S3 + CloudFront)
2. Update CORS_ORIGIN with frontend URL
3. Set up custom domain (optional)
4. Enable HTTPS with SSL certificate
5. Set up monitoring and alerts

## 📚 Additional Resources

- [AWS Elastic Beanstalk Documentation](https://docs.aws.amazon.com/elasticbeanstalk/)
- [EB CLI Reference](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html)
- [AWS Free Tier](https://aws.amazon.com/free/)
- [RDS PostgreSQL Documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)

---

## 🎉 Ready to Deploy!

You're all set! Start with Step 1 (Create RDS Database) and work through each step.

**Estimated Total Time**: 30-45 minutes for first deployment

**Questions?** Check the troubleshooting section or AWS documentation.

Good luck with your deployment! 🚀

