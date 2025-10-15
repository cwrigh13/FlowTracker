# FlowTracker Simple Demo Setup (No Database Required)
# This script sets up a demo environment using mock data

Write-Host "Setting up FlowTracker Simple Demo Environment..." -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

# Navigate to project root
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed. Please install Node.js 16+ first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Prerequisites check passed" -ForegroundColor Green
Write-Host ""

# Step 1: Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "Frontend dependencies installed" -ForegroundColor Green

# Step 2: Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "Backend dependencies installed" -ForegroundColor Green

# Step 3: Create mock API configuration
Write-Host "Creating mock API configuration..." -ForegroundColor Yellow

# Create mock .env file
$mockEnvContent = @"
# Mock Demo Environment Configuration
NODE_ENV=mock_demo
PORT=3001
DEMO_MODE=true
MOCK_API=true

# Mock database settings (not used)
DATABASE_URL=mock://localhost:5432/flowtracker_demo
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flowtracker_demo
DB_USER=postgres
DB_PASSWORD=flowtracker2024

# JWT Configuration
JWT_SECRET=demo_jwt_secret_key_for_development_only
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Frontend URL
FRONTEND_URL=http://localhost:3000
"@

$mockEnvContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "Mock environment configuration created" -ForegroundColor Green

# Step 4: Create mock data file
Write-Host "Creating mock data..." -ForegroundColor Yellow

