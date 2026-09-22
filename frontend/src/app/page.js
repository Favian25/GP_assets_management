"use client";

import { useState, useEffect, cloneElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDashboardStats } from "./lib/assetService";
import {
  Package, CheckCircle2, AlertCircle, Settings, AlertTriangle,
  RefreshCw, ClipboardList, ChevronRight, Search, Minus, Plus,
  Calendar, User, Clock, LayoutGrid, Cpu, Check, X, Zap, TrendingUp,
  TrendingDown, BarChart3, PieChart, ArrowUpRight, ArrowDownRight
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
      setUserName(ctx.namaLengkap || "User");
    }

    const err = new URLSearchParams(window.location.search).get("error");
    if (err === "unauthorized") {
      showToast("Akses Dibatasi: Anda tidak memiliki izin untuk mengakses halaman tersebut.", "error");
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Pagi";
    if (hour < 15) return "Siang";
    if (hour < 18) return "Sore";
    return "Malam";
  };

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

  // Generate trend data untuk chart
  const generateTrendData = () => {
    if (!stats) return [];
    return [
      { label: "Siap", value: stats.tersedia || 0, color: "emerald" },
      { label: "Dipinjam", value: stats.dipinjam || 0, color: "blue" },
      { label: "Maintenance", value: stats.maintenance || 0, color: "amber" },
      { label: "Rusak", value: stats.rusak || 0, color: "rose" },
    ];
  };

  const statCards = [
    {
      title: "Total Aset",
      value: stats?.total ?? 0,
      icon: <Package />,
      color: "from-blue-600 to-blue-700",
      link: "/aset/daftar",
      trend: stats ? stats.dipinjam > 0 ? "up" : "stable" : null,
    },
    {
      title: "Aksesoris",
      value: stats?.aksesorisTotal ?? 0,
      icon: <Cpu />,
      color: "from-cyan-500 to-cyan-600",
      link: "/aksesoris",
      trend: "stable",
    },
    {
      title: "Siap Digunakan",
      value: stats?.tersedia ?? 0,
      icon: <CheckCircle2 />,
      color: "from-emerald-600 to-emerald-700",
      link: "/aset/daftar?kondisi=Siap Digunakan",
      trend: "up",
    },
    {
      title: "Rusak",
      value: stats?.rusak ?? 0,
      icon: <AlertCircle />,
      color: "from-rose-600 to-rose-700",
      link: "/aset/daftar?kondisi=Rusak",
      trend: stats?.rusak > 2 ? "down" : "up",
    },
    {
      title: "Maintenance",
      value: stats?.maintenance ?? 0,
      icon: <Settings />,
      color: "from-amber-500 to-amber-600",
      link: "/aset/daftar?kondisi=Maintenance",
      trend: "stable",
    },
    {
      title: "Alat Dipinjam",
      value: stats?.dipinjam ?? 0,
      icon: <ClipboardList />,
      color: "from-indigo-600 to-indigo-700",
      link: "/aset/peminjaman?status=Sedang Dipinjam",
      trend: stats?.dipinjam > 2 ? "up" : "stable",
    },
  ];

  // Loading skeleton
  if (loading) {
    return (
      <div>
        <div className="mb-8">
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

  const trendData = generateTrendData();
  const maxValue = Math.max(...trendData.map(d => d.value), 10);

  return (
    <div>
      {/* Premium Header with Total Asset Value */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Greeting Card */}
        <div>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 p-1 shadow-2xl h-full">
          {/* Animated border */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8">
            {/* Animated background */}
            <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary/30 to-transparent opacity-40 blur-3xl animate-pulse" />
            <div className="absolute -left-40 -bottom-40 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-500/20 to-transparent opacity-30 blur-3xl" />

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-blue-500/20 border border-primary/30">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-semibold text-primary">Live Dashboard</span>
                  </div>
                  <h1 className="text-5xl font-black text-white leading-tight">
                    Selamat {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-cyan-400">{userName}</span>! 👋
                  </h1>
                  <p className="text-slate-400 mt-2 text-sm">Sistem Manajemen Asset Galeria Karya Media</p>
                </div>
                <button
                  onClick={() => fetchStats()}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-60 cursor-pointer whitespace-nowrap group"
                >
                  <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform"}`} />
                  {isRefreshing ? "Memperbarui..." : "Perbarui"}
                </button>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="h-4 w-4" />
                  Terakhir: <span className="text-slate-300 font-semibold">{formatLastUpdated()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs text-slate-400">Sistem aktif</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Total Asset Value Card */}
        <div className="rounded-2xl bg-gradient-to-br from-primary to-blue-700 shadow-xl border border-blue-600/50 p-10 text-white relative overflow-hidden group h-full">
          {/* Decorative background */}
          <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-white/10 blur-3xl group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

          <div className="relative z-10 flex flex-col h-full justify-center">
            {/* Icon & Title */}
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:bg-white/30 transition-colors">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Total Nilai Aset</h2>
                <p className="text-blue-100 text-sm mt-1">Keseluruhan aset</p>
              </div>
            </div>

            {/* Main Value Display */}
            <div className="space-y-6">
              <div>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-4 opacity-90">Nominal Keseluruhan</p>
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-bold opacity-90">Rp</span>
                  <span className="text-6xl font-black leading-none">
                    {stats && stats.total
                      ? (stats.total * 5000000).toLocaleString('id-ID')
                      : '0'}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/20"></div>

              {/* Summary Info */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-2 opacity-90">Total Unit</p>
                  <p className="text-4xl font-black">{stats?.total || 0} unit</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-2 opacity-90">Per Unit</p>
                  <p className="text-2xl font-black">Rp 5 Juta</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
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
              className={`rounded-lg bg-gradient-to-br ${stat.color} p-6 text-white shadow-md hover:shadow-lg transition-shadow ${isRestricted ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                  {cloneElement(stat.icon, { className: "h-5 w-5 text-white" })}
                </div>
                <div className="flex items-center gap-1">
                  {stat.trend === 'up' && <ArrowUpRight className="h-4 w-4 text-emerald-300" />}
                  {stat.trend === 'down' && <ArrowDownRight className="h-4 w-4 text-rose-300" />}
                </div>
              </div>

              <div>
                <span className="text-4xl font-bold text-white block leading-none mb-2">
                  {stats ? stat.value : "—"}
                </span>
                <span className="text-sm font-medium text-white/90">
                  {stat.title}
                </span>
              </div>
            </Link>
          );
        })}
      </div>


      {/* Asset Distribution */}
      <div className="mb-10">
        <div className="rounded-lg bg-white shadow-md border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Distribusi Aset
          </h2>

          <div className="space-y-4">
            {[
              { label: "Siap Digunakan", value: stats?.tersedia || 0, color: "emerald" },
              { label: "Sedang Dipinjam", value: stats?.dipinjam || 0, color: "blue" },
              { label: "Maintenance", value: stats?.maintenance || 0, color: "amber" },
              { label: "Rusak", value: stats?.rusak || 0, color: "rose" }
            ].map((item) => {
              const total = (stats?.tersedia || 0) + (stats?.dipinjam || 0) + (stats?.maintenance || 0) + (stats?.rusak || 0);
              const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;

              const colorMap = {
                emerald: "bg-emerald-500",
                blue: "bg-blue-500",
                amber: "bg-amber-500",
                rose: "bg-rose-500"
              };

              return (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    <span className="text-sm font-bold text-slate-900">{item.value} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`${colorMap[item.color]} h-full rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>


      {/* Dashboard Cards Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Peminjaman Aktif - Card Layout */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              Peminjaman Aktif
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari..."
                  value={loanSearch}
                  onChange={(e) => setLoanSearch(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {filteredLoans && filteredLoans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
              {filteredLoans.map((loan) => (
                <div
                  key={loan.id}
                  onClick={() => router.push(`/aset/peminjaman?search=${loan.kodePinjam}`)}
                  className="p-5 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-900">{loan.namaPeminjam}</p>
                      <p className="text-xs text-slate-500">{loan.kodePinjam}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      loan.status === 'Menunggu Persetujuan' ? 'bg-amber-100 text-amber-700' :
                      loan.status === 'Sedang Dipinjam' ? 'bg-blue-100 text-blue-700' :
                      'bg-violet-100 text-violet-700'
                    }`}>
                      {loan.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Package className="h-4 w-4" />
                    <span>{loan.totalItems || 0} Alat</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-lg border border-slate-200">
              <ClipboardList className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-500">Tidak ada peminjaman aktif</p>
            </div>
          )}
        </div>

        {/* Aktivitas Terbaru - Card Layout */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-600" />
              Aktivitas Terbaru
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>

          {filteredActivities.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => handleActivityClick(activity)}
                  className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-slate-900">{activity.createdBy}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        activity.action === 'Peminjaman' ? 'bg-amber-100 text-amber-700' :
                        activity.action === 'Pengembalian' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {activity.action}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 flex items-center gap-2 mb-1">
                      <Package className="h-4 w-4" />
                      {activity.item}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatActivityDate(activity.date).datePart} · {formatActivityDate(activity.date).timePart}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-lg border border-slate-200">
              <Clock className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-500">Tidak ada aktivitas</p>
            </div>
          )}
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
