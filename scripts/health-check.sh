#!/bin/bash

# FlowTracker Health Check Script
# Verifies that all services are running correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKEND_URL=${BACKEND_URL:-http://localhost:5000}
FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000}
TIMEOUT=5

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}FlowTracker Health Check${NC}"
echo -e "${BLUE}========================================${NC}"

# Check backend health
echo -e "\n${BLUE}Checking Backend API...${NC}"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "${BACKEND_URL}/api/health" || echo "000")

if [ "$BACKEND_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✓ Backend API is healthy (HTTP 200)${NC}"
    # Get detailed health info
    HEALTH_INFO=$(curl -s "${BACKEND_URL}/api/health")
    echo -e "  ${HEALTH_INFO}"
else
    echo -e "${RED}✗ Backend API is not responding (HTTP ${BACKEND_STATUS})${NC}"
    exit 1
fi

# Check frontend
echo -e "\n${BLUE}Checking Frontend...${NC}"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "${FRONTEND_URL}/health" || echo "000")

if [ "$FRONTEND_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✓ Frontend is healthy (HTTP 200)${NC}"
else
    # Frontend might not have /health endpoint, check root
    FRONTEND_ROOT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "${FRONTEND_URL}/" || echo "000")
    if [ "$FRONTEND_ROOT_STATUS" -eq 200 ]; then
        echo -e "${GREEN}✓ Frontend is accessible (HTTP 200)${NC}"
    else
        echo -e "${RED}✗ Frontend is not responding (HTTP ${FRONTEND_ROOT_STATUS})${NC}"
        exit 1
    fi
fi

# Check database connectivity (through backend)
echo -e "\n${BLUE}Checking Database Connectivity...${NC}"
# Assuming you have a /api/health endpoint that checks DB
DB_CHECK=$(curl -s "${BACKEND_URL}/api/health" | grep -o '"status":"healthy"' || echo "")

if [ ! -z "$DB_CHECK" ]; then
    echo -e "${GREEN}✓ Database connection is healthy${NC}"
else
    echo -e "${YELLOW}⚠ Could not verify database connectivity${NC}"
fi

# Check Docker containers (if running in Docker)
if command -v docker &> /dev/null; then
    echo -e "\n${BLUE}Checking Docker Containers...${NC}"
    
    # Check if containers are running
    CONTAINERS=$(docker ps --format "{{.Names}}" | grep "flowtracker" || echo "")
    
    if [ ! -z "$CONTAINERS" ]; then
        echo -e "${GREEN}✓ Docker containers are running:${NC}"
        docker ps --filter "name=flowtracker" --format "  - {{.Names}}: {{.Status}}"
        
        # Check container health
        UNHEALTHY=$(docker ps --filter "name=flowtracker" --filter "health=unhealthy" -q)
        if [ ! -z "$UNHEALTHY" ]; then
            echo -e "${RED}✗ Some containers are unhealthy${NC}"
            docker ps --filter "name=flowtracker" --filter "health=unhealthy"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠ No FlowTracker Docker containers found${NC}"
    fi
fi

# Check disk space
echo -e "\n${BLUE}Checking Disk Space...${NC}"
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo -e "${GREEN}✓ Disk space is adequate (${DISK_USAGE}% used)${NC}"
elif [ "$DISK_USAGE" -lt 90 ]; then
    echo -e "${YELLOW}⚠ Disk space is getting low (${DISK_USAGE}% used)${NC}"
else
    echo -e "${RED}✗ Disk space is critically low (${DISK_USAGE}% used)${NC}"
    exit 1
fi

# Check memory usage
echo -e "\n${BLUE}Checking Memory Usage...${NC}"
if command -v free &> /dev/null; then
    MEMORY_USAGE=$(free | awk 'NR==2 {printf "%.0f", $3/$2 * 100}')
    if [ "$MEMORY_USAGE" -lt 80 ]; then
        echo -e "${GREEN}✓ Memory usage is normal (${MEMORY_USAGE}%)${NC}"
    elif [ "$MEMORY_USAGE" -lt 90 ]; then
        echo -e "${YELLOW}⚠ Memory usage is high (${MEMORY_USAGE}%)${NC}"
    else
        echo -e "${RED}✗ Memory usage is critical (${MEMORY_USAGE}%)${NC}"
    fi
fi

# Success
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✓ All health checks passed!${NC}"
echo -e "${GREEN}========================================${NC}"
exit 0

