# GP Asset Management System - Testing Checklist

**Last Updated**: 2026-09-16
**Status**: Implementation Complete (25/25 tasks) → Testing Phase In Progress

---

## 📋 Testing Overview

This document outlines all tests required to verify the GP Asset Management System is working correctly. The system is 100% implemented and ready for comprehensive testing.

### Test Environment
- **Backend**: Running on `http://localhost:5000`
- **Frontend**: Running on `http://localhost:3000`
- **Database**: MySQL (requires migration_v2.sql to be executed)

---

## 🔧 PRE-TESTING SETUP

### 1. Database Migration
- [ ] Verify MySQL is running
- [ ] Execute migration: `mysql -u root gp_asset_management < migration_v2.sql`
- [ ] Verify tables created:
  - [ ] `tbl_pegawai` table exists
  - [ ] `users` table has `pegawai_id` column
  - [ ] `tbl_peminjaman` table has `keperluan_list` JSON column
  - [ ] `tbl_aset` and `tbl_aksesoris` have `jenis_aset` ENUM column

### 2. Backend & Frontend Status
- [ ] Backend running on port 5000 (`npm run dev`)
- [ ] Frontend running on port 3000 (`npm run dev`)
- [ ] No console errors on either service
- [ ] API root endpoint accessible: `http://localhost:5000/`

---

## 🔐 AUTHENTICATION & LOGIN TESTS

### 1. Login Flow
- [ ] Navigate to `http://localhost:3000`
- [ ] Login with valid credentials (super admin account)
- [ ] Verify JWT token is stored in localStorage
- [ ] Verify dashboard loads successfully
- [ ] Test logout functionality
- [ ] Test login with invalid credentials (should show error)

### 2. User Context
- [ ] Verify user name appears in dashboard greeting
- [ ] Verify user role is correctly identified
- [ ] Verify user profile accessible from header

---

## 📊 DASHBOARD TESTS

### 1. Dashboard Header Enhancement ✨ NEW
- [ ] Dynamic greeting appears based on time:
  - [ ] "Pagi" between 00:00-11:59
  - [ ] "Siang" between 12:00-14:59
  - [ ] "Sore" between 15:00-17:59
  - [ ] "Malam" between 18:00-23:59
- [ ] User name displays correctly in greeting
- [ ] Refresh button works and shows loading spinner
- [ ] "Last updated" timestamp displays:
  - [ ] "Baru saja" for updates < 1 minute ago
  - [ ] "Xm yang lalu" for updates 1-59 minutes ago
  - [ ] "Xh yang lalu" for updates 1+ hours ago
  - [ ] Date format for older updates

### 2. Dashboard Stat Cards
- [ ] All 6 stat cards display:
  - [ ] Total Aset (blue gradient)
  - [ ] Aksesoris (cyan gradient)
  - [ ] Siap Digunakan (emerald gradient)
  - [ ] Rusak (rose gradient)
  - [ ] Maintenance (amber gradient)
  - [ ] Alat Dipinjam (indigo gradient)
- [ ] Stat cards show correct values from database
- [ ] Cards have TrendingUp icon
- [ ] Hover effect scales card to 105%
- [ ] Cards have animated background circles
- [ ] Cards link to correct pages (with role validation)

### 3. Dashboard Tables
- [ ] "Peminjaman Aktif" table displays:
  - [ ] Peminjam name and code
  - [ ] Number of borrowed items
  - [ ] Status badge with correct colors
  - [ ] Search functionality works
  - [ ] Minimize/expand button works
- [ ] "Aktivitas Terbaru" table displays:
  - [ ] Date and time of activity
  - [ ] User who created activity
  - [ ] Action type (Peminjaman/Pengembalian/etc)
  - [ ] Item/asset involved
  - [ ] Search functionality works
  - [ ] Minimize/expand button works

