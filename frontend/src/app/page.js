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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Greeting Card */}
        <div className="group lg:col-span-2 lg:order-1">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-1 shadow-2xl h-full hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500">
          {/* Animated border glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-blue-500/30 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-3xl" />

          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-5 backdrop-blur-xl">
            {/* Animated background */}
            <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary/25 to-transparent opacity-30 blur-3xl animate-pulse" />
            <div className="absolute -left-40 -bottom-40 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-500/15 to-transparent opacity-20 blur-3xl" />

            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl" />

            <div className="relative z-10 flex flex-col h-full">
              {/* Header with Icon and Title */}
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 shadow-lg flex-shrink-0">
                  <span className="text-xl block">
                    {(() => {
                      const hour = new Date().getHours();
                      if (hour < 12) return '🌅';
                      if (hour < 15) return '☀️';
                      if (hour < 18) return '🌤️';
                      return '🌙';
                    })()}
                  </span>
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold tracking-tight text-white">Selamat {getGreeting()}</h2>
                  <p className="text-slate-300 text-sm mt-0.5 font-medium">{userName}</p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-white/10 via-white/30 to-white/10 mb-4"></div>

              {/* Status Section */}
              <div className="space-y-3 mb-4 pb-4 border-b border-white/20">
                <p className="text-slate-300 text-xs font-bold uppercase tracking-widest opacity-90">Status Sistem</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-sm font-semibold text-white">Berjalan Optimal</span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="space-y-2">
                <p className="text-slate-300 text-xs font-bold uppercase tracking-widest opacity-90 mb-3">Informasi Akun</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                    <p className="text-slate-300 text-xs font-medium mb-1">Role</p>
                    <p className="text-base font-bold text-white capitalize">{userRole || "User"}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                    <p className="text-slate-300 text-xs font-medium mb-1">Waktu</p>
                    <p className="text-base font-bold text-white">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>

              {/* Button - Push to bottom */}
              <button
                onClick={() => fetchStats()}
                disabled={isRefreshing}
                className="mt-auto pt-4 w-full group/btn flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 backdrop-blur transition-all duration-300 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : "group-hover/btn:rotate-180 transition-transform duration-500"}`} />
                {isRefreshing ? "Memperbarui..." : "Perbarui Data"}
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* Total Asset Value Card - With Integrated Metrics */}
        <div className="lg:col-span-1 lg:order-2 rounded-3xl bg-gradient-to-br from-primary via-blue-600 to-blue-800 shadow-2xl border border-blue-500/40 p-6 text-white relative overflow-hidden group h-full hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500">
          {/* Decorative background circles */}
          <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-white/15 blur-3xl group-hover:scale-125 transition-transform duration-700" />
          <div className="absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-2xl" />

          {/* Shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-5 transition-opacity duration-500" />

          <div className="relative z-10 flex flex-col h-full overflow-y-auto custom-scrollbar">
            {/* Icon & Title */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 shadow-lg flex-shrink-0">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold tracking-tight">Total Nilai Aset</h2>
                <p className="text-blue-100 text-xs mt-0.5 font-medium">Keseluruhan inventori</p>
              </div>
            </div>

            {/* Main Value Display */}
            <div className="space-y-3 mb-4 pb-4 border-b border-white/20">
              <div>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1 opacity-80">Nominal</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold opacity-95">Rp</span>
                  <span className="text-3xl font-black leading-none drop-shadow-lg">
                    {stats && stats.total
                      ? (stats.total * 5000000).toLocaleString('id-ID')
                      : '0'}
                  </span>
                </div>
              </div>

              {/* Summary Info */}
              <div className="flex items-end justify-between text-sm">
                <div>
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-0.5 opacity-80">Unit</p>
                  <p className="text-2xl font-black">{stats?.total || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-0.5 opacity-80">Per Unit</p>
                  <p className="text-lg font-black">Rp 5M</p>
                </div>
              </div>
            </div>

            {/* Integrated Metrics Grid */}
            <div className="space-y-2">
              <p className="text-xs text-blue-100 font-bold uppercase tracking-widest opacity-80 mb-3">Distribusi Status</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Tersedia", value: stats?.tersedia || 0, icon: CheckCircle2 },
                  { label: "Dipinjam", value: stats?.dipinjam || 0, icon: Package },
                  { label: "Maintenance", value: stats?.maintenance || 0, icon: AlertCircle },
                  { label: "Rusak", value: stats?.rusak || 0, icon: AlertTriangle }
                ].map((item) => (
                  <div key={item.label} className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5 mb-1">
                      {item.icon && <item.icon className="h-3.5 w-3.5 text-blue-200" />}
                      <span className="text-xs text-blue-100 font-medium">{item.label}</span>
                    </div>
                    <p className="text-lg font-bold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Asset Distribution */}
      <div className="mb-10">
        <div className="rounded-2xl bg-gradient-to-br from-white via-slate-50 to-blue-50 shadow-lg border border-slate-200/60 p-6 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/10">
              <PieChart className="h-5 w-5 text-primary" />
            </div>
            <span>Distribusi Aset</span>
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
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <ClipboardList className="h-5 w-5 text-blue-600" />
              </div>
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
                  className="rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                  className="group relative p-5 bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200/60 shadow-md hover:shadow-lg hover:border-blue-300/50 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10 flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{loan.namaPeminjam}</p>
                      <p className="text-xs text-slate-500 font-mono">{loan.kodePinjam}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm ${
                      loan.status === 'Menunggu Persetujuan' ? 'bg-amber-100/80 text-amber-700' :
                      loan.status === 'Sedang Dipinjam' ? 'bg-blue-100/80 text-blue-700' :
                      'bg-violet-100/80 text-violet-700'
                    }`}>
                      {loan.status}
                    </span>
                  </div>
                  <div className="relative z-10 flex items-center gap-2 text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{loan.totalItems || 0} Alat</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200/60">
              <div className="p-3 rounded-full bg-slate-200/50 mb-3">
                <ClipboardList className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600 font-medium">Tidak ada peminjaman aktif</p>
            </div>
          )}
        </div>

        {/* Aktivitas Terbaru - Card Layout */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-200/50">
                <Clock className="h-5 w-5 text-slate-600" />
              </div>
              Aktivitas Terbaru
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all"
              />
            </div>
          </div>

          {filteredActivities.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => handleActivityClick(activity)}
                  className="group relative p-4 bg-gradient-to-r from-white to-slate-50/50 rounded-2xl border border-slate-200/60 shadow-md hover:shadow-lg hover:border-slate-300/80 hover:-translate-x-1 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Left accent bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    activity.action === 'Peminjaman' ? 'bg-amber-400' :
                    activity.action === 'Pengembalian' ? 'bg-blue-400' :
                    'bg-emerald-400'
                  }`} />

                  <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-slate-900">{activity.createdBy}</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm ${
                        activity.action === 'Peminjaman' ? 'bg-amber-100/80 text-amber-700' :
                        activity.action === 'Pengembalian' ? 'bg-blue-100/80 text-blue-700' :
                        'bg-emerald-100/80 text-emerald-700'
                      }`}>
                        {activity.action}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{activity.item}</span>
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {formatActivityDate(activity.date).datePart} · {formatActivityDate(activity.date).timePart}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl border border-slate-200/60">
              <div className="p-3 rounded-full bg-slate-200/50 mb-3">
                <Clock className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600 font-medium">Tidak ada aktivitas</p>
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
