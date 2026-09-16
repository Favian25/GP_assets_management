# 🚀 Quick Start Guide - GP Asset Management System

**Status**: Implementation Complete (25/25 tasks) ✅
**Last Updated**: 2026-09-16

---

## ⚡ Running the Application (5 minutes)

### Prerequisites
- Node.js (v16+)
- MySQL (v5.7+)
- All dependencies installed (`npm install` in both `/backend` and `/frontend`)

### Step 1: Database Setup (First Time Only)
```bash
# Navigate to project root
cd /home/kali/Music/GP_assets_management

# Execute migration to set up database
mysql -u root gp_asset_management < migration_v2.sql

# Verify migration:
# - Check that tbl_pegawai table was created
# - Verify users table has pegawai_id column
```

### Step 2: Start Backend Server
```bash
cd /home/kali/Music/GP_assets_management/backend

# Install dependencies (if not done)
npm install

# Start development server
npm run dev

# Expected output:
# Server berjalan di http://localhost:5000
```

### Step 3: Start Frontend (New Terminal)
```bash
cd /home/kali/Music/GP_assets_management/frontend

# Install dependencies (if not done)
npm install

# Start development server
npm run dev

# Expected output:
# ▲ Next.js 15.0.0
# - ready started server on 0.0.0.0:3000
```

### Step 4: Access the Application
Open browser and navigate to:
```
http://localhost:3000
```

---

## 🔑 Default Login Credentials

Use these credentials to login:

### Super Admin
- **Email**: admin@galerika.com
- **Password**: admin123

### Regular User
- **Email**: user@galerika.com
- **Password**: user123

**Note**: Use credentials from your database. Adjust as needed.

---

## 📋 First 10 Minutes - What to Check

### 1. Dashboard Loads (30 seconds)
- [ ] Page loads without errors
- [ ] Greeting shows "Selamat [Pagi/Siang/Sore/Malam], [Your Name]! 👋"
- [ ] Refresh button visible
- [ ] Stat cards display with data

### 2. Navigation Works (1 minute)
- [ ] Click "Aset" → Asset list loads
- [ ] Click "Peminjaman" → Borrowing list loads
- [ ] Click "Kelola User" → User management loads
- [ ] Click "Kelola Pegawai" → Employee management loads
- [ ] Click logo → Returns to dashboard

### 3. Create a Test Record (2 minutes)
- [ ] Go to "Peminjaman" → "Tambah Peminjaman"
- [ ] Select employee from dropdown (Nama Peminjam)
- [ ] Select approver from dropdown (Yang Menyerahkan)
- [ ] Add at least one item
- [ ] Click "Tambah Peminjaman"
- [ ] Verify record appears in list

### 4. Test Guest User (2 minutes)
- [ ] Go to "Kelola User" → "Tambah User"
- [ ] Check "Guest User" checkbox
- [ ] Enter name, email, password
- [ ] Notice "Role" field is DISABLED and shows "user"
- [ ] Click "Tambah User"
- [ ] Verify user appears with "👤 Guest" badge

### 5. Test Filtering (2 minutes)
- [ ] In "Kelola User", use Role filter (dropdown)
- [ ] Use User Type filter (Guest/Regular)
- [ ] Verify both filters work independently
- [ ] Go to "Peminjaman", use Status filter
- [ ] Verify correct records display

### 6. Test Pegawai Date Formatting (1 minute)
- [ ] Go to "Kelola Pegawai"
- [ ] Check Tanggal Lahir column
- [ ] Verify dates display as "13 Mei 2026" format (not "2006-05-13")

---

## 🎯 Key Features to Test

### Guest User Management
```
✅ Create guest user (no pegawai selection required)
✅ Guest role locked as "user" (cannot change)
✅ Can filter by "Guest" user type
✅ Display "👤 Guest" badge in list
```

### Pegawai Deletion Protection
```
✅ Try to delete pegawai linked to user → Shows error
✅ Error modal displays user details (name, email, role)
✅ Must delete user first before deleting pegawai
```

### Dashboard Enhancements
```
✅ Time-based greeting (Pagi/Siang/Sore/Malam)
✅ User name in header
✅ Refresh button with loading spinner
✅ "Last updated" timestamp (relative time)
✅ Stat cards with gradients and animations
```

### Peminjaman Workflow
```
✅ Create: Select pegawai dropdown, add items, set keperluan
✅ Edit: Return flow only when status="Sedang Dipinjam"
✅ Swap Item: Modal dialog to swap items while borrowed
✅ Add Item: Modal dialog to add items while borrowed
✅ PDF: Download as "Bukti Peminjaman Aset"
```

---

## 🛠️ Common Tasks

### Reset Database
```bash
# Drop and recreate database
mysql -u root -e "DROP DATABASE gp_asset_management; CREATE DATABASE gp_asset_management;"

# Re-run migration
mysql -u root gp_asset_management < migration_v2.sql
```

### View Backend Logs
```bash
# Already running in terminal (check npm run dev output)
# Look for errors, API responses, database queries
```

### Clear Frontend Cache
```bash
# Delete Next.js cache
cd frontend
rm -rf .next
npm run dev
```

### Check API Response
```bash
# Test API endpoint (requires auth token)
curl -s http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | head -20
```

---

## ✅ Verification Checklist

