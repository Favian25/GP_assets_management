"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { getToken, getUserContext, isSessionExpired, logoutUser } from "../lib/authService";

export default function ClientWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
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
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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
      <Sidebar />
      <Navbar />
      <div className="ml-64 flex min-h-screen flex-col">
        <main className="flex-1 bg-background p-6 pt-22">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
