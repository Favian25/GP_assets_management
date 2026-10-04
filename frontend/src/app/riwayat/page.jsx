"use client";

import { useState, useEffect, useMemo, cloneElement } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { getMyPeminjamanHistory } from "../lib/peminjamanService";
import { getUserContext } from "../lib/authService";
import { History, Eye, Package, Clock, CheckCircle2, AlertCircle, RotateCcw, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, Check, FileText } from "lucide-react";

const getStatusBadge = (status) => {
  const s = {
    "Menunggu Persetujuan": "bg-amber-50 text-amber-700 border-amber-500",
    "Sedang Dipinjam": "bg-blue-50 text-blue-700 border-blue-500",
    "Menunggu Verifikasi": "bg-violet-50 text-violet-700 border-violet-500",
    "Peminjaman Selesai": "bg-emerald-50 text-emerald-700 border-emerald-500",
  };
  return s[status] || "bg-slate-50 text-slate-700 border-slate-500";
};

const getStatusIcon = (status) => {
  if (status === "Peminjaman Selesai") return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (status === "Sedang Dipinjam") return <Clock className="h-3.5 w-3.5" />;
  if (status === "Menunggu Verifikasi") return <RotateCcw className="h-3.5 w-3.5" />;
  return <AlertCircle className="h-3.5 w-3.5" />;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ROWS_OPTIONS = [10, 20, 30, 40, 50];

export default function RiwayatPage() {
  const router = useRouter();
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  
  // Table options (Search, Sort, Pagination)
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState(""); // "" | "asc" | "desc"
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); } }, [toast]);

  useEffect(() => {
    const ctx = getUserContext();
    if (ctx) setUserRole(ctx.role || "");
  }, []);

  useEffect(() => {
    const fetchRiwayat = async () => {
      try {
        const data = await getMyPeminjamanHistory();
        setRiwayat(data);
      } catch (err) {
        console.error("Error fetch riwayat:", err);
        setToast({ message: "Gagal memuat riwayat peminjaman", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchRiwayat();
  }, []);

  // Filter & Sort
  const processedData = useMemo(() => {
    let result = [...riwayat];
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(item => 
        item.kode_pinjam?.toLowerCase().includes(q) ||
        item.daftar_aset?.toLowerCase().includes(q) ||
        item.alasan_peminjaman?.toLowerCase().includes(q)
      );
    }
    
    if (statusFilter) {
      result = result.filter(item => item.status === statusFilter);
    }
    
    if (sortOrder) {
      result.sort((a, b) => {
        const dateA = new Date(a.tanggal_peminjaman || 0).getTime();
        const dateB = new Date(b.tanggal_peminjaman || 0).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    } else {
      // Default sort by latest
      result.sort((a, b) => new Date(b.tanggal_peminjaman || 0).getTime() - new Date(a.tanggal_peminjaman || 0).getTime());
    }
    
    return result;
  }, [riwayat, search, statusFilter, sortOrder]);

  // Pagination Variables
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  
  const indexOfLastItem = validCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = processedData.slice(indexOfFirstItem, indexOfLastItem);

  const getPageNumbers = () => {
    const p = [];
    if (totalPages <= 4) { for (let i = 1; i <= totalPages; i++) p.push(i); }
    else if (validCurrentPage <= 3) { for (let i = 1; i <= 3; i++) p.push(i); p.push("..."); p.push(totalPages); }
    else if (validCurrentPage >= totalPages - 2) { p.push(1); p.push("..."); for (let i = totalPages - 2; i <= totalPages; i++) p.push(i); }
    else { p.push(1); p.push("..."); p.push(validCurrentPage); p.push("..."); p.push(totalPages); }
    return p;
  };

  const handleSortDate = () => {
    setSortOrder(prev => prev === "" ? "asc" : prev === "asc" ? "desc" : "");
  };

  const Pagination = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 gap-3">
      <div className="hidden sm:flex items-center gap-3">
        <p className="text-sm text-slate-500 text-nowrap">Menampilkan {currentData.length === 0 ? 0 : indexOfFirstItem + 1}-{Math.min(indexOfFirstItem + itemsPerPage, totalItems)} dari <span className="font-semibold text-slate-700">{totalItems}</span> data</p>
        <div className="flex items-center gap-2">
          <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} 
            className="cursor-pointer rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-primary-hover shadow-sm transition-colors hover:bg-primary-hover">
            {ROWS_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-white text-slate-700">{opt}</option>)}
          </select>
          <p className="text-sm text-slate-500 text-nowrap">baris per halaman</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => setCurrentPage(1)} disabled={validCurrentPage === 1} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Halaman Pertama"><ChevronsLeft className="h-4 w-4" /></button>
        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={validCurrentPage === 1} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Sebelumnya"><ChevronLeft className="h-4 w-4" /></button>
        {getPageNumbers().map((page, idx) => page === "..." ? (<span key={`e-${idx}`} className="min-w-[32px] px-1 py-1.5 text-center text-sm text-slate-400">...</span>) : (<button key={page} onClick={() => setCurrentPage(page)} className={`cursor-pointer min-w-[32px] rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${validCurrentPage === page ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"}`}>{page}</button>))}
        <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={validCurrentPage === totalPages || totalPages === 0} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Berikutnya"><ChevronRight className="h-4 w-4" /></button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={validCurrentPage === totalPages || totalPages === 0} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Halaman Terakhir"><ChevronsRight className="h-4 w-4" /></button>
      </div>
    </div>
  );

  if (!mounted) return null;

  if (loading) {
    return (
      <div>
        <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Riwayat Peminjaman</h1><p className="text-sm text-slate-500">Daftar semua peminjaman yang pernah Anda buat</p></div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-8 space-y-3 animate-pulse">{[1,2,3].map(i => (<div key={i} className="flex gap-4"><div className="h-4 w-24 rounded bg-slate-200"/><div className="h-4 flex-1 rounded bg-slate-200"/><div className="h-4 w-20 rounded bg-slate-200"/></div>))}</div>
        </div>
      </div>
    );
  }

  // Stats
  const totalPinjam = riwayat.length;
  const sedangDipinjam = riwayat.filter((r) => r.status === "Sedang Dipinjam").length;
  const selesai = riwayat.filter((r) => r.status === "Peminjaman Selesai").length;
  const menunggu = riwayat.filter((r) =>
    ["Menunggu Persetujuan", "Menunggu Verifikasi"].includes(r.status)
  ).length;

  return (
    <div>
      {/* Toast */}
      {typeof document !== 'undefined' && toast && createPortal(
        <div className={`fixed top-20 right-6 z-[9999] flex items-center gap-2 rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-white transition-all ${toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"}`}>
          {toast.type === "error" ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {toast.message}
        </div>,
        document.body
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
          Riwayat Peminjaman
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Daftar semua peminjaman yang pernah Anda buat
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total", count: totalPinjam, color: "bg-violet-600", customIcon: <Package /> },
          { label: "Dipinjam", count: sedangDipinjam, color: "bg-blue-600", customIcon: <Clock /> },
          { label: "Menunggu", count: menunggu, color: "bg-amber-500", customIcon: <RotateCcw /> },
          { label: "Selesai", count: selesai, color: "bg-emerald-600", customIcon: <CheckCircle2 /> },
        ].map(stat => (
          <div key={stat.label} className={`relative overflow-hidden rounded-2xl ${stat.color} p-4 text-white shadow-lg transition-all hover:scale-[1.03] hover:shadow-xl group`}>
            {/* Decorative background elements */}
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 transition-transform group-hover:scale-125" />
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md shadow-inner">
                {cloneElement(stat.customIcon, { className: "h-5 w-5 text-white" })}
              </div>
              <div className="flex flex-col">
                <p className="text-xl font-black leading-none mb-0.5">{stat.count}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar & Table Section */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-primary">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-b border-slate-300 bg-slate-50/50">
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Cari kode, aset, keperluan..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border-2 border-slate-200 pl-10 pr-4 py-2 text-sm text-slate-700 hover:border-slate-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-48 rounded-lg border-2 border-slate-200 px-3 py-2 text-sm text-slate-700 bg-white hover:border-slate-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer transition-colors"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
            >
              <option value="">Semua Status</option>
              <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
              <option value="Sedang Dipinjam">Sedang Dipinjam</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Peminjaman Selesai">Peminjaman Selesai</option>
            </select>
          </div>
        </div>

        {/* Table Controls (Pagination Top) & Table */}
        <Pagination />
        
        <div className="overflow-x-auto border-t border-slate-200">
          <table className="w-full text-left text-sm table-fixed">
            <thead>
              <tr className="border-t border-slate-300 border-b border-slate-300 bg-slate-50/50">
                <th className="px-3 py-3 font-bold text-slate-700 w-[60px] text-center text-xs uppercase tracking-wider border-r border-slate-200">No</th>
                <th className="px-4 py-3 font-bold text-slate-700 w-[140px] text-center text-xs uppercase tracking-wider border-r border-slate-200">Kode</th>
                <th className="px-4 py-3 font-bold text-slate-700 w-[200px] text-center text-xs uppercase tracking-wider border-r border-slate-200">Daftar Aset</th>
                <th className="px-4 py-3 font-bold text-slate-700 w-[200px] text-center text-xs uppercase tracking-wider border-r border-slate-200">Keperluan</th>
                <th className="px-4 py-3 font-bold text-slate-700 w-[140px] select-none hover:bg-slate-200/50 transition-colors border-r border-slate-200 text-center">
                  <button onClick={handleSortDate} className="flex items-center justify-center gap-2 w-full cursor-pointer uppercase text-xs tracking-wider">
                    Tanggal
                    <div className="flex flex-col">
                      <ChevronUp className={`h-2.5 w-2.5 ${sortOrder === "asc" ? "text-primary" : "text-slate-400"}`} />
                      <ChevronDown className={`h-2.5 w-2.5 ${sortOrder === "desc" ? "text-primary" : "text-slate-400"}`} />
                    </div>
                  </button>
                </th>
                <th className="px-3 py-3 font-bold text-slate-700 w-[180px] text-center text-xs uppercase tracking-wider border-r border-slate-200">Status</th>
                <th className="px-3 py-3 font-bold text-slate-700 text-center w-[100px] text-xs uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, idx) => (
                <tr key={item.id} className={`border-b border-slate-100 transition-colors ${idx % 2 === 0 ? "bg-slate-100" : "bg-white"}`}>
                  <td className="px-3 py-3 text-slate-500 text-xs text-center border-r border-slate-200 align-middle">
                    {indexOfFirstItem + idx + 1}
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-700 text-xs text-center border-r border-slate-200 align-middle">
                    {item.kode_pinjam}
                  </td>
                  <td className="px-4 py-3 text-slate-600 border-r border-slate-200 align-middle">
                    <span className="block truncate text-xs font-semibold">{item.daftar_aset || "-"}</span>
                    <span className="text-[10px] text-slate-400">{item.total_items || 0} item</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 border-r border-slate-200 align-middle text-xs">
                    <span className="block truncate">{item.alasan_peminjaman || "-"}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs text-center border-r border-slate-200 align-middle">
                    {formatDate(item.tanggal_peminjaman)}
                  </td>
                  <td className="px-3 py-3 text-center border-r border-slate-200 align-middle">
                    <span className={`block w-full rounded-full border py-0.5 text-[10px] sm:text-xs text-center font-semibold tracking-wide uppercase transition-all shadow-sm ${getStatusBadge(item.status)}`}>
                      <span className="flex items-center justify-center gap-1">
                        {getStatusIcon(item.status)}
                        {item.status}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-3 align-middle text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => router.push(`/riwayat/${item.id}`)}
                        className="cursor-pointer rounded-lg bg-blue-50 border border-blue-500 px-3 py-1 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-600 hover:text-white hover:border-blue-600 flex items-center gap-1.5"
                      >
                        <FileText className="h-3.5 w-3.5" /> Detail
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    Belum ada riwayat peminjaman atau tidak ada yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200">
          <Pagination />
        </div>
      </div>
    </div>
  );
}
