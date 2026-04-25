"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { getToken, getUserContext, isSessionExpired, logoutUser } from "../lib/authService";
import { Loader2 } from "lucide-react";

export default function ClientWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isClientAuthChecked, setIsClientAuthChecked] = useState(false);

  const isAuthPage = pathname === "/auth" || pathname.startsWith("/auth/");

  useEffect(() => {
    const token = getToken();

    // Cek session expired
    if (!isAuthPage && isSessionExpired()) {
      logoutUser();
      router.replace("/auth");
      return;
    }

    // Jika tidak ada token dan bukan halaman auth, redirect ke login
    if (!token && !isAuthPage) {
      router.replace("/auth");
      return;
    }

    // Jika sudah login dan mencoba masuk halaman auth, redirect ke dashboard
    if (token && isAuthPage) {
      router.replace("/");
      return;
    }

    // Route protection berdasarkan role
    if (token && !isAuthPage) {
      const ctx = getUserContext();
      const role = ctx?.role || "user";

      // Halaman Kelola Aset (Daftar, Kategori, Merek): hanya super admin & admin
      if (
        (pathname.startsWith("/aset/daftar") || pathname.startsWith("/aset/kategori") || pathname.startsWith("/aset/merek")) 
        && !["super admin", "admin"].includes(role)
      ) {
        router.replace("/");
        return;
      }

      // Halaman Kelola User: super admin dan admin
      if (pathname.startsWith("/kelola-user") && !["super admin", "admin"].includes(role)) {
        router.replace("/");
        return;
      }
    }

    setIsClientAuthChecked(true);
  }, [pathname, isAuthPage, router]);

  // Loading indicator sementara menunggu pengecekan token
  if (!isClientAuthChecked && !isAuthPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-primary font-medium flex items-center gap-2">
          <Loader2 className="animate-spin h-5 w-5" />
          Loading...
        </div>
      </div>
    );
  }

  if (isAuthPage) {
    return (
      <main className="min-h-screen bg-white">
        {children}
      </main>
    );
  }

  return (
    <>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <Navbar isCollapsed={isCollapsed} />
      <div className={`flex min-h-screen flex-col transition-all duration-300 ease-in-out ${isCollapsed ? "ml-20" : "ml-64"}`}>
        <main key={pathname} className="flex-1 bg-background p-6 pt-22 animate-page-in">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
