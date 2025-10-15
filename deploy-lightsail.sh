#!/bin/bash
# FlowTracker AWS Lightsail Deployment Script
# This script automates the deployment of FlowTracker to AWS Lightsail

set -e  # Exit on error

# Default configuration
SERVICE_NAME="${SERVICE_NAME:-flowtracker}"
DATABASE_NAME="${DATABASE_NAME:-flowtracker-db}"
REGION="${REGION:-us-east-1}"
CONTAINER_POWER="${CONTAINER_POWER:-small}"
CONTAINER_SCALE="${CONTAINER_SCALE:-1}"
DATABASE_BUNDLE="${DATABASE_BUNDLE:-micro_2_0}"
SKIP_DATABASE="${SKIP_DATABASE:-false}"
UPDATE_ONLY="${UPDATE_ONLY:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

echo -e "${CYAN}=====================================${NC}"
echo -e "${CYAN}FlowTracker AWS Lightsail Deployment${NC}"
echo -e "${CYAN}=====================================${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}✗ AWS CLI not found. Please install AWS CLI first.${NC}"
    echo -e "${YELLOW}Download from: https://aws.amazon.com/cli/${NC}"
    exit 1
fi
echo -e "${GREEN}✓ AWS CLI found: $(aws --version)${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker not found. Please install Docker first.${NC}"
    echo -e "${YELLOW}Download from: https://www.docker.com/products/docker-desktop${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker found: $(docker --version)${NC}"

echo ""

# Function to check if a Lightsail service exists
check_service_exists() {
    aws lightsail get-container-services --service-name "$1" &> /dev/null
    return $?
}

# Function to check if a database exists
check_database_exists() {
    aws lightsail get-relational-database --relational-database-name "$1" &> /dev/null
    return $?
}

# Generate random password
generate_password() {
    LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 20
    echo "!A1"
}

# Step 1: Create Database (if not skipped and not updating)
if [ "$SKIP_DATABASE" != "true" ] && [ "$UPDATE_ONLY" != "true" ]; then
    echo -e "${YELLOW}Step 1: Creating PostgreSQL Database${NC}"
    echo -e "${YELLOW}-------------------------------------${NC}"
    
    if check_database_exists "$DATABASE_NAME"; then
        echo -e "${YELLOW}Database '$DATABASE_NAME' already exists. Skipping creation.${NC}"
    else
        echo -e "${CYAN}Database Bundle: $DATABASE_BUNDLE${NC}"
        echo -e "${CYAN}Region: $REGION${NC}"
        
        # Generate password
        PASSWORD=$(generate_password)
        
        echo ""
        echo -e "${CYAN}Creating database... (This will take 10-15 minutes)${NC}"
        
        aws lightsail create-relational-database \
            --relational-database-name "$DATABASE_NAME" \
            --relational-database-blueprint-id postgres_15 \
            --relational-database-bundle-id "$DATABASE_BUNDLE" \
            --master-database-name flowtracker \
            --master-username flowtrackeradmin \
            --master-user-password "$PASSWORD" \
            --publicly-accessible \
            --region "$REGION"
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}✗ Failed to create database${NC}"
            exit 1
        fi
        
        echo -e "${GREEN}✓ Database creation initiated${NC}"
        echo ""
        echo -e "${RED}IMPORTANT: Save these credentials securely!${NC}"
        echo -e "${YELLOW}Database Name: flowtracker${NC}"
        echo -e "${YELLOW}Username: flowtrackeradmin${NC}"
        echo -e "${YELLOW}Password: $PASSWORD${NC}"
        echo ""
        
        # Save credentials to file
        CRED_FILE="lightsail-db-credentials.txt"
        cat > "$CRED_FILE" << EOF
FlowTracker Database Credentials
================================
Database Name: flowtracker
Username: flowtrackeradmin
Password: $PASSWORD

Created: $(date)
EOF
        
        echo -e "${GREEN}Credentials saved to: $CRED_FILE${NC}"
        echo ""
        
        # Wait for database to be available
        echo -e "${CYAN}Waiting for database to become available...${NC}"
        MAX_ATTEMPTS=60
        ATTEMPT=0
        
        while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
            sleep 15
            ((ATTEMPT++))
            
            STATUS=$(aws lightsail get-relational-database \
                --relational-database-name "$DATABASE_NAME" \
                --query 'relationalDatabase.state' \
                --output text 2>&1)
            
            echo -e "${GRAY}  Attempt $ATTEMPT/$MAX_ATTEMPTS - Status: $STATUS${NC}"
            
            if [ "$STATUS" == "available" ]; then
                echo -e "${GREEN}✓ Database is now available${NC}"
                break
            fi
            
            if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
                echo -e "${RED}✗ Timeout waiting for database${NC}"
                echo -e "${YELLOW}Please check AWS Console for status${NC}"
                exit 1
            fi
        done
        
        # Get database endpoint
        DB_ENDPOINT=$(aws lightsail get-relational-database \
            --relational-database-name "$DATABASE_NAME" \
            --query 'relationalDatabase.masterEndpoint.address' \
            --output text)
        
        echo ""
        echo -e "${GREEN}Database Endpoint: $DB_ENDPOINT${NC}"
        echo ""
        
        # Update credentials file with endpoint
        cat >> "$CRED_FILE" << EOF

