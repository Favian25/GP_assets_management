"use client";

import { useState, useEffect, useCallback, useMemo, cloneElement } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getAllUsers, createUser, updateUser, updateUserRole, deleteUser } from "../lib/userService";
import { getUserContext } from "../lib/authService";
import { 
  Eye, EyeOff, Search, Plus, Pencil, Trash2, X, Check, 
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, 
  Shield, User, Mail, Lock, AlertTriangle, ChevronUp, ChevronDown,
  Users, ClipboardList
} from "lucide-react";

const ROWS_OPTIONS = [10, 20, 30, 40, 50];

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
    {show ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
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
  const [lightboxImg, setLightboxImg] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const getBackendURL = () => {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL.replace('/api', '');
    }
    if (typeof window !== "undefined") {
      return `http://${window.location.hostname}:5000`;
    }
    return "http://localhost:5000";
  };
  const BACKEND_URL = getBackendURL();

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
    try { 
      if (!loading) setTableLoading(true);
      setUsers(await getAllUsers()); 
    }
    catch { showToast("Gagal memuat data user", "error"); }
    finally { 
      setLoading(false); 
      setTableLoading(false);
    }
  }, [loading]);

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
    <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 gap-3">
      <div className="hidden sm:flex items-center gap-3">
        <p className="text-sm text-slate-500">Menampilkan {currentData.length === 0 ? 0 : indexOfFirstItem + 1}–{Math.min(indexOfFirstItem + itemsPerPage, processedUsers.length)} dari <span className="font-semibold text-slate-700">{processedUsers.length}</span> data</p>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => setCurrentPage(1)} disabled={validCurrentPage === 1} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Halaman Pertama"><ChevronsLeft className="h-4 w-4" /></button>
        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={validCurrentPage === 1} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Sebelumnya"><ChevronLeft className="h-4 w-4" /></button>
        {getPageNumbers().map((page, idx) => page === "..." ? (<span key={`e-${idx}`} className="min-w-[32px] px-1 py-1.5 text-center text-sm text-slate-400">...</span>) : (<button key={page} onClick={() => setCurrentPage(page)} className={`cursor-pointer min-w-[32px] rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${validCurrentPage === page ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"}`}>{page}</button>))}
        <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={validCurrentPage === totalPages || totalPages === 0} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Berikutnya"><ChevronRight className="h-4 w-4" /></button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={validCurrentPage === totalPages || totalPages === 0} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Halaman Terakhir"><ChevronsRight className="h-4 w-4" /></button>
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
      {typeof document !== 'undefined' && toast && createPortal(
        <div className={`fixed top-20 right-6 z-9999 flex items-center gap-2 rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-white transition-all ${toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"}`}>
          {toast.type === "error" ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {toast.message}
        </div>,
        document.body
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Kelola User</h1>
        <p className="text-sm text-slate-500">Manajemen akun pengguna dan pengaturan role</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total User", count: totalManagedUsers, color: "bg-violet-600", customIcon: <Users /> },
          { label: "Admin", count: countAdmin, color: "bg-blue-600", customIcon: <Shield /> },
          { label: "Supervisor", count: countSupervisor, color: "bg-amber-500", customIcon: <ClipboardList /> },
          { label: "User", count: countUser, color: "bg-emerald-600", customIcon: <User /> },
        ].map(stat => (
          <div key={stat.label} className={`relative overflow-hidden rounded-2xl ${stat.color} p-4 text-white shadow-lg transition-all hover:scale-[1.03] hover:shadow-xl group`}>
            {/* Decorative background elements */}
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 transition-transform group-hover:scale-125" />
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md shadow-inner">
                {cloneElement(stat.customIcon, { className: "h-5 w-5 text-white" })}
              </div>
              <div className="flex flex-col">
                <p className="text-xl font-black leading-none mb-0.5">{stat.count}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar & Table Section */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-primary">
        {/* Table Loading Overlay */}
        {tableLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px] transition-all animate-in fade-in duration-200">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-sm" />
              <div className="flex flex-col items-center">
                <p className="text-sm font-bold text-slate-700">Memperbarui Data User</p>
                <p className="text-[10px] text-slate-400">Mohon tunggu sebentar...</p>
              </div>
            </div>
          </div>
        )}
        
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
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
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
            <Plus className="h-4 w-4" />
            Tambah User
          </button>
        </div>

        {/* Table Controls (Pagination Top) & Table */}
        <Pagination />
        <div className="overflow-x-auto border-t border-slate-200">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50/50">
                <th className="px-5 py-3 font-bold text-slate-700 w-12 text-center uppercase text-[10px] tracking-wider">No</th>
                <th className="px-5 py-3 font-bold text-slate-700 w-14 text-center"></th>
                <th className="px-5 py-3 font-bold text-slate-700 select-none hover:bg-slate-200/50 transition-colors">
                  <button onClick={handleSortName} className="flex items-center justify-between gap-2 w-full cursor-pointer uppercase text-[10px] tracking-wider">
                    Nama Lengkap
                    <div className="flex flex-col">
                      <ChevronUp className={`h-2.5 w-2.5 ${sortOrder === "asc" ? "text-primary" : "text-slate-400"}`} />
                      <ChevronDown className={`h-2.5 w-2.5 ${sortOrder === "desc" ? "text-primary" : "text-slate-400"}`} />
                    </div>
                  </button>
                </th>
                <th className="px-5 py-3 font-bold text-slate-700 uppercase text-[10px] tracking-wider">Email</th>
                <th className="px-5 py-3 font-bold text-slate-700 uppercase text-[10px] tracking-wider">Role</th>
                <th className="px-5 py-3 font-bold text-slate-700 uppercase text-[10px] tracking-wider">Terdaftar</th>
                <th className="px-5 py-3 font-bold text-slate-700 text-center w-[160px] uppercase text-[10px] tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentData.map((user, index) => (
                <tr key={user.id} className={`${index % 2 === 0 ? "bg-slate-100" : "bg-white"}`}>
                  <td className="px-5 py-3 text-slate-400 font-medium text-center">{indexOfFirstItem + index + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-center">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 shadow-sm cursor-pointer group" onClick={() => {
                        const src = user.fotoProfil || user.foto_profil;
                        if (src) setLightboxImg(src.startsWith('http') ? src : `${BACKEND_URL}${src}`);
                      }}>
                        {(() => {
                          const src = user.fotoProfil || user.foto_profil;
                          if (src) {
                            const fullSrc = src.startsWith('http') ? src : `${BACKEND_URL}${src}`;
                            return <Image src={fullSrc} alt={user.namaLengkap} fill className="object-cover group-hover:scale-110 transition-transform" sizes="40px" unoptimized />;
                          }
                          return (
                            <div className={`flex h-full w-full items-center justify-center text-xs font-bold text-white ${user.role === "admin" ? "bg-blue-500" : user.role === "supervisor" ? "bg-amber-500" : user.role === "super admin" ? "bg-violet-500" : "bg-emerald-500"}`}>
                              {(user.namaLengkap || "U").charAt(0).toUpperCase()}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{user.namaLengkap}</td>
                  <td className="px-5 py-3 text-slate-600">{user.email}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 font-semibold capitalize shadow-sm ${getRoleBadge(user.role)}`}>{user.role}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-sm">{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {canManageUser(user.role) ? (
                        <>
                          {/* Edit */}
                          <button onClick={() => openEditModal(user)}
                            className="cursor-pointer rounded-lg bg-blue-100 p-1.5 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white" title="Edit User">
                            <Pencil className="h-4 w-4" />
                          </button>
                          {/* Change Role */}
                          <button onClick={() => { setShowRoleModal(user); setSelectedRole(user.role); }}
                            className="cursor-pointer rounded-lg bg-amber-100 p-1.5 text-amber-600 transition-colors hover:bg-amber-600 hover:text-white" title="Ubah Role">
                            <Shield className="h-4 w-4" />
                          </button>
                          {/* Delete */}
                          <button onClick={() => setShowDeleteConfirm(user)}
                            className="cursor-pointer rounded-lg bg-rose-100 p-1.5 text-rose-600 transition-colors hover:bg-rose-600 hover:text-white" title="Hapus">
                            <Trash2 className="h-4 w-4" />
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

      {mounted && typeof document !== 'undefined' && createPortal(
        <>
          {/* Modal Tambah User */}
          {showAddModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowAddModal(false)}>
              <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border-t-4 border-t-primary flex flex-col max-h-[90vh] animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0 bg-white rounded-t-2xl">
                  <h2 className="text-lg font-bold text-slate-800">Tambah User Baru</h2>
                  <button type="button" onClick={() => setShowAddModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleAddUser} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Password <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input type={showNewPw ? "text" : "password"} value={newUser.password} onChange={(e) => setNewUser(p => ({...p, password: e.target.value}))} placeholder="Masukkan password"
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
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowEditModal(null)}>
              <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border-t-4 border-t-blue-500 flex flex-col max-h-[90vh] animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0 bg-white rounded-t-2xl">
                  <h2 className="text-lg font-bold text-slate-800">Edit User</h2>
                  <button type="button" onClick={() => setShowEditModal(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleEditUser} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Lengkap <span className="text-rose-500">*</span></label>
                      <input type="text" value={editForm.namaLengkap} onChange={(e) => setEditForm(p => ({...p, namaLengkap: e.target.value}))} placeholder="Nama lengkap"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required
                        onInvalid={(e) => e.target.setCustomValidity("Nama lengkap wajib diisi")} onInput={(e) => e.target.setCustomValidity("")} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                      <input type="email" value={showEditModal.email} disabled
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-500 bg-slate-50 cursor-not-allowed" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Password Baru</label>
                    <div className="relative">
                      <input type={showEditPw ? "text" : "password"} value={editForm.password} onChange={(e) => setEditForm(p => ({...p, password: e.target.value}))} placeholder="Kosongkan jika tidak ingin ubah"
                        className="w-full rounded-lg border border-slate-200 pl-3 pr-10 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                      <EyeIcon show={showEditPw} onClick={() => setShowEditPw(!showEditPw)} />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">Kosongkan jika tidak ingin mengubah password. Tidak ada batasan karakter.</p>
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
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowRoleModal(null)}>
              <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border-t-4 border-t-amber-500 flex flex-col max-h-[90vh] animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0 bg-white rounded-t-2xl">
                  <h2 className="text-lg font-bold text-slate-800">Ubah Role User</h2>
                  <button type="button" onClick={() => setShowRoleModal(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                    <Shield className="h-7 w-7 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1 text-center">Ubah Role</h3>
                  <p className="text-sm text-slate-500 text-center mb-4">Mengubah role untuk <span className="font-semibold text-slate-700">{showRoleModal.namaLengkap}</span></p>
                  <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                    {getRoleOptions().map(r => (<option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>))}
                  </select>
                </div>
                <div className="flex items-center justify-center gap-3 border-t border-slate-100 px-6 py-4 bg-white rounded-b-2xl">
                  <button onClick={() => setShowRoleModal(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</button>
                  <button onClick={handleUpdateRole} disabled={submitting || selectedRole === showRoleModal.role} className="cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-600 disabled:opacity-60">{submitting ? "Menyimpan..." : "Simpan"}</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Delete */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowDeleteConfirm(null)}>
              <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border-t-4 border-t-rose-500 flex flex-col max-h-[90vh] animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 text-center overflow-y-auto custom-scrollbar">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
                    <Trash2 className="h-7 w-7 text-rose-600" />
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

          {/* Lightbox Profil */}
          {lightboxImg && (
            <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 cursor-pointer transition-opacity animate-in fade-in duration-300" onClick={() => setLightboxImg(null)}>
              <div className="relative h-[85vh] w-[85vw] max-w-5xl animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <Image src={lightboxImg} alt="Profil Full" fill className="rounded-xl object-contain shadow-2xl cursor-default" unoptimized />
              </div>
            </div>
          )}
        </>,
        document.body
      )}
    </div>
  );
}
