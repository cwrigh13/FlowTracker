# FlowTracker Demo Environment Setup Guide

This guide will help you set up and run the FlowTracker demo environment, showcasing the Library Items Issues Tracker with pre-populated sample data.

## 🎯 What is the Demo Environment?

The demo environment is a fully functional instance of FlowTracker with:
- **Pre-configured database** with sample library, users, and issues
- **Demo users** with different roles and permissions
- **Sample data** showing realistic library scenarios
- **All features enabled** for testing and demonstration

## 📋 Prerequisites

Before setting up the demo environment, ensure you have:

- **Node.js** (version 16 or higher)
- **PostgreSQL** (version 12 or higher)
- **PowerShell** (for Windows setup scripts)
- **Git** (to clone the repository)

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

1. **Run the setup script:**
   ```powershell
   .\setup-demo-environment.ps1
   ```

2. **Start the demo environment:**
   ```powershell
   .\start-demo.ps1
   ```

3. **Open your browser to:** `http://localhost:3000`

### Option 2: Manual Setup

If you prefer to set up manually or the automated script doesn't work:

1. **Install dependencies:**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd backend
   npm install
   cd ..
   ```

2. **Set up PostgreSQL:**
   ```sql
   -- Create demo database
   CREATE DATABASE flowtracker_demo;
   ```

3. **Configure environment:**
   ```bash
   cd backend
   cp env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up database schema and demo data:**
   ```bash
   # Run the schema creation (see setup-demo-environment.ps1 for the full SQL)
   psql -U postgres -d flowtracker_demo -f database/schema.sql
   ```

5. **Build and start services:**
   ```bash
   # Build backend
   cd backend
   npm run build
   npm run dev
   
   # In another terminal, start frontend
   npm run dev
   ```

## 👥 Demo Users

The demo environment includes four pre-configured users with different roles:

| User | Email | Password | Role | Permissions |
|------|-------|----------|------|-------------|
| **Demo Admin** | admin@demo.library.com | demo123 | Admin | Full system access |
| **Demo Manager** | manager@demo.library.com | demo123 | Manager | Manage issues, view reports |
| **Demo Staff** | staff@demo.library.com | demo123 | Staff | Create/update issues |
| **Demo Viewer** | viewer@demo.library.com | demo123 | Viewer | Read-only access |

## 📊 Demo Data Overview

### Library Information
- **Name:** Demo Library
- **Code:** DEMO
- **Location:** 123 Demo Street, Demo City, DC 12345
- **Contact:** (555) 123-DEMO, demo@library.com

### Collections (Kanban Columns)
1. **Newly Reported** (Red) - Issues just submitted
2. **Under Assessment** (Orange) - Issues being evaluated
3. **Awaiting Parts** (Purple) - Issues waiting for materials
4. **In Repair** (Blue) - Issues currently being fixed
5. **Resolved/Ready for Circulation** (Green) - Completed issues

### Sample Issues (8 total)
- **Broken 3D Printer** - High priority, in assessment
- **Missing Catalog Record** - Medium priority, newly reported
- **VR Headset Battery Replacement** - Medium priority, awaiting parts
- **Laptop Screen Repair** - High priority, in repair
- **Camera Lens Cleaning** - Low priority, resolved
- **Tablet Stylus Missing** - Low priority, newly reported
- **WiFi Connectivity Issues** - High priority, under assessment
- **Drone Propeller Replacement** - Medium priority, awaiting parts

## 🎮 Demo Features to Try

### 1. User Role Testing
- Log in as different users to see role-based permissions
- Try admin functions like user management
- Test staff features like issue creation and assignment

### 2. Issue Management
- **Create new issues** with detailed descriptions
- **Drag and drop** issues between columns to update status
- **Assign issues** to different team members
- **Add comments** and track status history
- **Set priorities** and due dates

