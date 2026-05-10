"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { getAllCategories, createCategory, deleteCategory } from "../../lib/categoryService";
import { getAllBrands, createBrand, deleteBrand } from "../../lib/brandService";
import { Plus, Trash2, X, Check, Tag, Bookmark, AlertTriangle, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pencil, Info, ChevronUp, ChevronDown } from "lucide-react";

export default function KategoriMerekPage() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("kategori"); // "kategori" or "merek"
  
  const [showModalKat, setShowModalKat] = useState(false);
  const [showModalMerek, setShowModalMerek] = useState(false);
  const [showEditKat, setShowEditKat] = useState(null);
  const [showEditMerek, setShowEditMerek] = useState(null);
  
  const [showDeleteKat, setShowDeleteKat] = useState(null);
  const [showDeleteMerek, setShowDeleteMerek] = useState(null);
  
  const [formKat, setFormKat] = useState({ nama: "", kode_singkat: "", tipe: "aset" });
  const [formMerek, setFormMerek] = useState({ nama: "", tipe: "aset" });
  
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "nama", direction: "asc" });

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Tab sliding indicator
  const tabContainerRef = useRef(null);
  const tabKategoriRef = useRef(null);
  const tabMerekRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const [isIndicatorReady, setIsIndicatorReady] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Update sliding indicator position when activeTab changes
  useEffect(() => {
    let mounted = true;
    const updateIndicator = () => {
      const activeRef = activeTab === "kategori" ? tabKategoriRef : tabMerekRef;
      const button = activeRef.current;
      if (button && button.offsetWidth > 0) {
        setIndicatorStyle({
          width: button.offsetWidth,
          left: button.offsetLeft,
        });
      }
    };

    updateIndicator();
    
    const readyTimer = setTimeout(() => {
      if (mounted) setIsIndicatorReady(true);
    }, 50);

    // Antisipasi client-side routing Next.js dimana ukuran bisa jadi 0 di awal
    const routingTimer = setTimeout(updateIndicator, 150);
    window.addEventListener("resize", updateIndicator);

    return () => {
      mounted = false;
      clearTimeout(readyTimer);
      clearTimeout(routingTimer);
      window.removeEventListener("resize", updateIndicator);
    };
  }, [activeTab]);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); } }, [toast]);
  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchData = useCallback(async () => {
    try {
      if (!loading) setTableLoading(true);
      // Fetch both for a complete overview or just based on what's needed
      const [catsData, brandsData] = await Promise.all([
        getAllCategories(), 
        getAllBrands()
      ]);
      setCategories(catsData || []);
      setBrands(brandsData || []);
    } catch {
      setError("Gagal memuat data master.");
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  }, [loading]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // Sorting & Pagination Logic
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

  const getFilteredData = () => {
    const data = activeTab === "kategori" ? categories : brands;
    let filtered = data.filter(item => 
      (item.nama || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.tipe || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.kode_singkat || "").toLowerCase().includes(search.toLowerCase())
    );
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = (a[sortConfig.key] || "").toString().toLowerCase();
        const bVal = (b[sortConfig.key] || "").toString().toLowerCase();
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  };

  const filteredData = getFilteredData();
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

  const SortIcon = ({ columnKey }) => {
    const isActive = sortConfig.key === columnKey;
    return (
      <span className="ml-1.5 inline-flex flex-col -space-y-1.5">
        <ChevronUp className={`h-3 w-3 ${isActive && sortConfig.direction === "asc" ? "text-primary" : "text-slate-300"}`} />
        <ChevronDown className={`h-3 w-3 ${isActive && sortConfig.direction === "desc" ? "text-primary" : "text-slate-300"}`} />
      </span>
    );
  };

  const PaginationControls = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 bg-slate-50/50 gap-3">
      <div className="hidden sm:flex items-center gap-3">
        <p className="text-sm text-slate-500 text-nowrap">Menampilkan {filteredData.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredData.length)} dari <span className="font-semibold text-slate-700">{filteredData.length}</span> data</p>
        <div className="flex items-center gap-2">
          <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} 
            className="cursor-pointer rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-primary-hover shadow-sm transition-colors hover:bg-primary-hover">
            {[5, 10, 25, 50].map(opt => <option key={opt} value={opt} className="bg-white text-slate-700">{opt}</option>)}
          </select>
          <p className="text-sm text-slate-500 text-nowrap">baris per halaman</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Halaman Pertama"><ChevronsLeft className="h-4 w-4" /></button>
        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Sebelumnya"><ChevronLeft className="h-4 w-4" /></button>
        {getPageNumbers().map((page, idx) => page === "..." ? (<span key={`e-${idx}`} className="min-w-[32px] px-1 py-1.5 text-center text-sm text-slate-400">...</span>) : (<button key={page} onClick={() => setCurrentPage(page)} className={`cursor-pointer min-w-[32px] rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${currentPage === page ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"}`}>{page}</button>))}
        <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Berikutnya"><ChevronRight className="h-4 w-4" /></button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Halaman Terakhir"><ChevronsRight className="h-4 w-4" /></button>
      </div>
    </div>
  );

  const handleCreateKat = async (e) => {
    e.preventDefault();
    if (!formKat.nama || !formKat.kode_singkat) { showToast("Nama dan Kode Singkat wajib diisi", "error"); return; }
    try { 
      setSubmitting(true); 
      await createCategory(formKat.nama, formKat.kode_singkat, formKat.tipe); 
      showToast(`Kategori berhasil ditambahkan!`); 
      setShowModalKat(false); 
      setFormKat({ nama: "", kode_singkat: "", tipe: "aset" }); 
      await fetchData(); 
    } catch (err) { showToast(err.response?.data?.message || "Gagal menambahkan kategori", "error"); }
    finally { setSubmitting(false); }
  };

  const handleUpdateKat = async (e) => {
    e.preventDefault();
    if (!showEditKat.nama || !showEditKat.kode_singkat) { showToast("Nama dan Kode Singkat wajib diisi", "error"); return; }
    try {
      setSubmitting(true);
      await updateCategory(showEditKat.id, showEditKat.nama, showEditKat.kode_singkat);
      showToast("Kategori berhasil diperbarui!");
      setShowEditKat(null);
      await fetchData();
    } catch (err) { showToast(err.response?.data?.message || "Gagal memperbarui kategori", "error"); }
    finally { setSubmitting(false); }
  };

  const handleDeleteKat = async () => {
    if (!showDeleteKat) return;
    try { setSubmitting(true); await deleteCategory(showDeleteKat.id); showToast("Kategori berhasil dihapus!"); setShowDeleteKat(null); await fetchData(); }
    catch (err) { showToast(err.response?.data?.message || "Gagal menghapus kategori", "error"); }
    finally { setSubmitting(false); }
  };

  const handleCreateMerek = async (e) => {
    e.preventDefault();
    if (!formMerek.nama) { showToast("Nama Merek wajib diisi", "error"); return; }
    try { 
      setSubmitting(true); 
      await createBrand(formMerek.nama, formMerek.tipe); 
      showToast(`Merek berhasil ditambahkan!`); 
      setShowModalMerek(false); 
      setFormMerek({ nama: "", tipe: "aset" }); 
      await fetchData(); 
    } catch (err) { showToast(err.response?.data?.message || "Gagal menambahkan merek", "error"); }
    finally { setSubmitting(false); }
  };

  const handleUpdateMerek = async (e) => {
    e.preventDefault();
    if (!showEditMerek.nama) { showToast("Nama merek wajib diisi", "error"); return; }
    try {
      setSubmitting(true);
      await updateBrand(showEditMerek.id, showEditMerek.nama);
      showToast("Merek berhasil diperbarui!");
      setShowEditMerek(null);
      await fetchData();
    } catch (err) { showToast(err.response?.data?.message || "Gagal memperbarui merek", "error"); }
    finally { setSubmitting(false); }
  };

  const handleDeleteMerek = async () => {
    if (!showDeleteMerek) return;
    try { setSubmitting(true); await deleteBrand(showDeleteMerek.id); showToast("Merek berhasil dihapus!"); setShowDeleteMerek(null); await fetchData(); }
    catch (err) { showToast(err.response?.data?.message || "Gagal menghapus merek", "error"); }
    finally { setSubmitting(false); }
  };

  if (loading) {
    return <div className="p-8 animate-pulse space-y-4"><div className="h-8 w-60 bg-slate-200 rounded"></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="h-64 bg-slate-200 rounded"></div><div className="h-64 bg-slate-200 rounded"></div></div></div>;
  }

  if (error) {
    return <div className="p-8 text-rose-500 bg-rose-50 rounded-xl">{error}</div>;
  }

  return (
    <div>
      {/* Toast */}
      {mounted && typeof document !== 'undefined' && toast && createPortal(
        <div className={`fixed top-20 right-6 z-9999 flex items-center gap-2 rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-white transition-all animate-[slideIn_0.3s_ease] ${toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"}`}>
          {toast.type === "error" ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {toast.message}
        </div>,
        document.body
      )}

      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Kategori & Merek</h1>
          <p className="text-sm text-slate-500">Manajemen kategori dan merek aset dalam satu tempat</p>
        </div>
        
        <div ref={tabContainerRef} className="relative flex bg-slate-200 p-1.5 rounded-xl border border-slate-300 self-center sm:self-start shadow-inner">
          {/* Sliding Indicator */}
          <div 
            className={`absolute top-1.5 bottom-1.5 bg-primary rounded-lg shadow-md transition-all duration-300 ease-out ${!indicatorStyle.width ? 'opacity-0' : 'opacity-100'}`}
            style={indicatorStyle}
          />
          <button 
            ref={tabKategoriRef}
            onClick={() => { setActiveTab("kategori"); setCurrentPage(1); setSearch(""); }}
            className={`relative z-10 px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === "kategori" && indicatorStyle.width ? "text-white scale-[1.02]" : "text-slate-600 hover:bg-white/50 hover:text-slate-800"}`}
          >
            DAFTAR KATEGORI
          </button>
          <button 
            ref={tabMerekRef}
            onClick={() => { setActiveTab("merek"); setCurrentPage(1); setSearch(""); }}
            className={`relative z-10 px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === "merek" && indicatorStyle.width ? "text-white scale-[1.02]" : "text-slate-600 hover:bg-white/50 hover:text-slate-800"}`}
          >
            DAFTAR MEREK
          </button>
        </div>
      </div>

      {/* Toolbar & Table Section */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-primary">
        {/* Table Loading Overlay */}
        {tableLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px] transition-all animate-in fade-in duration-200">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-sm" />
          </div>
        )}
        
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-5 border-b border-slate-300 bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={`Cari ${activeTab}...`} 
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-lg border-2 border-slate-200 py-2 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-text transition-colors hover:border-slate-300" 
            />
          </div>
          <button 
            onClick={() => {
              if (activeTab === "kategori") { setFormKat({ nama: "", kode_singkat: "", tipe: "aset" }); setShowModalKat(true); }
              else { setFormMerek({ nama: "", tipe: "aset" }); setShowModalMerek(true); }
            }}
            className="cursor-pointer w-full sm:w-auto flex justify-center items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Tambah {activeTab === "kategori" ? "Kategori" : "Merek"}
          </button>
        </div>

        {/* Table Controls Top */}
        <PaginationControls />

        {/* Table */}
        <div className="overflow-x-auto border-t border-slate-100">
          {activeTab === "kategori" ? (
            <table className="w-full text-left text-sm">
              <thead>
                  <tr className="border-t border-t-slate-300 border-b border-b-slate-300 bg-slate-50">
                  <th className="px-5 py-3 font-bold text-slate-700 w-16 text-center uppercase tracking-wider">No</th>
                  <th className="px-5 py-3 font-bold text-slate-700">
                    <button onClick={() => handleSort("nama")} className="cursor-pointer flex items-center uppercase tracking-wider">
                      Nama Kategori <SortIcon columnKey="nama" />
                    </button>
                  </th>
                  <th className="px-5 py-3 font-bold text-slate-700 w-40 text-center">
                    <button onClick={() => handleSort("kode_singkat")} className="cursor-pointer flex items-center justify-center w-full uppercase tracking-wider">
                      Kode <SortIcon columnKey="kode_singkat" />
                    </button>
                  </th>
                  <th className="px-5 py-3 font-bold text-center text-slate-700 w-44 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="px-5 py-3 font-bold text-slate-700 text-center w-32">
                    <button onClick={() => handleSort("qty")} className="cursor-pointer flex items-center justify-center w-full uppercase tracking-wider">
                      QTY <SortIcon columnKey="qty" />
                    </button>
                  </th>
                  <th className="px-5 py-3 font-bold text-slate-700 w-28 text-center uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr key={item.id} className={`border-b border-slate-100 transition-colors ${index % 2 === 0 ? "bg-slate-100" : "bg-white"}`}>
                    <td className="px-5 py-3 text-center text-slate-500 font-medium">{startIndex + index + 1}</td>
                    <td className="px-5 py-3 font-bold text-slate-700 text-sm">{item.nama}</td>
                    <td className="px-5 py-3">
                      <span className="block w-full text-center rounded-full border py-1 text-xs font-semibold tracking-wide uppercase border-blue-500 bg-blue-50 text-blue-700 shadow-sm">{item.kode_singkat}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`block min-w-[120px] w-full max-w-[140px] mx-auto rounded-full border py-1 text-xs font-semibold tracking-wide uppercase shadow-sm ${item.tipe === 'aset' ? 'bg-emerald-50 text-emerald-700 border-emerald-500' : 'bg-purple-50 text-purple-700 border-purple-500'}`}>
                        {item.tipe}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="font-bold text-slate-600 ">{item.qty || 0}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => setShowEditKat(item)} className="cursor-pointer rounded-lg bg-amber-100 p-1.5 text-amber-600 transition-all hover:bg-amber-600 hover:text-white" title="Edit"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setShowDeleteKat(item)} className="cursor-pointer rounded-lg bg-rose-100 p-1.5 text-rose-600 transition-all hover:bg-rose-600 hover:text-white" title="Hapus"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (<tr><td colSpan={6} className="px-5 py-16 text-center text-slate-400 font-medium italic">Data tidak ditemukan.</td></tr>)}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                  <tr className="border-t border-t-slate-300 border-b border-b-slate-300 bg-slate-50">
                  <th className="px-5 py-3 font-bold text-slate-700 w-16 text-center uppercase tracking-wider">No</th>
                  <th className="px-5 py-3 font-bold text-slate-700">
                    <button onClick={() => handleSort("nama")} className="cursor-pointer flex items-center uppercase tracking-wider">
                      Nama Merek <SortIcon columnKey="nama" />
                    </button>
                  </th>
                  <th className="px-5 py-3 font-bold text-center text-slate-700 w-44 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="px-5 py-3 font-bold text-slate-700 text-center w-36">
                    <button onClick={() => handleSort("qty")} className="cursor-pointer flex items-center justify-center w-full uppercase tracking-wider">
                      QTY <SortIcon columnKey="qty" />
                    </button>
                  </th>
                  <th className="px-5 py-3 font-bold text-slate-700 w-28 text-center uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr key={item.id} className={`border-b border-slate-100 transition-colors ${index % 2 === 0 ? "bg-slate-100" : "bg-white"}`}>
                    <td className="px-5 py-3 text-center text-slate-500 font-medium">{startIndex + index + 1}</td>
                    <td className="px-5 py-3 font-bold text-slate-700 text-sm">{item.nama}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`block min-w-[120px] w-full max-w-[140px] mx-auto rounded-full border py-1 text-xs font-semibold tracking-wide uppercase shadow-sm ${item.tipe === 'aset' ? 'bg-emerald-50 text-emerald-700 border-emerald-500' : 'bg-purple-50 text-purple-700 border-purple-500'}`}>
                        {item.tipe}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="font-bold text-slate-600">{item.qty || 0}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => setShowEditMerek(item)} className="cursor-pointer rounded-lg bg-amber-100 p-1.5 text-amber-600 transition-all hover:bg-amber-600 hover:text-white" title="Edit"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setShowDeleteMerek(item)} className="cursor-pointer rounded-lg bg-rose-100 p-1.5 text-rose-600 transition-all hover:bg-rose-600 hover:text-white" title="Hapus"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (<tr><td colSpan={5} className="px-5 py-16 text-center text-slate-400 font-medium italic">Data tidak ditemukan.</td></tr>)}
              </tbody>
            </table>
          )}
        </div>

        {/* Table Controls Bottom */}
        <div className="border-t border-slate-200"><PaginationControls /></div>
      </div>

      {mounted && typeof document !== 'undefined' && createPortal(
        <>
          {/* Modal Tambah Kategori */}
          {showModalKat && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowModalKat(false)}>
              <form onSubmit={handleCreateKat} className="w-full max-w-md flex flex-col rounded-2xl bg-white shadow-xl border-t-4 border-t-emerald-500 animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-50 px-6 py-4 rounded-t-2xl shrink-0">
                  <h2 className="text-lg font-bold text-emerald-800">Tambah Kategori</h2>
                  <button type="button" onClick={() => setShowModalKat(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Tipe Kategori</label>
                    <select value={formKat.tipe} onChange={(e) => setFormKat(d => ({ ...d, tipe: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="aset">Aset Utama</option>
                      <option value="aksesoris">Aksesoris</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Kategori</label>
                    <input type="text" required placeholder="Contoh: Kamera" value={formKat.nama} onChange={(e) => setFormKat(d => ({ ...d, nama: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" onInvalid={(e) => e.target.setCustomValidity("Nama kategori wajib diisi")} onInput={(e) => e.target.setCustomValidity("")} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Kode Singkat</label>
                    <input type="text" required placeholder="Contoh: CAM" value={formKat.kode_singkat} onChange={(e) => setFormKat(d => ({ ...d, kode_singkat: e.target.value.toUpperCase() }))} className="w-full font-mono rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" onInvalid={(e) => e.target.setCustomValidity("Kode singkat wajib diisi")} onInput={(e) => e.target.setCustomValidity("")} />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-white rounded-b-2xl shrink-0">
                  <button type="button" onClick={() => setShowModalKat(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Batal</button>
                  <button type="submit" disabled={submitting} className="cursor-pointer rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:opacity-60">{submitting ? "Menyimpan..." : "Simpan"}</button>
                </div>
              </form>
            </div>
          )}

          {/* Modal Tambah Merek */}
          {showModalMerek && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowModalMerek(false)}>
              <form onSubmit={handleCreateMerek} className="w-full max-w-md flex flex-col rounded-2xl bg-white shadow-xl border-t-4 border-t-amber-500 animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 bg-amber-50 px-6 py-4 rounded-t-2xl shrink-0">
                  <h2 className="text-lg font-bold text-amber-800">Tambah Merek</h2>
                  <button type="button" onClick={() => setShowModalMerek(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Tipe Merek</label>
                    <select value={formMerek.tipe} onChange={(e) => setFormMerek(d => ({ ...d, tipe: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="aset">Aset Utama</option>
                      <option value="aksesoris">Aksesoris</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Merek</label>
                    <input type="text" required placeholder="Contoh: Sony" value={formMerek.nama} onChange={(e) => setFormMerek(d => ({ ...d, nama: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" onInvalid={(e) => e.target.setCustomValidity("Nama merek wajib diisi")} onInput={(e) => e.target.setCustomValidity("")} />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-white rounded-b-2xl shrink-0">
                  <button type="button" onClick={() => setShowModalMerek(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Batal</button>
                  <button type="submit" disabled={submitting} className="cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-60">{submitting ? "Menyimpan..." : "Simpan"}</button>
                </div>
              </form>
            </div>
          )}

          {/* Modal Edit Kategori */}
          {showEditKat && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowEditKat(null)}>
              <form onSubmit={handleUpdateKat} className="w-full max-w-md flex flex-col rounded-2xl bg-white shadow-xl border-t-4 border-t-amber-500 animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 bg-amber-50 px-6 py-4 rounded-t-2xl shrink-0">
                  <h2 className="text-lg font-bold text-amber-800">Edit Kategori</h2>
                  <button type="button" onClick={() => setShowEditKat(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-500">Tipe (Read-Only)</label>
                    <input type="text" readOnly value={showEditKat.tipe === 'aset' ? 'Aset Utama' : 'Aksesoris'} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 outline-none" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Kategori</label>
                    <input type="text" required value={showEditKat.nama} onChange={(e) => setShowEditKat(d => ({ ...d, nama: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" onInvalid={(e) => e.target.setCustomValidity("Nama kategori wajib diisi")} onInput={(e) => e.target.setCustomValidity("")} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Kode Singkat</label>
                    <input type="text" required value={showEditKat.kode_singkat} onChange={(e) => setShowEditKat(d => ({ ...d, kode_singkat: e.target.value.toUpperCase() }))} className="w-full font-mono rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" onInvalid={(e) => e.target.setCustomValidity("Kode singkat wajib diisi")} onInput={(e) => e.target.setCustomValidity("")} />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-white rounded-b-2xl shrink-0">
                  <button type="button" onClick={() => setShowEditKat(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Batal</button>
                  <button type="submit" disabled={submitting} className="cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-60">{submitting ? "Menyimpan..." : "Simpan Perubahan"}</button>
                </div>
              </form>
            </div>
          )}

          {/* Modal Edit Merek */}
          {showEditMerek && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowEditMerek(null)}>
              <form onSubmit={handleUpdateMerek} className="w-full max-w-md flex flex-col rounded-2xl bg-white shadow-xl border-t-4 border-t-amber-500 animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 bg-amber-50 px-6 py-4 rounded-t-2xl shrink-0">
                  <h2 className="text-lg font-bold text-amber-800">Edit Merek</h2>
                  <button type="button" onClick={() => setShowEditMerek(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-500">Tipe (Read-Only)</label>
                    <input type="text" readOnly value={showEditMerek.tipe === 'aset' ? 'Aset Utama' : 'Aksesoris'} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 outline-none" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Merek</label>
                    <input type="text" required value={showEditMerek.nama} onChange={(e) => setShowEditMerek(d => ({ ...d, nama: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" onInvalid={(e) => e.target.setCustomValidity("Nama merek wajib diisi")} onInput={(e) => e.target.setCustomValidity("")} />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-white rounded-b-2xl shrink-0">
                  <button type="button" onClick={() => setShowEditMerek(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Batal</button>
                  <button type="submit" disabled={submitting} className="cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-60">{submitting ? "Menyimpan..." : "Simpan Perubahan"}</button>
                </div>
              </form>
            </div>
          )}

          {/* Modal Hapus Kategori */}
          {showDeleteKat && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowDeleteKat(null)}>
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border-t-4 border-t-rose-500 animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100"><Trash2 className="h-7 w-7 text-rose-600" /></div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Hapus Kategori?</h3>
                  <p className="text-sm font-semibold text-slate-700 mb-1">{showDeleteKat.nama}</p>
                </div>
                <div className="flex items-center justify-center gap-3 border-t border-slate-100 pt-4">
                  <button onClick={() => setShowDeleteKat(null)} className="cursor-pointer flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Batal</button>
                  <button onClick={handleDeleteKat} disabled={submitting} className="cursor-pointer flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-700 disabled:opacity-60">{submitting ? "Menghapus..." : "Ya, Hapus"}</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Hapus Merek */}
          {showDeleteMerek && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowDeleteMerek(null)}>
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border-t-4 border-t-rose-500 animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100"><Trash2 className="h-7 w-7 text-rose-600" /></div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Hapus Merek?</h3>
                  <p className="text-sm font-semibold text-slate-700 mb-1">{showDeleteMerek.nama}</p>
                </div>
                <div className="flex items-center justify-center gap-3 border-t border-slate-100 pt-4">
                  <button onClick={() => setShowDeleteMerek(null)} className="cursor-pointer flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Batal</button>
                  <button onClick={handleDeleteMerek} disabled={submitting} className="cursor-pointer flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-700 disabled:opacity-60">{submitting ? "Menghapus..." : "Ya, Hapus"}</button>
                </div>
              </div>
            </div>
          )}
        </>,
        document.body
      )}
    </div>
  );
}