Database Endpoint: $DB_ENDPOINT
Connection String: postgresql://flowtrackeradmin:$PASSWORD@$DB_ENDPOINT:5432/flowtracker
EOF
    fi
    
    echo ""
fi

# Step 2: Create Container Service (if not updating)
if [ "$UPDATE_ONLY" != "true" ]; then
    echo -e "${YELLOW}Step 2: Creating Container Service${NC}"
    echo -e "${YELLOW}-----------------------------------${NC}"
    
    if check_service_exists "$SERVICE_NAME"; then
        echo -e "${YELLOW}Container service '$SERVICE_NAME' already exists. Skipping creation.${NC}"
    else
        echo -e "${CYAN}Service Name: $SERVICE_NAME${NC}"
        echo -e "${CYAN}Power: $CONTAINER_POWER${NC}"
        echo -e "${CYAN}Scale: $CONTAINER_SCALE${NC}"
        echo -e "${CYAN}Region: $REGION${NC}"
        echo ""
        
        aws lightsail create-container-service \
            --service-name "$SERVICE_NAME" \
            --power "$CONTAINER_POWER" \
            --scale "$CONTAINER_SCALE" \
            --region "$REGION"
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}✗ Failed to create container service${NC}"
            exit 1
        fi
        
        echo -e "${GREEN}✓ Container service creation initiated${NC}"
        echo ""
        
        # Wait for service to be active
        echo -e "${CYAN}Waiting for container service to become active...${NC}"
        MAX_ATTEMPTS=20
        ATTEMPT=0
        
        while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
            sleep 10
            ((ATTEMPT++))
            
            STATUS=$(aws lightsail get-container-services \
                --service-name "$SERVICE_NAME" \
                --query 'containerServices[0].state' \
                --output text 2>&1)
            
            echo -e "${GRAY}  Attempt $ATTEMPT/$MAX_ATTEMPTS - Status: $STATUS${NC}"
            
            if [ "$STATUS" == "ACTIVE" ] || [ "$STATUS" == "RUNNING" ]; then
                echo -e "${GREEN}✓ Container service is now active${NC}"
                break
            fi
            
            if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
                echo -e "${RED}✗ Timeout waiting for container service${NC}"
                exit 1
            fi
        done
    fi
    
    echo ""
fi

# Step 3: Build Docker Images
echo -e "${YELLOW}Step 3: Building Docker Images${NC}"
echo -e "${YELLOW}-------------------------------${NC}"

echo -e "${CYAN}Building backend image...${NC}"
cd backend
docker build -t flowtracker-backend:latest .
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to build backend image${NC}"
    cd ..
    exit 1
fi
cd ..
echo -e "${GREEN}✓ Backend image built successfully${NC}"

