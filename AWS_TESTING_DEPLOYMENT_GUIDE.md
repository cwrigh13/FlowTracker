# AWS Free Tier Testing Deployment Guide for FlowTracker

## Overview
This guide walks you through deploying FlowTracker to AWS Free Tier for testing purposes using a single EC2 instance with Docker Compose.

**Estimated Time**: 30-45 minutes  
**Cost**: $0 (within Free Tier limits)  
**Prerequisites**: AWS Free Tier account, basic terminal knowledge

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         AWS Free Tier                    │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   EC2 t2.micro Instance            │ │
│  │   (Ubuntu 22.04)                   │ │
│  │                                    │ │
│  │  ┌──────────────────────────────┐ │ │
│  │  │  Docker Compose              │ │ │
│  │  │                              │ │ │
│  │  │  ┌─────────┐  ┌──────────┐  │ │ │
│  │  │  │Frontend │  │ Backend  │  │ │ │
│  │  │  │(React)  │  │(Node.js) │  │ │ │
│  │  │  │Port:3000│  │Port:5000 │  │ │ │
│  │  │  └─────────┘  └──────────┘  │ │ │
│  │  │                              │ │ │
│  │  │  ┌─────────────────────────┐ │ │ │
│  │  │  │   PostgreSQL 15         │ │ │ │
│  │  │  │   Port:5432             │ │ │ │
│  │  │  └─────────────────────────┘ │ │ │
│  │  └──────────────────────────────┘ │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Security Group:                         │
│    - Port 80 (HTTP)                      │
│    - Port 443 (HTTPS)                    │
│    - Port 22 (SSH)                       │
│    - Port 3000 (Frontend - Optional)     │
│    - Port 5000 (Backend API)             │
└─────────────────────────────────────────┘
```

---

## Part 1: AWS Setup

### Step 1: Launch EC2 Instance

1. **Log into AWS Console**
   - Navigate to EC2 Dashboard
   - Click "Launch Instance"

2. **Configure Instance**
   ```
   Name: flowtracker-testing
   AMI: Ubuntu Server 22.04 LTS (Free tier eligible)
   Instance type: t2.micro (1 vCPU, 1 GB RAM)
   Key pair: Create new or use existing (.pem file)
   ```

3. **Configure Storage**
   ```
   Size: 20 GB gp3 (or gp2) - Free tier includes 30 GB
   ```

4. **Network Settings (Security Group)**
   Create security group with these rules:
   
   | Type        | Protocol | Port Range | Source    | Description                |
   |-------------|----------|------------|-----------|----------------------------|
   | SSH         | TCP      | 22         | My IP     | SSH access                 |
   | HTTP        | TCP      | 80         | 0.0.0.0/0 | HTTP access                |
   | HTTPS       | TCP      | 443        | 0.0.0.0/0 | HTTPS access               |
   | Custom TCP  | TCP      | 3000       | 0.0.0.0/0 | Frontend (React)           |
   | Custom TCP  | TCP      | 5000       | 0.0.0.0/0 | Backend API                |

   **Security Note**: For production, restrict 3000 and 5000 to specific IPs or use a reverse proxy (nginx) on port 80/443.

5. **Launch Instance**
   - Review and launch
   - Download and save your `.pem` key file securely

### Step 2: Connect to Your Instance

**Windows (using PowerShell or Windows Terminal):**
```powershell
# Set permissions on the key file (if needed)
icacls "path\to\your-key.pem" /inheritance:r
icacls "path\to\your-key.pem" /grant:r "$($env:USERNAME):R"

