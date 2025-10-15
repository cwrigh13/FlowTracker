# CI/CD Quick Reference Card

## 🚀 Start Development (3 Commands)

```bash
cd "C:\Users\cwrig\OneDrive\Documents\IRL.URL\Library Items Issues Tracker"
docker-compose up
# Frontend: http://localhost:3000 | Backend: http://localhost:5000
```

---

## 📝 Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes, commit
git add .
git commit -m "feat: add new feature"

# 3. Push (triggers CI automatically)
git push origin feature/my-feature

# 4. Create Pull Request on GitHub
# CI runs automatically: tests, linting, builds

# 5. After approval, merge to main
# CD runs automatically: builds and publishes Docker images
```

---

## 🐳 Docker Commands

### Development
```bash
docker-compose up              # Start (see logs)
docker-compose up -d           # Start in background
docker-compose down            # Stop
docker-compose down -v         # Stop + delete data
docker-compose logs -f         # View all logs
docker-compose logs -f backend # View backend logs
docker-compose ps              # Check status
docker-compose restart         # Restart all
docker-compose build           # Rebuild images
```

### Testing
```bash
docker-compose run backend npm test   # Run backend tests
docker-compose run frontend npm test  # Run frontend tests
```

### Access Services
```bash
docker-compose exec backend sh                      # Backend shell
docker-compose exec database psql -U flowtracker    # Database CLI
```

---

## 🔧 Common Tasks

### Run Tests Locally
```bash
# Frontend tests
npm test

# Backend tests
cd backend && npm test

# In Docker (matches CI environment)
docker-compose run backend npm test
docker-compose run frontend npm test
```

### Check for Vulnerabilities
```bash
npm audit              # Frontend
cd backend && npm audit # Backend
```

### View CI/CD Status
1. Go to GitHub repository
2. Click **Actions** tab
3. See workflow runs

### Deploy to Production
1. Go to **Actions** tab
2. Select **CD - Continuous Deployment**
3. Click **Run workflow**
4. Select **production**
5. Click **Run workflow**

---

## 📦 Docker Images

Your images are published to GitHub Container Registry:

```
ghcr.io/YOUR-USERNAME/flowtracker-frontend:latest
ghcr.io/YOUR-USERNAME/flowtracker-backend:latest
```

### Pull Images
```bash
docker pull ghcr.io/YOUR-USERNAME/flowtracker-frontend:latest
docker pull ghcr.io/YOUR-USERNAME/flowtracker-backend:latest
```

---

## 🏥 Health Checks

### Check Services
```bash
# Backend health
curl http://localhost:5000/api/health

# Frontend health  
curl http://localhost:3000/health

# Run full health check script
./scripts/health-check.sh
```

### Troubleshooting
```bash
# View logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database

# Restart service
docker-compose restart backend

# Full restart
docker-compose down && docker-compose up
```

---

## 🔐 GitHub Secrets

**Settings** → **Secrets and variables** → **Actions**

### Optional (for enhanced features)
- `CODECOV_TOKEN` - Code coverage tracking

### Production (when ready)
- `STAGING_HOST` - Staging server
- `STAGING_USER` - SSH username
- `STAGING_SSH_KEY` - SSH private key
- `PRODUCTION_HOST` - Production server
- `PRODUCTION_USER` - SSH username
- `PRODUCTION_SSH_KEY` - SSH private key

---

## 📊 Workflows

### CI (Continuous Integration)
**Triggers**: Push, Pull Request  
**Duration**: ~5-8 minutes  
**What**: Tests, linting, builds, security scans

### CD (Continuous Deployment)  
**Triggers**: Push to main, Manual  
**Duration**: ~3-5 minutes  
**What**: Builds Docker images, publishes to registry

### Security Scan
**Triggers**: Weekly (Mondays), Manual  
**Duration**: ~10-15 minutes  
**What**: Dependency audits, CodeQL analysis

---

## 🐛 Troubleshooting

### CI Failing?
```bash
# Test locally first
docker-compose run backend npm test
docker-compose run frontend npm test

# Check GitHub Actions logs
# Go to Actions tab → Click on failed run → View logs
```

### Docker Issues?
```bash
# Clean everything
docker-compose down -v
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up
```

### Port Already in Use?
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Change port in docker-compose.yml if needed
```

---

## 📚 Documentation

- **Full Guide**: `CI_CD_GUIDE.md`
- **Docker Guide**: `QUICK_START_DOCKER.md`
- **Implementation Summary**: `CI_CD_IMPLEMENTATION_SUMMARY.md`
- **Production Checklist**: `PRODUCTION_READINESS_CHECKLIST.md`

---

## 🎯 Success Indicators

✅ **CI is working** when:
- Green checkmarks on Pull Requests
- Tests pass automatically
- Coverage reports generated

✅ **CD is working** when:
- Images appear in GitHub Packages
- Tagged with commit SHA
- Latest tag updates on main push

✅ **Docker is working** when:
- `docker-compose ps` shows all "Up"
- Can access localhost:3000 and localhost:5000
- Health checks pass

---

## ⚡ Pro Tips

1. Always run `docker-compose run backend npm test` before pushing
2. Keep Docker Desktop running when developing
3. Use `docker-compose logs -f` to watch what's happening
4. Clean Docker weekly: `docker system prune -a`
5. Check Actions tab after every push

---

## 🆘 Emergency Commands

```bash
# Everything is broken, start fresh:
docker-compose down -v
docker system prune -a --volumes
docker-compose build --no-cache
docker-compose up

# Can't connect to database:
docker-compose restart database
docker-compose logs database

# Frontend won't load:
docker-compose restart frontend
docker-compose logs frontend

# Backend errors:
docker-compose restart backend
docker-compose logs backend
```

---

## 📞 Quick Links

- **GitHub Actions**: `https://github.com/YOUR-REPO/actions`
- **Packages**: `https://github.com/YOUR-REPO/packages`
- **Codecov**: `https://codecov.io/gh/YOUR-REPO`
- **Docker Hub**: `https://hub.docker.com/`

---

**Print this and keep it handy!** 📋

**Most used command**: `docker-compose up` ← Start here!