$mockDataContent = @"
// Mock data for FlowTracker demo
export const mockUsers = [
    {
        id: '550e8400-e29b-41d4-a716-446655440001',
        library_id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'admin@demo.library.com',
        password_hash: '$2b$10$rQZ8kL9vJ8K9vJ8K9vJ8K9uJ8K9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K',
        first_name: 'Demo',
        last_name: 'Admin',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440002',
        library_id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'manager@demo.library.com',
        password_hash: '$2b$10$rQZ8kL9vJ8K9vJ8K9vJ8K9uJ8K9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K',
        first_name: 'Demo',
        last_name: 'Manager',
        role: 'manager',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440003',
        library_id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'staff@demo.library.com',
        password_hash: '$2b$10$rQZ8kL9vJ8K9vJ8K9vJ8K9uJ8K9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K',
        first_name: 'Demo',
        last_name: 'Staff',
        role: 'staff',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440004',
        library_id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'viewer@demo.library.com',
        password_hash: '$2b$10$rQZ8kL9vJ8K9vJ8K9vJ8K9uJ8K9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K',
        first_name: 'Demo',
        last_name: 'Viewer',
        role: 'viewer',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

export const mockLibrary = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Demo Library',
    code: 'DEMO',
    description: 'Demo Library for FlowTracker showcase',
    address: '123 Demo Street, Demo City, DC 12345',
    phone: '(555) 123-DEMO',
    email: 'demo@library.com',
    website: 'https://demo.library.com',
    settings: {},
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
};

export const mockCollections = [
    {
        id: '550e8400-e29b-41d4-a716-446655440010',
        library_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Newly Reported',
        description: 'Issues just submitted by staff or patrons',
        colour: '#EF4444',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440011',
        library_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Under Assessment',
        description: 'Issues being evaluated and prioritized',
        colour: '#F59E0B',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440012',
        library_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Awaiting Parts',
        description: 'Issues waiting for parts or materials',
        colour: '#8B5CF6',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440013',
        library_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'In Repair',
        description: 'Issues currently being fixed',
        colour: '#3B82F6',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440014',
        library_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Resolved/Ready for Circulation',
        description: 'Issues completed and ready for use',
        colour: '#10B981',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

export const mockIssues = [
    {
        id: '550e8400-e29b-41d4-a716-446655440020',
        library_id: '550e8400-e29b-41d4-a716-446655440000',
        collection_id: '550e8400-e29b-41d4-a716-446655440010',
        title: 'Broken 3D Printer',
        description: 'The MakerBot 3D printer in the makerspace is showing error code E-123 and not heating properly. Patrons are unable to use it for their projects.',
        status: 'open',
        priority: 'high',
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        assigned_to: '550e8400-e29b-41d4-a716-446655440002',
        due_date: null,
        resolved_at: null,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440021',
        library_id: '550e8400-e29b-41d4-a716-446655440000',
        collection_id: '550e8400-e29b-41d4-a716-446655440011',
        title: 'Missing Catalog Record',
        description: 'New book "The Future of Libraries" by John Smith is missing from the online catalog. Physical copy is on shelf but not discoverable.',
        status: 'open',
        priority: 'medium',
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        assigned_to: null,
        due_date: null,
        resolved_at: null,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440022',
        library_id: '550e8400-e29b-41d4-a716-446655440000',
        collection_id: '550e8400-e29b-41d4-a716-446655440012',
        title: 'VR Headset Battery Replacement',
        description: 'Oculus VR headset battery is not holding charge. Need replacement battery and proper tools for safe replacement.',
        status: 'open',
        priority: 'medium',
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        assigned_to: '550e8400-e29b-41d4-a716-446655440002',
        due_date: null,
        resolved_at: null,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440023',
        library_id: '550e8400-e29b-41d4-a716-446655440000',
        collection_id: '550e8400-e29b-41d4-a716-446655440013',
        title: 'Laptop Screen Repair',
        description: 'Dell laptop screen has cracked glass. Screen replacement part has arrived and repair is in progress.',
        status: 'in_progress',
        priority: 'high',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        assigned_to: '550e8400-e29b-41d4-a716-446655440002',
        due_date: null,
        resolved_at: null,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440024',
        library_id: '550e8400-e29b-41d4-a716-446655440000',
        collection_id: '550e8400-e29b-41d4-a716-446655440014',
        title: 'Camera Lens Cleaning',
        description: 'DSLR camera lens was cleaned and calibrated. Ready for circulation again.',
        status: 'resolved',
        priority: 'low',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        assigned_to: '550e8400-e29b-41d4-a716-446655440002',
        due_date: null,
        resolved_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440025',
        library_id: '550e8400-e29b-41d4-a716-446655440000',
        collection_id: '550e8400-e29b-41d4-a716-446655440010',
        title: 'Tablet Stylus Missing',
        description: 'iPad stylus for the library tablet is missing. Patron returned device without the stylus.',
        status: 'open',
        priority: 'low',
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        assigned_to: null,
        due_date: null,
        resolved_at: null,
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440026',
        library_id: '550e8400-e29b-41d4-a716-446655440000',
        collection_id: '550e8400-e29b-41d4-a716-446655440011',
        title: 'WiFi Connectivity Issues',
        description: 'Multiple patrons reporting intermittent WiFi connectivity in the study rooms on the second floor.',
        status: 'open',
        priority: 'high',
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        assigned_to: '550e8400-e29b-41d4-a716-446655440001',
        due_date: null,
        resolved_at: null,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440027',
        library_id: '550e8400-e29b-41d4-a716-446655440000',
        collection_id: '550e8400-e29b-41d4-a716-446655440012',
        title: 'Drone Propeller Replacement',
        description: 'DJI drone needs new propellers. Current ones are chipped and affecting flight stability.',
        status: 'open',
        priority: 'medium',
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        assigned_to: '550e8400-e29b-41d4-a716-446655440002',
        due_date: null,
        resolved_at: null,
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
    }
];
"@

# Create mock data directory if it doesn't exist
if (!(Test-Path "src\data")) {
    New-Item -ItemType Directory -Path "src\data" -Force
}

$mockDataContent | Out-File -FilePath "src\data\mockData.ts" -Encoding UTF8
Write-Host "Mock data created" -ForegroundColor Green

# Step 5: Build backend
Write-Host "Building backend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "Backend built successfully" -ForegroundColor Green

# Return to root directory
Set-Location ..

Write-Host ""
Write-Host "Simple Demo Environment Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "This demo uses mock data instead of a database." -ForegroundColor Yellow
Write-Host "No PostgreSQL installation required!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Demo Environment Details:" -ForegroundColor Cyan
Write-Host "• Backend API: http://localhost:3001 (Mock Mode)" -ForegroundColor White
Write-Host "• Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Demo Users (password: 'demo123' for all):" -ForegroundColor Cyan
Write-Host "• Admin: admin@demo.library.com" -ForegroundColor White
Write-Host "• Manager: manager@demo.library.com" -ForegroundColor White
Write-Host "• Staff: staff@demo.library.com" -ForegroundColor White
Write-Host "• Viewer: viewer@demo.library.com" -ForegroundColor White
Write-Host ""
Write-Host "To start the demo environment:" -ForegroundColor Cyan
Write-Host "1. Backend: cd backend; npm run dev" -ForegroundColor White
Write-Host "2. Frontend: npm run dev (in root directory)" -ForegroundColor White
Write-Host ""
Write-Host "Demo includes:" -ForegroundColor Cyan
Write-Host "• 1 Demo Library" -ForegroundColor White
Write-Host "• 4 Demo Users with different roles" -ForegroundColor White
Write-Host "• 5 Issue Collections (Kanban columns)" -ForegroundColor White
Write-Host "• 8 Sample Issues across different statuses" -ForegroundColor White
Write-Host "• Mock API responses (no database needed)" -ForegroundColor White
Write-Host ""
Write-Host "Use the admin account to explore all features!" -ForegroundColor Yellow
