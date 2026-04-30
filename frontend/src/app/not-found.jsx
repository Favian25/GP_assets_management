"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, Home, ArrowLeft, Ghost } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex items-center justify-center p-4" style={{ minHeight: "calc(100vh - 140px)" }}>
      <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
        
        {/* Left/Top Area - Visuals */}
        <div className="bg-linear-to-br from-slate-800 to-slate-900 py-8 px-6 flex flex-col items-center justify-center text-white relative overflow-hidden md:w-2/5 shrink-0">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Search className="h-20 w-20" />
          </div>
          
          <div className="relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-5xl font-black mb-1 tracking-tighter drop-shadow-md">404</h1>
            <div className="h-0.5 w-10 bg-white/30 mx-auto rounded-full mb-4"></div>
            <Ghost className="h-12 w-12 mx-auto animate-bounce text-slate-300" />
          </div>
          
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute top-8 -right-8 w-20 h-20 bg-slate-500/20 rounded-full blur-xl"></div>
        </div>

        {/* Right/Bottom Area - Content */}
        <div className="p-6 flex flex-col justify-center animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
          <h2 className="text-lg font-bold text-slate-800 mb-1.5">Oops! Halaman Tidak Ditemukan</h2>
          <p className="text-slate-500 mb-5 leading-relaxed text-sm">
            Halaman yang Anda cari mungkin telah dihapus, diubah namanya, atau tidak pernah ada.
          </p>

          <div className="space-y-2.5">
            <button 
              onClick={() => router.back()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Sebelumnya
            </button>
            
            <Link 
              href="/"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer shadow-sm shadow-primary/20"
            >
              <Home className="h-4 w-4" />
              Kembali ke Dashboard
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
