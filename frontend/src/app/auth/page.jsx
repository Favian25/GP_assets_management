"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser } from "../lib/authService";

export default function AuthPage() {
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [namaLengkap, setNamaLengkap] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const clearForm = () => {
    setNamaLengkap("");
    setEmail("");
    setPassword("");
    setErrorMsg("");
    setSuccessMsg("");
  };

  const toggleMode = (mode) => {
    setIsLogin(mode);
    clearForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isLogin) {
        // Mode Login
        const res = await loginUser({ email, password });
        if (res.success) {
          router.push("/");
        }
      } else {
        // Mode Sign Up
        const res = await registerUser({ namaLengkap, email, password });
        if (res.success) {
          setSuccessMsg(res.message || "Akun berhasil dibuat. Silakan login.");
          setTimeout(() => {
            toggleMode(true);
          }, 2000);
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Terjadi kesalahan pada server");
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
        <div className="text-center mb-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg shadow-primary/20 mb-4 overflow-hidden border border-slate-100 p-1.5">
            {/* Ganti "logo.png" dengan nama file gambar logo Anda yang diletakkan di folder "public" Next.js */}
            <img src="/logo.png" alt="Galeria Production Logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Galeria Production</h1>
          <p className="text-sm font-medium text-slate-500 mt-1.5">Asset Management System</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          
          {/* Top Tabs */}
          <div className="flex items-center justify-center pt-8 pb-6">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => toggleMode(true)}
                className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                  isLogin ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                Login
              </button>
              <button
                type="button"
                onClick={() => toggleMode(false)}
                className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                  !isLogin ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                Sign Up
              </button>
            </div>
          </div>

          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Pesan Kesalahan / Sukses */}
              {errorMsg && (
                <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-lg border border-rose-200 font-medium">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="bg-emerald-50 text-emerald-600 text-sm p-3 rounded-lg border border-emerald-200 font-medium">
                  {successMsg}
                </div>
              )}

              {/* Nama Lengkap (Khusus Sign Up) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    required={!isLogin}
                  />
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
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  {isLogin && (
                    <a href="#" className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors">
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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
                   {/* subtle top inner shadow/highlight effect common in premium designs */}
                   <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10"></span>
                   {loading ? "Memproses..." : (isLogin ? "Log In" : "Create an account")}
                </button>
              </div>
            </form>
          </div>

          {/* Bottom Link Area */}
          <div className="bg-slate-50/80 px-8 py-5 border-t border-slate-100/60 text-center">
            {isLogin ? (
              <p className="text-sm font-medium text-slate-500">
                Don&apos;t have an account yet?{" "}
                <button 
                  type="button" 
                  onClick={() => toggleMode(false)}
                  className="text-slate-800 font-bold hover:underline underline-offset-4 cursor-pointer focus:outline-none"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-sm font-medium text-slate-500">
                Already have an account?{" "}
                <button 
                  type="button" 
                  onClick={() => toggleMode(true)}
                  className="text-slate-800 font-bold hover:underline underline-offset-4 cursor-pointer focus:outline-none"
                >
                  Login
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
