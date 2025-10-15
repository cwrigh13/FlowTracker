# GitHub Actions Workflows

This directory contains automated workflows for FlowTracker's CI/CD pipeline.

## Workflows

### 1. CI - Continuous Integration (`ci.yml`)

**Purpose**: Automated testing and validation on every code change

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs**:
- `test-frontend`: Tests React/TypeScript frontend with Vitest
- `test-backend`: Tests Node.js/Express backend with Jest + PostgreSQL
- `build-docker`: Validates Docker images can be built
- `security-scan`: Scans for dependency vulnerabilities

**Matrix Testing**: Runs on Node.js 18.x and 20.x

**Duration**: ~5-8 minutes

---

### 2. CD - Continuous Deployment (`cd.yml`)

**Purpose**: Automated building and deployment of Docker images

**Triggers**:
- Push to `main` branch
- Manual workflow dispatch (with environment selection)

**Jobs**:
- `build-and-push`: Builds and pushes Docker images to GitHub Container Registry
- `deploy-staging`: Deploys to staging environment (configurable)
- `deploy-production`: Deploys to production (manual only, requires approval)

**Images**:
- `ghcr.io/your-org/flowtracker-frontend:latest`
- `ghcr.io/your-org/flowtracker-backend:latest`

**Duration**: ~3-5 minutes

---

### 3. Security Scan (`security.yml`)

**Purpose**: Regular security audits and vulnerability scanning

**Triggers**:
- Weekly (Mondays at 9:00 AM UTC)
- When `package-lock.json` files change
- Manual workflow dispatch

**Jobs**:
- `dependency-audit`: Runs `npm audit` on frontend and backend
- `codeql-analysis`: Static code analysis for security issues

**Duration**: ~10-15 minutes

---

## Status Badges

Add these to your README.md:

```markdown
![CI Status](https://github.com/your-username/flowtracker/workflows/CI/badge.svg)
![Security Scan](https://github.com/your-username/flowtracker/workflows/Security%20Scan/badge.svg)
[![codecov](https://codecov.io/gh/your-username/flowtracker/branch/main/graph/badge.svg)](https://codecov.io/gh/your-username/flowtracker)
```

---

## Required Secrets

Configure in **Settings** → **Secrets and variables** → **Actions**:

### Optional (for enhanced features)
- `CODECOV_TOKEN`: Upload code coverage reports

### Production Deployment (when ready)
- `STAGING_HOST`: Staging server hostname/IP
- `STAGING_USER`: SSH username for staging
- `STAGING_SSH_KEY`: Private SSH key for staging
- `PRODUCTION_HOST`: Production server hostname/IP
- `PRODUCTION_USER`: SSH username for production
- `PRODUCTION_SSH_KEY`: Private SSH key for production

---

## Permissions

The workflows require these permissions (automatically configured):

- `contents: read` - Read repository contents
- `packages: write` - Push to GitHub Container Registry
- `security-events: write` - Upload CodeQL results

---

## Local Testing

Test GitHub Actions locally using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # macOS
choco install act-cli  # Windows

# Run CI workflow locally
act pull_request

# Run specific job
act -j test-frontend
```

---

## Monitoring

View workflow runs:
1. Go to **Actions** tab in your repository
2. Select a workflow from the left sidebar
3. Click on a specific run to see logs

---

## Troubleshooting

### Common Issues

**1. Tests fail in CI but pass locally**
- Run tests in Docker: `docker-compose run backend npm test`
- Check Node.js version matches CI matrix

**2. Docker push fails**
- Verify repository permissions: Settings → Actions → Workflow permissions
- Ensure `Read and write permissions` is enabled

**3. CodeQL analysis fails**
- This is normal for first-time setup
- Wait for initial scan to complete (~10-15 minutes)

---

For detailed documentation, see [CI_CD_GUIDE.md](../../CI_CD_GUIDE.md)