### 3. Kanban Board Features
- **Filter issues** by status, priority, or assignee
- **Search issues** by title or description
- **View issue details** in modal dialogs
- **Track progress** with visual status indicators

### 4. Admin Functions
- **User management** - Create, edit, and manage users
- **Collection management** - Add or modify issue categories
- **System settings** - Configure library information
- **Reports and analytics** - View system statistics

## 🔧 Demo Environment Configuration

### Backend Configuration
The demo backend runs on `http://localhost:3001` with:
- **Database:** `flowtracker_demo`
- **Environment:** `demo`
- **Demo Mode:** Enabled
- **Rate Limiting:** Relaxed for testing

### Frontend Configuration
The demo frontend runs on `http://localhost:3000` with:
- **API Endpoint:** `http://localhost:3001`
- **Demo Mode:** Enabled
- **Demo Banner:** Shows user information and tips
- **Quick Login:** One-click demo user selection

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure PostgreSQL is running
   - Check database credentials in `backend/.env`
   - Verify database `flowtracker_demo` exists

2. **Backend Won't Start**
   - Check if port 3001 is available
   - Ensure all backend dependencies are installed
   - Verify TypeScript compilation succeeded

3. **Frontend Won't Load**
   - Check if port 3000 is available
   - Ensure backend is running first
   - Verify all frontend dependencies are installed

4. **Demo Users Can't Login**
   - Verify demo data was created correctly
   - Check password is exactly "demo123"
   - Ensure user accounts are active in database

### Reset Demo Environment

To reset the demo environment:

1. **Stop all services** (close PowerShell windows)
2. **Drop and recreate database:**
   ```sql
   DROP DATABASE flowtracker_demo;
   CREATE DATABASE flowtracker_demo;
   ```
3. **Re-run setup script:**
   ```powershell
   .\setup-demo-environment.ps1
   ```

## 📚 Additional Resources

### API Documentation
- **Health Check:** `GET http://localhost:3001/health`
- **API Base:** `http://localhost:3001/api`
- **Authentication:** JWT tokens required for protected routes

### Database Schema
The demo uses a simplified schema with core tables:
- `libraries` - Library tenant information
- `users` - User accounts and roles
- `collections` - Issue categories/columns
- `issues` - Main issue tracking
- `issue_comments` - Comments and notes

### File Structure
```
├── setup-demo-environment.ps1  # Main setup script
├── start-demo.ps1             # Demo startup script
├── backend/
│   ├── .env                   # Demo environment config
│   ├── src/                   # Backend source code
│   └── database/schema.sql    # Database schema
├── src/
│   ├── config/demo.ts         # Demo configuration
│   └── components/            # Demo-specific components
└── DEMO_SETUP_GUIDE.md        # This guide
```

## 🎯 Demo Scenarios

### Scenario 1: New Issue Workflow
1. Login as `staff@demo.library.com`
2. Create a new issue for "Broken Printer"
3. Assign it to a team member
4. Move it through the workflow columns
5. Add comments and update status

### Scenario 2: Admin Management
1. Login as `admin@demo.library.com`
2. View all users and their roles
3. Create a new staff member
4. Modify collection settings
5. View system reports

### Scenario 3: Issue Resolution
1. Login as `manager@demo.library.com`
2. Review issues in "Under Assessment"
3. Move appropriate issues to "In Repair"
4. Add internal notes for staff
5. Resolve completed issues

## 🚀 Production Deployment

This demo environment is for testing and demonstration only. For production deployment:

1. **Change all demo passwords**
2. **Configure proper database credentials**
3. **Set up SSL/HTTPS**
4. **Configure production environment variables**
5. **Set up monitoring and logging**
6. **Implement proper backup strategies**

## 📞 Support

If you encounter issues with the demo environment:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure PostgreSQL is running and accessible
4. Check that all required ports (3000, 3001) are available
5. Review the console output for error messages

The demo environment is designed to be self-contained and should work out of the box with the provided setup scripts.
