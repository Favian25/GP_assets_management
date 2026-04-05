"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logoutUser, getUserContext } from "../lib/authService";

export default function Navbar() {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const [userName, setUserName] = useState("");
  const [userInitial, setUserInitial] = useState("U");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const ctx = getUserContext();
    if (ctx) {
      setUserName(ctx.namaLengkap || ctx.email || "");
      setUserInitial((ctx.namaLengkap || ctx.email || "U").charAt(0).toUpperCase());
      setUserRole(ctx.role || "user");
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    router.replace("/auth");
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

  const notifications = [
    { text: "Kamera Sony A7III telah dikembalikan", time: "5 menit lalu", unread: true },
    { text: "Mic Rode NT1 dipinjam oleh Budi", time: "1 jam lalu", unread: true },
    { text: "Tripod Manfrotto selesai maintenance", time: "3 jam lalu", unread: false },
    { text: "Aset baru Gimbal DJI RS3 ditambahkan", time: "1 hari lalu", unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="fixed top-0 right-0 left-64 z-30 flex h-16 items-center justify-end border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-2">
        {/* Notification */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-100 bg-white shadow-lg">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">Notifikasi</p>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((notif, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 ${
                      notif.unread ? "bg-blue-50/40" : ""
                    }`}
                  >
                    {notif.unread && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    )}
                    {!notif.unread && <span className="mt-1.5 h-2 w-2 shrink-0" />}
                    <div>
                      <p className="text-sm text-slate-700">{notif.text}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 px-4 py-2.5">
                <button className="w-full text-center text-xs font-medium text-primary hover:text-primary-hover">
                  Lihat semua notifikasi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-slate-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              {userInitial}
            </div>
            <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-100 bg-white shadow-lg">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800 truncate">{userName}</p>
                <p className="text-xs text-slate-400 capitalize">{userRole}</p>
              </div>
              <div className="p-1.5">
                <button className="cursor-pointer flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profil Saya
                </button>
              </div>
              <div className="mx-1.5 border-t border-slate-100" />
              <div className="p-1.5">
                <button onClick={handleLogout} className="cursor-pointer flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-50">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
