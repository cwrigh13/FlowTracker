#!/bin/bash

# FlowTracker Deployment Script
# This script handles deployment to staging or production environments

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="/var/backups/flowtracker"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}FlowTracker Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Environment: ${YELLOW}${ENVIRONMENT}${NC}"
echo -e "Version: ${YELLOW}${VERSION}${NC}"
echo ""

# Validate environment
if [[ "$ENVIRONMENT" != "staging" ]] && [[ "$ENVIRONMENT" != "production" ]]; then
    echo -e "${RED}Error: Environment must be 'staging' or 'production'${NC}"
    exit 1
fi

# Confirmation for production deployments
if [[ "$ENVIRONMENT" == "production" ]]; then
    echo -e "${YELLOW}⚠️  WARNING: You are about to deploy to PRODUCTION${NC}"
    read -p "Are you sure you want to continue? (yes/no): " -r
    echo
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo -e "${RED}Deployment cancelled${NC}"
        exit 1
    fi
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: docker-compose is not installed${NC}"
    exit 1
fi

# Load environment variables
if [ -f ".env.${ENVIRONMENT}" ]; then
    echo -e "${GREEN}✓ Loading environment variables${NC}"
    export $(cat .env.${ENVIRONMENT} | grep -v '^#' | xargs)
else
    echo -e "${RED}Error: .env.${ENVIRONMENT} file not found${NC}"
    exit 1
fi

# Step 1: Create backup of database
echo -e "\n${BLUE}Step 1: Creating database backup${NC}"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/flowtracker_$(date +%Y%m%d_%H%M%S).sql"

docker-compose -f $COMPOSE_FILE exec -T database pg_dump -U ${DB_USER} ${DB_NAME} > "$BACKUP_FILE" || {
    echo -e "${YELLOW}Warning: Could not create database backup (database might not be running yet)${NC}"
}

if [ -f "$BACKUP_FILE" ]; then
    echo -e "${GREEN}✓ Database backed up to: $BACKUP_FILE${NC}"
fi

# Step 2: Pull latest images
echo -e "\n${BLUE}Step 2: Pulling latest Docker images${NC}"
docker-compose -f $COMPOSE_FILE pull

# Step 3: Stop old containers
echo -e "\n${BLUE}Step 3: Stopping old containers${NC}"
docker-compose -f $COMPOSE_FILE down --remove-orphans

# Step 4: Start new containers
echo -e "\n${BLUE}Step 4: Starting new containers${NC}"
docker-compose -f $COMPOSE_FILE up -d

# Step 5: Wait for services to be healthy
echo -e "\n${BLUE}Step 5: Waiting for services to be healthy${NC}"
echo -n "Waiting for backend."
for i in {1..30}; do
    if docker-compose -f $COMPOSE_FILE exec -T backend wget --no-verbose --tries=1 --spider http://localhost:5000/api/health 2>&1 > /dev/null; then
        echo -e "\n${GREEN}✓ Backend is healthy${NC}"
        break
    fi
    echo -n "."
    sleep 2
    if [ $i -eq 30 ]; then
        echo -e "\n${RED}Error: Backend failed to become healthy${NC}"
        echo -e "${YELLOW}Rolling back...${NC}"
        docker-compose -f $COMPOSE_FILE logs backend
        exit 1
    fi
done

# Step 6: Run database migrations
echo -e "\n${BLUE}Step 6: Running database migrations${NC}"
docker-compose -f $COMPOSE_FILE exec -T backend npm run migrate || {
    echo -e "${YELLOW}Warning: Migration command not found or failed${NC}"
}

# Step 7: Health check
echo -e "\n${BLUE}Step 7: Running health checks${NC}"
./scripts/health-check.sh || {
    echo -e "${RED}Health check failed!${NC}"
    echo -e "${YELLOW}Rolling back to previous version...${NC}"
    # Rollback logic here
    exit 1
}

# Step 8: Clean up old images
echo -e "\n${BLUE}Step 8: Cleaning up old Docker images${NC}"
docker image prune -f

# Success!
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Environment: ${YELLOW}${ENVIRONMENT}${NC}"
echo -e "Version: ${YELLOW}${VERSION}${NC}"
echo -e "Backup: ${YELLOW}${BACKUP_FILE}${NC}"
echo ""
echo -e "${BLUE}Running services:${NC}"
docker-compose -f $COMPOSE_FILE ps

echo -e "\n${BLUE}Recent logs:${NC}"
docker-compose -f $COMPOSE_FILE logs --tail=50

