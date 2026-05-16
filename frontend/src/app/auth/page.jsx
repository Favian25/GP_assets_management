"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginUser } from "../lib/authService";
import { LogIn, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
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

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#FFF3E8] relative overflow-hidden">
      {/* Optional Subtle Grid Background */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
      
      <div className="relative z-10 w-full max-w-md">
        
        {/* Brand Logo & Title */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-36 w-auto items-center justify-center mb-1 relative">
            <Image src="/LOGO GALERIA KARYA MEDIA - TRANSPARANT WARNA.png" alt="Galeria Karya Media Logo" width={340} height={144} className="h-full w-auto object-contain" style={{ width: 'auto' }} priority />
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Asset Management</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          
          {/* Bold Contrast LOGIN FORM Header */}
          <div className="pt-8 pb-8 text-center">
            <h1 className="text-2xl font-black uppercase tracking-widest">
              <span className="text-slate-700">Login</span>
            </h1>
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
                    onInvalid={(e) => e.target.setCustomValidity(e.target.validity.typeMismatch ? "Format email tidak valid" : "Email wajib diisi")}
                    onInput={(e) => e.target.setCustomValidity("")}
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
                      onInvalid={(e) => e.target.setCustomValidity("Password wajib diisi")}
                      onInput={(e) => e.target.setCustomValidity("")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
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

        </div>
      </div>
    </div>
  );
}
