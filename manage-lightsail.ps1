# FlowTracker AWS Lightsail Management Script
# This script provides easy management commands for your Lightsail deployment

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('status', 'logs', 'restart', 'scale', 'metrics', 'backup', 'update-env', 'delete')]
    [string]$Action,
    
    [string]$ServiceName = "flowtracker",
    [string]$DatabaseName = "flowtracker-db",
    [string]$Container = "backend",
    [int]$Scale,
    [string]$Power,
    [int]$Hours = 1
)

$ErrorActionPreference = "Stop"

# Colors
$GREEN = "Green"
$RED = "Red"
$YELLOW = "Yellow"
$CYAN = "Cyan"

Write-Host "=====================================" -ForegroundColor $CYAN
Write-Host "FlowTracker Lightsail Management" -ForegroundColor $CYAN
Write-Host "=====================================" -ForegroundColor $CYAN
Write-Host ""

switch ($Action) {
    'status' {
        Write-Host "Checking service status..." -ForegroundColor $YELLOW
        Write-Host ""
        
        # Container Service Status
        Write-Host "Container Service:" -ForegroundColor $CYAN
        $serviceInfo = aws lightsail get-container-services --service-name $ServiceName | ConvertFrom-Json
        
        if ($serviceInfo.containerServices.Count -gt 0) {
            $service = $serviceInfo.containerServices[0]
            Write-Host "  Name: $($service.containerServiceName)" -ForegroundColor $GREEN
            Write-Host "  State: $($service.state)" -ForegroundColor $(if ($service.state -eq "RUNNING") { $GREEN } else { $YELLOW })
            Write-Host "  Power: $($service.power)" -ForegroundColor $GREEN
            Write-Host "  Scale: $($service.scale)" -ForegroundColor $GREEN
            Write-Host "  URL: $($service.url)" -ForegroundColor $GREEN
            
            if ($service.currentDeployment) {
                Write-Host "  Deployment State: $($service.currentDeployment.state)" -ForegroundColor $(if ($service.currentDeployment.state -eq "ACTIVE") { $GREEN } else { $YELLOW })
                Write-Host "  Version: $($service.currentDeployment.version)" -ForegroundColor $GREEN
            }
        } else {
            Write-Host "  Service not found!" -ForegroundColor $RED
        }
        
        Write-Host ""
        
        # Database Status
        Write-Host "Database:" -ForegroundColor $CYAN
        try {
            $dbInfo = aws lightsail get-relational-database --relational-database-name $DatabaseName | ConvertFrom-Json
            $db = $dbInfo.relationalDatabase
            
            Write-Host "  Name: $($db.name)" -ForegroundColor $GREEN
            Write-Host "  State: $($db.state)" -ForegroundColor $(if ($db.state -eq "available") { $GREEN } else { $YELLOW })
            Write-Host "  Engine: $($db.engine) $($db.engineVersion)" -ForegroundColor $GREEN
            Write-Host "  Endpoint: $($db.masterEndpoint.address):$($db.masterEndpoint.port)" -ForegroundColor $GREEN
            Write-Host "  Storage: $($db.diskSize) GB" -ForegroundColor $GREEN
            Write-Host "  Backup Retention: $($db.backupRetentionEnabled)" -ForegroundColor $GREEN
        } catch {
            Write-Host "  Database not found or error accessing!" -ForegroundColor $RED
        }
    }
    
    'logs' {
        Write-Host "Fetching logs for container: $Container" -ForegroundColor $YELLOW
        Write-Host "Time range: Last $Hours hour(s)" -ForegroundColor $YELLOW
        Write-Host ""
        
        $endTime = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
        $startTime = $endTime - ($Hours * 3600)
        
        try {
            $logs = aws lightsail get-container-log `
                --service-name $ServiceName `
                --container-name $Container `
                --start-time $startTime `
                --end-time $endTime | ConvertFrom-Json
            
            if ($logs.logEvents.Count -gt 0) {
                Write-Host "Found $($logs.logEvents.Count) log entries:" -ForegroundColor $GREEN
                Write-Host ""
                
                foreach ($entry in $logs.logEvents) {
                    $timestamp = [DateTimeOffset]::FromUnixTimeMilliseconds($entry.createdAt).LocalDateTime
                    Write-Host "[$timestamp] $($entry.message)" -ForegroundColor $CYAN
                }
            } else {
                Write-Host "No logs found for the specified time range." -ForegroundColor $YELLOW
            }
        } catch {
            Write-Host "Error fetching logs: $_" -ForegroundColor $RED
        }
    }
    
    'restart' {
        Write-Host "Restarting service by forcing a new deployment..." -ForegroundColor $YELLOW
        Write-Host ""
        
        # Get current deployment
        $serviceInfo = aws lightsail get-container-services --service-name $ServiceName | ConvertFrom-Json
        $deployment = $serviceInfo.containerServices[0].currentDeployment
        
        if ($deployment) {
            # Recreate deployment with same configuration
            $deployConfig = @{
                containers = $deployment.containers
                publicEndpoint = $deployment.publicEndpoint
            } | ConvertTo-Json -Depth 10
            
            $deployConfig | Out-File -FilePath "temp-deploy.json" -Encoding UTF8
            
            aws lightsail create-container-service-deployment `
                --service-name $ServiceName `
                --cli-input-json "file://temp-deploy.json"
            
            Remove-Item "temp-deploy.json" -Force
            
            Write-Host "✓ Restart initiated" -ForegroundColor $GREEN
            Write-Host "Monitor progress with: .\manage-lightsail.ps1 -Action status" -ForegroundColor $CYAN
        } else {
            Write-Host "✗ No current deployment found" -ForegroundColor $RED
        }
    }
    
    'scale' {
        if (-not $Scale) {
            Write-Host "✗ Please specify -Scale parameter (number of containers)" -ForegroundColor $RED
            exit 1
        }
        
        Write-Host "Scaling service to $Scale container(s)..." -ForegroundColor $YELLOW
        
        $params = @(
            "--service-name", $ServiceName,
            "--scale", $Scale
        )
        
        if ($Power) {
            Write-Host "Also changing power to: $Power" -ForegroundColor $YELLOW
            $params += @("--power", $Power)
        }
        
        aws lightsail update-container-service @params
        
        Write-Host "✓ Scale operation initiated" -ForegroundColor $GREEN
        Write-Host "Monitor progress with: .\manage-lightsail.ps1 -Action status" -ForegroundColor $CYAN
    }
    
    'metrics' {
        Write-Host "Fetching metrics for last $Hours hour(s)..." -ForegroundColor $YELLOW
        Write-Host ""
        
        $endTime = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
        $startTime = $endTime - ($Hours * 3600)
        
        # CPU Utilization
        Write-Host "CPU Utilization:" -ForegroundColor $CYAN
        $cpuMetrics = aws lightsail get-container-service-metric-data `
            --service-name $ServiceName `
            --metric-name CPUUtilization `
            --start-time $startTime `
            --end-time $endTime `
            --period 300 `
            --statistics Average | ConvertFrom-Json
        
        if ($cpuMetrics.metricData.Count -gt 0) {
            $avgCpu = ($cpuMetrics.metricData.average | Measure-Object -Average).Average
            Write-Host "  Average: $([math]::Round($avgCpu, 2))%" -ForegroundColor $GREEN
            Write-Host "  Data points: $($cpuMetrics.metricData.Count)" -ForegroundColor $GREEN
        } else {
            Write-Host "  No data available" -ForegroundColor $YELLOW
        }
        
        Write-Host ""
        
        # Memory Utilization
        Write-Host "Memory Utilization:" -ForegroundColor $CYAN
        $memMetrics = aws lightsail get-container-service-metric-data `
            --service-name $ServiceName `
            --metric-name MemoryUtilization `
            --start-time $startTime `
            --end-time $endTime `
            --period 300 `
            --statistics Average | ConvertFrom-Json
        
        if ($memMetrics.metricData.Count -gt 0) {
            $avgMem = ($memMetrics.metricData.average | Measure-Object -Average).Average
            Write-Host "  Average: $([math]::Round($avgMem, 2))%" -ForegroundColor $GREEN
            Write-Host "  Data points: $($memMetrics.metricData.Count)" -ForegroundColor $GREEN
        } else {
            Write-Host "  No data available" -ForegroundColor $YELLOW
        }
    }
    
    'backup' {
        Write-Host "Creating database snapshot..." -ForegroundColor $YELLOW
        
        $snapshotName = "$DatabaseName-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        
        aws lightsail create-relational-database-snapshot `
            --relational-database-name $DatabaseName `
            --relational-database-snapshot-name $snapshotName
        
        Write-Host "✓ Backup initiated: $snapshotName" -ForegroundColor $GREEN
        Write-Host ""
        Write-Host "List snapshots with:" -ForegroundColor $CYAN
        Write-Host "  aws lightsail get-relational-database-snapshots" -ForegroundColor $CYAN
    }
    
    'update-env' {
        Write-Host "Update Environment Variables:" -ForegroundColor $YELLOW
        Write-Host ""
        Write-Host "To update environment variables:" -ForegroundColor $CYAN
        Write-Host "1. Edit lightsail-containers.json" -ForegroundColor $GREEN
        Write-Host "2. Update the environment variables in the backend container section" -ForegroundColor $GREEN
        Write-Host "3. Run the deployment script:" -ForegroundColor $GREEN
        Write-Host "   .\deploy-lightsail.ps1 -UpdateOnly" -ForegroundColor $YELLOW
        Write-Host ""
        Write-Host "Or manually trigger deployment:" -ForegroundColor $CYAN
        Write-Host "   aws lightsail create-container-service-deployment --service-name $ServiceName --cli-input-json file://lightsail-containers.json" -ForegroundColor $YELLOW
    }
    
    'delete' {
        Write-Host "WARNING: This will delete the Lightsail container service!" -ForegroundColor $RED
        Write-Host "The database will NOT be deleted (must be done separately)." -ForegroundColor $YELLOW
        Write-Host ""
        Write-Host "Are you sure you want to continue? (yes/no): " -ForegroundColor $RED -NoNewline
        $confirmation = Read-Host
        
        if ($confirmation -eq "yes") {
            Write-Host ""
            Write-Host "Deleting container service..." -ForegroundColor $YELLOW
            
            aws lightsail delete-container-service --service-name $ServiceName
            
            Write-Host "✓ Deletion initiated" -ForegroundColor $GREEN
            Write-Host ""
            Write-Host "To also delete the database:" -ForegroundColor $CYAN
            Write-Host "  aws lightsail delete-relational-database --relational-database-name $DatabaseName --skip-final-snapshot" -ForegroundColor $YELLOW
            Write-Host ""
            Write-Host "Or with final backup:" -ForegroundColor $CYAN
            Write-Host "  aws lightsail delete-relational-database --relational-database-name $DatabaseName --final-relational-database-snapshot-name final-backup" -ForegroundColor $YELLOW
        } else {
            Write-Host "Cancelled." -ForegroundColor $YELLOW
        }
    }
}

Write-Host ""
Write-Host "For more commands, see AWS_LIGHTSAIL_GUIDE.md" -ForegroundColor $CYAN

