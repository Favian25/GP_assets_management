"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Bell, FileText, CheckCircle2, ShieldCheck, AlertTriangle, ChevronLeft, Trash2, Check, X, RefreshCcw, ChevronsLeft, ChevronsRight, ChevronRight } from "lucide-react";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, formatTimeAgo } from "../lib/notificationService";
import { getUserContext } from "../lib/authService";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setLoading(true);
        setCurrentPage(1);
      }
      const result = await getNotifications();
      if (result.success) {
        setNotifications(result.data);
        setUnreadCount(result.unreadCount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (message, type = "success") => setToast({ message, type });

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
      showToast("Semua notifikasi ditandai sebagai dibaca");
    } catch (err) {
      showToast("Gagal menandai notifikasi", "error");
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.is_read) {
      await markNotificationAsRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // Extraction Logic (Reusing from Navbar)
    let searchKeyword = "";
    if (['peminjaman_baru', 'dikembalikan', 'approved'].includes(notif.type)) {
      const match = notif.message.match(/\(([^)]+)\)/) || notif.message.match(/(?:Peminjaman\s)([A-Z0-9-]+)/i);
      searchKeyword = match ? match[1] : "";
      router.push(`/aset/peminjaman?search=${encodeURIComponent(searchKeyword)}`);
    } else if (notif.type === 'stok_rendah_aset') {
      const match = notif.message.match(/Stok\s(.*?)\stersisa/i);
      searchKeyword = match ? match[1] : "";
      router.push(`/aset/daftar?search=${encodeURIComponent(searchKeyword)}`);
    } else if (notif.type === 'stok_rendah_aks') {
      const match = notif.message.match(/Stok\s(.*?)\stersisa/i);
      searchKeyword = match ? match[1] : "";
      router.push(`/aksesoris?search=${encodeURIComponent(searchKeyword)}`);
    }
  };

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

  // Pagination logic
  const totalPages = Math.ceil(notifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = notifications.slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = () => {
    const p = [];
    if (totalPages <= 4) { for (let i = 1; i <= totalPages; i++) p.push(i); }
    else if (currentPage <= 3) { for (let i = 1; i <= 3; i++) p.push(i); p.push("..."); p.push(totalPages); }
    else if (currentPage >= totalPages - 2) { p.push(1); p.push("..."); for (let i = totalPages - 2; i <= totalPages; i++) p.push(i); }
    else { p.push(1); p.push("..."); p.push(currentPage); p.push("..."); p.push(totalPages); }
    return p;
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Toast */}
      {typeof document !== 'undefined' && toast && createPortal(
        <div className={`fixed top-20 right-6 z-9999 flex items-center gap-2 rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-white transition-all animate-[slideIn_0.3s_ease] ${toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"}`}>
          {toast.type === "error" ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {toast.message}
        </div>,
        document.body
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="cursor-pointer rounded-lg bg-primary p-2 text-white hover:bg-primary-hover transition-colors shadow-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Semua Notifikasi</h1>
            <p className="text-sm text-slate-500">Pantau semua aktivitas sistem terbaru</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchNotifications(true)}
            disabled={loading}
            className="cursor-pointer flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="cursor-pointer flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors shadow-sm"
            >
              <Check className="h-4 w-4" />
              Tandai Semua Dibaca
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-6">
        {loading && notifications.length === 0 ? (
          <div className="p-12 space-y-4 animate-pulse">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex gap-4">
                <div className="h-10 w-10 rounded-lg bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-slate-100" />
                  <div className="h-3 w-1/4 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-20 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Belum Ada Notifikasi</h3>
            <p className="text-sm text-slate-500">Semua notifikasi terbaru akan muncul di sini.</p>
          </div>
        ) : (
          <div className="divide-y-2 divide-slate-100">
            {paginatedNotifications.map((notif) => {
              const icon = getNotifIcon(notif.type);
              return (
                <button
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className={`w-full text-left flex items-start gap-4 px-6 py-5 transition-all hover:bg-slate-50 group cursor-pointer ${
                    !notif.is_read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${icon.bg}`}>
                    <icon.component className={`h-5 w-5 ${icon.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {notif.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatTimeAgo(notif.created_at)}
                      </span>
                    </div>
                    <p className={`text-base leading-relaxed ${!notif.is_read ? "text-slate-800 font-semibold" : "text-slate-600"}`}>
                      {notif.message.replace(/\s\[(Peminjam|By):.*?\]/gi, "").trim()}
                    </p>
                  </div>
                  {!notif.is_read && (
                    <span className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-3">
          <p className="hidden sm:block text-sm text-slate-500">
            Menampilkan <span className="font-semibold text-slate-700">{startIndex + 1}</span>-
            <span className="font-semibold text-slate-700">{Math.min(startIndex + itemsPerPage, notifications.length)}</span> dari 
            <span className="font-semibold text-slate-700"> {notifications.length}</span> notifikasi
          </p>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(1)} 
              disabled={currentPage === 1} 
              className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1} 
              className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="flex items-center gap-1 mx-1">
              {getPageNumbers().map((page, idx) => page === "..." ? (
                <span key={`e-${idx}`} className="min-w-[32px] px-1 py-1.5 text-center text-sm text-slate-400">...</span>
              ) : (
                <button 
                  key={page} 
                  onClick={() => setCurrentPage(page)} 
                  className={`cursor-pointer min-w-[32px] h-8 rounded-lg text-sm font-medium transition-all ${
                    currentPage === page 
                      ? "bg-primary text-white shadow-md shadow-primary/20" 
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages} 
              className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setCurrentPage(totalPages)} 
              disabled={currentPage === totalPages} 
              className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
