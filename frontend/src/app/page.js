"use client";

import { useState, useEffect, cloneElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDashboardStats } from "./lib/assetService";
import { 
  Package, CheckCircle2, AlertCircle, Settings, AlertTriangle, 
  RefreshCw, ClipboardList, ChevronRight, Search, Minus, Plus, 
  Calendar, User, Clock, LayoutGrid, Cpu, Check, X
} from "lucide-react";
import { getUserContext } from "./lib/authService";
import { createPortal } from "react-dom";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState("user");
  const [toast, setToast] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const ctx = getUserContext();
    if (ctx) setUserRole(ctx.role || "user");
    
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
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError("Gagal memuat statistik dashboard. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Selamat datang di Sistem Pencatatan Asset Galeria Karya Media
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
              className={`relative overflow-hidden rounded-2xl ${stat.color} p-5 text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl group block ${isRestricted ? "cursor-not-allowed opacity-90" : "cursor-pointer"}`}
            >
            {/* Decorative background elements */}
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 transition-transform group-hover:scale-125" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md shadow-inner">
                  {cloneElement(stat.icon, { className: "h-6 w-6 text-white" })}
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black leading-none mb-0.5">
                    {stats ? stat.value : "—"}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                    {stat.title}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                Lihat Selengkapnya <ChevronRight className="h-3 w-3" />
              </div>
            </div>
            </Link>
          );
        })}
      </div>

      {/* Dashboard Tables Grid */}
      <div className="mt-8 flex flex-col lg:grid lg:grid-cols-5 gap-8 items-start">
        
        {/* Peminjaman Aktif Section (Top on mobile, Right on desktop) */}
        <div className="lg:col-span-2 order-1 lg:order-2 w-full lg:w-auto rounded-xl border border-blue-200 bg-white shadow-sm overflow-hidden border-t-4 border-t-blue-500">
          <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100 bg-blue-50/50">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-bold text-blue-800">Peminjaman Aktif</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className={`relative transition-all duration-300 ${isLoanMinimized ? "opacity-0 invisible w-0" : "opacity-100 visible w-28 sm:w-36"}`}>
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari peminjaman..." 
                  value={loanSearch}
                  onChange={(e) => setLoanSearch(e.target.value)}
                  className="rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-full"
                />
              </div>
              <button 
                onClick={() => setIsLoanMinimized(!isLoanMinimized)}
                className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors text-blue-500 cursor-pointer"
              >
                {isLoanMinimized ? <Plus className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isLoanMinimized ? "max-h-0" : "max-h-[600px]"}`}>
            <div className="overflow-x-auto h-[480px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-blue-50 z-10">
                  <tr className="border-b border-blue-200">
                    <th className="px-5 py-3 font-bold text-blue-800">Peminjam</th>
                    <th className="px-5 py-3 font-bold text-blue-800">Alat Dipinjam</th>
                    <th className="px-5 py-3 font-bold text-blue-800 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {filteredLoans?.map((loan, idx) => (
                    <tr 
                      key={loan.id} 
                      className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${idx % 2 === 0 ? "bg-slate-100/50" : "bg-white"}`}
                      onClick={() => {
                        router.push(`/aset/peminjaman?search=${loan.kodePinjam}`);
                      }}
                    >
                      <td className="px-5 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-800">{loan.namaPeminjam}</span>
                          <span className="text-xs text-blue-800 font-mono font-semibold mt-0.5">{loan.kodePinjam}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-sm font-semibold text-slate-600">{loan.totalItems || 0} Alat</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-block w-[140px] text-center px-2 py-1 rounded-full border text-xs uppercase font-semibold shadow-sm ${
                          loan.status === 'Menunggu Persetujuan' ? 'bg-amber-50 text-amber-700 border-amber-500' :
                          loan.status === 'Sedang Dipinjam' ? 'bg-blue-50 text-blue-700 border-blue-500' :
                          'bg-violet-50 text-violet-700 border-violet-500'
                        }`}>
                          {loan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!filteredLoans || filteredLoans.length === 0) && (
                    <tr>
                      <td colSpan={3} className="px-6 py-20 text-center text-slate-400 italic font-medium">Tidak ada peminjaman aktif.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Aktivitas Terbaru Section (Bottom on mobile, Left on desktop) */}
        <div className="lg:col-span-3 order-2 lg:order-1 w-full lg:w-auto rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden border-t-4 border-t-slate-500">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-slate-500" />
              <h2 className="text-lg font-bold text-slate-800">Aktivitas Terbaru</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className={`relative transition-all duration-300 ${isActivityMinimized ? "opacity-0 invisible w-0" : "opacity-100 visible w-40 sm:w-60"}`}>
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari aktivitas..." 
                  value={activitySearch}
                  onChange={(e) => { setActivitySearch(e.target.value); }}
                  className="rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-full"
                />
              </div>
              <button 
                onClick={() => setIsActivityMinimized(!isActivityMinimized)}
                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 cursor-pointer"
              >
                {isActivityMinimized ? <Plus className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isActivityMinimized ? "max-h-0" : "max-h-[600px]"}`}>
            <div className="overflow-x-auto h-[480px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="sticky top-0 bg-slate-50 z-10">
                  <tr className="border-b border-slate-300">
                    <th className="px-4 py-3 font-bold text-slate-700 w-[120px]"><Calendar className="inline h-3 w-3 mr-1" /> Tanggal</th>
                    <th className="px-4 py-3 font-bold text-slate-700"><User className="inline h-3 w-3 mr-1" /> Dibuat Oleh</th>
                    <th className="px-4 py-3 font-bold text-slate-700 text-center">Aksi</th>
                    <th className="px-4 py-3 font-bold text-slate-700"><LayoutGrid className="inline h-3 w-3 mr-1" /> Item / Kode Transaksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredActivities.map((activity, idx) => (
                    <tr 
                      key={activity.id} 
                      onClick={() => handleActivityClick(activity)}
                      className={`cursor-pointer transition-colors hover:bg-slate-50 ${idx % 2 === 0 ? "bg-slate-100" : "bg-white"}`}
                    >
                      <td className="px-4 py-3 text-slate-600">
                        <div className="flex flex-col leading-tight">
                          <span className="text-sm text-slate-700 font-semibold">{formatActivityDate(activity.date).datePart}</span>
                          <span className="text-xs text-slate-400 font-medium">{formatActivityDate(activity.date).timePart}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-slate-700 cursor-pointer">{activity.createdBy}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block w-[140px] text-center text-xs font-semibold uppercase px-2 py-0.5 rounded-full border shadow-sm ${
                          activity.action === 'Peminjaman' ? 'bg-amber-50 text-amber-600 border-amber-500' :
                          activity.action === 'Pengembalian' ? 'bg-blue-50 text-blue-600 border-blue-500' :
                          'bg-emerald-50 text-emerald-600 border-emerald-500'
                        }`}>
                          {activity.action}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-700 font-semibold">{activity.item}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredActivities.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic font-medium">Tidak ada aktivitas ditemukan.</td>
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