### 4. Dashboard Responsiveness
- [ ] Desktop layout (1920px+): Side-by-side tables
- [ ] Tablet layout (768px-1024px): Adjusted grid
- [ ] Mobile layout (<768px): Full-width tables stacked
- [ ] Search inputs responsive and collapse correctly

---

## 👥 USER MANAGEMENT TESTS (Kelola User)

### 1. User List Display
- [ ] All users display in table
- [ ] Columns show:
  - [ ] Nama Lengkap
  - [ ] Email
  - [ ] Role
  - [ ] Status badge (Guest/Regular)
  - [ ] Action buttons
- [ ] Guest users show "👤 Guest" badge
- [ ] Regular users show "👨 Regular" badge
- [ ] Super admin users have no badge (status hidden)

### 2. User Filtering
- [ ] Role filter dropdown works (Filter by: Semua, Super Admin, Admin, Supervisor, User)
- [ ] User Type filter dropdown works (Filter by: Semua, Guest, Regular)
- [ ] Both filters work independently
- [ ] Combination filters work correctly
- [ ] "Clear Filter" button resets all filters

### 3. Guest User Features
- [ ] Guest users created without pegawai selection
- [ ] Guest checkbox auto-checks when creating guest user
- [ ] Guest user role field is DISABLED and defaults to "user"
- [ ] Cannot change role of guest user (field disabled)
- [ ] Guest user details modal shows:
  - [ ] Additional fields (nomor_hp, keterangan)
  - [ ] Role disabled in edit form

### 4. Regular User Features
- [ ] Regular users require pegawai selection
- [ ] Pegawai autocomplete dropdown works
- [ ] Can change role of regular user
- [ ] Role options do NOT include "guest"

### 5. User Actions
- [ ] Create new user button works
- [ ] Edit user button opens form
- [ ] Toggle active/inactive button:
  - [ ] Changes status immediately
  - [ ] Updates badge color
  - [ ] List refreshes automatically
- [ ] Delete user button:
  - [ ] Shows confirmation
  - [ ] Removes user from list
  - [ ] Updates user count

### 6. User Stats Card
- [ ] Total users count displays
- [ ] Guest users count displays
- [ ] Regular users count displays

---

## 👨‍💼 PEGAWAI MANAGEMENT TESTS (Kelola Pegawai)

### 1. Pegawai List Display
- [ ] All pegawai display in table
- [ ] Columns show:
  - [ ] Nama Lengkap
  - [ ] Tempat Lahir
  - [ ] Tanggal Lahir (formatted as "13 Mei 2026")
  - [ ] Alamat
  - [ ] Email
  - [ ] Nomor HP
  - [ ] Action buttons
- [ ] Tanggal Lahir formatting correct (day, month name in Indonesian, year)

### 2. Pegawai CRUD Operations
- [ ] Create pegawai with all required fields
- [ ] Edit pegawai details
- [ ] Date handling in form:
  - [ ] Date input accepts YYYY-MM-DD format
  - [ ] Date displays correctly after saving
- [ ] Delete pegawai:
  - [ ] SUCCESS: When pegawai not linked to any user
  - [ ] BLOCKED: When pegawai is linked to user account
  - [ ] Error modal displays with:
    - [ ] User name
    - [ ] User email
    - [ ] User role
    - [ ] Clear instruction to delete user first

### 3. Pegawai-User Linkage
- [ ] Prevent deletion of pegawai linked to users
- [ ] Error message shows which user is blocking deletion
- [ ] Must delete user before deleting pegawai

---

## 📋 PEMINJAMAN MANAGEMENT TESTS

### 1. Create Peminjaman (Tambah/page.jsx)
- [ ] Form loads with all required fields
- [ ] Dropdowns work:
  - [ ] Nama Peminjam (dari tbl_pegawai - active only)
  - [ ] Yang Menyerahkan (dari approvers - conditional by role)
  - [ ] Auto-fill based on current user role
- [ ] Keperluan fields:
  - [ ] Add multiple keperluan entries
  - [ ] "+" button adds new keperluan
  - [ ] "-" button removes keperluan
  - [ ] Each has separate input
