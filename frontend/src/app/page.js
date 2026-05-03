"use client";

import { useState, useEffect, cloneElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDashboardStats } from "./lib/assetService";
import { 
  Package, CheckCircle2, AlertCircle, Settings, AlertTriangle, 
  RefreshCw, ClipboardList, ChevronRight, Search, Minus, Plus, 
  Calendar, User, Clock, LayoutGrid, Cpu
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

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

  const statCards = [
    {
      title: "Total Aset",
      value: stats?.total ?? 0,
      icon: <Package />,
      color: "bg-blue-600",
      link: "/aset",
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
      link: "/aset",
    },
    {
      title: "Rusak",
      value: stats?.rusak ?? 0,
      icon: <AlertCircle />,
      color: "bg-rose-600",
      link: "/aset",
    },
    {
      title: "Maintenance",
      value: stats?.maintenance ?? 0,
      icon: <Settings />,
      color: "bg-amber-500",
      link: "/aset",
    },
    {
      title: "Aset Dipinjam",
      value: stats?.dipinjam ?? 0,
      icon: <ClipboardList />,
      color: "bg-indigo-600",
      link: "/aset/peminjaman",
    },
  ];

  // Loading skeleton
  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Selamat datang di Sistem Pencatatan Asset Galeria Production
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
            Selamat datang di Sistem Pencatatan Asset Galeria Production
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

  // Tentukan tipe aktivitas berdasarkan kondisi
  const getActivityType = (kondisi) => {
    if (kondisi === "Siap Digunakan") return "add";
    if (kondisi === "Rusak") return "return";
    if (kondisi === "Maintenance") return "maintenance";
    if (kondisi === "Diarsipkan") return "borrow";
    return "add";
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Selamat datang di Sistem Pencatatan Asset Galeria Production
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            href={stat.link}
            className={`relative overflow-hidden rounded-2xl ${stat.color} p-5 text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl group block`}
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
        ))}
      </div>

      {/* Dashboard Tables Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Aktivitas Terbaru Section (Col Span 3) */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden border-t-4 border-t-slate-500">
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
                  onChange={(e) => { setActivitySearch(e.target.value); setActivityPage(1); }}
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
            <div className="overflow-x-auto max-h-[480px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="sticky top-0 bg-slate-50 z-10">
                  <tr className="border-b border-slate-300">
                    <th className="px-4 py-3 font-bold text-slate-700 uppercase text-[10px] tracking-wider w-[120px]"><Calendar className="inline h-3 w-3 mr-1" /> Tanggal</th>
                    <th className="px-4 py-3 font-bold text-slate-700 uppercase text-[10px] tracking-wider"><User className="inline h-3 w-3 mr-1" /> Dibuat Oleh</th>
                    <th className="px-4 py-3 font-bold text-slate-700 uppercase text-[10px] tracking-wider">Aksi</th>
                    <th className="px-4 py-3 font-bold text-slate-700 uppercase text-[10px] tracking-wider"><LayoutGrid className="inline h-3 w-3 mr-1" /> Item</th>
                    <th className="px-4 py-3 font-bold text-slate-700 uppercase text-[10px] tracking-wider">Tujuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredActivities.map((activity, idx) => (
                    <tr key={activity.id} className={`${idx % 2 === 0 ? "bg-slate-100" : "bg-white"}`}>
                      <td className="px-4 py-3 text-slate-500 font-medium">
                        <div className="flex flex-col leading-tight">
                          <span className="text-xs text-slate-700 font-bold">{formatActivityDate(activity.date).datePart}</span>
                          <span className="text-[11px] text-slate-400">{formatActivityDate(activity.date).timePart}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-blue-600 hover:underline cursor-pointer">{activity.createdBy}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full border ${
                          activity.action === 'Peminjaman' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                          activity.action === 'Pengembalian' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          'bg-emerald-50 text-emerald-600 border-emerald-200'
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
                      <td className="px-4 py-4">
                        {activity.target !== "-" ? (
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-sm text-slate-600 font-medium">{activity.target}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredActivities.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic font-medium">Tidak ada aktivitas ditemukan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Peminjaman Aktif Section (Col Span 2) */}
        <div className="lg:col-span-2 rounded-xl border border-blue-200 bg-white shadow-sm overflow-hidden border-t-4 border-t-blue-500">
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
            <div className="overflow-x-auto max-h-[480px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-blue-50 z-10">
                  <tr className="border-b border-blue-200">
                    <th className="px-5 py-3 font-bold text-blue-800 uppercase text-[10px] tracking-wider">Peminjam</th>
                    <th className="px-5 py-3 font-bold text-blue-800 uppercase text-[10px] tracking-wider">Item/Aset</th>
                    <th className="px-5 py-3 font-bold text-blue-800 uppercase text-[10px] tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {filteredLoans?.map((loan, idx) => (
                    <tr 
                      key={loan.id} 
                      className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${idx % 2 === 0 ? "bg-slate-100/50" : "bg-white"}`}
                      onClick={() => router.push(`/aset/peminjaman?search=${loan.kodePinjam}`)}
                    >
                      <td className="px-5 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{loan.namaPeminjam}</span>
                          <span className="text-[11px] text-primary font-mono font-bold mt-0.5">{loan.kodePinjam}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-sm font-semibold text-slate-600">{loan.totalItems || 0} Aset</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2 py-1 rounded-full border text-xs uppercase font-semibold ${
                          loan.status === 'Menunggu Persetujuan' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                          loan.status === 'Sedang Dipinjam' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                          'bg-violet-50 text-violet-700 border-violet-300'
                        }`}>
                          {loan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!filteredLoans || filteredLoans.length === 0) && (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic font-medium">Tidak ada peminjaman aktif.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