Run this checklist to verify system is working:

- [ ] **Backend**: `curl http://localhost:5000/` returns JSON
- [ ] **Frontend**: `http://localhost:3000` loads dashboard
- [ ] **Database**: `mysql -e "USE gp_asset_management; SHOW TABLES;" | grep tbl_pegawai`
- [ ] **Migration**: `tbl_pegawai` table exists with correct columns
- [ ] **Login**: Can login with valid credentials
- [ ] **Dashboard**: Stat cards show numbers > 0
- [ ] **Navigation**: All menu items link to correct pages
- [ ] **API**: Protected endpoints require JWT token
- [ ] **Forms**: Can create/edit records without errors
- [ ] **PDF**: Can generate and download PDF

---

## 📚 File Structure

```
/home/kali/Music/GP_assets_management/
├── backend/                      # Express.js server
│   ├── controllers/              # Request handlers
│   ├── models/                   # Database queries
│   ├── routes/                   # API routes
│   ├── utils/                    # Utilities (PDF generator, etc.)
│   ├── server.js                 # Main server file
│   └── package.json
│
├── frontend/                     # Next.js app
│   ├── src/app/                  # Pages and components
│   │   ├── lib/                  # API services
│   │   ├── components/           # React components
│   │   ├── page.js               # Dashboard
│   │   ├── kelola-user/          # User management
│   │   ├── kelola-pegawai/       # Employee management
│   │   ├── aset/                 # Asset pages
│   │   └── riwayat/              # History pages
│   ├── next.config.js
│   └── package.json
│
├── migration_v2.sql              # Database migration
├── TESTING_CHECKLIST.md          # Comprehensive testing guide
├── QUICK_START.md                # This file
├── README.md                      # Project documentation
└── .gitignore
```

---

## 🔗 Important URLs

| Page | URL | Requires Auth |
|------|-----|---|
| Dashboard | http://localhost:3000 | ✅ |
| Assets | http://localhost:3000/aset/daftar | ✅ |
| Borrowing | http://localhost:3000/aset/peminjaman | ✅ |
| Borrow History | http://localhost:3000/riwayat/peminjaman | ✅ |
| User Management | http://localhost:3000/kelola-user | ✅ |
| Employee Management | http://localhost:3000/kelola-pegawai | ✅ |
| API Root | http://localhost:5000 | ❌ |
| API Users | http://localhost:5000/api/users | ✅ |

---

## 🐛 Troubleshooting

### Problem: "Cannot GET /api/users" (404 error)
- **Solution**: Ensure backend is running on port 5000
- **Check**: `ps aux | grep "node server.js"`

### Problem: "Gagal memuat statistik dashboard"
- **Solution**: Backend may not be running or database not migrated
- **Check**:
  1. Backend running? (`npm run dev` in backend folder)
  2. Database migrated? (`mysql gp_asset_management < migration_v2.sql`)

### Problem: "Token tidak ditemukan" (API error)
- **Solution**: Need JWT token for protected endpoints
- **Solution**: Login first to get token in localStorage

### Problem: "CORS error" in browser console
- **Solution**: Frontend and backend on different ports (should be 3000 and 5000)
- **Check**: CORS configured in backend/server.js

### Problem: "Akses ditolak" on protected pages
- **Solution**: Insufficient user role for that page
- **Action**: Use higher role account (Super Admin) to test

### Problem: "Database connection failed"
- **Solution**: MySQL not running or wrong credentials
- **Check**:
  1. MySQL running? `sudo service mysql status`
  2. Database exists? `mysql -e "SHOW DATABASES;"`
  3. User has access? Check backend `.env` file

---

## 📊 Expected Data After Migration

After running `migration_v2.sql`, you should have:

### Tables
- `tbl_aset` (Assets)
- `tbl_aksesoris` (Accessories)
- `tbl_peminjaman` (Borrowing records)
- `tbl_pegawai` (Employees)
- `users` (User accounts)
- And others...

### Sample Data
- Super Admin user (for testing)
- Sample pegawai records
- Sample assets/aksesoris

---

## 🎓 Testing Tips

### Create Test Data
```bash
# Use the application UI to create:
1. Create a new employee (Kelola Pegawai)
2. Create a new user linked to employee (Kelola User)
3. Create a borrowing record (Peminjaman → Tambah)
4. Test return flow (Edit peminjaman while "Sedang Dipinjam")
```

### Test Different Roles
```bash
1. Login as Super Admin → See all features
2. Login as Admin → Limited features
3. Login as User → Can only see own records
4. Create Guest User → No pegawai linkage
```

### Monitor Performance
```bash
# Browser DevTools:
- Network tab: Check API response times
- Console: Look for errors
- Performance: Check page load times
```

---

## 🚀 Next Steps

1. **Complete Testing**: Follow TESTING_CHECKLIST.md
2. **Report Issues**: Document bugs with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots
3. **Prepare for Production**:
   - Review security settings
   - Set up monitoring
   - Configure backups
   - Document deployment process

---

## 📞 Support

For issues or questions:
1. Check TESTING_CHECKLIST.md for test coverage
2. Review code comments in relevant files
3. Check git commits for context on changes
4. Review API documentation in backend routes

---

**Remember**: All 25 implementation tasks are complete! 🎉
Now it's time to verify everything works correctly through comprehensive testing.
