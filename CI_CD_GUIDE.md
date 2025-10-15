# FlowTracker CI/CD Pipeline Guide

## Overview

This guide explains how to set up and use the Continuous Integration and Continuous Deployment (CI/CD) pipeline for FlowTracker. The pipeline is built using GitHub Actions, Docker, and automated testing.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [GitHub Secrets Configuration](#github-secrets-configuration)
5. [Workflows Explained](#workflows-explained)
6. [Docker Configuration](#docker-configuration)
7. [Local Development with Docker](#local-development-with-docker)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Architecture Overview

### CI/CD Workflow

```
Developer Push → GitHub Actions → Tests → Build → Deploy
                      ↓              ↓       ↓       ↓
                   Linting      Unit/Int  Docker  Staging/Prod
                   Security     Coverage  Images  Environments
```

### Components

- **GitHub Actions**: Automation workflows
- **Docker**: Containerization for consistent environments
- **GitHub Container Registry (ghcr.io)**: Docker image storage
- **Codecov**: Code coverage tracking
- **CodeQL**: Security analysis

---

## Prerequisites

### Required Accounts

1. **GitHub Account** (you already have this)
2. **Codecov Account** (optional, free for public repos)
   - Sign up at: https://codecov.io
   - Connect your GitHub repository

### Required Software (for local development)

- Docker Desktop: https://www.docker.com/products/docker-desktop
- Docker Compose: Usually included with Docker Desktop
- Git: https://git-scm.com/downloads

---

## Initial Setup

### Step 1: Enable GitHub Actions

1. Go to your repository on GitHub
2. Click on **Settings** → **Actions** → **General**
3. Under "Actions permissions", select **Allow all actions and reusable workflows**
4. Click **Save**

### Step 2: Enable GitHub Container Registry

1. Go to **Settings** → **Packages**
2. Under "Package creation", ensure **Packages** is visible
3. Set visibility to **Public** or **Private** (your choice)

### Step 3: Set Up Branch Protection (Recommended)

1. Go to **Settings** → **Branches**
2. Click **Add rule** for `main` branch
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Select: `test-frontend`, `test-backend`, `security-scan`
4. Click **Create** or **Save changes**

---

## GitHub Secrets Configuration

### Required Secrets

Go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

#### For Codecov (Optional)

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `CODECOV_TOKEN` | Code coverage upload token | 1. Sign in to codecov.io<br>2. Add your repository<br>3. Copy the upload token |

#### For Production Deployment (When Ready)

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `STAGING_HOST` | Staging server IP/hostname | `staging.yourdomain.com` |
| `STAGING_USER` | SSH username for staging | `deploy` |
| `STAGING_SSH_KEY` | Private SSH key for staging | `-----BEGIN RSA PRIVATE KEY-----...` |
| `PRODUCTION_HOST` | Production server IP/hostname | `flowtracker.app` |
| `PRODUCTION_USER` | SSH username for production | `deploy` |
| `PRODUCTION_SSH_KEY` | Private SSH key for production | `-----BEGIN RSA PRIVATE KEY-----...` |

#### Environment Variables (Production)

Create a `.env.production` file on your server with these values:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/flowtracker_prod
DB_USER=flowtracker_prod
DB_PASSWORD=your_secure_password
DB_NAME=flowtracker_prod

# JWT
JWT_SECRET=your_super_secret_64_char_minimum_jwt_key_here
JWT_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com

# URLs
CORS_ORIGIN=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

# GitHub Container Registry
GITHUB_REPOSITORY=yourusername/flowtracker
```

---

## Workflows Explained

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers**: Push to `main`/`develop`, Pull Requests

**What it does**:
1. Runs on Node.js 18.x and 20.x (matrix testing)
2. Tests frontend with Vitest
3. Tests backend with Jest + PostgreSQL
4. Runs ESLint and TypeScript checks
5. Generates code coverage reports
6. Uploads coverage to Codecov
7. Builds Docker images (validation)
8. Scans for security vulnerabilities

**Duration**: ~5-8 minutes

### 2. CD Workflow (`.github/workflows/cd.yml`)

**Triggers**: Push to `main`, Manual dispatch

**What it does**:
1. Builds optimized Docker images
2. Tags images with commit SHA and `latest`
3. Pushes images to GitHub Container Registry
4. Optionally deploys to staging/production

**Duration**: ~3-5 minutes

### 3. Security Workflow (`.github/workflows/security.yml`)

**Triggers**: Weekly (Mondays), dependency changes, manual

**What it does**:
1. Runs `npm audit` on frontend and backend
2. Checks for critical/high vulnerabilities
3. Runs CodeQL static analysis
4. Creates issues for critical findings

**Duration**: ~10-15 minutes

---

## Docker Configuration

### Files Structure

```
.
├── Dockerfile                      # Frontend container
├── .dockerignore                   # Frontend exclusions
├── docker-compose.yml              # Development environment
├── docker-compose.prod.yml         # Production environment
├── backend/
│   ├── Dockerfile                  # Backend container
│   └── .dockerignore               # Backend exclusions
└── scripts/
    ├── deploy.sh                   # Deployment automation
    └── health-check.sh             # Health verification
```

### Image Sizes

- **Frontend**: ~50MB (nginx + built assets)
- **Backend**: ~150MB (Node.js + compiled code)
- **Database**: ~230MB (PostgreSQL 15 Alpine)

### Multi-Stage Builds

Both Dockerfiles use multi-stage builds for optimization:

1. **Builder stage**: Compiles TypeScript, builds React app
2. **Production stage**: Only includes compiled code and runtime

This reduces image size by ~60-70%.

---

## Local Development with Docker

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/flowtracker.git
cd flowtracker

# Start all services
docker-compose up

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Database: localhost:5432
```

### Common Commands

```bash
# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Rebuild after code changes
docker-compose build

# Restart a specific service
docker-compose restart backend

# Run tests in containers
docker-compose run backend npm test
docker-compose run frontend npm test

# Access backend shell
docker-compose exec backend sh

# Access database
docker-compose exec database psql -U flowtracker
```

### Environment Variables

Create a `.env` file in the root directory:

```bash
# SMTP Configuration (for local email testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@flowtracker.local
```

---

## Deployment

### Automatic Deployment (GitHub Actions)

#### To Staging (Automatic on push to main)

```bash
git push origin main
```

The CD workflow automatically:
1. Builds Docker images
2. Pushes to GitHub Container Registry
3. Deploys to staging (if configured)

#### To Production (Manual trigger)

1. Go to **Actions** tab on GitHub
2. Select **CD - Continuous Deployment** workflow
3. Click **Run workflow**
4. Select **production** environment
5. Click **Run workflow**

### Manual Deployment (SSH to server)

#### Prerequisites

1. SSH access to your server
2. Docker and Docker Compose installed on server
3. Clone repository on server

#### Deployment Steps

```bash
# SSH to your server
ssh user@your-server.com

# Navigate to application directory
cd /opt/flowtracker

# Pull latest images
docker login ghcr.io -u your-github-username
docker-compose -f docker-compose.prod.yml pull

# Run deployment script
./scripts/deploy.sh production

# OR manually:
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml exec backend npm run migrate

# Verify deployment
./scripts/health-check.sh
```

### Zero-Downtime Deployment

For zero-downtime deployments, use a load balancer with blue-green deployment:

1. Deploy to "green" environment
2. Health check green environment
3. Switch load balancer to green
4. Keep blue environment as rollback

---

## Troubleshooting

### CI/CD Issues

#### Tests Failing in CI but Passing Locally

**Problem**: Environment differences

**Solution**:
```bash
# Run tests in Docker locally to match CI environment
docker-compose run backend npm test
docker-compose run frontend npm test
```

#### Docker Build Fails

**Problem**: Out of memory, dependency issues

**Solution**:
```bash
# Clear Docker cache
docker builder prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### Cannot Push to GitHub Container Registry

**Problem**: Authentication issues

**Solution**:
1. Check if GITHUB_TOKEN has `write:packages` permission
2. Repository settings → Actions → Workflow permissions → Read and write

### Deployment Issues

#### Health Check Fails

**Problem**: Services not starting correctly

**Solution**:
```bash
# Check service logs
docker-compose logs backend
docker-compose logs frontend

# Check service status
docker-compose ps

# Restart services
docker-compose restart
```

#### Database Connection Errors

**Problem**: Database not ready, wrong credentials

**Solution**:
```bash
# Check database logs
docker-compose logs database

# Verify environment variables
docker-compose exec backend env | grep DATABASE

# Test database connection
docker-compose exec database psql -U flowtracker -c "SELECT version();"
```

#### Port Already in Use

**Problem**: Another service using the same port

**Solution**:
```bash
# Find process using port
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Stop the process or change port in docker-compose.yml
```

---

## Best Practices

### Git Workflow

1. **Feature Branches**: Create feature branches from `develop`
   ```bash
   git checkout -b feature/new-feature develop
   ```

2. **Pull Requests**: Always create PRs for code review
   - CI runs automatically on PRs
   - Merge only after CI passes

3. **Commit Messages**: Use conventional commits
   ```
   feat: add user profile page
   fix: resolve database connection issue
   docs: update CI/CD guide
   ```

### Docker Best Practices

1. **Keep Images Small**: Use Alpine base images, multi-stage builds
2. **Security**: Don't include secrets in images, use build args
3. **Caching**: Order Dockerfile commands for optimal layer caching
4. **Health Checks**: Always include health checks in containers

### Deployment Best Practices

1. **Always Test in Staging First**: Never deploy directly to production
2. **Database Backups**: Always backup before deployment
3. **Rollback Plan**: Know how to rollback if something goes wrong
4. **Monitoring**: Set up monitoring and alerting (Sentry, New Relic, etc.)
5. **Documentation**: Keep deployment logs and incident reports

### Security Best Practices

1. **Secrets Management**: Use GitHub Secrets, never commit secrets
2. **Dependency Updates**: Regularly update dependencies
3. **Security Scanning**: Review security scan results weekly
4. **Access Control**: Limit who can deploy to production
5. **Audit Logs**: Monitor deployment and access logs

---

## Next Steps

1. ✅ Set up GitHub Secrets
2. ✅ Enable GitHub Actions
3. ✅ Test CI/CD pipeline with a small change
4. ✅ Set up staging environment
5. ✅ Configure monitoring and alerting
6. ✅ Plan production deployment
7. ✅ Set up database backups
8. ✅ Configure SSL certificates

---

## Support

### Resources

- **Docker Documentation**: https://docs.docker.com
- **GitHub Actions**: https://docs.github.com/actions
- **PostgreSQL**: https://www.postgresql.org/docs/

### Getting Help

1. Check workflow logs in GitHub Actions tab
2. Review this guide's troubleshooting section
3. Check Docker container logs: `docker-compose logs`
4. Search GitHub Issues for similar problems

---

**Last Updated**: October 2025  
**Version**: 1.0  
**Maintainer**: FlowTracker Team

