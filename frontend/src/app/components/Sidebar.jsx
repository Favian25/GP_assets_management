"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getUserContext } from "../lib/authService";
import { Home, Package, ClipboardList, Tag, FileText, Users, ChevronRight, PanelRight, Cpu, BarChart2, ShieldAlert, Activity, X } from "lucide-react";

export default function Sidebar({ isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) {
  const pathname = usePathname();
  const [asetOpen, setAsetOpen] = useState(pathname.startsWith("/aset"));
  const [reportsOpen, setReportsOpen] = useState(pathname.startsWith("/reports"));
  const [userRole, setUserRole] = useState("user");

  useEffect(() => {
    const ctx = getUserContext();
    if (ctx) setUserRole(ctx.role || "user");
  }, []);

  // Tutup grup jika sidebar di-collapse, tapi buka jika sedang di halaman terkait
  useEffect(() => {
    if (isCollapsed) {
      setAsetOpen(false);
      setReportsOpen(false);
    } else {
      if (pathname.startsWith("/aset")) setAsetOpen(true);
      if (pathname.startsWith("/reports")) setReportsOpen(true);
    }
  }, [isCollapsed, pathname]);

  // Auto-close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  const isActive = (path) => pathname === path;

  // Role checks
  const canSeeDaftarAset = ["super admin", "admin"].includes(userRole);

  // Close mobile sidebar
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 flex h-screen flex-col bg-sidebar-bg text-sidebar-text transition-all duration-300 ease-in-out
        ${/* Mobile: full overlay */ ""}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        w-64
        ${/* Desktop: normal behavior */ ""}
        lg:translate-x-0 lg:z-40
        ${isCollapsed ? "lg:w-20" : "lg:w-64"}
      `}>
        {/* Brand & Toggle Header */}
        <div className="flex h-16 items-center border-b border-white/10 px-4">
          {/* Toggle Button Wrapper - Aligned with Nav Icons */}
          <div className="flex w-12 shrink-0 items-center justify-center">
            {/* Desktop: collapse toggle */}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white cursor-pointer"
              title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
            >
              <PanelRight className="h-5 w-5" />
            </button>
            {/* Mobile: close button */}
            <button 
              onClick={closeMobile}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className={`flex flex-1 items-center justify-center transition-all duration-500 overflow-hidden ${isCollapsed ? "lg:max-w-0 lg:opacity-0 lg:invisible" : "max-w-full opacity-100 visible"}`}>
            <Link href="/" className="flex items-center justify-center w-full">
              <div className="flex h-8 w-auto items-center justify-center bg-transparent relative">
                <Image src="/logo-galeria-production.png" alt="Galeria Production Logo" width={110} height={110} className="h-full w-auto object-contain" style={{ width: 'auto' }} priority />
              </div>
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 mt-6 space-y-1 custom-scrollbar">
          {/* Dashboard */}
          <Link
            href="/"
            className={`group flex items-center h-11 rounded-lg transition-all duration-300 ${
              isActive("/")
                ? "bg-primary text-white"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
            title={isCollapsed ? "Dashboard" : ""}
          >
            <div className="flex w-12 h-full items-center justify-center shrink-0">
              <Home className="h-5 w-5" />
            </div>
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100 ml-1"}`}>
              Dashboard
            </span>
          </Link>

          {/* Aset Group */}
          <div>
            <button
              onClick={() => {
                if (isCollapsed) {
                  setIsCollapsed(false);
                  setAsetOpen(true);
                } else {
                  setAsetOpen(!asetOpen);
                }
              }}
              className={`group flex w-full items-center h-11 rounded-lg transition-all duration-300 ${
                pathname.startsWith("/aset")
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
              title={isCollapsed ? "Kelola Aset" : ""}
            >
              <div className="flex w-12 h-full items-center justify-center shrink-0">
                <Package className="h-5 w-5" />
              </div>
              <span className={`flex-1 text-left whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100 ml-1"}`}>
                Kelola Aset
              </span>
              <ChevronRight className={`h-4 w-4 mr-3 transition-transform duration-300 ${asetOpen ? "rotate-90" : ""} ${isCollapsed ? "lg:hidden" : ""}`} />
            </button>

            <div 
              className={`grid transition-all duration-300 ease-in-out ${
                asetOpen && (!isCollapsed || mobileOpen) ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden ml-4 space-y-1">
                {/* Daftar Aset - Only Super Admin & Admin */}
                {canSeeDaftarAset && (
                  <>
                    <Link
                      href="/aset/daftar"
                      className={`flex items-center h-10 rounded-lg transition-all duration-300 ${
                        isActive("/aset/daftar")
                          ? "bg-primary text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex w-12 h-full items-center justify-center shrink-0">
                        <ClipboardList className="h-4 w-4" />
                      </div>
                      <span className="text-[13px] whitespace-nowrap">Daftar Aset</span>
                    </Link>
                    
                    <Link
                      href="/aset/kategori"
                      className={`flex items-center h-10 rounded-lg transition-all duration-300 ${
                        isActive("/aset/kategori") || isActive("/aset/merek")
                          ? "bg-primary text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex w-12 h-full items-center justify-center shrink-0">
                        <Tag className="h-4 w-4" />
                      </div>
                      <span className="text-[13px] whitespace-nowrap">Kategori & Merek</span>
                    </Link>
                  </>
                )}

                <Link
                  href="/aset/peminjaman"
                  className={`flex items-center h-10 rounded-lg transition-all duration-300 ${
                    pathname.startsWith("/aset/peminjaman")
                      ? "bg-primary text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex w-12 h-full items-center justify-center shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="text-[13px] whitespace-nowrap">Peminjaman Aset</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Aksesoris - Only Super Admin & Admin */}
          {canSeeDaftarAset && (
            <Link
              href="/aksesoris"
              className={`group flex items-center h-11 rounded-lg transition-all duration-300 ${
                isActive("/aksesoris")
                  ? "bg-primary text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
              title={isCollapsed ? "Aksesoris" : ""}
            >
              <div className="flex w-12 h-full items-center justify-center shrink-0">
                <Cpu className="h-5 w-5" />
              </div>
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100 ml-1"}`}>
                Aksesoris
              </span>
            </Link>
          )}

          {/* Laporan Group - Only Super Admin & Admin */}
          {["super admin", "admin"].includes(userRole) && (
            <div>
              <button
                onClick={() => {
                  if (isCollapsed) {
                    setIsCollapsed(false);
                    setReportsOpen(true);
                  } else {
                    setReportsOpen(!reportsOpen);
                  }
                }}
                className={`group flex w-full items-center h-11 rounded-lg transition-all duration-300 ${
                  pathname.startsWith("/reports")
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
                title={isCollapsed ? "Laporan" : ""}
              >
                <div className="flex w-12 h-full items-center justify-center shrink-0">
                  <BarChart2 className="h-5 w-5" />
                </div>
                <span className={`flex-1 text-left whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100 ml-1"}`}>
                  Laporan
                </span>
                <ChevronRight className={`h-4 w-4 mr-3 transition-transform duration-300 ${reportsOpen ? "rotate-90" : ""} ${isCollapsed ? "lg:hidden" : ""}`} />
              </button>

              <div 
                className={`grid transition-all duration-300 ease-in-out ${
                  reportsOpen && (!isCollapsed || mobileOpen) ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden ml-4 space-y-1">
                  {[
                    { name: "Aktivitas", href: "/reports/aktivitas", icon: Activity },
                    { name: "Aset", href: "/reports/aset", icon: Package },
                    { name: "Aksesoris", href: "/reports/aksesoris", icon: Cpu },
                    { name: "Peminjaman", href: "/reports/peminjaman", icon: ClipboardList },
                    { name: "Audit Log", href: "/reports/audit", icon: ShieldAlert },
                  ].map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center h-10 rounded-lg transition-all duration-300 ${
                        isActive(item.href)
                          ? "bg-primary text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex w-12 h-full items-center justify-center shrink-0">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="text-[13px] whitespace-nowrap">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Kelola User - Only Super Admin & Admin */}
          {["super admin", "admin"].includes(userRole) && (
            <Link
              href="/kelola-user"
              className={`group flex items-center h-11 rounded-lg transition-all duration-300 ${
                isActive("/kelola-user")
                  ? "bg-primary text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
              title={isCollapsed ? "Kelola User" : ""}
            >
              <div className="flex w-12 h-full items-center justify-center shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100 ml-1"}`}>
                Kelola User
              </span>
            </Link>
          )}
        </nav>
      </aside>
    </>
  );
}
