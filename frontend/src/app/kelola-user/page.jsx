"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getAllUsers, createUser, updateUser, updateUserRole, deleteUser } from "../lib/userService";
import { getUserContext } from "../lib/authService";

const getRoleBadge = (role) => {
  const s = {
    "super admin": "bg-violet-50 text-violet-700 border-violet-200",
    "admin": "bg-blue-50 text-blue-700 border-blue-200",
    "supervisor": "bg-amber-50 text-amber-700 border-amber-200",
    "user": "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return s[role] || "bg-slate-100 text-slate-600 border-slate-200";
};

const EyeIcon = ({ show, onClick }) => (
  <button type="button" onClick={onClick} className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
    {show ? (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
    ) : (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
    )}
  </button>
);

export default function KelolaUserPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState("");

  // Table options (Search, Sort, Pagination)
  const [searchName, setSearchName] = useState("");
  const [searchRole, setSearchRole] = useState("");
  const [sortOrder, setSortOrder] = useState(""); // "" | "asc" | "desc"
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Input states
  const [showNewPw, setShowNewPw] = useState(false);
  const [showEditPw, setShowEditPw] = useState(false);

  // Add user form
  const [newUser, setNewUser] = useState({ namaLengkap: "", email: "", password: "", role: "user" });
  // Edit user form
  const [editForm, setEditForm] = useState({ namaLengkap: "", password: "", role: "" });
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); } }, [toast]);
  const showToast = (message, type = "success") => setToast({ message, type });

  useEffect(() => {
    const ctx = getUserContext();
    if (ctx) {
      setCurrentUserId(ctx.id);
      setCurrentUserRole(ctx.role || "user");
      if (!["super admin", "admin"].includes(ctx.role)) {
        router.replace("/");
      }
    }
  }, [router]);

  const fetchUsers = useCallback(async () => {
    try { setLoading(true); setUsers(await getAllUsers()); }
    catch { showToast("Gagal memuat data user", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Role options berdasarkan role pemanggil
  const getRoleOptions = () => {
    if (currentUserRole === "super admin") return ["admin", "supervisor", "user"];
    return ["supervisor", "user"];
  };

  // Cek apakah boleh kelola user ini
  const canManageUser = (targetRole) => {
    if (currentUserRole === "super admin") return targetRole !== "super admin";
    if (currentUserRole === "admin") return ["supervisor", "user"].includes(targetRole);
    return false;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.namaLengkap || !newUser.email || !newUser.password) {
      showToast("Semua field wajib diisi", "error"); return;
    }
    try {
      setSubmitting(true);
      await createUser(newUser);
      showToast("User berhasil ditambahkan!");
      setShowAddModal(false);
      setNewUser({ namaLengkap: "", email: "", password: "", role: "user" });
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal menambah user", "error");
    } finally { setSubmitting(false); }
  };

  const openEditModal = (user) => {
    setEditForm({ namaLengkap: user.namaLengkap, password: "", role: user.role });
    setShowEditPw(false);
    setShowEditModal(user);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!showEditModal) return;
    try {
      setSubmitting(true);
      await updateUser(showEditModal.id, editForm);
      showToast("Data user berhasil diperbarui!");
      setShowEditModal(null);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal memperbarui user", "error");
    } finally { setSubmitting(false); }
  };

  const handleUpdateRole = async () => {
    if (!showRoleModal || !selectedRole) return;
    try {
      setSubmitting(true);
      await updateUserRole(showRoleModal.id, selectedRole);
      showToast(`Role berhasil diubah ke ${selectedRole}!`);
      setShowRoleModal(null);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal mengubah role", "error");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    try {
      setSubmitting(true);
      await deleteUser(showDeleteConfirm.id);
      showToast("User berhasil dihapus!");
      setShowDeleteConfirm(null);
      
      // Jika men-delete item terakhir di halaman saat ini, mundur 1 halaman (opsional, tapi good UX)
      if (currentData.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
      
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal menghapus user", "error");
    } finally { setSubmitting(false); }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(dateStr));
  };
  
  const handleSortName = () => {
    if (sortOrder === "") setSortOrder("asc");
    else if (sortOrder === "asc") setSortOrder("desc");
    else setSortOrder("");
  };

  // Filter & Sort
  const processedUsers = useMemo(() => {
    let result = [...users];

    // Search filter
    if (searchName) {
      const q = searchName.toLowerCase();
      result = result.filter(u => u.namaLengkap?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }
    if (searchRole) {
      result = result.filter(u => u.role === searchRole);
    }

    // Sort
    if (sortOrder === "asc") {
      result.sort((a, b) => a.namaLengkap.localeCompare(b.namaLengkap));
    } else if (sortOrder === "desc") {
      result.sort((a, b) => b.namaLengkap.localeCompare(a.namaLengkap));
    }

    return result;
  }, [users, searchName, searchRole, sortOrder]);

  // Pagination Variables
  const totalItems = processedUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  // Ensure current page is within valid range after filter/delete changes
  const validCurrentPage = Math.min(currentPage, totalPages);
  
  const indexOfLastItem = validCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = processedUsers.slice(indexOfFirstItem, indexOfLastItem);

  const getPageNumbers = () => {
    const p = [];
    if (totalPages <= 4) { for (let i = 1; i <= totalPages; i++) p.push(i); }
    else if (validCurrentPage <= 3) { for (let i = 1; i <= 3; i++) p.push(i); p.push("..."); p.push(totalPages); }
    else if (validCurrentPage >= totalPages - 2) { p.push(1); p.push("..."); for (let i = totalPages - 2; i <= totalPages; i++) p.push(i); }
    else { p.push(1); p.push("..."); p.push(validCurrentPage); p.push("..."); p.push(totalPages); }
    return p;
  };

  const Pagination = () => (
    <div className="flex items-center justify-between px-5 py-3">
      <p className="text-sm text-slate-500">Menampilkan {currentData.length === 0 ? 0 : indexOfFirstItem + 1}–{Math.min(indexOfFirstItem + itemsPerPage, processedUsers.length)} dari <span className="font-semibold text-slate-700">{processedUsers.length}</span> data</p>
      <div className="flex items-center gap-1">
        <button onClick={() => setCurrentPage(1)} disabled={validCurrentPage === 1} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Halaman Pertama"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M18 19l-7-7 7-7" /></svg></button>
        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={validCurrentPage === 1} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Sebelumnya"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
        {getPageNumbers().map((page, idx) => page === "..." ? (<span key={`e-${idx}`} className="min-w-[32px] px-1 py-1.5 text-center text-sm text-slate-400">...</span>) : (<button key={page} onClick={() => setCurrentPage(page)} className={`cursor-pointer min-w-[32px] rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${validCurrentPage === page ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"}`}>{page}</button>))}
        <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={validCurrentPage === totalPages || totalPages === 0} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Berikutnya"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={validCurrentPage === totalPages || totalPages === 0} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Halaman Terakhir"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M6 5l7 7-7 7" /></svg></button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div>
        <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Kelola User</h1><p className="text-sm text-slate-500">Manajemen akun pengguna dan pengaturan role</p></div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-8 space-y-3 animate-pulse">{[1,2,3].map(i => (<div key={i} className="flex gap-4"><div className="h-4 w-24 rounded bg-slate-200"/><div className="h-4 flex-1 rounded bg-slate-200"/><div className="h-4 w-20 rounded bg-slate-200"/></div>))}</div>
        </div>
      </div>
    );
  }

  // Calculate generic stats
  const totalManagedUsers = users.length;
  const countAdmin = users.filter(u => u.role === "admin").length;
  const countSupervisor = users.filter(u => u.role === "supervisor").length;
  const countUser = users.filter(u => u.role === "user").length;

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-100 flex items-center gap-2 rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-white transition-all ${toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"}`}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {toast.type === "error" ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />}
          </svg>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Kelola User</h1>
        <p className="text-sm text-slate-500">Manajemen akun pengguna dan pengaturan role</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total User", count: totalManagedUsers, color: "bg-primary", customIcon: (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73A9.93 9.93 0 0112 12.75zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1A6.73 6.73 0 004 14c-.99 0-1.93.21-2.78.58A2.01 2.01 0 000 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85A6.95 6.95 0 0020 14c-.37 0-.74.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
            </svg>
          )},
          { label: "Admin", count: countAdmin, color: "bg-blue-500", customIcon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          )},
          { label: "Supervisor", count: countSupervisor, color: "bg-amber-500", customIcon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          )},
          { label: "User", count: countUser, color: "bg-slate-500", customIcon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          )},
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color} text-white`}>
                {stat.customIcon}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stat.count}</p>
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar & Table Section */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-violet-500">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-b border-slate-300 bg-slate-50/50">
          {/* Search Input */}
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border-2 border-slate-200 pl-10 pr-4 py-2 text-sm text-slate-700 hover:border-slate-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
              <svg className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={searchRole}
              onChange={(e) => {
                setSearchRole(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-40 rounded-lg border-2 border-slate-200 px-3 py-2 text-sm text-slate-700 bg-white hover:border-slate-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer transition-colors"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
            >
              <option value="">Semua Role</option>
              <option value="super admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="supervisor">Supervisor</option>
              <option value="user">User</option>
            </select>
          </div>

          {/* Tambah Button */}
          <button onClick={() => setShowAddModal(true)}
            className="cursor-pointer flex w-full justify-center items-center gap-2 rounded-lg bg-primary px-4 py-2 sm:w-auto sm:px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Tambah User
          </button>
        </div>

        {/* Table Controls (Pagination Top) & Table */}
        <Pagination />
        <div className="overflow-x-auto border-t border-slate-100">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50">
                <th className="px-5 py-3 font-bold text-slate-700 w-12 text-center">No</th>
                <th className="px-5 py-3 font-bold text-slate-700 cursor-pointer select-none hover:bg-slate-200/50 transition-colors" onClick={handleSortName}>
                  <div className="flex items-center justify-between gap-2">
                    Nama Lengkap
                    <div className="flex flex-col">
                      <svg className={`h-2 w-2 ${sortOrder === "asc" ? "text-primary" : "text-slate-400"}`} fill="currentColor" viewBox="0 0 320 512"><path d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z" /></svg>
                      <svg className={`h-2 w-2 ${sortOrder === "desc" ? "text-primary" : "text-slate-400"}`} fill="currentColor" viewBox="0 0 320 512"><path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z" /></svg>
                    </div>
                  </div>
                </th>
                <th className="px-5 py-3 font-bold text-slate-700">Email</th>
                <th className="px-5 py-3 font-bold text-slate-700">Role</th>
                <th className="px-5 py-3 font-bold text-slate-700">Terdaftar</th>
                <th className="px-5 py-3 font-bold text-slate-700 text-center w-[160px]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((user, index) => (
                <tr key={user.id} className={`border-b border-slate-100 transition-colors ${index % 2 === 0 ? "bg-slate-50/50" : "bg-white"}`}>
                  <td className="px-5 py-3 text-slate-400 font-medium text-center">{indexOfFirstItem + index + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${user.role === "admin" ? "bg-blue-500" : user.role === "supervisor" ? "bg-amber-500" : user.role === "super admin" ? "bg-violet-500" : "bg-emerald-500"}`}>
                        {(user.namaLengkap || "U").charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800">{user.namaLengkap}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{user.email}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getRoleBadge(user.role)}`}>{user.role}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-sm">{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {canManageUser(user.role) ? (
                        <>
                          {/* Edit */}
                          <button onClick={() => openEditModal(user)}
                            className="cursor-pointer rounded-lg bg-blue-100 p-1.5 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white" title="Edit User">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          {/* Change Role */}
                          <button onClick={() => { setShowRoleModal(user); setSelectedRole(user.role); }}
                            className="cursor-pointer rounded-lg bg-amber-100 p-1.5 text-amber-600 transition-colors hover:bg-amber-600 hover:text-white" title="Ubah Role">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          </button>
                          {/* Delete */}
                          <button onClick={() => setShowDeleteConfirm(user)}
                            className="cursor-pointer rounded-lg bg-rose-100 p-1.5 text-rose-600 transition-colors hover:bg-rose-600 hover:text-white" title="Hapus">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {currentData.length === 0 && (<tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Belum ada user terdaftar atau sesuai pencarian.</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah User */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border-t-4 border-t-primary">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-800">Tambah User Baru</h2>
              <button onClick={() => setShowAddModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Lengkap <span className="text-rose-500">*</span></label>
                <input type="text" value={newUser.namaLengkap} onChange={(e) => setNewUser(p => ({...p, namaLengkap: e.target.value}))} placeholder="Masukkan nama lengkap"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required
                  onInvalid={(e) => e.target.setCustomValidity("Nama lengkap wajib diisi")} onInput={(e) => e.target.setCustomValidity("")} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email <span className="text-rose-500">*</span></label>
                <input type="email" value={newUser.email} onChange={(e) => setNewUser(p => ({...p, email: e.target.value}))} placeholder="email@example.com"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required
                  onInvalid={(e) => e.target.setCustomValidity(e.target.validity.typeMismatch ? "Format email tidak valid" : "Email wajib diisi")} onInput={(e) => e.target.setCustomValidity("")} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Password <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <input type={showNewPw ? "text" : "password"} value={newUser.password} onChange={(e) => setNewUser(p => ({...p, password: e.target.value}))} placeholder="Buat password"
                    className="w-full rounded-lg border border-slate-200 pl-3 pr-10 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required
                    onInvalid={(e) => e.target.setCustomValidity("Password wajib diisi")} onInput={(e) => e.target.setCustomValidity("")} />
                  <EyeIcon show={showNewPw} onClick={() => setShowNewPw(!showNewPw)} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
                <select value={newUser.role} onChange={(e) => setNewUser(p => ({...p, role: e.target.value}))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                  {getRoleOptions().map(r => (<option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>))}
                </select>
                {currentUserRole === "admin" && <p className="mt-1 text-xs text-slate-400">Admin hanya bisa membuat role Supervisor dan User</p>}
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</button>
                <button type="submit" disabled={submitting} className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover disabled:opacity-60">{submitting ? "Menyimpan..." : "Simpan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit User */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border-t-4 border-t-blue-500">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-800">Edit User</h2>
              <button onClick={() => setShowEditModal(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleEditUser} className="p-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <input type="email" value={showEditModal.email} disabled
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-500 bg-slate-50 cursor-not-allowed" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Lengkap <span className="text-rose-500">*</span></label>
                <input type="text" value={editForm.namaLengkap} onChange={(e) => setEditForm(p => ({...p, namaLengkap: e.target.value}))} placeholder="Nama lengkap"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required
                  onInvalid={(e) => e.target.setCustomValidity("Nama lengkap wajib diisi")} onInput={(e) => e.target.setCustomValidity("")} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Password Baru</label>
                <div className="relative">
                  <input type={showEditPw ? "text" : "password"} value={editForm.password} onChange={(e) => setEditForm(p => ({...p, password: e.target.value}))} placeholder="Kosongkan jika tidak ingin ubah"
                    className="w-full rounded-lg border border-slate-200 pl-3 pr-10 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  <EyeIcon show={showEditPw} onClick={() => setShowEditPw(!showEditPw)} />
                </div>
                <p className="mt-1 text-xs text-slate-400">Minimal 6 karakter. Kosongkan jika tidak ingin mengubah password.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm(p => ({...p, role: e.target.value}))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                  {getRoleOptions().map(r => (<option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</button>
                <button type="submit" disabled={submitting} className="cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 disabled:opacity-60">{submitting ? "Menyimpan..." : "Simpan Perubahan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ubah Role */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border-t-4 border-t-amber-500">
            <div className="p-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                <svg className="h-7 w-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1 text-center">Ubah Role</h3>
              <p className="text-sm text-slate-500 text-center mb-4">Mengubah role untuk <span className="font-semibold text-slate-700">{showRoleModal.namaLengkap}</span></p>
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                {getRoleOptions().map(r => (<option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>))}
              </select>
            </div>
            <div className="flex items-center justify-center gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={() => setShowRoleModal(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</button>
              <button onClick={handleUpdateRole} disabled={submitting || selectedRole === showRoleModal.role} className="cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-600 disabled:opacity-60">{submitting ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border-t-4 border-t-rose-500">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
                <svg className="h-7 w-7 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Hapus User?</h3>
              <p className="text-sm text-slate-500 mb-1">{showDeleteConfirm.namaLengkap}</p>
              <p className="text-xs text-slate-400">{showDeleteConfirm.email}</p>
              <p className="text-xs text-rose-500 mt-3">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className="flex items-center justify-center gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={() => setShowDeleteConfirm(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</button>
              <button onClick={handleDelete} disabled={submitting} className="cursor-pointer rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-600 disabled:opacity-60">{submitting ? "Menghapus..." : "Ya, Hapus"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