echo ""
echo -e "${CYAN}Building frontend image...${NC}"
docker build -t flowtracker-frontend:latest .
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to build frontend image${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend image built successfully${NC}"

echo ""

# Step 4: Push Images to Lightsail
echo -e "${YELLOW}Step 4: Pushing Images to Lightsail${NC}"
echo -e "${YELLOW}------------------------------------${NC}"

echo -e "${CYAN}Pushing backend image...${NC}"
BACKEND_OUTPUT=$(aws lightsail push-container-image \
    --service-name "$SERVICE_NAME" \
    --label backend \
    --image flowtracker-backend:latest 2>&1)

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to push backend image${NC}"
    echo "$BACKEND_OUTPUT"
    exit 1
fi

# Extract image name from output
BACKEND_IMAGE_NAME=$(echo "$BACKEND_OUTPUT" | grep -o ":$SERVICE_NAME\.backend\.[0-9]*")
echo -e "${GREEN}✓ Backend image pushed: $BACKEND_IMAGE_NAME${NC}"

echo ""
echo -e "${CYAN}Pushing frontend image...${NC}"
FRONTEND_OUTPUT=$(aws lightsail push-container-image \
    --service-name "$SERVICE_NAME" \
    --label frontend \
    --image flowtracker-frontend:latest 2>&1)

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to push frontend image${NC}"
    echo "$FRONTEND_OUTPUT"
    exit 1
fi

# Extract image name from output
FRONTEND_IMAGE_NAME=$(echo "$FRONTEND_OUTPUT" | grep -o ":$SERVICE_NAME\.frontend\.[0-9]*")
echo -e "${GREEN}✓ Frontend image pushed: $FRONTEND_IMAGE_NAME${NC}"

echo ""

# Step 5: Update Deployment Configuration
echo -e "${YELLOW}Step 5: Updating Deployment Configuration${NC}"
echo -e "${YELLOW}------------------------------------------${NC}"

CONFIG_FILE="lightsail-containers.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}✗ Configuration file not found: $CONFIG_FILE${NC}"
    exit 1
fi

# Update image names using jq
DEPLOY_CONFIG_FILE="lightsail-containers-deploy.json"
jq --arg backend "$BACKEND_IMAGE_NAME" \
   --arg frontend "$FRONTEND_IMAGE_NAME" \
   '.containers.backend.image = $backend | .containers.frontend.image = $frontend' \
   "$CONFIG_FILE" > "$DEPLOY_CONFIG_FILE"

echo -e "${CYAN}Updated configuration:${NC}"
echo -e "${GRAY}  Backend image: $BACKEND_IMAGE_NAME${NC}"
echo -e "${GRAY}  Frontend image: $FRONTEND_IMAGE_NAME${NC}"
echo -e "${GREEN}✓ Configuration updated: $DEPLOY_CONFIG_FILE${NC}"
echo ""

# Step 6: Deploy to Lightsail
echo -e "${YELLOW}Step 6: Deploying to Lightsail${NC}"
echo -e "${YELLOW}-------------------------------${NC}"

echo -e "${YELLOW}IMPORTANT: Make sure you've updated the environment variables in $DEPLOY_CONFIG_FILE${NC}"
echo -e "${YELLOW}Press Enter to continue with deployment, or Ctrl+C to cancel...${NC}"
read

aws lightsail create-container-service-deployment \
    --service-name "$SERVICE_NAME" \
    --cli-input-json "file://$DEPLOY_CONFIG_FILE"

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to create deployment${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Deployment initiated${NC}"
echo ""

# Wait for deployment to complete
echo -e "${CYAN}Waiting for deployment to complete...${NC}"
MAX_ATTEMPTS=40
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    sleep 15
    ((ATTEMPT++))
    
    DEPLOYMENT_STATE=$(aws lightsail get-container-services \
        --service-name "$SERVICE_NAME" \
        --query 'containerServices[0].currentDeployment.state' \
        --output text 2>&1)
    
    echo -e "${GRAY}  Attempt $ATTEMPT/$MAX_ATTEMPTS - Deployment State: $DEPLOYMENT_STATE${NC}"
    
    if [ "$DEPLOYMENT_STATE" == "ACTIVE" ]; then
        echo -e "${GREEN}✓ Deployment completed successfully${NC}"
        break
    fi
    
    if [ "$DEPLOYMENT_STATE" == "FAILED" ]; then
        echo -e "${RED}✗ Deployment failed${NC}"
        exit 1
    fi
    
    if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
        echo -e "${RED}✗ Timeout waiting for deployment${NC}"
        echo -e "${YELLOW}Check AWS Console for more details${NC}"
        exit 1
    fi
done

echo ""

# Get the application URL
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""

APP_URL=$(aws lightsail get-container-services \
    --service-name "$SERVICE_NAME" \
    --query 'containerServices[0].url' \
    --output text)

echo -e "${CYAN}Your application is available at:${NC}"
echo -e "${YELLOW}  $APP_URL${NC}"
echo ""

echo -e "${CYAN}Next Steps:${NC}"
echo -e "${NC}1. Visit your application URL to verify it's working${NC}"
echo -e "${NC}2. Set up a custom domain (optional)${NC}"
echo -e "${NC}3. Configure SSL certificate${NC}"
echo -e "${NC}4. Review and adjust environment variables as needed${NC}"
echo ""

echo -e "${CYAN}Useful Commands:${NC}"
echo -e "${GRAY}  View logs: aws lightsail get-container-log --service-name $SERVICE_NAME --container-name backend${NC}"
echo -e "${GRAY}  View service: aws lightsail get-container-services --service-name $SERVICE_NAME${NC}"
echo -e "${GRAY}  Delete service: aws lightsail delete-container-service --service-name $SERVICE_NAME${NC}"
echo ""

echo -e "${CYAN}Documentation: See AWS_LIGHTSAIL_GUIDE.md for more details${NC}"

