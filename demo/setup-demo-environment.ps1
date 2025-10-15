# FlowTracker Demo Environment Setup Script
# This script sets up a complete demo environment for the Library Items Issues Tracker

Write-Host "Setting up FlowTracker Demo Environment..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed. Please install Node.js 16+ first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if PostgreSQL is installed
try {
    $psqlVersion = psql --version
    Write-Host "PostgreSQL found: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "PostgreSQL is not installed. Please install PostgreSQL 12+ first." -ForegroundColor Red
    Write-Host "Download from: https://www.postgresql.org/download/" -ForegroundColor Yellow
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

# Step 3: Create demo environment configuration
Write-Host "Creating demo environment configuration..." -ForegroundColor Yellow

# Create demo .env file
$demoEnvContent = @"
# Demo Environment Configuration
DATABASE_URL=postgresql://postgres:flowtracker2024@localhost:5432/flowtracker_demo
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flowtracker_demo
DB_USER=postgres
DB_PASSWORD=flowtracker2024

# JWT Configuration
JWT_SECRET=demo_jwt_secret_key_for_development_only
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=demo

# Email Configuration (demo mode - no real emails sent)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=demo@example.com
SMTP_PASS=demo_password
FROM_EMAIL=demo@flowtracker.com

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Rate Limiting (relaxed for demo)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000

# Demo mode settings
DEMO_MODE=true
DEMO_DATA_AUTO_CREATE=true
"@

$demoEnvContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "Demo environment configuration created" -ForegroundColor Green

# Step 4: Create demo database
Write-Host "Creating demo database..." -ForegroundColor Yellow

# Connect to PostgreSQL and create demo database
$createDbScript = @"
-- Create demo database if it doesn't exist
SELECT 'CREATE DATABASE flowtracker_demo'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'flowtracker_demo')\gexec
"@

$createDbScript | psql -U postgres -h localhost -d postgres
if ($LASTEXITCODE -ne 0) {
    Write-Host "Database creation failed or database already exists" -ForegroundColor Yellow
}

Write-Host "Demo database created or verified" -ForegroundColor Green

# Step 5: Set up database schema and demo data
Write-Host "Setting up database schema and demo data..." -ForegroundColor Yellow

# Create demo schema with sample data
$demoSchemaContent = @"
-- FlowTracker Demo Database Schema with Sample Data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Libraries table (tenants)
CREATE TABLE IF NOT EXISTS libraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(255),
    email VARCHAR(255),
    website VARCHAR(255),
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'staff',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(library_id, email)
);

-- Collections table (issue categories)
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    colour VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(library_id, name)
);

-- Issues table
CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    created_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Issue comments table
CREATE TABLE IF NOT EXISTS issue_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_issues_library_id ON issues(library_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);
CREATE INDEX IF NOT EXISTS idx_issues_assigned_to ON issues(assigned_to);
CREATE INDEX IF NOT EXISTS idx_issues_created_by ON issues(created_by);
CREATE INDEX IF NOT EXISTS idx_issues_collection_id ON issues(collection_id);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at);

CREATE INDEX IF NOT EXISTS idx_issue_comments_issue_id ON issue_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_user_id ON issue_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_users_library_id ON users(library_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_collections_library_id ON collections(library_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS `$`
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
`$` language 'plpgsql';

DROP TRIGGER IF EXISTS update_libraries_updated_at ON libraries;
CREATE TRIGGER update_libraries_updated_at BEFORE UPDATE ON libraries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_collections_updated_at ON collections;
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_issues_updated_at ON issues;
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_issue_comments_updated_at ON issue_comments;
CREATE TRIGGER update_issue_comments_updated_at BEFORE UPDATE ON issue_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo library
INSERT INTO libraries (id, name, code, description, address, phone, email, website) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'Demo Library', 'DEMO', 'Demo Library for FlowTracker showcase', '123 Demo Street, Demo City, DC 12345', '(555) 123-DEMO', 'demo@library.com', 'https://demo.library.com')
ON CONFLICT (code) DO NOTHING;

-- Insert demo users
INSERT INTO users (id, library_id, email, password_hash, first_name, last_name, role) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'admin@demo.library.com', '$2b$10$rQZ8kL9vJ8K9vJ8K9vJ8K9uJ8K9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K', 'Demo', 'Admin', 'admin'),
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'manager@demo.library.com', '$2b$10$rQZ8kL9vJ8K9vJ8K9vJ8K9uJ8K9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K', 'Demo', 'Manager', 'manager'),
    ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'staff@demo.library.com', '$2b$10$rQZ8kL9vJ8K9vJ8K9vJ8K9uJ8K9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K', 'Demo', 'Staff', 'staff'),
    ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'viewer@demo.library.com', '$2b$10$rQZ8kL9vJ8K9vJ8K9vJ8K9uJ8K9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K', 'Demo', 'Viewer', 'viewer')
ON CONFLICT (library_id, email) DO NOTHING;

-- Insert demo collections
INSERT INTO collections (id, library_id, name, description, colour) VALUES
    ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Newly Reported', 'Issues just submitted by staff or patrons', '#EF4444'),
    ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Under Assessment', 'Issues being evaluated and prioritized', '#F59E0B'),
    ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'Awaiting Parts', 'Issues waiting for parts or materials', '#8B5CF6'),
    ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'In Repair', 'Issues currently being fixed', '#3B82F6'),
    ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440000', 'Resolved/Ready for Circulation', 'Issues completed and ready for use', '#10B981')
ON CONFLICT (library_id, name) DO NOTHING;

