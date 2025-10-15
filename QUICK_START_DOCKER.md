# FlowTracker Docker Quick Start

Get FlowTracker running with Docker in 5 minutes!

## Prerequisites

- **Docker Desktop** installed: https://www.docker.com/products/docker-desktop
- **Git** installed: https://git-scm.com/downloads
- **8GB RAM** available (recommended)
- **5GB disk space** free

## Quick Start (3 Commands)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/flowtracker.git
cd flowtracker

# 2. Start all services
docker-compose up

# 3. Open your browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

That's it! FlowTracker is now running with:
- ✅ React frontend on port 3000
- ✅ Node.js backend on port 5000
- ✅ PostgreSQL database on port 5432

---

## What Just Happened?

Docker Compose automatically:
1. **Downloaded** PostgreSQL, Node.js, and nginx images
2. **Created** three containers (database, backend, frontend)
3. **Initialized** the database with the schema
4. **Started** all services and connected them
5. **Enabled** hot-reload for development

---

## Common Tasks

### Stop Services

```bash
# Stop but keep data
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just frontend
docker-compose logs -f frontend
```

### Restart After Code Changes

```bash
# Frontend and backend have hot-reload, but if needed:
docker-compose restart backend
docker-compose restart frontend
```

### Run Tests

```bash
# Frontend tests
docker-compose run frontend npm test

# Backend tests
docker-compose run backend npm test
```

### Access Database

```bash
# Using psql
docker-compose exec database psql -U flowtracker

# List tables
\dt

# Query users
SELECT * FROM users;

# Exit
\q
```

### Rebuild After Major Changes

```bash
# Rebuild images
docker-compose build

# Rebuild without cache
docker-compose build --no-cache

# Start with new images
docker-compose up
```

---

## Configuration

### Change Ports

Edit `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:3000"  # Change 3000 to 8080
  
  backend:
    ports:
      - "8000:5000"  # Change 5000 to 8000
```

### Change Database Password

Edit `docker-compose.yml`:

```yaml
services:
  database:
    environment:
      POSTGRES_PASSWORD: your_new_password
  
  backend:
    environment:
      DATABASE_URL: postgresql://flowtracker:your_new_password@database:5432/flowtracker
```

### Configure Email (Optional)

Create a `.env` file in the project root:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@flowtracker.local
```

Then restart:
```bash
docker-compose down
docker-compose up
```

---

## Troubleshooting

### Port Already in Use

**Error**: `port is already allocated`

**Solution**:
```bash
# Find what's using the port (example: port 3000)
# macOS/Linux:
lsof -i :3000

# Windows:
netstat -ano | findstr :3000

# Kill the process or change the port in docker-compose.yml
```

### Container Fails to Start

**Error**: Container keeps restarting

**Solution**:
```bash
# Check logs for error messages
docker-compose logs backend

# Common issues:
# 1. Database not ready - wait 30 seconds and check again
# 2. Port conflict - see "Port Already in Use" above
# 3. Missing dependencies - run: docker-compose build
```

### Database Connection Error

**Error**: `ECONNREFUSED localhost:5432`

**Solution**:
```bash
# Verify database is running
docker-compose ps database

# Check database logs
docker-compose logs database

# Restart database
docker-compose restart database

# If still failing, fresh start:
docker-compose down -v
docker-compose up
```

### Out of Memory

**Error**: `Killed` or container stops unexpectedly

**Solution**:
1. Open Docker Desktop
2. Go to Settings → Resources
3. Increase Memory to at least 4GB (8GB recommended)
4. Click "Apply & Restart"

### Slow Performance

**Solution**:
```bash
# Clean up Docker
docker system prune -a

# Restart Docker Desktop
# macOS: Docker icon → Restart
# Windows: Right-click Docker icon → Restart Docker Desktop
```

---

## Advanced Usage

### Production Build

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d

# This uses optimized images with:
# - No hot-reload (faster)
# - Compiled code only
# - Nginx for frontend
# - Production environment variables
```

### Custom Network

```bash
# Connect to external services
docker network create flowtracker-external
docker-compose up -d
docker network connect flowtracker-external flowtracker-backend
```

### Scale Services

```bash
# Run 3 backend instances (requires load balancer)
docker-compose up --scale backend=3
```

---

## Next Steps

### Learn More About Docker

- **Docker Compose Docs**: https://docs.docker.com/compose/
- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/
- **Dockerfile Reference**: https://docs.docker.com/engine/reference/builder/

### Deploy to Production

See [CI_CD_GUIDE.md](./CI_CD_GUIDE.md) for:
- GitHub Actions setup
- Automated deployments
- Production configurations
- Monitoring and logging

### Development Workflow

1. **Make code changes** - Files auto-reload in containers
2. **Run tests** - `docker-compose run backend npm test`
3. **Check logs** - `docker-compose logs -f`
4. **Commit changes** - Git commit triggers CI/CD
5. **Deploy** - Automatic via GitHub Actions

---

## Useful Commands Cheat Sheet

```bash
# Start services
docker-compose up                    # Foreground (see logs)
docker-compose up -d                 # Background (detached)

# Stop services
docker-compose down                  # Stop and remove containers
docker-compose down -v               # Also remove volumes (data)
docker-compose stop                  # Stop without removing

# View information
docker-compose ps                    # List containers
docker-compose logs                  # View all logs
docker-compose logs -f backend       # Follow backend logs
docker-compose top                   # View processes

# Execute commands
docker-compose exec backend sh       # Shell in backend container
docker-compose exec database psql    # Access database
docker-compose run backend npm test  # Run tests

# Maintenance
docker-compose build                 # Rebuild images
docker-compose pull                  # Pull latest images
docker-compose restart              # Restart all services
docker system prune -a              # Clean up Docker

# Health checks
docker ps                           # Check container status
docker stats                        # Resource usage
docker inspect flowtracker-backend  # Detailed info
```

---

## Getting Help

- **Docker Issues**: Check [Docker Documentation](https://docs.docker.com/)
- **FlowTracker Issues**: See [CI_CD_GUIDE.md](./CI_CD_GUIDE.md) Troubleshooting section
- **Container Logs**: Always check logs first: `docker-compose logs`

---

**Pro Tip**: Add aliases to your shell for common commands:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias dcup='docker-compose up'
alias dcdown='docker-compose down'
alias dclogs='docker-compose logs -f'
alias dcps='docker-compose ps'
alias dcrestart='docker-compose restart'
```

Happy coding! 🚀

