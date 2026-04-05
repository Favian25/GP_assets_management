"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getUserContext } from "../lib/authService";

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
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-lg bg-white overflow-hidden p-1.5 shadow-sm">
          <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white leading-tight">
            Galeria Production
          </h1>
          <p className="text-[11px] text-slate-400">Asset Management</p>
        </div>
      </div>

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
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
          </svg>
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
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Aset
          </span>
          <svg
            className={`h-4 w-4 transition-transform ${asetOpen ? "rotate-90" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {asetOpen && (
          <div className="ml-4 border-l border-white/10 pl-3">
            {/* Daftar Aset - Only Super Admin & Admin */}
            {canSeeDaftarAset && (
              <Link
                href="/aset/daftar"
                className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                  isActive("/aset/daftar")
                    ? "bg-primary text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Daftar Aset
              </Link>
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
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Peminjaman Aset
            </Link>
          </div>
        )}

        {/* Kelola User - Only Super Admin */}
        {userRole === "super admin" && (
          <Link
            href="/kelola-user"
            className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive("/kelola-user")
                ? "bg-primary text-white"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            Kelola User
          </Link>
        )}
      </nav>
    </aside>
  );
}
