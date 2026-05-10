"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { getAllAssets } from "../../lib/assetService";
import { getAllAksesoris } from "../../lib/aksesorisService";
import { getAllPeminjaman } from "../../lib/peminjamanService";
import { exportToPDF, exportToExcel } from "../../lib/exportUtils";
import { Search, FileText, Download, Filter, Activity, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronUp, ChevronDown, Calendar, User, LayoutGrid, RotateCcw, Printer } from "lucide-react";

const ROWS_OPTIONS = [10, 25, 50, 100];

function SortIcon({ columnKey, sortConfig }) {
  const isActive = sortConfig.key === columnKey;
  return (
    <span className="ml-1.5 inline-flex flex-col -space-y-1.5">
      <ChevronUp className={`h-3.5 w-3.5 ${isActive && sortConfig.direction === "asc" ? "text-primary" : "text-slate-300"}`} />
      <ChevronDown className={`h-3.5 w-3.5 ${isActive && sortConfig.direction === "desc" ? "text-primary" : "text-slate-300"}`} />
    </span>
  );
}

export default function AktivitasReportPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });

  useEffect(() => {
    fetchData();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assets, aksesoris, peminjaman] = await Promise.all([
        getAllAssets(),
        getAllAksesoris(),
        getAllPeminjaman()
      ]);

      const allActivities = [
        ...assets.map(a => ({
          id: `asset-${a.id}`,
          date: a.createdAt,
          createdBy: a.createdByName || "Admin",
          action: "Tambah Aset",
          item: a.namaAset,
          target: "-",
          type: "Aset"
        })),
        ...aksesoris.map(a => ({
          id: `aks-${a.id}`,
          date: a.createdAt,
          createdBy: a.createdByName || "Admin",
          action: "Tambah Aksesoris",
          item: a.namaAksesoris,
          target: "-",
          type: "Aksesoris"
        })),
        ...peminjaman.map(p => ({
          id: `pjm-${p.id}`,
          date: p.createdAt,
          createdBy: p.createdByName || "User",
          action: (p.status === 'Menunggu Persetujuan' || p.status === 'Sedang Dipinjam') ? 'Peminjaman' : 'Pengembalian',
          item: p.kodePinjam,
          target: p.namaPeminjam,
          type: "Peminjaman"
        }))
      ];

      setActivities(allActivities);
    } catch (err) {
      setError("Gagal memuat data aktivitas");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) { 
        if (prev.direction === "asc") return { key, direction: "desc" }; 
        if (prev.direction === "desc") return { key: null, direction: null }; 
      }
      return { key, direction: "asc" };
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    let result = [...activities];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(a => 
        a.item?.toLowerCase().includes(s) || 
        a.action?.toLowerCase().includes(s) ||
        a.createdBy?.toLowerCase().includes(s) ||
        a.target?.toLowerCase().includes(s)
      );
    }
    if (typeFilter) {
      result = result.filter(a => a.type === typeFilter);
    }

    if (startDate) {
      result = result.filter(a => {
        const d = new Date(a.date);
        return d >= new Date(startDate + "T00:00:00");
      });
    }
    if (endDate) {
      result = result.filter(a => {
        const d = new Date(a.date);
        return d <= new Date(endDate + "T23:59:59");
      });
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key] || "";
        const bVal = b[sortConfig.key] || "";
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [activities, search, typeFilter, startDate, endDate, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = () => {
    const p = [];
    if (totalPages <= 4) { for (let i = 1; i <= totalPages; i++) p.push(i); }
    else if (currentPage <= 3) { for (let i = 1; i <= 3; i++) p.push(i); p.push("..."); p.push(totalPages); }
    else if (currentPage >= totalPages - 2) { p.push(1); p.push("..."); for (let i = totalPages - 2; i <= totalPages; i++) p.push(i); }
    else { p.push(1); p.push("..."); p.push(currentPage); p.push("..."); p.push(totalPages); }
    return p;
  };

  const getUniqueValues = (key) => {
    return [...new Set(activities.map(a => a[key]).filter(Boolean))].sort();
  };

  const getColumns = () => [
    { header: "Tanggal", dataKey: "formattedDate" },
    { header: "Waktu", dataKey: "formattedTime" },
    { header: "Dibuat Oleh", dataKey: "createdBy" },
    { header: "Aksi", dataKey: "action" },
    { header: "Modul", dataKey: "type" },
    { header: "Item / Kode Transaksi", dataKey: "item" },
    { header: "Penerima / Pihak Terkait", dataKey: "target" }
  ];

  const handleExportPDF = () => {
    try {
      setExporting(true);
      setShowExportMenu(false);
      const dataToExport = filteredData.map(a => {
        const d = a.date ? new Date(a.date) : null;
        const isValid = d && !isNaN(d.getTime());
        return {
          ...a,
          formattedDate: isValid ? d.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "-",
          formattedTime: isValid ? d.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) + " WIB" : "-"
        };
      });
      exportToPDF(getColumns(), dataToExport, "Laporan_Aktivitas.pdf", "Laporan Aktivitas Operasional");
    } catch (err) {
      alert("Gagal mengekspor: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = () => {
    try {
      setExporting(true);
      setShowExportMenu(false);
      const dataToExport = filteredData.map(a => {
        const d = a.date ? new Date(a.date) : null;
        const isValid = d && !isNaN(d.getTime());
        return {
          ...a,
          formattedDate: isValid ? d.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "-",
          formattedTime: isValid ? d.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) + " WIB" : "-"
        };
      });
      exportToExcel(getColumns(), dataToExport, "Laporan_Aktivitas.xlsx");
    } catch (err) {
      alert("Gagal mengekspor: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  const formatActivityDate = (dateStr) => {
    const dStr = dateStr || "";
    if (!dStr) return { datePart: "-", timePart: "" };
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return { datePart: "-", timePart: "" };
    
    const datePart = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(d);
    const timePart = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(d) + " WIB";
    return { datePart, timePart };
  };

  const Pagination = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 border-t border-slate-200 gap-3">
      <div className="hidden sm:flex items-center gap-3">
        <p className="text-sm text-slate-500 text-nowrap">Menampilkan {filteredData.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredData.length)} dari <span className="font-semibold text-slate-700">{filteredData.length}</span> data</p>
        <div className="flex items-center gap-2">
          <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} 
            className="cursor-pointer rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-primary-hover shadow-sm transition-colors hover:bg-primary-hover">
            {ROWS_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-white text-slate-700">{opt}</option>)}
          </select>
          <p className="text-sm text-slate-500 text-nowrap">baris per halaman</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronsLeft className="h-4 w-4" /></button>
        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft className="h-4 w-4" /></button>
        {getPageNumbers().map((page, idx) => page === "..." ? (<span key={`e-${idx}`} className="min-w-[32px] px-1 py-1.5 text-center text-sm text-slate-400">...</span>) : (<button key={page} onClick={() => setCurrentPage(page)} className={`cursor-pointer min-w-[32px] rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${currentPage === page ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"}`}>{page}</button>))}
        <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight className="h-4 w-4" /></button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronsRight className="h-4 w-4" /></button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-primary">
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-slate-800">Laporan Aktivitas Operasional</h2>
        </div>
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={exporting || loading || filteredData.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-hover transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Printer className="h-4 w-4" /> 
            <span>Cetak Laporan</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showExportMenu ? "rotate-180" : ""}`} />
          </button>
          
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
              <button
                onClick={handleExportPDF}
                className="flex items-center w-full gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-50"
              >
                <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold">Format PDF</span>
                  <span className="text-[10px] text-slate-400 text-left">Dokumen digital siap cetak</span>
                </div>
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center w-full gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                  <Download className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold">Format Excel</span>
                  <span className="text-[10px] text-slate-400 text-left">Olah data di spreadsheet</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4 bg-white border-b border-slate-300">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari aktivitas, user, atau item..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 border-2 border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors hover:border-slate-300"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 px-3 py-2 border-2 border-slate-200 rounded-lg bg-slate-50/50">
              <Calendar className="h-4 w-4 text-slate-400" />
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-xs text-slate-700 focus:outline-none" 
              />
              <span className="text-slate-300">|</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-xs text-slate-700 focus:outline-none" 
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-8 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white appearance-none cursor-pointer hover:border-slate-300 transition-colors"
              >
                <option value="">Semua Modul</option>
                {getUniqueValues('type').map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button 
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              title="Reset Filter"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </div>
        </div>
      </div>

      <div className="p-0">
        {error && <div className="m-5 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-t border-t-slate-300 border-b border-b-slate-300">
                <th className="px-5 py-3 font-bold text-slate-700 w-[120px]">
                  <button onClick={() => handleSort("date")} className="flex items-center uppercase tracking-wider cursor-pointer">
                    Tanggal <SortIcon columnKey="date" sortConfig={sortConfig} />
                  </button>
                </th>
                <th className="px-5 py-3 font-bold text-slate-700">
                  <button onClick={() => handleSort("createdBy")} className="flex items-center uppercase tracking-wider cursor-pointer">
                    User <SortIcon columnKey="createdBy" sortConfig={sortConfig} />
                  </button>
                </th>
                <th className="px-5 py-3 font-bold text-slate-700 text-center uppercase tracking-wider">Aksi</th>
                <th className="px-5 py-3 font-bold text-slate-700">
                  <button onClick={() => handleSort("item")} className="flex items-center uppercase tracking-wider cursor-pointer">
                    Item / Kode Transaksi <SortIcon columnKey="item" sortConfig={sortConfig} />
                  </button>
                </th>
                <th className="px-5 py-3 font-bold text-slate-700 uppercase tracking-wider">Penerima / Pihak Terkait</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-500">Memuat data...</td></tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-500">Tidak ada data ditemukan.</td></tr>
              ) : (
                paginatedData.map((activity, index) => {
                  const { datePart, timePart } = formatActivityDate(activity.date);
                  return (
                    <tr key={activity.id} className={`border-b border-slate-100 transition-colors ${index % 2 === 0 ? "bg-slate-100" : "bg-white"}`}>
                      <td className="px-5 py-3 text-slate-600">
                        <div className="flex flex-col leading-tight">
                          <span className="text-sm text-slate-700 font-semibold">{datePart}</span>
                          <span className="text-xs text-slate-400 font-medium">{timePart}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold border border-primary/20">
                            {activity.createdBy?.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-slate-700 font-semibold text-sm">{activity.createdBy}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-block w-[180px] text-center text-xs font-semibold uppercase px-3 py-1 rounded-full border shadow-sm ${
                          activity.action === 'Peminjaman' ? 'bg-amber-50 text-amber-600 border-amber-500' :
                          activity.action === 'Pengembalian' ? 'bg-blue-50 text-blue-600 border-blue-500' :
                          'bg-emerald-50 text-emerald-600 border-emerald-500'
                        }`}>
                          {activity.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm">
                        <div className="flex flex-col">
                          <span className="text-slate-700 font-semibold">{activity.item}</span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">{activity.type}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600 text-sm font-semibold">{activity.target}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination />
      </div>
    </div>
  );
}