# Connect via SSH
ssh -i "path\to\your-key.pem" ubuntu@your-ec2-public-ip
```

**Mac/Linux:**
```bash
chmod 400 /path/to/your-key.pem
ssh -i /path/to/your-key.pem ubuntu@your-ec2-public-ip
```

Replace `your-ec2-public-ip` with the Public IPv4 address from your EC2 console.

---

## Part 2: Server Setup

### Step 3: Install Docker and Docker Compose

Run these commands on your EC2 instance:

```bash
# Update package list
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add ubuntu user to docker group (so you don't need sudo)
sudo usermod -aG docker ubuntu

# Log out and back in for group changes to take effect
exit
```

**Reconnect to your instance** after logging out.

Verify installation:
```bash
docker --version
docker-compose --version
```

### Step 4: Install Git and Clone Your Repository

```bash
# Install Git
sudo apt install -y git

# Create application directory
mkdir -p ~/apps
cd ~/apps

# Clone your repository (replace with your actual repo)
git clone https://github.com/your-username/your-repo.git flowtracker
cd flowtracker

# Or if you don't have a git repo yet, upload files manually (see Option B below)
```

**Option B: Manual File Upload (if no git repo)**

On your **local machine**:
```powershell
# From your project directory
scp -i "path\to\your-key.pem" -r * ubuntu@your-ec2-public-ip:~/apps/flowtracker/
```

---

## Part 3: Application Configuration

### Step 5: Create Environment Configuration

On the EC2 instance, create a production Docker Compose file:

```bash
cd ~/apps/flowtracker

# Create production environment file
nano docker-compose.prod.yml
```

**Paste this configuration** (optimized for single-server testing):

```yaml
# Docker Compose for FlowTracker - AWS Testing Environment
version: '3.8'

services:
  # PostgreSQL Database
  database:
    image: postgres:15-alpine
    container_name: flowtracker-db
    environment:
      POSTGRES_USER: flowtracker
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme_secure_password_123}
      POSTGRES_DB: flowtracker
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro
    ports:
      - "127.0.0.1:5432:5432"  # Only accessible from localhost
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U flowtracker"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - flowtracker-network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: flowtracker-backend
    environment:
      NODE_ENV: production
      PORT: 5000
      DATABASE_URL: postgresql://flowtracker:${DB_PASSWORD:-changeme_secure_password_123}@database:5432/flowtracker
      JWT_SECRET: ${JWT_SECRET:-change_this_to_random_string_min_32_chars}
      JWT_EXPIRES_IN: 7d
      CORS_ORIGIN: http://${PUBLIC_IP:-localhost}:3000
      FRONTEND_URL: http://${PUBLIC_IP:-localhost}:3000
      SMTP_HOST: ${SMTP_HOST:-smtp.gmail.com}
      SMTP_PORT: ${SMTP_PORT:-587}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
      FROM_EMAIL: ${FROM_EMAIL:-noreply@flowtracker.com}
      UPLOAD_DIR: /app/uploads
      MAX_FILE_SIZE: 10485760
      RATE_LIMIT_WINDOW_MS: 900000
      RATE_LIMIT_MAX_REQUESTS: 100
    volumes:
      - ./backend/uploads:/app/uploads
    ports:
      - "5000:5000"
    depends_on:
      database:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
    networks:
      - flowtracker-network

  # Frontend
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_API_URL: http://${PUBLIC_IP:-localhost}:5000/api
    container_name: flowtracker-frontend
    environment:
      NODE_ENV: production
    ports:
      - "3000:80"  # Frontend serves on port 80 internally, exposed as 3000
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - flowtracker-network

volumes:
  postgres_data:
    driver: local

networks:
  flowtracker-network:
    driver: bridge
```

Save and exit (Ctrl+O, Enter, Ctrl+X in nano).

### Step 6: Create Environment Variables File

```bash
# Create .env file for sensitive data
nano .env
```

Add these variables (customize with your values):

```env
# Database
DB_PASSWORD=your_secure_database_password_here

# JWT Secret (generate a random string)
JWT_SECRET=your_very_long_random_jwt_secret_at_least_32_characters_long

# Public IP (your EC2 instance public IP)
PUBLIC_IP=your-ec2-public-ip-address

# Email Configuration (optional for testing, required for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
FROM_EMAIL=noreply@flowtracker.com
```

**To generate a secure JWT secret:**
```bash
openssl rand -base64 32
```

Save and exit.

### Step 7: Update Frontend Dockerfile for Production

Your current Dockerfile might be for development. Create a production-optimized version:

```bash
nano Dockerfile.prod
```

Paste this:

```dockerfile
# Multi-stage build for React frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source files
COPY . .

# Build for production
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Create nginx configuration:

```bash
nano nginx.conf
```

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Part 4: Deployment

### Step 8: Build and Start the Application

```bash
cd ~/apps/flowtracker

# Make sure your .env file is properly configured
# Verify environment variables
cat .env

# Build the Docker images (this may take 5-10 minutes)
docker-compose -f docker-compose.prod.yml build

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 9: Verify Deployment

1. **Check containers are running:**
   ```bash
   docker ps
   ```
   You should see 3 containers: frontend, backend, and database.

2. **Test backend health:**
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Test from your local machine:**
   Open your browser and navigate to:
   - Frontend: `http://your-ec2-public-ip:3000`
   - Backend API: `http://your-ec2-public-ip:5000/api/health`

---

## Part 5: Domain Setup (Optional)

### Step 10: Add a Custom Domain

