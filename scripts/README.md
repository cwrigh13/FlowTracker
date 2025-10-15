# Deployment Scripts

This directory contains automation scripts for FlowTracker deployment and operations.

## Scripts

### `deploy.sh`

**Purpose**: Automated deployment to staging or production environments

**Usage**:
```bash
# Deploy to staging (default)
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production

# Deploy specific version
./scripts/deploy.sh production v1.2.3
```

**What it does**:
1. Creates database backup
2. Pulls latest Docker images
3. Stops old containers
4. Starts new containers
5. Waits for health checks
6. Runs database migrations
7. Cleans up old images

**Prerequisites**:
- Docker and Docker Compose installed
- Environment file (`.env.staging` or `.env.production`)
- Appropriate permissions

**Rollback**: If deployment fails, script automatically rolls back

---

### `health-check.sh`

**Purpose**: Verify that all FlowTracker services are running correctly

**Usage**:
```bash
./scripts/health-check.sh
```

**What it checks**:
- Backend API health endpoint
- Frontend accessibility
- Database connectivity
- Docker container status
- Disk space
- Memory usage

**Exit codes**:
- `0`: All checks passed
- `1`: One or more checks failed

**Integration**: Used by `deploy.sh` to verify successful deployment

---

## Making Scripts Executable

On Linux/macOS:
```bash
chmod +x scripts/*.sh
```

On Windows (using Git Bash):
```bash
git update-index --chmod=+x scripts/deploy.sh
git update-index --chmod=+x scripts/health-check.sh
```

---

## Environment Files

### Required Files

Create these files in your project root (DO NOT commit them):

**`.env.staging`** - Staging environment variables
```bash
DB_USER=flowtracker_staging
DB_PASSWORD=staging_password
DB_NAME=flowtracker_staging
JWT_SECRET=staging_jwt_secret
CORS_ORIGIN=https://staging.yourdomain.com
FRONTEND_URL=https://staging.yourdomain.com
GITHUB_REPOSITORY=your-username/flowtracker
```

**`.env.production`** - Production environment variables
```bash
DB_USER=flowtracker_prod
DB_PASSWORD=super_secure_production_password
DB_NAME=flowtracker_prod
JWT_SECRET=super_secure_production_jwt_secret
CORS_ORIGIN=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
GITHUB_REPOSITORY=your-username/flowtracker
```

---

## Server Setup

### Initial Server Configuration

1. **Install Docker**:
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Clone Repository**:
```bash
cd /opt
sudo git clone https://github.com/your-username/flowtracker.git
sudo chown -R $USER:$USER flowtracker
cd flowtracker
```

3. **Create Environment File**:
```bash
cp backend/.env.production.example .env.production
nano .env.production  # Edit with your values
```

4. **Set Up SSH Keys** (for GitHub Actions deployment):
```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096 -C "deploy@flowtracker"

# Add public key to authorized_keys
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys

# Copy private key to add to GitHub Secrets
cat ~/.ssh/id_rsa
```

5. **Configure Firewall**:
```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Monitoring

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100
```

### Check Service Status

```bash
# Container status
docker-compose -f docker-compose.prod.yml ps

# Health status
docker ps --format "{{.Names}}: {{.Status}}"
```

### System Resources

```bash
# Container resource usage
docker stats

# Disk usage
docker system df

# Clean up
docker system prune -a
```

---

## Backup and Recovery

### Manual Backup

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec database pg_dump -U flowtracker flowtracker_prod > backup_$(date +%Y%m%d).sql

# Restore backup
cat backup_20241011.sql | docker-compose -f docker-compose.prod.yml exec -T database psql -U flowtracker flowtracker_prod
```

### Automated Backups

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * /opt/flowtracker/scripts/backup.sh
```

---

## Troubleshooting

### Deployment Fails

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check service health
./scripts/health-check.sh

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

### Database Connection Issues

```bash
# Check database is running
docker-compose -f docker-compose.prod.yml ps database

# Test connection
docker-compose -f docker-compose.prod.yml exec database psql -U flowtracker -c "SELECT version();"

# Check environment variables
docker-compose -f docker-compose.prod.yml exec backend env | grep DATABASE
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a --volumes

# Remove old images
docker image prune -a
```

---

For more detailed information, see [CI_CD_GUIDE.md](../CI_CD_GUIDE.md)