-- Insert demo issues
INSERT INTO issues (id, library_id, collection_id, title, description, status, priority, created_by, assigned_to) VALUES
    ('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', 'Broken 3D Printer', 'The MakerBot 3D printer in the makerspace is showing error code E-123 and not heating properly. Patrons are unable to use it for their projects.', 'open', 'high', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002'),
    ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440011', 'Missing Catalog Record', 'New book "The Future of Libraries" by John Smith is missing from the online catalog. Physical copy is on shelf but not discoverable.', 'open', 'medium', '550e8400-e29b-41d4-a716-446655440003', NULL),
    ('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440012', 'VR Headset Battery Replacement', 'Oculus VR headset battery is not holding charge. Need replacement battery and proper tools for safe replacement.', 'open', 'medium', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002'),
    ('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440013', 'Laptop Screen Repair', 'Dell laptop screen has cracked glass. Screen replacement part has arrived and repair is in progress.', 'in_progress', 'high', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002'),
    ('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440014', 'Camera Lens Cleaning', 'DSLR camera lens was cleaned and calibrated. Ready for circulation again.', 'resolved', 'low', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002'),
    ('550e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', 'Tablet Stylus Missing', 'iPad stylus for the library tablet is missing. Patron returned device without the stylus.', 'open', 'low', '550e8400-e29b-41d4-a716-446655440003', NULL),
    ('550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440011', 'WiFi Connectivity Issues', 'Multiple patrons reporting intermittent WiFi connectivity in the study rooms on the second floor.', 'open', 'high', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440012', 'Drone Propeller Replacement', 'DJI drone needs new propellers. Current ones are chipped and affecting flight stability.', 'open', 'medium', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

-- Insert demo comments
INSERT INTO issue_comments (issue_id, user_id, content, is_internal) VALUES
    ('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440003', 'Reported by patron Sarah Johnson at 2:30 PM. She was trying to print a small figurine for her art project.', false),
    ('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440002', 'Contacted MakerBot support. They suggest checking the heating element and thermistor connections.', true),
    ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440003', 'Book is physically present on shelf but not showing in catalog search. ISBN: 978-1234567890', false),
    ('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440002', 'Screen replacement completed. Testing all functions before returning to circulation.', true),
    ('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440002', 'Lens cleaned with proper equipment. Auto-focus tested and working correctly.', true)
ON CONFLICT DO NOTHING;

-- Update timestamps to show realistic demo data
UPDATE issues SET 
    created_at = CURRENT_TIMESTAMP - INTERVAL '5 days',
    updated_at = CURRENT_TIMESTAMP - INTERVAL '2 hours'
WHERE id = '550e8400-e29b-41d4-a716-446655440020';

UPDATE issues SET 
    created_at = CURRENT_TIMESTAMP - INTERVAL '3 days',
    updated_at = CURRENT_TIMESTAMP - INTERVAL '1 day'
WHERE id = '550e8400-e29b-41d4-a716-446655440021';

UPDATE issues SET 
    created_at = CURRENT_TIMESTAMP - INTERVAL '2 days',
    updated_at = CURRENT_TIMESTAMP - INTERVAL '4 hours'
WHERE id = '550e8400-e29b-41d4-a716-446655440022';

UPDATE issues SET 
    created_at = CURRENT_TIMESTAMP - INTERVAL '1 day',
    updated_at = CURRENT_TIMESTAMP - INTERVAL '30 minutes'
WHERE id = '550e8400-e29b-41d4-a716-446655440023';

UPDATE issues SET 
    created_at = CURRENT_TIMESTAMP - INTERVAL '7 days',
    updated_at = CURRENT_TIMESTAMP - INTERVAL '2 hours'
WHERE id = '550e8400-e29b-41d4-a716-446655440024';

UPDATE issues SET 
    created_at = CURRENT_TIMESTAMP - INTERVAL '6 hours',
    updated_at = CURRENT_TIMESTAMP - INTERVAL '6 hours'
WHERE id = '550e8400-e29b-41d4-a716-446655440025';

UPDATE issues SET 
    created_at = CURRENT_TIMESTAMP - INTERVAL '4 hours',
    updated_at = CURRENT_TIMESTAMP - INTERVAL '4 hours'
WHERE id = '550e8400-e29b-41d4-a716-446655440026';

UPDATE issues SET 
    created_at = CURRENT_TIMESTAMP - INTERVAL '8 hours',
    updated_at = CURRENT_TIMESTAMP - INTERVAL '8 hours'
WHERE id = '550e8400-e29b-41d4-a716-446655440027';

-- Set resolved timestamp for completed issue
UPDATE issues SET 
    resolved_at = CURRENT_TIMESTAMP - INTERVAL '2 hours'
WHERE id = '550e8400-e29b-41d4-a716-446655440024';
"@

$demoSchemaContent | psql -U postgres -h localhost -d flowtracker_demo
if ($LASTEXITCODE -ne 0) {
    Write-Host "Database schema setup failed" -ForegroundColor Red
    exit 1
}

Write-Host "Database schema and demo data created" -ForegroundColor Green

# Step 6: Build backend
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
Write-Host "Demo Environment Setup Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "Demo Environment Details:" -ForegroundColor Cyan
Write-Host "• Database: flowtracker_demo" -ForegroundColor White
Write-Host "• Backend API: http://localhost:3001" -ForegroundColor White
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
Write-Host "• Realistic timestamps and comments" -ForegroundColor White
Write-Host ""
Write-Host "Use the admin account to explore all features!" -ForegroundColor Yellow