If you want a proper domain name instead of an IP address:

1. **Purchase a domain** (e.g., from Route 53, Namecheap, etc.)

2. **Create Route 53 hosted zone** (if using Route 53):
   - Go to Route 53 in AWS Console
   - Create hosted zone for your domain
   - Create an A record pointing to your EC2 instance IP

3. **Update your environment variables** with the new domain:
   ```bash
   nano .env
   # Change PUBLIC_IP to your domain name
   PUBLIC_IP=your-domain.com
   ```

4. **Restart containers:**
   ```bash
   docker-compose -f docker-compose.prod.yml restart
   ```

### Step 11: Add SSL/HTTPS with Let's Encrypt (Optional but Recommended)

For HTTPS access:

```bash
# Install Certbot
sudo apt install -y certbot

# Stop frontend container temporarily
docker-compose -f docker-compose.prod.yml stop frontend

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Update nginx configuration to use SSL
# (You'll need to modify nginx.conf and docker-compose to map certificates)
```

---

## Monitoring and Maintenance

### Useful Commands

**View logs:**
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

**Restart services:**
```bash
# All services
docker-compose -f docker-compose.prod.yml restart

# Specific service
docker-compose -f docker-compose.prod.yml restart backend
```

**Update application:**
```bash
cd ~/apps/flowtracker
git pull  # or upload new files
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

**Database backup:**
```bash
docker exec flowtracker-db pg_dump -U flowtracker flowtracker > backup_$(date +%Y%m%d).sql
```

**View resource usage:**
```bash
docker stats
```

---

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs <service-name>

# Check if port is already in use
sudo netstat -tulpn | grep <port-number>
```

### Out of memory errors
The t2.micro has only 1GB RAM. If containers crash:
```bash
# Add swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Database connection errors
```bash
# Check if database is healthy
docker-compose -f docker-compose.prod.yml ps
docker exec flowtracker-db pg_isready -U flowtracker

# Verify connection string
docker-compose -f docker-compose.prod.yml exec backend env | grep DATABASE_URL
```

### Can't access from browser
- Verify security group rules in AWS Console
- Check if services are listening: `sudo netstat -tulpn | grep -E '3000|5000'`
- Verify firewall: `sudo ufw status` (should be inactive or allow ports)

---

## Cost Monitoring

### Staying Within Free Tier

**Monitor your usage** in AWS Console:
1. Go to AWS Billing Dashboard
2. Check "Free Tier Usage"
3. Set up billing alerts:
   - CloudWatch → Billing → Create Alarm
   - Set threshold at $1-5 to get early warning

**Free Tier Limits:**
- EC2: 750 hours/month (one t2.micro running 24/7 = 720 hours)
- Data Transfer: 15 GB outbound per month
- Storage: 30 GB EBS

**Exceeding Free Tier** (approximate costs if you go over):
- t2.micro: ~$0.0116/hour (~$8.50/month)
- Data transfer: $0.09/GB after 15GB
- EBS: $0.10/GB-month after 30GB

---

## Next Steps

Once testing is complete, you can:

1. **Scale up**: Move to larger instance types (t3.small, t3.medium)
2. **High Availability**: 
   - Separate RDS database (db.t3.micro free tier eligible)
   - Application Load Balancer
   - Multi-AZ deployment
3. **CI/CD**: Use your existing GitHub Actions to auto-deploy to AWS
4. **Monitoring**: Set up CloudWatch dashboards and alarms
5. **Elastic Beanstalk**: Migrate to EB for easier management

---

## Security Checklist

Before sharing this with others:

- [ ] Change all default passwords
- [ ] Use strong JWT secret (32+ characters)
- [ ] Restrict security group rules (don't use 0.0.0.0/0 for SSH)
- [ ] Enable AWS CloudTrail for audit logs
- [ ] Set up automatic backups for database
- [ ] Configure HTTPS with SSL certificate
- [ ] Enable AWS GuardDuty for threat detection (free 30-day trial)
- [ ] Review IAM permissions
- [ ] Set up MFA on AWS root account

---

## Support Resources

- **AWS Free Tier FAQ**: https://aws.amazon.com/free/
- **EC2 Documentation**: https://docs.aws.amazon.com/ec2/
- **Docker Documentation**: https://docs.docker.com/
- **FlowTracker Docs**: See `README.md` and `PRODUCTION_READINESS_CHECKLIST.md`

---

**Last Updated**: October 2025  
**Version**: 1.0  
**Tested On**: AWS Free Tier, Ubuntu 22.04, Docker 24.x, Docker Compose 2.x

