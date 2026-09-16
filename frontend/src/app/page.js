"use client";

import { useState, useEffect, cloneElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDashboardStats } from "./lib/assetService";
import {
  Package, CheckCircle2, AlertCircle, Settings, AlertTriangle,
  RefreshCw, ClipboardList, ChevronRight, Search, Minus, Plus,
  Calendar, User, Clock, LayoutGrid, Cpu, Check, X, Zap, TrendingUp
} from "lucide-react";
import { getUserContext } from "./lib/authService";
import { createPortal } from "react-dom";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState("user");
  const [userName, setUserName] = useState("User");
  const [toast, setToast] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const ctx = getUserContext();
    if (ctx) {
      setUserRole(ctx.role || "user");
      setUserName(ctx.name || "User");
    }

    // Check for unauthorized error from redirect
    const err = new URLSearchParams(window.location.search).get("error");
    if (err === "unauthorized") {
      showToast("Akses Dibatasi: Anda tidak memiliki izin untuk mengakses halaman tersebut.", "error");
      // Clean up URL
      router.replace("/");
    }

    fetchStats();
  }, []);

  const showToast = (message, type = "error") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const fetchStats = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError("Gagal memuat statistik dashboard. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Get greeting berdasarkan waktu
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Pagi";
    if (hour < 15) return "Siang";
    if (hour < 18) return "Sore";
    return "Malam";
  };

  // Format last updated time
  const formatLastUpdated = () => {
    const now = new Date();
    const diff = Math.floor((now - lastUpdated) / 1000);
    if (diff < 60) return "Baru saja";
    if (diff < 3600) return `${Math.floor(diff / 60)}m yang lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h yang lalu`;
    return lastUpdated.toLocaleDateString("id-ID");
  };

  const [activitySearch, setActivitySearch] = useState("");
  const [isActivityMinimized, setIsActivityMinimized] = useState(false);
  const [isLoanMinimized, setIsLoanMinimized] = useState(false);
  const [loanSearch, setLoanSearch] = useState("");

  // Set initial minimized state for tablet/mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsLoanMinimized(true);
    }
  }, []);

  const filteredActivities = stats?.activities?.filter(a => 
    a.item?.toLowerCase().includes(activitySearch.toLowerCase()) ||
    a.action?.toLowerCase().includes(activitySearch.toLowerCase()) ||
    a.createdBy?.toLowerCase().includes(activitySearch.toLowerCase()) ||
    a.target?.toLowerCase().includes(activitySearch.toLowerCase())
  ) || [];

  const filteredLoans = stats?.activeLoans?.filter(l => 
    l.kodePinjam?.toLowerCase().includes(loanSearch.toLowerCase()) ||
    l.namaPeminjam?.toLowerCase().includes(loanSearch.toLowerCase())
  ) || [];

  const formatActivityDate = (dateStr) => {
    const d = new Date(dateStr);
    const datePart = new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
    const timePart = new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d) + " WIB";
    return { datePart, timePart };
  };

  const handleActivityClick = (activity) => {
    const isAdmin = ["super admin", "admin"].includes(userRole);
    if (activity.type === 'asset') {
      if (!isAdmin) {
        showToast("Akses Dibatasi: Anda tidak memiliki izin untuk melihat daftar aset.", "error");
        return;
      }
      router.push(`/aset/daftar?search=${activity.item}`);
    } else if (activity.type === 'aksesoris') {
      if (!isAdmin) {
        showToast("Akses Dibatasi: Anda tidak memiliki izin untuk melihat daftar aksesoris.", "error");
        return;
      }
      router.push(`/aksesoris?search=${activity.item}`);
    } else if (activity.type === 'loan') {
      router.push(`/aset/peminjaman?search=${activity.item}`);
    }
  };

  const statCards = [
    {
      title: "Total Aset",
      value: stats?.total ?? 0,
      icon: <Package />,
      color: "bg-blue-600",
      link: "/aset/daftar",
    },
    {
      title: "Aksesoris",
      value: stats?.aksesorisTotal ?? 0,
      icon: <Cpu />,
      color: "bg-cyan-500",
      link: "/aksesoris",
    },
    {
      title: "Siap Digunakan",
      value: stats?.tersedia ?? 0,
      icon: <CheckCircle2 />,
      color: "bg-emerald-600",
      link: "/aset/daftar?kondisi=Siap Digunakan",
    },
    {
      title: "Rusak",
      value: stats?.rusak ?? 0,
      icon: <AlertCircle />,
      color: "bg-rose-600",
      link: "/aset/daftar?kondisi=Rusak",
    },
    {
      title: "Maintenance",
      value: stats?.maintenance ?? 0,
      icon: <Settings />,
      color: "bg-amber-500",
      link: "/aset/daftar?kondisi=Maintenance",
    },
    {
      title: "Alat Dipinjam",
      value: stats?.dipinjam ?? 0,
      icon: <ClipboardList />,
      color: "bg-indigo-600",
      link: "/aset/peminjaman?status=Sedang Dipinjam",
    },
  ];

  // Loading skeleton
  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Selamat datang di Sistem Pencatatan Asset Galeria Karya Media
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-slate-200" />
                <div className="flex flex-col space-y-2">
                  <div className="h-6 w-12 rounded bg-slate-200" />
                  <div className="h-3 w-20 rounded bg-slate-200" />
                </div>
              </div>
              <div className="h-3 w-24 rounded bg-slate-200 mt-1" />
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-xl border border-slate-100 bg-white p-6 shadow-sm animate-pulse">
          <div className="h-5 w-40 rounded bg-slate-200 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="h-2 w-2 rounded-full bg-slate-200" />
                <div className="h-3 flex-1 rounded bg-slate-200" />
                <div className="h-3 w-20 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Selamat datang di Sistem Pencatatan Asset Galeria Karya Media
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-10">
        <AlertTriangle className="h-12 w-12 text-rose-400 mb-3" />
        <p className="text-sm font-medium text-rose-700 mb-1">Koneksi Gagal</p>
          <p className="text-xs text-rose-500 mb-4 text-center">{error}</p>
          <button
            onClick={fetchStats}
            className="cursor-pointer flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600"
          >
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-black text-slate-900">
                Selamat {getGreeting()}, {userName}! 👋
              </h1>
            </div>
            <p className="text-sm text-slate-600">
              Sistem Pencatatan Asset Galeria Karya Media
            </p>
          </div>
          <button
            onClick={() => fetchStats()}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-hover text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Memperbarui..." : "Perbarui"}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Terakhir diperbarui: {formatLastUpdated()}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat, index) => {
          const isRestricted = ["/aset/daftar", "/aksesoris", "/reports"].some(path => stat.link.startsWith(path)) && !["super admin", "admin"].includes(userRole);

          return (
            <Link
              key={index}
              href={stat.link}
              onClick={(e) => {
                if (isRestricted) {
                  e.preventDefault();
                  showToast("Akses Dibatasi: Anda tidak memiliki izin untuk mengakses halaman ini.", "error");
                }
              }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-6 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 group block ${isRestricted ? "cursor-not-allowed opacity-75" : "cursor-pointer"}`}
            >
              {/* Decorative animated gradient background */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/[0.08] transition-transform duration-500 group-hover:scale-150 group-hover:translate-x-2 group-hover:-translate-y-2" />
              <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-white/[0.05] transition-transform duration-500 group-hover:scale-125" />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-lg shadow-lg border border-white/30">
                    {cloneElement(stat.icon, { className: "h-7 w-7 text-white" })}
                  </div>
                  <TrendingUp className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
                </div>

                <div>
                  <span className="text-4xl font-black leading-none mb-2 block">
                    {stats ? stat.value : "—"}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-90 block">
                    {stat.title}
                  </span>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide opacity-90 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                  Lihat <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Dashboard Tables Grid - Stacked Vertically */}
      <div className="mt-8 flex flex-col gap-8">

        {/* Peminjaman Aktif Section - Top */}
        <div className="w-full rounded-2xl bg-white shadow-xl overflow-hidden border border-slate-100">
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <ClipboardList className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Peminjaman Aktif</h2>
                  <p className="text-xs text-blue-100 mt-1">Daftar aset yang sedang dipinjam</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`relative transition-all duration-300 ${isLoanMinimized ? "opacity-0 invisible w-0" : "opacity-100 visible w-40 sm:w-56"}`}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={loanSearch}
                    onChange={(e) => setLoanSearch(e.target.value)}
                    className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm py-2 pl-10 pr-3 text-sm text-white placeholder-slate-400 focus:border-white/40 focus:ring-1 focus:ring-white/20 focus:bg-white/15 outline-none transition-all w-full"
                  />
                </div>
                <button
                  onClick={() => setIsLoanMinimized(!isLoanMinimized)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                >
                  {isLoanMinimized ? <Plus className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isLoanMinimized ? "max-h-0" : "max-h-[600px]"}`}>
            <div className="overflow-x-auto h-[480px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Peminjam</th>
                    <th className="px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Alat Dipinjam</th>
                    <th className="px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider text-center w-[110px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLoans?.map((loan) => (
                    <tr
                      key={loan.id}
                      onClick={() => {
                        router.push(`/aset/peminjaman?search=${loan.kodePinjam}`);
                      }}
                      className="cursor-pointer group hover:bg-slate-50/80 transition-colors duration-200"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-slate-900">{loan.namaPeminjam}</span>
                          <span className="text-xs text-slate-500">{loan.kodePinjam}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-slate-700">{loan.totalItems || 0} Alat</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                          loan.status === 'Menunggu Persetujuan'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 group-hover:bg-amber-100 group-hover:border-amber-300' :
                          loan.status === 'Sedang Dipinjam'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 group-hover:bg-blue-100 group-hover:border-blue-300' :
                          'bg-violet-50 text-violet-700 border-violet-200 group-hover:bg-violet-100 group-hover:border-violet-300'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${
                            loan.status === 'Menunggu Persetujuan' ? 'bg-amber-500' :
                            loan.status === 'Sedang Dipinjam' ? 'bg-blue-500' :
                            'bg-violet-500'
                          }`}></span>
                          {loan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!filteredLoans || filteredLoans.length === 0) && (
                    <tr>
                      <td colSpan={3} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                            <ClipboardList className="h-6 w-6 text-slate-400" />
                          </div>
                          <p className="text-sm font-medium text-slate-500">Tidak ada peminjaman</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Aktivitas Terbaru Section - Bottom */}
        <div className="w-full rounded-2xl bg-white shadow-xl overflow-hidden border border-slate-100">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Aktivitas Terbaru</h2>
                  <p className="text-xs text-slate-300 mt-1">Perubahan sistem real-time</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`relative transition-all duration-300 ${isActivityMinimized ? "opacity-0 invisible w-0" : "opacity-100 visible w-40 sm:w-56"}`}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={activitySearch}
                    onChange={(e) => { setActivitySearch(e.target.value); }}
                    className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm py-2 pl-10 pr-3 text-sm text-white placeholder-slate-400 focus:border-white/40 focus:ring-1 focus:ring-white/20 focus:bg-white/15 outline-none transition-all w-full"
                  />
                </div>
                <button
                  onClick={() => setIsActivityMinimized(!isActivityMinimized)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                >
                  {isActivityMinimized ? <Plus className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isActivityMinimized ? "max-h-0" : "max-h-[600px]"}`}>
            <div className="overflow-x-auto h-[480px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider w-[130px]">Tanggal</th>
                    <th className="px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Pengguna</th>
                    <th className="px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider text-center w-[110px]">Tipe</th>
                    <th className="px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Item</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredActivities.map((activity) => (
                    <tr
                      key={activity.id}
                      onClick={() => handleActivityClick(activity)}
                      className="cursor-pointer group hover:bg-slate-50/80 transition-colors duration-200"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-slate-900">{formatActivityDate(activity.date).datePart}</span>
                          <span className="text-xs text-slate-500">{formatActivityDate(activity.date).timePart}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-sm font-medium text-slate-700 inline-flex items-center gap-2">
                          <span className="flex h-2 w-2 rounded-full bg-slate-400"></span>
                          {activity.createdBy}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                          activity.action === 'Peminjaman'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 group-hover:bg-amber-100 group-hover:border-amber-300' :
                          activity.action === 'Pengembalian'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 group-hover:bg-blue-100 group-hover:border-blue-300' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200 group-hover:bg-emerald-100 group-hover:border-emerald-300'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${
                            activity.action === 'Peminjaman' ? 'bg-amber-500' :
                            activity.action === 'Pengembalian' ? 'bg-blue-500' :
                            'bg-emerald-500'
                          }`}></span>
                          {activity.action}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5 group-hover:text-slate-900 transition-colors duration-200">
                          <Package className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-slate-700 truncate">{activity.item}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredActivities.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                            <Clock className="h-6 w-6 text-slate-400" />
                          </div>
                          <p className="text-sm font-medium text-slate-500">Tidak ada aktivitas</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Portal */}
      {mounted && typeof document !== 'undefined' && toast && createPortal(
        <div className={`fixed top-20 right-6 z-9999 flex items-center gap-2 rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-white transition-all animate-[slideIn_0.3s_ease] ${toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"}`}>
          {toast.type === "error" ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {toast.message}
        </div>,
        document.body
      )}
    </div>
  );
}
