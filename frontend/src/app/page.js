"use client";

import { useState, useEffect, cloneElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDashboardStats } from "./lib/assetService";
import {
  Package, CheckCircle2, AlertCircle, Settings, AlertTriangle,
  RefreshCw, ClipboardList, ChevronRight, Search, Minus, Plus,
  Calendar, User, Clock, LayoutGrid, Cpu, Check, X, Zap, TrendingUp,
  TrendingDown, BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
  Sunrise, Sun, CloudSun, Moon
} from "lucide-react";
import { getUserContext } from "./lib/authService";
import { createPortal } from "react-dom";
import { ResponsivePie } from "@nivo/pie";

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
  const [now, setNow] = useState(null);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const clockInterval = setInterval(() => setNow(new Date()), 1000);
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

    return () => clearInterval(clockInterval);
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

  // Greeting card: icon & aksen warna mengikuti waktu
  const currentHour = new Date().getHours();
  const greetingLabel = `Selamat ${getGreeting()}`;
  const GreetingIcon = currentHour < 12 ? Sunrise : currentHour < 15 ? Sun : currentHour < 18 ? CloudSun : Moon;
  const accentBadge = currentHour < 12 ? "from-amber-400 to-orange-500"
    : currentHour < 15 ? "from-sky-400 to-blue-600"
    : currentHour < 18 ? "from-orange-400 to-rose-500"
    : "from-indigo-400 to-violet-600";
  const accentGlow = currentHour < 12 ? "bg-amber-400/25"
    : currentHour < 15 ? "bg-sky-400/25"
    : currentHour < 18 ? "bg-orange-400/25"
    : "bg-indigo-400/25";

  return (
    <div>
      {/* Header Mobile — Hanya tampil di mobile */}
      <div className="mb-6 block lg:hidden">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-semibold">
          Asset Management System
        </p>
      </div>

      {/* Premium Header — Ucapan (kiri) + Nilai Aset (kanan) */}
      <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:auto-rows-max">
        {/* === Card Ucapan === */}
        <div className="lg:col-span-2">
          <div className="group relative h-full overflow-hidden rounded-3xl bg-slate-950 shadow-xl shadow-slate-950/20 ring-1 ring-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-950/30">
            {/* Gradient base */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950" />

            {/* Ambient glow — mengikuti waktu */}
            <div className={`absolute -right-24 -top-28 h-72 w-72 rounded-full blur-3xl transition-colors duration-700 ${accentGlow}`} />
            <div className="absolute -left-28 bottom-0 h-72 w-72 rounded-full bg-blue-600/15 blur-3xl" />

            {/* Dot pattern halus */}
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "22px 22px",
              }}
            />

            {/* Garis highlight atas */}
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <div className="relative z-10 flex h-full flex-col p-4 lg:p-7">
              {/* Baris 1 — identitas + jam live */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accentBadge} shadow-lg ring-1 ring-white/25 lg:h-14 lg:w-14`}>
                    <GreetingIcon className="h-6 w-6 text-white lg:h-7 lg:w-7" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300/80 lg:text-[11px]">
                      {greetingLabel}
                    </p>
                    <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-white lg:text-4xl">
                      {userName}
                    </h1>
                    <p className="mt-1 flex items-center gap-1.5 text-[10px] font-medium text-slate-400 lg:mt-1.5 lg:text-xs">
                      <LayoutGrid className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                      Asset Management System
                    </p>
                  </div>
                </div>

                {/* Jam & tanggal live */}
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center backdrop-blur-md lg:rounded-2xl lg:px-4 lg:py-2.5">
                  <p className="font-mono text-[9px] font-bold leading-none text-slate-300 lg:text-[11px]">
                    {now
                      ? now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                      : "Memuat..."}
                  </p>
                  <p className="mt-1 font-mono text-sm font-bold leading-none tabular-nums text-white lg:text-lg">
                    {now
                      ? now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
                      : "--:--:--"}
                  </p>
                </div>
              </div>

              {/* Baris 2 — chip info ringkasan */}
              <div className="mt-4 flex flex-1 flex-col justify-end lg:mt-6">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md transition-colors duration-300 hover:bg-white/10 lg:gap-3 lg:rounded-2xl lg:px-4 lg:py-2.5">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/20 ring-1 ring-blue-400/30 lg:h-9 lg:w-9 lg:rounded-xl">
                      <User className="h-3.5 w-3.5 text-blue-300 lg:h-4 lg:w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 lg:text-[10px]">Role</p>
                      <p className="text-xs font-semibold capitalize text-white lg:text-sm">{userRole || "User"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md transition-colors duration-300 hover:bg-white/10 lg:gap-3 lg:rounded-2xl lg:px-4 lg:py-2.5">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 ring-1 ring-emerald-400/30 lg:h-9 lg:w-9 lg:rounded-xl">
                      <Package className="h-3.5 w-3.5 text-emerald-300 lg:h-4 lg:w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 lg:text-[10px]">Total Aset</p>
                      <p className="text-xs font-semibold text-white lg:text-sm">{stats?.total || 0} Unit</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md transition-colors duration-300 hover:bg-white/10 lg:gap-3 lg:rounded-2xl lg:px-4 lg:py-2.5">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-sky-500/20 ring-1 ring-sky-400/30 lg:h-9 lg:w-9 lg:rounded-xl">
                      <BarChart3 className="h-3.5 w-3.5 text-sky-300 lg:h-4 lg:w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 lg:text-[10px]">Nilai Aset</p>
                      <p className="truncate text-xs font-semibold text-white lg:text-sm">
                        {["super admin", "admin"].includes(userRole?.toLowerCase()) ? (
                          stats?.totalNilaiKeseluruhan > 0
                            ? (
                              <>
                                <span className="hidden lg:inline">
                                  {`Rp ${stats.totalNilaiKeseluruhan.toLocaleString("id-ID")}`}
                                </span>
                                <span className="lg:hidden">
                                  {`Rp ${(stats.totalNilaiKeseluruhan / 1000000).toFixed(1)} Jt`}
                                </span>
                              </>
                            )
                            : "Rp -"
                        ) : (
                          "-"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status strip */}
                <div className="mt-3 flex flex-wrap gap-1 border-t border-white/10 pt-3 lg:mt-5 lg:gap-2 lg:pt-4">
                  {[
                    { label: "Tersedia", value: stats?.tersedia || 0, icon: CheckCircle2, chip: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20" },
                    { label: "Dipinjam", value: stats?.dipinjam || 0, icon: Package, chip: "bg-blue-500/10 text-blue-300 ring-blue-400/20" },
                    { label: "Maintenance", value: stats?.maintenance || 0, icon: AlertCircle, chip: "bg-amber-500/10 text-amber-300 ring-amber-400/20" },
                    { label: "Rusak", value: stats?.rusak || 0, icon: AlertTriangle, chip: "bg-rose-500/10 text-rose-300 ring-rose-400/20" }
                  ].map((item) => (
                    <span key={item.label} className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold ring-1 lg:gap-2 lg:px-3 lg:py-1.5 lg:text-xs ${item.chip}`}>
                      <item.icon className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                      <span className="hidden sm:inline">{item.label}</span>
                      <span className="rounded-full bg-white/10 px-1 py-0.5 text-[8px] font-bold text-white lg:px-1.5 lg:py-0.5 lg:text-[10px]">{item.value}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === Card Distribusi Aset === */}
        <div className="lg:col-span-1">
          <div className="group relative h-full overflow-hidden rounded-3xl bg-slate-950 shadow-xl shadow-slate-950/20 ring-1 ring-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-950/30">
            {/* Gradient base */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-cyan-950 to-teal-950" />

            {/* Ambient glow */}
            <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl transition-transform duration-700 group-hover:scale-125" />
            <div className="absolute -left-28 bottom-0 h-72 w-72 rounded-full bg-teal-500/15 blur-3xl" />

            {/* Dot pattern */}
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "22px 22px",
              }}
            />

            {/* Garis highlight atas */}
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <div className="relative z-10 flex h-full flex-col p-6 lg:p-7">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-3">
                <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 p-2 shadow-lg">
                  <PieChart className="h-5 w-5 text-white" />
                </div>
                <span>Distribusi Aset</span>
              </h2>

              {/* Nivo Pie Chart - Legend & Chart Side by Side */}
              {mounted && (
                <div className="flex-1 flex gap-6 items-center justify-center" style={{ minHeight: 'auto' }}>
                  {/* Legend di Kiri */}
                  <div className="flex flex-col justify-center flex-shrink-0">
                    <h3 className="text-sm font-semibold text-white mb-3">Keterangan</h3>
                    <div className="space-y-2 text-xs">
                      {[
                        { color: "#10b981", label: "Siap Digunakan" },
                        { color: "#3b82f6", label: "Sedang Dipinjam" },
                        { color: "#f59e0b", label: "Maintenance" },
                        { color: "#ef4444", label: "Rusak" }
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2 whitespace-nowrap">
                          <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-300 text-[12px]">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pie Chart di Kanan */}
                  <div style={{ width: '100%', height: '200px', flex: 1 }}>
                    <ResponsivePie
                      data={[
                        { id: "Siap", label: "Siap Digunakan", value: stats?.tersedia || 0, color: "#10b981" },
                        { id: "Dipinjam", label: "Sedang Dipinjam", value: stats?.dipinjam || 0, color: "#3b82f6" },
                        { id: "Maintenance", label: "Maintenance", value: stats?.maintenance || 0, color: "#f59e0b" },
                        { id: "Rusak", label: "Rusak", value: stats?.rusak || 0, color: "#ef4444" }
                      ].filter(d => d.value > 0)}
                      margin={{ top: 12, right: 12, bottom: 12, left: 12 }}
                      innerRadius={0.58}
                      padAngle={2}
                      cornerRadius={3}
                      activeOuterRadiusOffset={8}
                      colors={(datum) => {
                        const colorMap = {
                          "Siap": "#10b981",
                          "Dipinjam": "#3b82f6",
                          "Maintenance": "#f59e0b",
                          "Rusak": "#ef4444"
                        };
                        return colorMap[datum.id] || "#999999";
                      }}
                      borderColor="rgba(255, 255, 255, 0.12)"
                      borderWidth={1.5}
                      enableArcLabels={true}
                      arcLabelsSkipAngle={12}
                      arcLabelsTextColor="#ffffff"
                      arcLabelsRadiusOffset={0.48}
                      arcLabel={(datum) => {
                        const total = (stats?.tersedia || 0) + (stats?.dipinjam || 0) + (stats?.maintenance || 0) + (stats?.rusak || 0);
                        const percentage = total > 0 ? Math.round((datum.value / total) * 100) : 0;
                        return `${percentage}%`;
                      }}
                      enableArcLinkLabels={false}
                      tooltip={({ datum }) => (
                        <div className="bg-slate-950/95 border border-cyan-400/30 rounded-xl px-3 py-2 backdrop-blur-md shadow-lg">
                          <p className="text-sm font-semibold text-cyan-300">{datum.label}</p>
                          <p className="text-sm font-bold text-white">{datum.value} unit</p>
                        </div>
                      )}
                      motionConfig="gentle"
                      legends={[]}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Dashboard Cards Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Peminjaman Aktif - Card Layout */}
        <div className="group relative overflow-hidden rounded-3xl bg-slate-950 shadow-xl shadow-slate-950/20 ring-1 ring-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-950/30">
          {/* Gradient base */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950" />

          {/* Ambient glow */}
          <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl transition-transform duration-700 group-hover:scale-125" />
          <div className="absolute -left-28 bottom-0 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />

          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />

          {/* Garis highlight atas */}
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <div className="relative z-10 p-6 lg:p-7">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-3">
                <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 p-2 shadow-lg">
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>
                Peminjaman Aktif
              </h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={loanSearch}
                    onChange={(e) => setLoanSearch(e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white placeholder-slate-400 backdrop-blur-md focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                  className="group relative p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md shadow-md hover:shadow-lg hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10 flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-white group-hover:text-blue-300 transition-colors">{loan.namaPeminjam}</p>
                      <p className="text-xs text-slate-400 font-mono">{loan.kodePinjam}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm ${
                      loan.status === 'Menunggu Persetujuan' ? 'bg-amber-500/20 text-amber-200' :
                      loan.status === 'Sedang Dipinjam' ? 'bg-blue-500/20 text-blue-200' :
                      'bg-violet-500/20 text-violet-200'
                    }`}>
                      {loan.status}
                    </span>
                  </div>
                  <div className="relative z-10 flex items-center gap-2 text-sm text-slate-300 group-hover:text-white transition-colors">
                    <Package className="h-4 w-4 text-blue-400" />
                    <span className="font-medium">{loan.totalItems || 0} Alat</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="p-3 rounded-full bg-cyan-500/20 mb-3">
                <ClipboardList className="h-8 w-8 text-cyan-300" />
              </div>
              <p className="text-sm text-slate-300 font-medium">Tidak ada peminjaman aktif</p>
            </div>
            )}
          </div>
        </div>

        {/* Aktivitas Terbaru - Card Layout */}
        <div className="group relative overflow-hidden rounded-3xl bg-slate-950 shadow-xl shadow-slate-950/20 ring-1 ring-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-950/30">
          {/* Gradient base */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-amber-950 to-orange-950" />

          {/* Ambient glow */}
          <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl transition-transform duration-700 group-hover:scale-125" />
          <div className="absolute -left-28 bottom-0 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />

          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />

          {/* Garis highlight atas */}
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <div className="relative z-10 p-6 lg:p-7">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-3">
                <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 p-2 shadow-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                Aktivitas Terbaru
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari..."
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  className="rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white placeholder-slate-400 backdrop-blur-md focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
            </div>

            {filteredActivities.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => handleActivityClick(activity)}
                  className="group relative p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md shadow-md hover:shadow-lg hover:bg-white/10 hover:-translate-x-1 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Left accent bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    activity.action === 'Peminjaman' ? 'bg-amber-400' :
                    activity.action === 'Pengembalian' ? 'bg-blue-400' :
                    'bg-emerald-400'
                  }`} />

                  <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-white">{activity.createdBy}</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm ${
                        activity.action === 'Peminjaman' ? 'bg-amber-500/20 text-amber-200' :
                        activity.action === 'Pengembalian' ? 'bg-blue-500/20 text-blue-200' :
                        'bg-emerald-500/20 text-emerald-200'
                      }`}>
                        {activity.action}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 group-hover:text-white transition-colors flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{activity.item}</span>
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
                      {formatActivityDate(activity.date).datePart} · {formatActivityDate(activity.date).timePart}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="p-3 rounded-full bg-orange-500/20 mb-3">
                <Clock className="h-8 w-8 text-orange-300" />
              </div>
              <p className="text-sm text-slate-300 font-medium">Tidak ada aktivitas</p>
            </div>
            )}
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
