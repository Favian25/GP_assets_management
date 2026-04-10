"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../lib/authService";

export default function AuthPage() {
  const router = useRouter();
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Forgot password state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setForgotEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      if (res.success) {
        router.push("/");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Terjadi kesalahan pada server");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (newPassword !== confirmPassword) {
      setErrorMsg("Password baru dan konfirmasi password tidak sama");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, newPassword }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg("Password berhasil direset. Silakan login.");
        setTimeout(() => {
          setIsForgotPassword(false);
          clearForm();
        }, 2000);
      } else {
        setErrorMsg(data.message || "Gagal mereset password");
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan pada server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#E5EEFF] relative overflow-hidden">
      {/* Optional Subtle Grid Background */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="relative z-10 w-full max-w-md">
        
        {/* Brand Logo & Title */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-24 w-auto items-center justify-center mb-1">
            <img src="/logo-galeria-production-biru.png" alt="Galeria Production Logo" className="h-full w-auto max-w-[220px] object-contain" />
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Asset Management</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-center pt-8 pb-6">
            <div className="flex items-center gap-2 bg-slate-100 px-5 py-2 rounded-xl">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
              <span className="text-sm font-semibold text-slate-800">
                Login
              </span>
            </div>
          </div>

          <div className="px-8 pb-8">
            {/* === LOGIN FORM === */}
            <form onSubmit={handleLogin} className="space-y-5">
                
                {errorMsg && (
                  <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-lg border border-rose-200 font-medium">
                    {errorMsg}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email anda"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password anda"
                      className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-[0_4px_12px_rgb(0,0,0,0.15)] hover:shadow-[0_6px_16px_rgb(0,0,0,0.2)] transition-all cursor-pointer relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                     <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10"></span>
                     {loading ? "Memproses..." : "Log In"}
                  </button>
                </div>
              </form>
          </div>

          {/* Bottom Link Area */}
          <div className="bg-slate-50/80 px-8 py-5 border-t border-slate-100/60 text-center">
            <p className="text-sm font-medium text-slate-400">
              &copy; {new Date().getFullYear()} Galeria Production
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
