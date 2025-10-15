# FlowTracker Demo Environment

This directory contains all files and resources for the FlowTracker demo environment.

## 📁 Directory Contents

### Setup Scripts
- **`setup-demo-environment.ps1`** - Full demo setup with PostgreSQL database
- **`setup-demo-simple.ps1`** - Simplified demo setup (no database required)

### Startup Scripts
- **`start-demo.ps1`** - Start full demo with database
- **`start-demo-simple.ps1`** - Start simplified mock demo

### Testing & Documentation
- **`test-demo-environment.ps1`** - Verify demo environment setup
- **`DEMO_SETUP_GUIDE.md`** - Comprehensive setup and usage guide

### Demo Components & Configuration
- **`demo.ts`** - Demo configuration and user data (copy to `src/config/`)
- **`DemoBanner.tsx`** - Demo information banner component (copy to `src/components/`)
- **`DemoQuickLogin.tsx`** - Quick login component (copy to `src/components/`)
- **`mockData.ts`** - Mock data for database-free demo (copy to `backend/src/data/`)

## 🚀 Quick Start

### Option 1: Simple Demo (Recommended - No Database)

1. Run the simple setup:
   ```powershell
   cd demo
   .\setup-demo-simple.ps1
   ```

2. Start the demo:
   ```powershell
   .\start-demo-simple.ps1
   ```

3. Open browser to: http://localhost:3000

### Option 2: Full Demo (With PostgreSQL)

1. Ensure PostgreSQL is installed and running

2. Run the full setup:
   ```powershell
   cd demo
   .\setup-demo-environment.ps1
   ```

3. Start the demo:
   ```powershell
   .\start-demo.ps1
   ```

4. Open browser to: http://localhost:3000

## 👥 Demo Users

All demo users use the password: **demo123**

| Email | Role | Description |
|-------|------|-------------|
| admin@demo.library.com | Admin | Full system access |
| manager@demo.library.com | Manager | Management access |
| staff@demo.library.com | Staff | Staff access |
| viewer@demo.library.com | Viewer | Read-only access |

## 📊 Demo Data

The demo environment includes:
- **1 Demo Library** with realistic information
- **4 Demo Users** with different permission levels
- **5 Collections** (Kanban columns)
  - Newly Reported
  - Under Assessment
  - Awaiting Parts
  - In Repair
  - Resolved/Ready for Circulation
- **8 Sample Issues** across various statuses and priorities

## 🎮 Demo Features

- Drag & drop Kanban board
- Issue creation and management
- User role-based permissions
- Admin panel functionality
- Search and filtering
- Status tracking and history
- Comments and notes
- Real-time updates

## 🔧 Troubleshooting

### Demo won't start
- Check that ports 3000 and 3001 are available
- Ensure Node.js is installed (v16+)
- For full demo, verify PostgreSQL is running

### Cannot login
- Verify password is exactly "demo123" (case-sensitive)
- Check that backend server is running on port 3001

### Database connection failed
- Use the simple demo instead (no database required)
- Check PostgreSQL service is running
- Verify database credentials in `backend/.env`

## 📚 Additional Resources

- See `DEMO_SETUP_GUIDE.md` for detailed setup instructions
- Visit the main project README for general information
- Check the production readiness checklist for deployment info

## 🛑 Stopping the Demo

To stop the demo environment:
1. Close both PowerShell windows (backend and frontend)
2. Or press `Ctrl+C` in each window

## 💡 Tips

- Try logging in as different users to see role-based features
- Create new issues and drag them between columns
- Test the admin panel for user management
- All demo data is pre-populated for immediate testing
- Changes are temporary and reset when you restart

## 🔄 Resetting Demo Data

To reset the demo environment:

**Simple Demo:**
- Just restart the demo servers

**Full Demo:**
1. Stop all services
2. Drop and recreate the database:
   ```sql
   DROP DATABASE flowtracker_demo;
   CREATE DATABASE flowtracker_demo;
   ```
3. Re-run setup script: `.\setup-demo-environment.ps1`

## 📞 Support

For issues with the demo environment:
1. Check the troubleshooting section above
2. Review `DEMO_SETUP_GUIDE.md` for detailed help
3. Ensure all prerequisites are installed
4. Check console output for error messages

---

**Note:** The demo environment is for testing and demonstration purposes only. For production deployment, follow the main project's deployment guide.
