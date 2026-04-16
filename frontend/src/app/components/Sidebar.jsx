"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getUserContext } from "../lib/authService";

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
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
    <aside className={`fixed top-0 left-0 z-40 flex h-screen flex-col bg-sidebar-bg text-sidebar-text transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}>
      {/* Brand & Toggle */}
      <div className={`flex items-center border-b border-white/10 py-6 mb-2 ${isCollapsed ? "justify-center px-2" : "justify-between px-4"}`}>
        {!isCollapsed && (
          <Link href="/" className="flex h-12 w-auto items-center justify-center bg-transparent cursor-pointer hover:bg-white/5 transition-colors rounded-lg overflow-hidden flex-1">
            <img src="/logo-galeria-production.png" alt="Galeria Production Logo" className="h-full w-auto max-w-[140px] object-contain" />
          </Link>
        )}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className={`cursor-pointer p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors ${isCollapsed ? "" : "ml-2"}`}>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Dashboard */}
        <Link
          href="/"
          className={`mb-1 flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors ${isCollapsed ? "justify-center px-0" : "gap-3 px-3"} ${
            isActive("/")
              ? "bg-primary text-white"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
          title={isCollapsed ? "Dashboard" : undefined}
        >
          <svg className={`shrink-0 ${isCollapsed ? "h-6 w-6" : "h-5 w-5"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
          </svg>
          {!isCollapsed && <span>Dashboard</span>}
        </Link>

        {/* Aset Group */}
        <button
          onClick={() => {
            if (isCollapsed) {
              setIsCollapsed(false);
              setAsetOpen(true);
            } else {
              setAsetOpen(!asetOpen);
            }
          }}
          className={`mb-1 flex w-full items-center rounded-lg py-2.5 text-sm font-medium transition-colors ${isCollapsed ? "justify-center px-0" : "justify-between px-3"} ${
            pathname.startsWith("/aset")
              ? "bg-white/10 text-white"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
          title={isCollapsed ? "Aset" : undefined}
        >
          <span className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
            <svg className={`shrink-0 ${isCollapsed ? "h-6 w-6" : "h-5 w-5"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            {!isCollapsed && <span>Aset</span>}
          </span>
          {!isCollapsed && (
            <svg
              className={`h-4 w-4 transition-transform ${asetOpen ? "rotate-90" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>

        {asetOpen && !isCollapsed && (
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
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
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
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
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
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Peminjaman Aset
            </Link>
          </div>
        )}

        {/* Kelola User - Only Super Admin & Admin */}
        {["super admin", "admin"].includes(userRole) && (
          <Link
            href="/kelola-user"
            className={`mb-1 flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors ${isCollapsed ? "justify-center px-0 mt-2" : "gap-3 px-3"} ${
              isActive("/kelola-user")
                ? "bg-primary text-white"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
            title={isCollapsed ? "Kelola User" : undefined}
          >
            <svg className={`shrink-0 ${isCollapsed ? "h-6 w-6" : "h-5 w-5"}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73A9.93 9.93 0 0112 12.75zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1A6.73 6.73 0 004 14c-.99 0-1.93.21-2.78.58A2.01 2.01 0 000 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85A6.95 6.95 0 0020 14c-.37 0-.74.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
            </svg>
            {!isCollapsed && <span>Kelola User</span>}
          </Link>
        )}
      </nav>
    </aside>
  );
}
