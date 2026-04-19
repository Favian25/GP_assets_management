"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getUserContext } from "../lib/authService";
import { Home, Package, ClipboardList, Tag, FileText, Users, ChevronRight } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [asetOpen, setAsetOpen] = useState(pathname.startsWith("/aset"));
  const [userRole, setUserRole] = useState("user");

  useEffect(() => {
    const ctx = getUserContext();
    if (ctx) setUserRole(ctx.role || "user");
  }, []);

  const isActive = (path) => pathname === path;

  // Role checks
  const canSeeDaftarAset = ["super admin", "admin"].includes(userRole);

  return (
    <aside className="fixed top-0 left-0 z-40 flex h-screen w-64 flex-col bg-sidebar-bg text-sidebar-text">
      {/* Brand */}
      <Link href="/" className="flex h-16 items-center justify-center border-b border-white/10 px-6 cursor-pointer hover:bg-white/5 transition-colors">
        <div className="flex h-10 w-auto items-center justify-center bg-transparent relative">
          <Image src="/logo-galeria-production.png" alt="Galeria Production Logo" width={140} height={40} className="h-full w-auto object-contain" />
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Dashboard */}
        <Link
          href="/"
          className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive("/")
              ? "bg-primary text-white"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Home className="h-5 w-5" />
          Dashboard
        </Link>

        {/* Aset Group */}
        <button
          onClick={() => setAsetOpen(!asetOpen)}
          className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            pathname.startsWith("/aset")
              ? "bg-white/10 text-white"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-3">
            <Package className="h-5 w-5" />
            Aset
          </span>
          <ChevronRight className={`h-4 w-4 transition-transform ${asetOpen ? "rotate-90" : ""}`} />
        </button>

        {asetOpen && (
          <div className="ml-4 border-l border-white/10 pl-3">
            {/* Daftar Aset - Only Super Admin & Admin */}
            {canSeeDaftarAset && (
              <>
                <Link
                  href="/aset/daftar"
                  className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                    isActive("/aset/daftar")
                      ? "bg-primary text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <ClipboardList className="h-4 w-4" />
                  Daftar Aset
                </Link>
                
                <Link
                  href="/aset/kategori"
                  className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                    isActive("/aset/kategori") || isActive("/aset/merek")
                      ? "bg-primary text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Tag className="h-4 w-4" />
                  Kategori & Merek
                </Link>
              </>
            )}

            {/* Peminjaman Aset - All roles */}
            <Link
              href="/aset/peminjaman"
              className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                pathname.startsWith("/aset/peminjaman")
                  ? "bg-primary text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FileText className="h-4 w-4" />
              Peminjaman Aset
            </Link>
          </div>
        )}

        {/* Kelola User - Only Super Admin & Admin */}
        {["super admin", "admin"].includes(userRole) && (
          <Link
            href="/kelola-user"
            className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive("/kelola-user")
                ? "bg-primary text-white"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Users className="h-5 w-5" />
            Kelola User
          </Link>
        )}
      </nav>
    </aside>
  );
}
