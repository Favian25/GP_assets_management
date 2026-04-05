"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAllUsers, createUser, updateUserRole, deleteUser } from "../lib/userService";
import { getUserContext } from "../lib/authService";

const ROLE_OPTIONS = ["admin", "supervisor", "user"];

const getRoleBadge = (role) => {
  const s = {
    "super admin": "bg-violet-50 text-violet-700 border-violet-200",
    "admin": "bg-blue-50 text-blue-700 border-blue-200",
    "supervisor": "bg-amber-50 text-amber-700 border-amber-200",
    "user": "bg-slate-100 text-slate-600 border-slate-200",
  };
  return s[role] || "bg-slate-100 text-slate-600 border-slate-200";
};

export default function KelolaUserPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Add user form
  const [newUser, setNewUser] = useState({ namaLengkap: "", email: "", password: "", role: "user" });
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); } }, [toast]);
  const showToast = (message, type = "success") => setToast({ message, type });

  useEffect(() => {
    const ctx = getUserContext();
    if (ctx) {
      setCurrentUserId(ctx.id);
      if (ctx.role !== "super admin") {
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
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal menghapus user", "error");
    } finally { setSubmitting(false); }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(dateStr));
  };

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

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-[100] flex items-center gap-2 rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-white transition-all ${toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"}`}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {toast.type === "error" ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />}
          </svg>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola User</h1>
          <p className="text-sm text-slate-500">Manajemen akun pengguna dan pengaturan role</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="cursor-pointer flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Tambah User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total User", count: users.length, color: "bg-primary", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" },
          { label: "Admin", count: users.filter(u => u.role === "admin").length, color: "bg-blue-500", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
          { label: "Supervisor", count: users.filter(u => u.role === "supervisor").length, color: "bg-amber-500", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
          { label: "User", count: users.filter(u => u.role === "user").length, color: "bg-slate-500", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color} text-white`}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stat.count}</p>
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-violet-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50">
                <th className="px-5 py-3 font-bold text-slate-700 w-12">#</th>
                <th className="px-5 py-3 font-bold text-slate-700">Nama Lengkap</th>
                <th className="px-5 py-3 font-bold text-slate-700">Email</th>
                <th className="px-5 py-3 font-bold text-slate-700">Role</th>
                <th className="px-5 py-3 font-bold text-slate-700">Terdaftar</th>
                <th className="px-5 py-3 font-bold text-slate-700 text-center w-[120px]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className={`border-b border-slate-100 transition-colors ${index % 2 === 0 ? "bg-slate-50/50" : "bg-white"}`}>
                  <td className="px-5 py-3 text-slate-400 font-medium">{index + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${user.role === "super admin" ? "bg-violet-500" : user.role === "admin" ? "bg-blue-500" : user.role === "supervisor" ? "bg-amber-500" : "bg-slate-400"}`}>
                        {(user.namaLengkap || "U").charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800">{user.namaLengkap}</span>
                      {user.id === currentUserId && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">Anda</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{user.email}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getRoleBadge(user.role)}`}>{user.role}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-sm">{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {user.role !== "super admin" && (
                        <>
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
                      )}
                      {user.role === "super admin" && (
                        <span className="text-xs text-violet-400 font-medium italic">Protected</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (<tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Belum ada user terdaftar.</td></tr>)}
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
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email <span className="text-rose-500">*</span></label>
                <input type="email" value={newUser.email} onChange={(e) => setNewUser(p => ({...p, email: e.target.value}))} placeholder="email@example.com"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Password <span className="text-rose-500">*</span></label>
                <input type="password" value={newUser.password} onChange={(e) => setNewUser(p => ({...p, password: e.target.value}))} placeholder="Buat password"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
                <select value={newUser.role} onChange={(e) => setNewUser(p => ({...p, role: e.target.value}))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                  {ROLE_OPTIONS.map(r => (<option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>))}
                </select>
                <p className="mt-1 text-xs text-slate-400">Role Super Admin tidak bisa dibuat melalui form ini</p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</button>
                <button type="submit" disabled={submitting} className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover disabled:opacity-60">{submitting ? "Menyimpan..." : "Simpan"}</button>
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
                {ROLE_OPTIONS.map(r => (<option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>))}
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
