# PostgreSQL Installation Guide for FlowTracker

## 🐘 Installing PostgreSQL on Windows

### Step 1: Download PostgreSQL
1. Go to: https://www.postgresql.org/download/windows/
2. Click "Download the installer" under "Interactive Installer by EDB"
3. Download the latest version (PostgreSQL 15 or 16)

### Step 2: Run the Installer
1. **Run as Administrator**: Right-click the installer and select "Run as administrator"
2. **Welcome Screen**: Click "Next"
3. **Installation Directory**: Keep default (`C:\Program Files\PostgreSQL\16`) and click "Next"
4. **Select Components**: Ensure these are checked:
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4 (database management tool)
   - ✅ Command Line Tools
   - ✅ Stack Builder (optional)
   - Click "Next"

### Step 3: Data Directory
- Keep default location: `C:\Program Files\PostgreSQL\16\data`
- Click "Next"

### Step 4: Password Setup
- **IMPORTANT**: Set a password for the `postgres` superuser
- **Remember this password** - you'll need it for FlowTracker
- Suggested password: `flowtracker2024` (or choose your own)
- Click "Next"

### Step 5: Port Configuration
- Keep default port: `5432`
- Click "Next"

### Step 6: Locale
- Keep default locale settings
- Click "Next"

### Step 7: Pre-Installation Summary
- Review settings
- Click "Next" to install

### Step 8: Complete Installation
- Wait for installation to complete
- **Uncheck** "Launch Stack Builder" (not needed)
- Click "Finish"

## 🔧 Configure PostgreSQL for FlowTracker

### Step 1: Test Connection
1. Open **SQL Shell (psql)** from Start Menu
2. Press Enter for all defaults:
   - Server: [localhost]
   - Database: [postgres]
   - Port: [5432]
   - Username: [postgres]
   - Password: [enter your password]
3. You should see: `postgres=#`

### Step 2: Create FlowTracker Database
In the SQL Shell, run these commands:
```sql
CREATE DATABASE flowtracker;
\q
```

### Step 3: Test Database Creation
1. Open SQL Shell again
2. Connect to the new database:
   - Server: [localhost]
   - Database: [flowtracker]
   - Port: [5432]
   - Username: [postgres]
   - Password: [your password]
3. You should see: `flowtracker=#`
4. Type `\q` to quit

## ✅ Verification Checklist
- [ ] PostgreSQL installed successfully
- [ ] Can connect to `postgres` database
- [ ] Can connect to `flowtracker` database
- [ ] Remembered the postgres password
- [ ] pgAdmin 4 accessible from Start Menu

## 🚀 Next Steps
Once PostgreSQL is installed, we'll:
1. Update the backend configuration
2. Run database migrations
3. Test the complete FlowTracker system

## 🔧 Troubleshooting
- **Port 5432 in use**: Change port during installation
- **Password issues**: Reset using pgAdmin or reinstall
- **Connection refused**: Check Windows Firewall settings
- **Permission denied**: Run installer as Administrator

---
**Note**: Keep your postgres password safe - you'll need it to configure FlowTracker!
