"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { logoutUser, getUserContext } from "../lib/authService";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, formatTimeAgo } from "../lib/notificationService";
import { Bell, User, ChevronDown, LogOut, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Menu } from "lucide-react";

const getBackendURL = () => {
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:5000`;
  }
  return "http://localhost:5000";
};
const BACKEND_URL = getBackendURL();

export default function Navbar({ isCollapsed, onMenuToggle }) {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const [userName, setUserName] = useState("");
  const [userInitial, setUserInitial] = useState("U");
  const [userRole, setUserRole] = useState("");
  const [userFoto, setUserFoto] = useState(null);

  // Notifikasi state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateFromCtx = () => {
      const ctx = getUserContext();
      if (ctx) {
        setUserName(ctx.namaLengkap || ctx.email || "");
        setUserInitial((ctx.namaLengkap || ctx.email || "U").charAt(0).toUpperCase());
        setUserRole(ctx.role || "user");
        setUserFoto(ctx.fotoProfil || ctx.foto_profil || null);
      }
    };
    updateFromCtx();

    window.addEventListener("userContextUpdated", updateFromCtx);
    return () => window.removeEventListener("userContextUpdated", updateFromCtx);
  }, []);

  const handleLogout = () => {
    logoutUser();
    router.replace("/auth");
  };

  // Fetch notifikasi
  const fetchNotifications = useCallback(async () => {
    const result = await getNotifications();
    if (result.success) {
      setNotifications(result.data);
      setUnreadCount(result.unreadCount);
    }
  }, []);

  // Polling setiap 15 detik
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Tandai semua sudah dibaca saat dropdown dibuka
  const handleOpenNotif = async () => {
    const willOpen = !notifOpen;
    setNotifOpen(willOpen);
    setProfileOpen(false);
    if (willOpen && unreadCount > 0) {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    }
  };

  // Klik notifikasi individual
  const handleNotifClick = async (notif) => {
    if (!notif.is_read) {
      await markNotificationAsRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: 1 } : n));
    }
    setNotifOpen(false);

    // Extraction Logic
    let searchKeyword = "";
    if (['peminjaman_baru', 'dikembalikan', 'approved'].includes(notif.type)) {
      // Extract from: "... (PINJAM-001)" or "Peminjaman PINJAM-001 ..."
      const match = notif.message.match(/\(([^)]+)\)/) || notif.message.match(/(?:Peminjaman\s)([A-Z0-9-]+)/i);
      searchKeyword = match ? match[1] : "";
      router.push(`/aset/peminjaman?search=${encodeURIComponent(searchKeyword)}`);
    } else if (notif.type === 'stok_rendah_aset') {
      // Extract from: "Stok Canon EOS R5 tersisa..."
      const match = notif.message.match(/Stok\s(.*?)\stersisa/i);
      searchKeyword = match ? match[1] : "";
      router.push(`/aset/daftar?search=${encodeURIComponent(searchKeyword)}`);
    } else if (notif.type === 'stok_rendah_aks') {
      const match = notif.message.match(/Stok\s(.*?)\stersisa/i);
      searchKeyword = match ? match[1] : "";
      router.push(`/aksesoris?search=${encodeURIComponent(searchKeyword)}`);
    }
  };

  // Icon berdasarkan tipe notifikasi
  const getNotifIcon = (type) => {
    const icons = {
      peminjaman_baru: { bg: "bg-blue-100", color: "text-blue-600", component: FileText },
      dikembalikan: { bg: "bg-emerald-100", color: "text-emerald-600", component: CheckCircle2 },
      approved: { bg: "bg-violet-100", color: "text-violet-600", component: ShieldCheck },
      stok_rendah: { bg: "bg-amber-100", color: "text-amber-600", component: AlertTriangle },
      stok_rendah_aset: { bg: "bg-amber-100", color: "text-amber-600", component: AlertTriangle },
      stok_rendah_aks: { bg: "bg-amber-100", color: "text-amber-600", component: AlertTriangle },
    };
    return icons[type] || icons.peminjaman_baru;
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className={`fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 transition-all duration-300 ease-in-out left-0 ${isCollapsed ? "lg:left-20" : "lg:left-64"}`}>
      <div className="flex items-center gap-3">
        {/* Hamburger Menu - Mobile Only */}
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div 
          className="text-lg sm:text-xl font-montserrat font-extrabold tracking-wide drop-shadow-sm truncate pr-4 hidden sm:block"
          style={{ backgroundImage: 'radial-gradient(circle at top left, #3b82f6 0%, #1d4ed8 50%, #1e3a8a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}
        >
          ASSET MANAGEMENT SYSTEM
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notification */}
        <div ref={notifRef} className="relative">
          <button
            onClick={handleOpenNotif}
            className="cursor-pointer relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <div className={`fixed sm:absolute top-16 right-4 sm:top-auto sm:right-0 sm:mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-96 grid transition-all duration-300 ease-in-out z-50 ${notifOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"}`}>
            <div className="overflow-hidden">
              <div className="rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5">
                <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">Notifikasi</p>
                  {notifications.length > 0 && (
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {notifications.length} terbaru
                    </span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                      <p className="text-sm text-slate-400">Tidak ada notifikasi</p>
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notif) => {
                      const icon = getNotifIcon(notif.type);
                      return (
                        <button
                          key={notif.id}
                          onClick={() => handleNotifClick(notif)}
                          className={`cursor-pointer w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 border-b-2 border-slate-100 last:border-0 ${
                            !notif.is_read ? "bg-primary/5" : ""
                          }`}
                        >
                          <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${icon.bg}`}>
                            <icon.component className={`h-4 w-4 ${icon.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notif.is_read ? "text-slate-800 font-medium" : "text-slate-600"}`}>{notif.message}</p>
                            <p className="mt-0.5 text-xs text-slate-400">{formatTimeAgo(notif.created_at)}</p>
                          </div>
                          {!notif.is_read && (
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
                <div className="border-t border-slate-200 p-2">
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      router.push("/notifikasi");
                    }}
                    className="cursor-pointer w-full rounded-lg py-2 text-center text-xs font-semibold uppercase text-primary transition-colors hover:bg-primary/10"
                  >
                    Lihat Semua Notifikasi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="cursor-pointer flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-slate-100"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 text-sm font-bold text-slate-600 overflow-hidden">
              {userFoto ? (
                <Image src={userFoto.startsWith("http") ? userFoto : `${BACKEND_URL}${userFoto}`} alt="Profile" fill className="object-cover" sizes="32px" unoptimized priority />
              ) : (
                userInitial
              )}
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
          </button>

          <div className={`absolute right-0 mt-2 w-56 grid transition-all duration-300 ease-in-out ${profileOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"}`}>
            <div className="overflow-hidden">
              <div className="rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5">
                <div className="px-4 py-3 border-b border-slate-200">
                  <p className="text-sm font-semibold text-slate-800 truncate">{userName}</p>
                  <p className="text-xs text-slate-400 capitalize">{userRole}</p>
                </div>
                <div className="p-1.5">
                  <button onClick={() => { setProfileOpen(false); router.push("/profil"); }} className="cursor-pointer flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-primary/10 hover:text-primary">
                    <User className="h-4 w-4" />
                    Profil Saya
                  </button>
                </div>
                <div className="mx-1.5 border-t border-slate-200" />
                <div className="p-1.5">
                  <button onClick={handleLogout} className="cursor-pointer flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-100">
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