- [ ] Item selection:
  - [ ] Card Grid view works
  - [ ] List view works
  - [ ] Toggle between views
  - [ ] Items show pricing (harga_unit)
  - [ ] Quantity adjustable
  - [ ] Total value calculated correctly
- [ ] Date handling:
  - [ ] Date input (date only, no time picker)
  - [ ] Server auto-fills current time
- [ ] Form recovery:
  - [ ] Unsaved data persists in localStorage
  - [ ] Data restored on page reload
  - [ ] Clear after successful submit
- [ ] Submit:
  - [ ] POST /api/peminjaman creates record
  - [ ] Success message shows
  - [ ] Redirects to peminjaman list
  - [ ] New record appears in list

### 2. Edit Peminjaman - When "Sedang Dipinjam"
- [ ] Edit form shows all details
- [ ] Return section displays:
  - [ ] Conditional visibility (only when status="Sedang Dipinjam")
  - [ ] Penerima Aset (auto-filled based on role)
  - [ ] Date-only input for return date
  - [ ] Status auto-disabled (auto-set to "Menunggu Verifikasi")
- [ ] Display items with pricing:
  - [ ] Item name
  - [ ] Harga unit
  - [ ] Quantity
  - [ ] Total (harga_unit × qty)
- [ ] Item operations:
  - [ ] "Tukar Item" button opens modal:
    - [ ] Select item to swap out
    - [ ] Select replacement item
    - [ ] Confirm swap
  - [ ] "Tambah Item" button opens modal:
    - [ ] Select additional items
    - [ ] Set quantities
    - [ ] Confirm addition
- [ ] Display keperluan_list with proper formatting
- [ ] Submit return successfully
- [ ] Status changes to "Menunggu Verifikasi"

### 3. Peminjaman List with Role-Based Filtering
- [ ] Users see only own peminjaman
- [ ] Supervisors/admins see all peminjaman
- [ ] Status filter dropdown:
  - [ ] Menunggu Persetujuan
  - [ ] Sedang Dipinjam
  - [ ] Menunggu Verifikasi
  - [ ] Selesai
  - [ ] Ditolak
- [ ] Display total asset value per record
- [ ] Action buttons visible based on role
- [ ] Search functionality works

### 4. Peminjaman History (Riwayat)
- [ ] User borrowing history displays
- [ ] Card-based layout with status badges
- [ ] Status filtering works
- [ ] Summary statistics show:
  - [ ] Total peminjaman
  - [ ] Currently borrowed
  - [ ] Awaiting verification
  - [ ] Completed
- [ ] View detail button works
- [ ] PDF download button works

---

## 📦 ASSET MANAGEMENT TESTS

### 1. Asset List (Aset Daftar)
- [ ] All assets display in table
- [ ] Role-based visibility:
  - [ ] Aksi column hidden for users/guests
  - [ ] Kondisi field read-only for non-admins
  - [ ] All roles can view assets
- [ ] Filter by Kondisi:
  - [ ] Siap Digunakan
  - [ ] Rusak
  - [ ] Maintenance
- [ ] Search functionality
- [ ] Pagination (if applicable)
- [ ] Admin users can edit assets
- [ ] Non-admin users cannot edit kondisi

### 2. Aksesoris Management
- [ ] All aksesoris display in table
- [ ] Create aksesoris (admin only)
- [ ] Edit aksesoris (admin only)
- [ ] Delete aksesoris (admin only)
- [ ] Search and filter functionality

---

## 📄 PDF GENERATION TESTS

### 1. PDF Structure
- [ ] Title: "Bukti Peminjaman Aset"
- [ ] Header includes logo/branding
- [ ] Company name: "Galeria Karya Media"

### 2. PDF Content
- [ ] Borrower information displays:
  - [ ] Nama Peminjam
  - [ ] Pegawai/User details
  - [ ] Contact information
