# AWS Free Tier Quick Start Guide - FlowTracker

## 🚀 Get Your App Running on AWS in 30 Minutes

This is your **fastest path** from zero to deployed on AWS Free Tier.

---

## Prerequisites Checklist

Before you start, make sure you have:

- [ ] AWS Free Tier account created and verified
- [ ] Credit card added to AWS account (required but won't be charged in Free Tier)
- [ ] Basic understanding of command line
- [ ] Your FlowTracker code ready (this repository)

---

## Choose Your Path

### Path A: Easiest (Recommended) ⭐
**Elastic Beanstalk - Deploy in 20-30 minutes**
- One-command deployment
- Professional URL automatically
- Auto-scaling ready
- Perfect for demos and testing

👉 **[Follow Elastic Beanstalk Guide](./AWS_ELASTIC_BEANSTALK_GUIDE.md)**

### Path B: Most Learning
**Single EC2 Instance - Deploy in 30-45 minutes**
- Full control over everything
- Learn core AWS concepts
- Docker Compose on single server
- Great for understanding infrastructure

👉 **[Follow EC2 Deployment Guide](./AWS_TESTING_DEPLOYMENT_GUIDE.md)**

### Need help deciding?
**[View Detailed Comparison](./AWS_DEPLOYMENT_COMPARISON.md)**

---

## Absolute Fastest Start (Elastic Beanstalk)

If you just want to **deploy NOW**, here's the minimal steps:

### Step 1: Install Tools (5 minutes)

**Windows (PowerShell as Administrator):**
```powershell
# Install AWS CLI
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Install EB CLI
pip install awsebcli --upgrade
```

**Mac:**
```bash
brew install awscli awsebcli
```

**Linux:**
```bash
# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# EB CLI
pip install awsebcli --upgrade
```

### Step 2: Configure AWS (2 minutes)

```bash
aws configure
```

Enter your:
- **Access Key ID**: From AWS Console → IAM → Users → Security credentials
- **Secret Access Key**: Shown when creating access key
- **Region**: `us-east-1` (or nearest to you)
- **Output format**: `json`

### Step 3: Deploy Backend (10 minutes)

```bash
# Navigate to backend
cd backend

# Initialize EB
eb init --platform docker --region us-east-1

# Create environment
eb create flowtracker-api --single

# Set environment variables
eb setenv \
  NODE_ENV=production \
  JWT_SECRET=$(openssl rand -base64 32) \
  DATABASE_URL=sqlite:///app/data/flowtracker.db \
  CORS_ORIGIN=http://localhost:3000

# Deploy
eb deploy

# Get your API URL
eb status
```

Save the CNAME URL (e.g., `flowtracker-api.us-east-1.elasticbeanstalk.com`)

### Step 4: Deploy Frontend (10 minutes)

```bash
# Go back to project root
cd ..

# Create .env.production with your API URL
echo "VITE_API_URL=http://YOUR-API-URL/api" > .env.production

# Initialize EB
eb init --platform docker --region us-east-1

# Create environment
eb create flowtracker-web --single

# Deploy
eb deploy

# Open in browser
eb open
```

**Done!** 🎉 Your app is now live on AWS!

---

## Free Tier Limits - What You Need to Know

### What's Included FREE for 12 Months:

✅ **750 hours/month** of EC2 t2.micro instances
   - = One instance running 24/7 all month
   - **Your usage**: 2 instances (backend + frontend) = uses all 750 hours
   
✅ **750 hours/month** of RDS db.t3.micro database
   - PostgreSQL or MySQL
   - 20GB storage included
   
✅ **30 GB** of EBS storage

✅ **15 GB** data transfer out per month
   - Plenty for testing (≈ 150,000 page loads)

✅ **5 GB** S3 storage

### What Costs Extra (Even in Free Tier):

❌ **Application Load Balancer**: ~$16/month
   - **Solution**: Use single-instance mode (no load balancer)
   
❌ **Elastic IP** (if not attached): $0.005/hour = ~$3.60/month
   - **Solution**: Use EB's auto-assigned domain
   
❌ **Data transfer over 15GB**: $0.09/GB
   - **Solution**: Keep testing traffic low

### How to Stay at $0/month:

1. **Use Single-Instance Mode** for Elastic Beanstalk
   ```bash
   eb create --single
   ```

2. **Stop instances when not testing**
   ```bash
   eb scale 0  # Stop
   eb scale 1  # Start again
   ```

3. **Use SQLite instead of RDS** for testing
   - Saves 750 hours of RDS
   - Perfect for single-server setup

4. **Monitor usage weekly**
   - AWS Console → Billing → Free Tier Usage

---

## Your First Hour Plan

### Minute 0-10: Setup AWS Account
1. Create AWS account at https://aws.amazon.com/free/
2. Verify email and add payment method
3. Create IAM user with AdministratorAccess
4. Download access keys

### Minute 10-15: Install Tools
1. Install AWS CLI
2. Install EB CLI
3. Run `aws configure`

### Minute 15-30: Deploy Backend
1. `cd backend`
2. `eb init`
3. `eb create flowtracker-api --single`
4. Set environment variables
5. Test: `curl http://your-url/api/health`

### Minute 30-45: Deploy Frontend
1. `cd ..`
2. Update `.env.production`
3. `eb init`
4. `eb create flowtracker-web --single`
5. Open in browser

### Minute 45-60: Test & Configure
1. Create test user account
2. Add sample data
3. Test all features
4. Set up monitoring alerts

---

## Troubleshooting Common Issues

### "eb: command not found"

**Windows:**
```powershell
# Add to PATH
$env:Path += ";C:\Users\YOUR_USERNAME\AppData\Roaming\Python\Scripts"
```

**Mac/Linux:**
```bash
# Add to ~/.bash_profile or ~/.zshrc
export PATH="$HOME/.local/bin:$PATH"
source ~/.bash_profile
```

### "No module named 'awsebcli'"

```bash
# Reinstall with user flag
pip install --user awsebcli
```

### "Insufficient permissions"

Your IAM user needs these policies:
- `AWSElasticBeanstalkFullAccess`
- `IAMFullAccess` (or `IAMReadOnlyAccess` minimum)

Add in AWS Console → IAM → Users → Permissions

### "Health check failed"

Check logs:
```bash
eb logs
```

Common causes:
- Port mismatch (make sure app listens on correct port)
- Missing environment variables
- Database connection errors

### "Rate exceeded" or API limit errors

You hit AWS API rate limits. Wait 1 minute and retry.

### Deployment takes too long

First deployment can take 10-15 minutes. Subsequent deploys are faster (3-5 min).

```bash
# Check progress
eb events --follow
```

---

## Post-Deployment Checklist

After successful deployment:

### Immediate (Do Today):
- [ ] Test all major features
- [ ] Check AWS Free Tier usage dashboard
- [ ] Set up billing alarm ($1 threshold)
- [ ] Save your environment URLs
- [ ] Document any custom configuration

### Within First Week:
- [ ] Set up HTTPS (free with AWS Certificate Manager)
- [ ] Configure custom domain (optional)
- [ ] Enable CloudWatch monitoring
- [ ] Create RDS database snapshot (if using RDS)
- [ ] Test backup and restore procedure

### Before Sharing with Users:
- [ ] Enable CloudWatch alarms
- [ ] Set up error tracking (AWS X-Ray or Sentry)
- [ ] Configure auto-scaling policies (if load balanced)
- [ ] Review security group rules
- [ ] Enable AWS CloudTrail for audit logs

---

## Monitoring Your Deployment

### Check Application Status

```bash
# View environment health
eb health

# View recent events
eb events

# View logs
eb logs

# SSH into instance
eb ssh
```

### AWS Console Monitoring

1. **Elastic Beanstalk Dashboard**
   - Application health
   - Request metrics
   - Error rates

2. **CloudWatch Dashboard**
   - CPU utilization
   - Memory usage
   - Network traffic

3. **Billing Dashboard**
   - Free Tier usage tracking
   - Cost estimates
   - Usage alerts

### Set Up Billing Alert

```bash
# Create alarm for $1 spending
aws cloudwatch put-metric-alarm \
  --alarm-name billing-alert \
  --alarm-description "Alert when charges exceed $1" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 1.0 \
  --comparison-operator GreaterThanThreshold
```

Or via AWS Console:
1. CloudWatch → Billing → Create Alarm
2. Set threshold: $1
3. Add email notification

---

## Updating Your Application

### Deploy Code Changes

```bash
# After making changes
git add .
git commit -m "Update feature"

# Deploy to backend
cd backend
eb deploy

# Deploy to frontend
cd ..
eb deploy
```

### Update Environment Variables

```bash
eb setenv KEY=VALUE ANOTHER_KEY=another_value
```

### Scale Resources

```bash
# Change instance type
eb scale --instance-type t3.small

# Change instance count
eb scale 2  # Run 2 instances

# Back to single instance
eb scale 1
```

---

## Cost Optimization Tips

### For Testing (Stay Free):

1. **Single Instance Mode**
   ```bash
   eb create --single
   ```

2. **Stop When Not Using**
   ```bash
   # Stop at night
   eb scale 0
   
   # Start in morning
   eb scale 1
   ```

3. **Use On-Demand Only**
   - Don't set up auto-scaling during testing
   - Prevents surprise instance launches

4. **Monitor Data Transfer**
   - 15GB free per month
   - Track in Billing Dashboard

### Scheduled Scaling (Advanced)

Stop instances automatically at night:

```bash
# Create script: stop-at-night.sh
#!/bin/bash
aws elasticbeanstalk update-environment \
  --environment-name flowtracker-env \
  --option-settings Namespace=aws:autoscaling:asg,OptionName=MinSize,Value=0
```

Use AWS Lambda + CloudWatch Events to run on schedule.

---

## Next Steps After Testing

### Ready for Production?

1. **Enable High Availability**
   ```bash
   # Convert to load-balanced environment
   eb config
   # Change environment type to LoadBalanced
   ```

2. **Set Up Database**
   - Move from SQLite to RDS PostgreSQL
   - Enable Multi-AZ for redundancy

3. **Add HTTPS**
   - Request SSL certificate in AWS Certificate Manager
   - Attach to load balancer

4. **Custom Domain**
   - Register domain (Route 53 or external)
   - Create CNAME pointing to EB environment

5. **CI/CD Integration**
   - Connect GitHub repository
   - Auto-deploy on push to main

6. **Monitoring & Alerts**
   - Set up comprehensive CloudWatch dashboards
   - Configure SNS for alerts
   - Integrate with PagerDuty/Slack

### Learning More AWS:

- **AWS Free Tier Guide**: https://aws.amazon.com/free/
- **Elastic Beanstalk Docs**: https://docs.aws.amazon.com/elasticbeanstalk/
- **AWS Training**: https://aws.amazon.com/training/
- **AWS Well-Architected Framework**: Best practices for cloud apps

---

## Getting Help

### AWS Support:

- **Free Tier Forum**: https://forums.aws.amazon.com/forum.jspa?forumID=30
- **Documentation**: https://docs.aws.amazon.com/
- **Support Plans**: Basic (free), Developer ($29/mo), Business ($100/mo)

### Community Resources:

- **Reddit**: r/aws, r/devops
- **Stack Overflow**: [tag:amazon-web-services]
- **AWS re:Post**: Community Q&A platform

### FlowTracker Specific:

- See `README.md` for application documentation
- See `PRODUCTION_READINESS_CHECKLIST.md` for deployment details
- See other AWS guides in this directory

---

## Success Checklist

You're successfully deployed when:

- [ ] Frontend loads in browser at `http://your-url.elasticbeanstalk.com`
- [ ] Backend API responds at `http://your-api-url/api/health`
- [ ] You can create user account and log in
- [ ] You can create and manage issues
- [ ] All features work as expected
- [ ] AWS Free Tier usage is under limits
- [ ] Billing alerts are configured
- [ ] You've tested on mobile and desktop

---

## Cleanup (When Done Testing)

To avoid any future charges:

```bash
# Terminate frontend environment
eb terminate flowtracker-web

# Terminate backend environment
cd backend
eb terminate flowtracker-api

# Delete application
eb terminate --all

# Verify in AWS Console
# EC2 → No running instances
# RDS → No databases
# Elastic Beanstalk → No applications
```

**Important**: Terminating EB environments deletes all data. Export any data you want to keep first!

---

## Estimated Timeline

| Task | Time | Cumulative |
|------|------|------------|
| Create AWS account | 10 min | 10 min |
| Install tools | 5 min | 15 min |
| Configure AWS CLI | 2 min | 17 min |
| Deploy backend | 10 min | 27 min |
| Deploy frontend | 10 min | 37 min |
| Test application | 10 min | 47 min |
| Configure monitoring | 5 min | 52 min |
| **TOTAL** | **~1 hour** | |

---

**Ready to deploy?**

👉 **Start with**: [AWS Elastic Beanstalk Guide](./AWS_ELASTIC_BEANSTALK_GUIDE.md)

Or for more control: [AWS EC2 Direct Deployment](./AWS_TESTING_DEPLOYMENT_GUIDE.md)

Good luck! 🚀

---

**Last Updated**: October 2025  
**Version**: 1.0  
**Tested**: AWS Free Tier, October 2025

