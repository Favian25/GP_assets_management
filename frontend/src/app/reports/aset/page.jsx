"use client";

import { useState, useEffect, useMemo } from "react";
import { getAllAssets } from "../../lib/assetService";
import { exportToPDF, exportToExcel } from "../../lib/exportUtils";
import { Search, FileText, Download, Filter, Package, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronUp, ChevronDown } from "lucide-react";

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

export default function AsetReportPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("");
  const [kondisiFilter, setKondisiFilter] = useState("");
  const [exporting, setExporting] = useState(false);
  
  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "kodeAset", direction: "asc" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAllAssets();
      setAssets(data || []);
    } catch (err) {
      setError(err.message || "Gagal memuat data aset");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const filteredAssets = useMemo(() => {
    let result = [...assets];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(a => 
        a.namaAset?.toLowerCase().includes(s) || 
        a.kodeAset?.toLowerCase().includes(s) ||
        a.merek?.toLowerCase().includes(s)
      );
    }
    if (kategoriFilter) {
      result = result.filter(a => a.kategori === kategoriFilter);
    }
    if (kondisiFilter) {
      result = result.filter(a => a.kondisi === kondisiFilter);
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
  }, [assets, search, kategoriFilter, kondisiFilter, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAssets.slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = () => {
    const p = [];
    if (totalPages <= 4) { for (let i = 1; i <= totalPages; i++) p.push(i); }
    else if (currentPage <= 3) { for (let i = 1; i <= 3; i++) p.push(i); p.push("..."); p.push(totalPages); }
    else if (currentPage >= totalPages - 2) { p.push(1); p.push("..."); for (let i = totalPages - 2; i <= totalPages; i++) p.push(i); }
    else { p.push(1); p.push("..."); p.push(currentPage); p.push("..."); p.push(totalPages); }
    return p;
  };

  const getUniqueValues = (key) => {
    return [...new Set(assets.map(a => a[key]).filter(Boolean))].sort();
  };

  const getColumns = () => [
    { header: "Kode Aset", dataKey: "kodeAset" },
    { header: "Nama Aset", dataKey: "namaAset" },
    { header: "Kategori", dataKey: "kategori" },
    { header: "Merek", dataKey: "merek" },
    { header: "Kondisi", dataKey: "kondisi" },
    { header: "Tersedia", dataKey: "jumlah" },
    { header: "Total Unit", dataKey: "jumlahTotal" },
    { header: "Lokasi", dataKey: "lokasi" }
  ];

  const handleExportPDF = () => {
    try {
      setExporting(true);
      exportToPDF(getColumns(), filteredAssets, "Laporan_Aset.pdf", "Laporan Inventaris Aset");
    } catch (err) {
      alert("Gagal mengekspor: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = () => {
    try {
      setExporting(true);
      exportToExcel(getColumns(), filteredAssets, "Laporan_Aset.xlsx");
    } catch (err) {
      alert("Gagal mengekspor: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  const getKondisiBadge = (kondisi) => {
    const s = { 
      "Siap Digunakan": "bg-emerald-50 text-emerald-700 border-emerald-500", 
      "Rusak": "bg-red-50 text-red-700 border-red-500", 
      "Maintenance": "bg-amber-50 text-amber-700 border-amber-500", 
      "Dijual": "bg-slate-100 text-slate-600 border-slate-500" 
    };
    return s[kondisi] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const Pagination = () => (
    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200">
      <div className="flex items-center gap-3">
        <p className="text-sm text-slate-500 text-nowrap">Menampilkan {filteredAssets.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredAssets.length)} dari <span className="font-semibold text-slate-700">{filteredAssets.length}</span> data</p>
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
          <Package className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-slate-800">Laporan Inventaris Aset</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            disabled={exporting || loading || filteredAssets.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <FileText className="h-4 w-4" /> PDF
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exporting || loading || filteredAssets.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-green-50 text-green-600 rounded-lg border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Excel
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col sm:flex-row gap-4 bg-white border-b border-slate-300">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari aset..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 border-2 border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors hover:border-slate-300"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={kategoriFilter}
              onChange={(e) => { setKategoriFilter(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-8 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white appearance-none cursor-pointer hover:border-slate-300 transition-colors"
            >
              <option value="">Semua Kategori</option>
              {getUniqueValues('kategori').map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={kondisiFilter}
              onChange={(e) => { setKondisiFilter(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-8 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white appearance-none cursor-pointer hover:border-slate-300 transition-colors"
            >
              <option value="">Semua Kondisi</option>
              {getUniqueValues('kondisi').map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="p-0">
        {error && <div className="m-5 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-300">
                <th className="px-5 py-3 font-bold text-slate-700 tracking-wider uppercase">
                  <button onClick={() => handleSort("kodeAset")} className="flex items-center uppercase text-xs">
                    Kode <SortIcon columnKey="kodeAset" sortConfig={sortConfig} />
                  </button>
                </th>
                <th className="px-5 py-3 font-bold text-slate-700 tracking-wider uppercase">
                  <button onClick={() => handleSort("namaAset")} className="flex items-center uppercase text-xs">
                    Nama Aset <SortIcon columnKey="namaAset" sortConfig={sortConfig} />
                  </button>
                </th>
                <th className="px-5 py-3 font-bold text-slate-700 tracking-wider uppercase">
                  <button onClick={() => handleSort("kategori")} className="flex items-center uppercase text-xs">
                    Kategori <SortIcon columnKey="kategori" sortConfig={sortConfig} />
                  </button>
                </th>
                <th className="px-5 py-3 font-bold text-slate-700 tracking-wider uppercase text-center">Kondisi</th>
                <th className="px-5 py-3 font-bold text-slate-700 tracking-wider uppercase text-center">Stok (Tersedia / Total)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-500">Memuat data...</td></tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-500">Tidak ada data ditemukan.</td></tr>
              ) : (
                paginatedData.map((asset, index) => (
                  <tr key={asset.id} className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? "bg-slate-50/30" : "bg-white"}`}>
                    <td className="px-5 py-3 text-primary font-mono font-bold text-xs">{asset.kodeAset}</td>
                    <td className="px-5 py-3 text-slate-700 font-medium">{asset.namaAset}</td>
                    <td className="px-5 py-3 text-slate-600">{asset.kategori}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide shadow-sm ${getKondisiBadge(asset.kondisi)}`}>
                        {asset.kondisi}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex flex-col">
                        <span className="font-bold text-emerald-600">{asset.jumlah}</span>
                        <span className="text-[10px] text-slate-400">DARI {asset.jumlahTotal} UNIT</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination />
      </div>
    </div>
  );
}
