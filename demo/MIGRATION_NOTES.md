# Demo Directory Migration Notes

This document explains how the demo environment files have been organized into the `/demo` directory.

## 📁 File Organization

All demo-related files have been moved from the project root to the `/demo` directory for better organization.

### Files in `/demo` Directory

**Setup Scripts:**
- `setup-demo-environment.ps1` - Full demo setup with PostgreSQL
- `setup-demo-simple.ps1` - Simplified setup (no database)

**Startup Scripts:**
- `start-demo.ps1` - Start full demo
- `start-demo-simple.ps1` - Start simple demo (recommended)

**Testing & Documentation:**
- `test-demo-environment.ps1` - Test demo setup
- `DEMO_SETUP_GUIDE.md` - Comprehensive guide
- `README.md` - Demo directory overview
- `MIGRATION_NOTES.md` - This file

**Demo Components & Data:**
- `demo.ts` - Demo configuration (to be copied to `src/config/`)
- `DemoBanner.tsx` - Demo banner component (to be copied to `src/components/`)
- `DemoQuickLogin.tsx` - Quick login component (to be copied to `src/components/`)
- `mockData.ts` - Mock data (to be copied to `backend/src/data/`)

### Root Directory Launchers

Two convenience scripts remain in the project root:
- `setup-demo.ps1` - Interactive setup launcher
- `start-demo.ps1` - Demo startup launcher

These scripts automatically run the appropriate scripts from the `/demo` directory.

## 🚀 How to Use

### From Project Root (Easiest)

```powershell
# Setup
.\setup-demo.ps1

# Start
.\start-demo.ps1
```

### From Demo Directory (Direct)

```powershell
# Navigate to demo directory
cd demo

# Setup
.\setup-demo-simple.ps1

# Start
.\start-demo-simple.ps1
```

## 📝 Script Updates

All scripts in the `/demo` directory have been updated to:
1. Automatically navigate to the project root
2. Use `$projectRoot` variable for path references
3. Create temporary files in the correct location
4. Work correctly when run from the `/demo` directory

### Path Resolution

Scripts now use PowerShell's path resolution:
```powershell
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot
```

This ensures scripts work regardless of where they're executed from.

## 🎯 Benefits

1. **Better Organization** - All demo files in one place
2. **Cleaner Root** - Less clutter in project root
3. **Easy Maintenance** - Demo changes isolated
4. **Clear Separation** - Demo vs production code
5. **Simple Navigation** - Convenience launchers in root

## 🔄 Component Integration

The demo components need to be manually copied when needed:

**For Frontend:**
```powershell
# Copy demo config
Copy-Item demo\demo.ts src\config\

# Copy demo components
Copy-Item demo\DemoBanner.tsx src\components\
Copy-Item demo\DemoQuickLogin.tsx src\components\
```

**For Backend:**
```powershell
# Copy mock data
New-Item -ItemType Directory -Path backend\src\data -Force
Copy-Item demo\mockData.ts backend\src\data\
```

## 📚 Documentation

All demo documentation is now in the `/demo` directory:
- **README.md** - Quick start and overview
- **DEMO_SETUP_GUIDE.md** - Detailed setup instructions
- **MIGRATION_NOTES.md** - This migration guide

## ⚠️ Important Notes

1. **Scripts are updated** - All paths have been updated to work from the demo directory
2. **Convenience launchers** - Root scripts point to demo directory scripts
3. **Components are separate** - Demo UI components are stored in demo directory
4. **Documentation is complete** - All guides are in demo directory

## 🔍 What Changed

**Moved to `/demo`:**
- All setup scripts
- All startup scripts
- Test scripts
- Documentation
- Demo components
- Demo configuration
- Mock data

**Added to project root:**
- `setup-demo.ps1` (launcher)
- `start-demo.ps1` (launcher)

**Updated:**
- Main `README.md` - Added demo section
- Demo scripts - Updated paths
- Documentation - Updated references

## 💡 Tips

1. **Use root launchers** for convenience
2. **Run from demo directory** for direct control
3. **Read DEMO_SETUP_GUIDE.md** for detailed instructions
4. **Check README.md** in demo directory for quick reference

---

**Last Updated:** October 7, 2025
**Migration Completed:** Successfully organized all demo files