- [ ] Items table displays:
  - [ ] Item name/kode
  - [ ] Quantity
  - [ ] Harga unit
  - [ ] Total (harga_unit × qty)
  - [ ] Grand total at bottom
- [ ] Date formatting: "16 September 2026" (no time)
- [ ] Keperluan list displays correctly
- [ ] Signature areas present:
  - [ ] Peminjam
  - [ ] Penyerah
  - [ ] Verifikator

### 3. PDF Download
- [ ] PDF downloads from peminjaman list
- [ ] PDF downloads from riwayat page
- [ ] File naming includes kode_pinjam
- [ ] PDF opens/displays correctly in viewer
- [ ] Print-ready styling works

---

## 🔒 ROLE-BASED ACCESS CONTROL TESTS

### 1. Super Admin
- [ ] Can access all features
- [ ] Can view all peminjaman
- [ ] Can edit assets
- [ ] Can manage users
- [ ] Can manage pegawai
- [ ] Dashboard shows all stats
- [ ] Status badge hidden in kelola-user

### 2. Admin
- [ ] Can view all peminjaman
- [ ] Can edit assets
- [ ] Can manage peminjaman
- [ ] Cannot access user management (if restricted)
- [ ] Dashboard shows relevant stats

### 3. Supervisor
- [ ] Can view all peminjaman
- [ ] Cannot edit assets (kondisi field read-only)
- [ ] Can approve peminjaman (if applicable)
- [ ] Can see reports (if applicable)

### 4. User
- [ ] Can only see own peminjaman
- [ ] Can create peminjaman requests
- [ ] Can view asset list (read-only)
- [ ] Cannot see admin pages
- [ ] Cannot access Kelola User/Pegawai
- [ ] Can view own history

### 5. Guest User
- [ ] Can perform basic actions
- [ ] No pegawai linkage
- [ ] Role locked as "user"
- [ ] Cannot change role

---

## 🌐 API ENDPOINT TESTS

### Authentication
- [ ] POST /api/auth/login (with valid credentials)
- [ ] POST /api/auth/login (with invalid credentials)
- [ ] Token validation in protected routes

### Users
- [ ] GET /api/users (with auth token)
- [ ] GET /api/users/me
- [ ] GET /api/users/active
- [ ] GET /api/users/role/:role
- [ ] GET /api/users/paginated?page=1&limit=10
- [ ] POST /api/users (create user)
- [ ] PUT /api/users/:id (update user)
- [ ] PUT /api/users/:id/toggle-active
- [ ] PUT /api/users/:id/role (change role)
- [ ] DELETE /api/users/:id

### Pegawai
- [ ] GET /api/pegawai
- [ ] GET /api/pegawai/:id
- [ ] GET /api/pegawai/approvers
- [ ] GET /api/pegawai/active
- [ ] GET /api/pegawai/role/:role
- [ ] GET /api/pegawai/with-user-status
- [ ] POST /api/pegawai (create pegawai)
- [ ] PUT /api/pegawai/:id (update pegawai)
- [ ] DELETE /api/pegawai/:id (with validation)

### Peminjaman
- [ ] GET /api/peminjaman
- [ ] GET /api/peminjaman/:id
- [ ] GET /api/peminjaman/status/:status
- [ ] GET /api/peminjaman/nama/:nama_peminjam
- [ ] GET /api/peminjaman/:id/items-pricing
- [ ] POST /api/peminjaman (create)
- [ ] PUT /api/peminjaman/:id (update)
- [ ] PUT /api/peminjaman/:id/swap-item (swap items)
- [ ] PUT /api/peminjaman/:id/add-item (add items)
- [ ] PUT /api/peminjaman/:id/approve (approve/verify)
- [ ] DELETE /api/peminjaman/:id

### Assets
- [ ] GET /api/assets
- [ ] GET /api/assets/:id
- [ ] GET /api/assets?kondisi=Siap%20Digunakan
- [ ] POST /api/assets (create asset)
- [ ] PUT /api/assets/:id (update asset)
- [ ] DELETE /api/assets/:id

