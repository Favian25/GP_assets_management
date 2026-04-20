"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getUserContext, updateUserContext } from "../lib/authService";
import { updateMyProfile } from "../lib/userService";
import { User, Lock, Camera, Trash2, Eye, EyeOff, Check, X, Shield, Key } from "lucide-react";

const getAPIBase = () => {
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:5000`;
  }
  return "http://localhost:5000";
};
const API_BASE = getAPIBase();

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Editable fields
  const [namaLengkap, setNamaLengkap] = useState("");
  const [fotoFile, setFotoFile] = useState(null);
  const [removeFoto, setRemoveFoto] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Change password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); } }, [toast]);
  const showToast = (message, type = "success") => setToast({ message, type });

  useEffect(() => {
    const ctx = getUserContext();
    if (ctx) {
      setUser(ctx);
      setNamaLengkap(ctx.namaLengkap || "");
    }
  }, []);

  const canChangePassword = !!user;

  const handleFotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Ukuran foto profil maksimal 2 MB", "error");
        return;
      }
      setFotoFile(file);
      setRemoveFoto(false);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = () => {
    setFotoFile(null);
    setFotoPreview(null);
    setRemoveFoto(true);
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    if (!namaLengkap.trim()) {
      showToast("Nama lengkap wajib diisi", "error");
      return;
    }

    // Validation for password if user attempts to change it
    const attemptsToChangePw = currentPassword || newPassword || confirmPassword;
    if (attemptsToChangePw) {
      if (!currentPassword) {
        showToast("Password saat ini wajib diisi untuk mengubah password", "error");
        return;
      }
      if (newPassword !== confirmPassword) {
        showToast("Password baru dan konfirmasi tidak sama", "error");
        return;
      }
    }

    setSavingProfile(true);
    let successCount = 0;
    let failMsg = "";

    try {
      // 1. Update Profile (Name & Photo)
      const formData = new FormData();
      formData.append("namaLengkap", namaLengkap);
      if (fotoFile) formData.append("fotoProfil", fotoFile);
      if (removeFoto) formData.append("removeFoto", "true");

      const profileResult = await updateMyProfile(formData);
      if (profileResult.success) {
        // Handle snake_case vs camelCase dari API
        const newNamaLengkap = profileResult.user.namaLengkap || profileResult.user.nama_lengkap;
        const newFotoProfil = profileResult.user.fotoProfil !== undefined ? profileResult.user.fotoProfil : profileResult.user.foto_profil;

        updateUserContext({
          namaLengkap: newNamaLengkap,
          fotoProfil: newFotoProfil,
          foto_profil: newFotoProfil
        });
        
        setUser(prev => ({ 
          ...prev, 
          namaLengkap: newNamaLengkap, 
          fotoProfil: newFotoProfil,
          foto_profil: newFotoProfil 
        }));
        
        setFotoFile(null);
        setFotoPreview(null);
        setRemoveFoto(false);
        successCount++;
      }
    } catch (err) {
      failMsg = err.response?.data?.message || "Gagal memperbarui profil";
    }

    // 2. Change Password
    if (attemptsToChangePw && !failMsg) {
      try {
        const response = await fetch(`${API_BASE}/api/auth/change-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        const data = await response.json();
        if (data.success) {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          successCount++;
        } else {
          failMsg = data.message || "Gagal mengubah password";
        }
      } catch (err) {
        failMsg = "Gagal mengubah password: Kesalahan pada server";
      }
    }

    setSavingProfile(false);

    if (failMsg) {
      showToast(failMsg, "error");
    } else if (successCount > 0) {
      showToast("Perubahan berhasil disimpan!");
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
      "user": "bg-emerald-500",
    };
    return colors[role] || "bg-slate-500";
  };

  const getRoleBadge = (role) => {
    const s = {
      "super admin": "bg-violet-50 text-violet-700 border-violet-200",
      "admin": "bg-blue-50 text-blue-700 border-blue-200",
      "supervisor": "bg-amber-50 text-amber-700 border-amber-200",
      "user": "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return s[role] || "bg-slate-100 text-slate-600 border-slate-200";
  };

  const getAvatarContent = () => {
    if (removeFoto) {
      return (
        <div className={`flex h-full w-full items-center justify-center rounded-full ${getRoleColor(user.role)} text-2xl font-bold text-white`}>
          {(namaLengkap || "U").charAt(0).toUpperCase()}
        </div>
      );
    }
    const f = user.fotoProfil || user.foto_profil;
    const fotoSrc = fotoPreview || (f ? (f.startsWith('http') ? f : `${API_BASE}${f}`) : null);
    if (fotoSrc) {
      return <Image src={fotoSrc} alt="Foto Profil" fill className="object-cover" sizes="128px" unoptimized />;
    }
    return (
      <div className={`flex h-full w-full items-center justify-center rounded-full ${getRoleColor(user.role)} text-2xl font-bold text-white`}>
        {(namaLengkap || "U").charAt(0).toUpperCase()}
      </div>
    );
  };

  const EyeIcon = ({ show, onClick }) => (
    <button type="button" onClick={onClick} className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" tabIndex="-1">
      {show ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
    </button>
  );

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-100 flex items-center gap-2 rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-white transition-all ${toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"}`}>
          {toast.type === "error" ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Profil Saya</h1>
        <p className="text-sm text-slate-500">Informasi akun dan pengaturan keamanan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card (Live preview) */}
        <div className="lg:col-span-1 border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden h-max sticky top-24">
          <div className={`h-24 ${getRoleColor(user.role)} relative`}>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              <div className="relative group">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white border-4 border-white shadow-lg overflow-hidden">
                  {getAvatarContent()}
                </div>
              </div>
            </div>
          </div>
          <div className="pt-14 pb-6 px-6 text-center">
            <h2 className="text-lg font-bold text-slate-800 wrap-break-word">{namaLengkap || user.namaLengkap}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
            <div className="mt-3">
              <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getRoleBadge(user.role)}`}>{user.role}</span>
            </div>
          </div>
        </div>

        {/* Unified Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSaveAll} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            
            {/* Edit Profil Section */}
            <div className="border-b border-slate-200">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Edit Profil</h3>
                  <p className="text-xs text-slate-500">Sesuaikan data diri Anda</p>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Foto Profil</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input type="file" ref={fileInputRef} accept="image/jpeg,image/jpg,image/png" onChange={handleFotoSelect} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="cursor-pointer font-semibold rounded-lg bg-primary px-4 py-2 text-sm text-white transition-colors hover:bg-primary-hover shadow-sm border border-transparent">
                      Ubah Foto Profil
                    </button>
                    <button type="button" onClick={handleRemoveAvatar} className="cursor-pointer font-semibold rounded-lg bg-[#36393f] px-4 py-2 text-sm text-white transition-colors hover:bg-neutral-800 shadow-sm border border-transparent">
                      Hapus Foto Profil
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Lengkap</label>
                    <input type="text" value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)} placeholder="Nama lengkap"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required
                      onInvalid={(e) => e.target.setCustomValidity("Nama lengkap wajib diisi")} onInput={(e) => e.target.setCustomValidity("")} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                    <input type="email" value={user.email} disabled
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-500 bg-slate-50 cursor-not-allowed" />
                    <p className="mt-1 text-xs text-slate-400">Email tidak dapat diubah.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ubah Password Section */}
            <div>
              {canChangePassword ? (
                <div className="p-6 space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Password Saat Ini</label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Masukkan password saat ini"
                        className="w-full pl-4 pr-11 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <EyeIcon show={showCurrentPw} onClick={() => setShowCurrentPw(!showCurrentPw)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Password Baru</label>
                      <div className="relative">
                        <input
                          type={showNewPw ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Masukkan password baru"
                          className="w-full pl-4 pr-11 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 flex flex-col items-center justify-center text-center pb-10">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 mb-4">
                    <Lock className="h-8 w-8 text-amber-500" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800 mb-2">Ubah Password Tidak Tersedia</h4>
                  <p className="text-sm text-slate-500 max-w-xs">Minta persetujuan ke admin dulu yaa :)</p>
                </div>
              )}
            </div>

            {/* Submit Bar */}
            <div className="border-t border-slate-200 bg-slate-50 p-6 flex flex-wrap gap-3 justify-end items-center">
              <button type="button" onClick={() => router.back()}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
                Kembali
              </button>
              <button type="submit" disabled={savingProfile}
                className="cursor-pointer rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-60">
                {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
