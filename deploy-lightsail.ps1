# FlowTracker AWS Lightsail Deployment Script
# This script automates the deployment of FlowTracker to AWS Lightsail

param(
    [string]$ServiceName = "flowtracker",
    [string]$DatabaseName = "flowtracker-db",
    [string]$Region = "us-east-1",
    [string]$ContainerPower = "small",
    [int]$ContainerScale = 1,
    [string]$DatabaseBundle = "micro_2_0",
    [switch]$SkipDatabase,
    [switch]$UpdateOnly
)

$ErrorActionPreference = "Stop"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "FlowTracker AWS Lightsail Deployment" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if AWS CLI is installed
try {
    $awsVersion = aws --version
    Write-Host "✓ AWS CLI found: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ AWS CLI not found. Please install AWS CLI first." -ForegroundColor Red
    Write-Host "Download from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker not found. Please install Docker first." -ForegroundColor Red
    Write-Host "Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Function to check if a Lightsail service exists
function Test-LightsailService {
    param([string]$Name)
    try {
        $result = aws lightsail get-container-services --service-name $Name 2>&1
        return $?
    } catch {
        return $false
    }
}

# Function to check if a database exists
function Test-LightsailDatabase {
    param([string]$Name)
    try {
        $result = aws lightsail get-relational-database --relational-database-name $Name 2>&1
        return $?
    } catch {
        return $false
    }
}

# Step 1: Create Database (if not skipped and not updating)
if (-not $SkipDatabase -and -not $UpdateOnly) {
    Write-Host "Step 1: Creating PostgreSQL Database" -ForegroundColor Yellow
    Write-Host "-------------------------------------" -ForegroundColor Yellow
    
    if (Test-LightsailDatabase -Name $DatabaseName) {
        Write-Host "Database '$DatabaseName' already exists. Skipping creation." -ForegroundColor Yellow
    } else {
        Write-Host "Database Bundle: $DatabaseBundle" -ForegroundColor Cyan
        Write-Host "Region: $Region" -ForegroundColor Cyan
        
        # Generate a random password
        $Password = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 20 | ForEach-Object {[char]$_})
        $Password = $Password + "!A1" # Ensure it meets requirements
        
        Write-Host ""
        Write-Host "Creating database... (This will take 10-15 minutes)" -ForegroundColor Cyan
        
        aws lightsail create-relational-database `
            --relational-database-name $DatabaseName `
            --relational-database-blueprint-id postgres_15 `
            --relational-database-bundle-id $DatabaseBundle `
            --master-database-name flowtracker `
            --master-username flowtrackeradmin `
            --master-user-password $Password `
            --publicly-accessible `
            --region $Region
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "✗ Failed to create database" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "✓ Database creation initiated" -ForegroundColor Green
        Write-Host ""
        Write-Host "IMPORTANT: Save these credentials securely!" -ForegroundColor Red
        Write-Host "Database Name: flowtracker" -ForegroundColor Yellow
        Write-Host "Username: flowtrackeradmin" -ForegroundColor Yellow
        Write-Host "Password: $Password" -ForegroundColor Yellow
        Write-Host ""
        
        # Save credentials to file
        $credFile = "lightsail-db-credentials.txt"
        @"
FlowTracker Database Credentials
================================
Database Name: flowtracker
Username: flowtrackeradmin
Password: $Password

Created: $(Get-Date)
"@ | Out-File -FilePath $credFile -Encoding UTF8
        
        Write-Host "Credentials saved to: $credFile" -ForegroundColor Green
        Write-Host ""
        
        # Wait for database to be available
        Write-Host "Waiting for database to become available..." -ForegroundColor Cyan
        $maxAttempts = 60
        $attempt = 0
        
        do {
            Start-Sleep -Seconds 15
            $attempt++
            $status = aws lightsail get-relational-database `
                --relational-database-name $DatabaseName `
                --query 'relationalDatabase.state' `
                --output text 2>&1
            
            Write-Host "  Attempt $attempt/$maxAttempts - Status: $status" -ForegroundColor Gray
            
            if ($status -eq "available") {
                Write-Host "✓ Database is now available" -ForegroundColor Green
                break
            }
            
            if ($attempt -ge $maxAttempts) {
                Write-Host "✗ Timeout waiting for database" -ForegroundColor Red
                Write-Host "Please check AWS Console for status" -ForegroundColor Yellow
                exit 1
            }
        } while ($true)
        
        # Get database endpoint
        $dbEndpoint = aws lightsail get-relational-database `
            --relational-database-name $DatabaseName `
            --query 'relationalDatabase.masterEndpoint.address' `
            --output text
        
        Write-Host ""
        Write-Host "Database Endpoint: $dbEndpoint" -ForegroundColor Green
        Write-Host ""
        
        # Update credentials file with endpoint
        @"

Database Endpoint: $dbEndpoint
Connection String: postgresql://flowtrackeradmin:$Password@$dbEndpoint:5432/flowtracker
"@ | Out-File -FilePath $credFile -Append -Encoding UTF8
    }
    
    Write-Host ""
}

# Step 2: Create Container Service (if not updating)
if (-not $UpdateOnly) {
    Write-Host "Step 2: Creating Container Service" -ForegroundColor Yellow
    Write-Host "-----------------------------------" -ForegroundColor Yellow
    
    if (Test-LightsailService -Name $ServiceName) {
        Write-Host "Container service '$ServiceName' already exists. Skipping creation." -ForegroundColor Yellow
    } else {
        Write-Host "Service Name: $ServiceName" -ForegroundColor Cyan
        Write-Host "Power: $ContainerPower" -ForegroundColor Cyan
        Write-Host "Scale: $ContainerScale" -ForegroundColor Cyan
        Write-Host "Region: $Region" -ForegroundColor Cyan
        Write-Host ""
        
        aws lightsail create-container-service `
            --service-name $ServiceName `
            --power $ContainerPower `
            --scale $ContainerScale `
            --region $Region
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "✗ Failed to create container service" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "✓ Container service creation initiated" -ForegroundColor Green
        Write-Host ""
        
        # Wait for service to be active
        Write-Host "Waiting for container service to become active..." -ForegroundColor Cyan
        $maxAttempts = 20
        $attempt = 0
        
        do {
            Start-Sleep -Seconds 10
            $attempt++
            $status = aws lightsail get-container-services `
                --service-name $ServiceName `
                --query 'containerServices[0].state' `
                --output text 2>&1
            
            Write-Host "  Attempt $attempt/$maxAttempts - Status: $status" -ForegroundColor Gray
            
            if ($status -eq "ACTIVE" -or $status -eq "RUNNING") {
                Write-Host "✓ Container service is now active" -ForegroundColor Green
                break
            }
            
            if ($attempt -ge $maxAttempts) {
                Write-Host "✗ Timeout waiting for container service" -ForegroundColor Red
                exit 1
            }
        } while ($true)
    }
    
    Write-Host ""
}

# Step 3: Build Docker Images
Write-Host "Step 3: Building Docker Images" -ForegroundColor Yellow
Write-Host "-------------------------------" -ForegroundColor Yellow

Write-Host "Building backend image..." -ForegroundColor Cyan
Push-Location backend
docker build -t flowtracker-backend:latest .
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to build backend image" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "✓ Backend image built successfully" -ForegroundColor Green

Write-Host ""
Write-Host "Building frontend image..." -ForegroundColor Cyan
docker build -t flowtracker-frontend:latest .
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to build frontend image" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend image built successfully" -ForegroundColor Green

Write-Host ""

# Step 4: Push Images to Lightsail
Write-Host "Step 4: Pushing Images to Lightsail" -ForegroundColor Yellow
Write-Host "------------------------------------" -ForegroundColor Yellow

Write-Host "Pushing backend image..." -ForegroundColor Cyan
$backendOutput = aws lightsail push-container-image `
    --service-name $ServiceName `
    --label backend `
    --image flowtracker-backend:latest 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to push backend image" -ForegroundColor Red
    Write-Host $backendOutput -ForegroundColor Red
    exit 1
}

# Extract image name from output
$backendImageName = ($backendOutput | Select-String -Pattern ":$ServiceName\.backend\.\d+").Matches.Value
Write-Host "✓ Backend image pushed: $backendImageName" -ForegroundColor Green

Write-Host ""
Write-Host "Pushing frontend image..." -ForegroundColor Cyan
$frontendOutput = aws lightsail push-container-image `
    --service-name $ServiceName `
    --label frontend `
    --image flowtracker-frontend:latest 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to push frontend image" -ForegroundColor Red
    Write-Host $frontendOutput -ForegroundColor Red
    exit 1
}

# Extract image name from output
$frontendImageName = ($frontendOutput | Select-String -Pattern ":$ServiceName\.frontend\.\d+").Matches.Value
Write-Host "✓ Frontend image pushed: $frontendImageName" -ForegroundColor Green

Write-Host ""

# Step 5: Update Deployment Configuration
Write-Host "Step 5: Updating Deployment Configuration" -ForegroundColor Yellow
Write-Host "------------------------------------------" -ForegroundColor Yellow

# Read the template
$configFile = "lightsail-containers.json"
if (-not (Test-Path $configFile)) {
    Write-Host "✗ Configuration file not found: $configFile" -ForegroundColor Red
    exit 1
}

$config = Get-Content $configFile -Raw | ConvertFrom-Json

# Update image names
$config.containers.backend.image = $backendImageName
$config.containers.frontend.image = $frontendImageName

Write-Host "Updated configuration:" -ForegroundColor Cyan
Write-Host "  Backend image: $backendImageName" -ForegroundColor Gray
Write-Host "  Frontend image: $frontendImageName" -ForegroundColor Gray

# Save updated config
$deployConfigFile = "lightsail-containers-deploy.json"
$config | ConvertTo-Json -Depth 10 | Set-Content $deployConfigFile

Write-Host "✓ Configuration updated: $deployConfigFile" -ForegroundColor Green
Write-Host ""

# Step 6: Deploy to Lightsail
Write-Host "Step 6: Deploying to Lightsail" -ForegroundColor Yellow
Write-Host "-------------------------------" -ForegroundColor Yellow

Write-Host "IMPORTANT: Make sure you've updated the environment variables in $deployConfigFile" -ForegroundColor Yellow
Write-Host "Press Enter to continue with deployment, or Ctrl+C to cancel..." -ForegroundColor Yellow
$null = Read-Host

aws lightsail create-container-service-deployment `
    --service-name $ServiceName `
    --cli-input-json "file://$deployConfigFile"

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to create deployment" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Deployment initiated" -ForegroundColor Green
Write-Host ""

# Wait for deployment to complete
Write-Host "Waiting for deployment to complete..." -ForegroundColor Cyan
$maxAttempts = 40
$attempt = 0

do {
    Start-Sleep -Seconds 15
    $attempt++
    
    $deploymentState = aws lightsail get-container-services `
        --service-name $ServiceName `
        --query 'containerServices[0].currentDeployment.state' `
        --output text 2>&1
    
    Write-Host "  Attempt $attempt/$maxAttempts - Deployment State: $deploymentState" -ForegroundColor Gray
    
    if ($deploymentState -eq "ACTIVE") {
        Write-Host "✓ Deployment completed successfully" -ForegroundColor Green
        break
    }
    
    if ($deploymentState -eq "FAILED") {
        Write-Host "✗ Deployment failed" -ForegroundColor Red
        exit 1
    }
    
    if ($attempt -ge $maxAttempts) {
        Write-Host "✗ Timeout waiting for deployment" -ForegroundColor Red
        Write-Host "Check AWS Console for more details" -ForegroundColor Yellow
        exit 1
    }
} while ($true)

Write-Host ""

# Get the application URL
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

$appUrl = aws lightsail get-container-services `
    --service-name $ServiceName `
    --query 'containerServices[0].url' `
    --output text

Write-Host "Your application is available at:" -ForegroundColor Cyan
Write-Host "  $appUrl" -ForegroundColor Yellow
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Visit your application URL to verify it's working" -ForegroundColor White
Write-Host "2. Set up a custom domain (optional)" -ForegroundColor White
Write-Host "3. Configure SSL certificate" -ForegroundColor White
Write-Host "4. Review and adjust environment variables as needed" -ForegroundColor White
Write-Host ""

Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  View logs: aws lightsail get-container-log --service-name $ServiceName --container-name backend" -ForegroundColor Gray
Write-Host "  View service: aws lightsail get-container-services --service-name $ServiceName" -ForegroundColor Gray
Write-Host "  Delete service: aws lightsail delete-container-service --service-name $ServiceName" -ForegroundColor Gray
Write-Host ""

Write-Host "Documentation: See AWS_LIGHTSAIL_GUIDE.md for more details" -ForegroundColor Cyan