### Aksesoris
- [ ] GET /api/aksesoris
- [ ] GET /api/aksesoris/:id
- [ ] POST /api/aksesoris (create)
- [ ] PUT /api/aksesoris/:id (update)
- [ ] DELETE /api/aksesoris/:id

---

## 🖥️ BROWSER COMPATIBILITY TESTS

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Test Points for Each Browser
- [ ] Dashboard loads correctly
- [ ] Forms submit successfully
- [ ] Tables display and scroll properly
- [ ] Dropdowns and modals work
- [ ] PDF downloads correctly
- [ ] Responsive design works

---

## 📱 RESPONSIVE DESIGN TESTS

### Mobile (< 768px)
- [ ] Navigation visible/accessible
- [ ] Forms stack vertically
- [ ] Tables scrollable horizontally
- [ ] All buttons clickable
- [ ] Search inputs functional

### Tablet (768px - 1024px)
- [ ] Layout adjusts appropriately
- [ ] Grid columns responsive
- [ ] Dropdowns functional
- [ ] Touch interactions work

### Desktop (≥ 1024px)
- [ ] Full layout displays
- [ ] Multi-column tables visible
- [ ] Hover effects work
- [ ] All features accessible

---

## ⚠️ ERROR HANDLING TESTS

### 1. Network Errors
- [ ] Offline: App shows error message
- [ ] API timeout: Shows retry button
- [ ] Invalid token: Redirects to login

### 2. Validation Errors
- [ ] Missing required fields: Shows error message
- [ ] Invalid email format: Shows error
- [ ] Invalid date format: Shows error
- [ ] Duplicate entries (if applicable): Shows error

### 3. Business Logic Errors
- [ ] Delete pegawai linked to user: Shows error modal
- [ ] Create peminjaman with unavailable items: Shows error
- [ ] Change guest user role: Shows error/blocks action
- [ ] Access restricted pages: Shows error message

---

## 🎯 SMOKE TEST CHECKLIST (Quick Verification)

Quick tests to verify system is working:
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Dashboard loads successfully
- [ ] Can login with valid credentials
- [ ] Greeting displays with user name
- [ ] Stat cards show data
- [ ] Can navigate to different pages
- [ ] API endpoints return data (with auth)
- [ ] Can create a peminjaman record
- [ ] Can view peminjaman list
- [ ] PDF generation works
- [ ] Logout works correctly

---

## 📊 TESTING RESULTS SUMMARY

| Category | Status | Notes |
|----------|--------|-------|
| Authentication | ⏳ | |
| Dashboard | ⏳ | |
| User Management | ⏳ | |
| Pegawai Management | ⏳ | |
| Peminjaman | ⏳ | |
| Assets | ⏳ | |
| PDF Generation | ⏳ | |
| API Endpoints | ⏳ | |
| Browser Compatibility | ⏳ | |
| Responsive Design | ⏳ | |
| Error Handling | ⏳ | |

---

## 🚀 COMPLETION CRITERIA

The system is considered **READY FOR PRODUCTION** when:
- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ All API endpoints tested and working
- ✅ All RBAC tests pass
- ✅ All browser compatibility tests pass
- ✅ No console errors or warnings
- ✅ PDF generation tested and approved
- ✅ Database migration applied
- ✅ All error handling scenarios tested
- ✅ Performance acceptable (load times, response times)

---

## 📝 NOTES

- All tests should be performed with both **valid and invalid data**
- Test with different user roles to verify RBAC
- Test on multiple browsers and devices
- Document any bugs found with:
  - Steps to reproduce
  - Expected vs actual behavior
  - Screenshots/videos if applicable
  - Environment details (OS, Browser, etc.)

---

**Testing Phase Started**: 2026-09-16
**Expected Completion**: TBD
**Tester Name**: _____________
**Approved By**: _____________
