"use client";

import { useState, useEffect } from "react";
import { getUserContext } from "../lib/authService";

export default function ProfilPage() {
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Change password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); } }, [toast]);
  const showToast = (message, type = "success") => setToast({ message, type });

  useEffect(() => {
    const ctx = getUserContext();
    if (ctx) setUser(ctx);
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast("Password baru dan konfirmasi tidak sama", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Password baru minimal 6 karakter", "error");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (data.success) {
        showToast("Password berhasil diubah!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showToast(data.message || "Gagal mengubah password", "error");
      }
    } catch {
      showToast("Terjadi kesalahan pada server", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div>
        <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Profil Saya</h1></div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-8 space-y-3 animate-pulse">
            {[1,2,3].map(i => (<div key={i} className="flex gap-4"><div className="h-4 w-24 rounded bg-slate-200"/><div className="h-4 flex-1 rounded bg-slate-200"/></div>))}
          </div>
        </div>
      </div>
    );
  }

  const getRoleColor = (role) => {
    const colors = {
      "super admin": "bg-violet-500",
      "admin": "bg-blue-500",
      "supervisor": "bg-amber-500",
      "user": "bg-slate-500",
    };
    return colors[role] || "bg-slate-500";
  };

  const getRoleBadge = (role) => {
    const s = {
      "super admin": "bg-violet-50 text-violet-700 border-violet-200",
      "admin": "bg-blue-50 text-blue-700 border-blue-200",
      "supervisor": "bg-amber-50 text-amber-700 border-amber-200",
      "user": "bg-slate-100 text-slate-600 border-slate-200",
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

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Profil Saya</h1>
        <p className="text-sm text-slate-500">Informasi akun dan pengaturan keamanan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className={`h-24 ${getRoleColor(user.role)} relative`}>
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white border-4 border-white shadow-lg">
                  <div className={`flex h-full w-full items-center justify-center rounded-full ${getRoleColor(user.role)} text-2xl font-bold text-white`}>
                    {(user.namaLengkap || "U").charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-14 pb-6 px-6 text-center">
              <h2 className="text-lg font-bold text-slate-800">{user.namaLengkap}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
              <div className="mt-3">
                <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getRoleBadge(user.role)}`}>{user.role}</span>
              </div>
            </div>
            <div className="border-t border-slate-100 px-6 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span className="text-sm text-slate-600">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                <span className="text-sm text-slate-600 capitalize">{user.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Ubah Password</h3>
                  <p className="text-xs text-slate-500">Pastikan password baru Anda aman dan berbeda dari sebelumnya</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Password Saat Ini</label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan password saat ini"
                    className="w-full pl-4 pr-11 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                  <EyeIcon show={showCurrentPw} onClick={() => setShowCurrentPw(!showCurrentPw)} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Password Baru</label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Buat password baru (min. 6 karakter)"
                    className="w-full pl-4 pr-11 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                  <EyeIcon show={showNewPw} onClick={() => setShowNewPw(!showNewPw)} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={submitting}
                  className="cursor-pointer rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-60">
                  {submitting ? "Menyimpan..." : "Simpan Password Baru"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
