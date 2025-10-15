# FlowTracker Demo Environment - Index

Quick reference guide for the demo environment.

## 🚀 Quick Start Commands

### Easiest Way (From Project Root)
```powershell
.\setup-demo.ps1    # Interactive setup
.\start-demo.ps1    # Start demo
```

### Direct Way (From Demo Directory)
```powershell
cd demo
.\setup-demo-simple.ps1    # No database needed
.\start-demo-simple.ps1    # Start
```

## 📚 Documentation Files

| File | Description |
|------|-------------|
| **README.md** | Main demo overview and quick start |
| **DEMO_SETUP_GUIDE.md** | Comprehensive setup instructions |
| **MIGRATION_NOTES.md** | How files were organized into /demo |
| **INDEX.md** | This quick reference file |

## 🛠️ Script Files

### Setup Scripts
| Script | Purpose | Database Required? |
|--------|---------|-------------------|
| `setup-demo-simple.ps1` | Simple setup | ❌ No (Recommended) |
| `setup-demo-environment.ps1` | Full setup | ✅ Yes (PostgreSQL) |

### Startup Scripts
| Script | Purpose |
|--------|---------|
| `start-demo-simple.ps1` | Start simple demo (recommended) |
| `start-demo.ps1` | Start full demo |

### Testing Scripts
| Script | Purpose |
|--------|---------|
| `test-demo-environment.ps1` | Verify demo setup |

## 👥 Demo Users

| Email | Password | Role | Access Level |
|-------|----------|------|--------------|
| admin@demo.library.com | demo123 | Admin | Full access |
| manager@demo.library.com | demo123 | Manager | Management |
| staff@demo.library.com | demo123 | Staff | Standard |
| viewer@demo.library.com | demo123 | Viewer | Read-only |

## 🌐 Access URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

## 📦 Demo Components

| File | Type | Destination | Purpose |
|------|------|-------------|---------|
| `demo.ts` | Config | `src/config/` | Demo configuration |
| `DemoBanner.tsx` | Component | `src/components/` | Info banner |
| `DemoQuickLogin.tsx` | Component | `src/components/` | Quick login UI |
| `mockData.ts` | Data | `backend/src/data/` | Mock database |

## 📊 Demo Data Included

- ✅ 1 Demo Library
- ✅ 4 Demo Users (all roles)
- ✅ 5 Collections (Kanban columns)
- ✅ 8 Sample Issues (various statuses)
- ✅ Realistic timestamps
- ✅ Sample comments

## 🎯 Common Tasks

### Start Demo
```powershell
.\start-demo.ps1
```

### Stop Demo
Close the PowerShell windows or press Ctrl+C

### Reset Demo
Restart the demo servers (simple demo) or re-run setup (full demo)

### Test Demo
```powershell
cd demo
.\test-demo-environment.ps1
```

## 🔧 Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| Can't connect to database | Use simple demo (no database) |
| Port 3000/3001 in use | Stop other services using those ports |
| Scripts won't run | Use `powershell -ExecutionPolicy Bypass -File <script>` |
| Backend build fails | Check TypeScript errors in output |
| Frontend won't load | Ensure backend is running first |

## 📖 Need More Help?

1. **Quick Start:** Read `README.md`
2. **Detailed Setup:** Read `DEMO_SETUP_GUIDE.md`
3. **Organization Info:** Read `MIGRATION_NOTES.md`
4. **Component Usage:** Check individual component files

## 🎮 What to Try

- ✨ Login as different users to see role-based UI
- 🎯 Create new issues and move them around
- 👥 Check admin panel for user management
- 🔍 Test search and filtering features
- 💬 Add comments to issues
- 📝 Update issue details and priorities

## ⚡ Pro Tips

1. Start with simple demo (no database complexity)
2. Use admin account to see all features
3. Try different user roles for permissions
4. Check console for any errors
5. Backend must start before frontend

---

**Quick Links:**
- [Main README](README.md)
- [Setup Guide](DEMO_SETUP_GUIDE.md)
- [Migration Notes](MIGRATION_NOTES.md)
