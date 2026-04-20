"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getAllPeminjaman, deletePeminjaman, searchPeminjaman, approvePeminjaman } from "../../lib/peminjamanService";
import { getUserContext } from "../../lib/authService";
import { Search, Plus, Info, Pencil, Check, Trash2, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, X, AlertTriangle, ChevronUp, ChevronDown } from "lucide-react";

const ROWS_OPTIONS = [10, 20, 30, 40, 50];
const getBackendURL = () => {
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:5000`;
  }
  return "http://localhost:5000";
};
const BACKEND_URL = getBackendURL();

function SortIcon({ columnKey, sortConfig }) {
  const isActive = sortConfig.key === columnKey;
  return (
    <span className="ml-1.5 inline-flex flex-col -space-y-1.5">
      <ChevronUp className={`h-3.5 w-3.5 ${isActive && sortConfig.direction === "asc" ? "text-primary" : "text-slate-300"}`} />
      <ChevronDown className={`h-3.5 w-3.5 ${isActive && sortConfig.direction === "desc" ? "text-primary" : "text-slate-300"}`} />
    </span>
  );
}

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  }).format(new Date(dateString)) + " WIB";
};

const getStatusLabel = (status) => {
  const map = {
    "Pending": "BELUM DIKEMBALIKAN",
    "Dikembalikan": "SUDAH DIKEMBALIKAN",
    "Approved": "SUDAH DISETUJUI",
  };
  return map[status] || status;
};

const getStatusBadge = (status) => {
  const s = {
    "Pending": "bg-amber-50 text-amber-700 border-amber-200",
    "Dikembalikan": "bg-blue-50 text-blue-700 border-blue-200",
    "Approved": "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return s[status] || "bg-slate-50 text-slate-700 border-slate-200";
};

export default function PeminjamanAsetPage() {
  const router = useRouter();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [toast, setToast] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState("user");
  const [userName, setUserName] = useState("");
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    const ctx = getUserContext();
    if (ctx) {
      setUserRole(ctx.role || "user");
      setUserName(ctx.namaLengkap || ctx.email || "");
    }
  }, []);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); } }, [toast]);
  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchData = useCallback(async () => {
    try { setLoading(true); setError(null); setDataList(await getAllPeminjaman()); }
    catch { setError("Gagal memuat data. Pastikan backend berjalan."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.trim()) {
        try { setDataList(await searchPeminjaman(search.trim())); setCurrentPage(1); } catch { }
      } else {
        try { setDataList(await getAllPeminjaman()); } catch { }
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Sorting & Pagination
  const sorted = [...dataList].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = (a[sortConfig.key] || "").toString().toLowerCase();
    const bVal = (b[sortConfig.key] || "").toString().toLowerCase();
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sorted.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) { if (prev.direction === "asc") return { key, direction: "desc" }; if (prev.direction === "desc") return { key: null, direction: null }; }
      return { key, direction: "asc" };
    });
    setCurrentPage(1);
  };

  // Permission helpers
  const canAdd = ["super admin", "admin", "supervisor", "user"].includes(userRole);
  const canEdit = ["super admin", "admin", "supervisor", "user"].includes(userRole);
  const canDelete = userRole === "super admin";
  const canApprove = ["super admin", "admin", "supervisor"].includes(userRole);

  // Actions
  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    try { setSubmitting(true); await deletePeminjaman(showDeleteConfirm.id); showToast("Peminjaman berhasil dihapus!"); setShowDeleteConfirm(null); fetchData(); }
    catch (err) { showToast(err.response?.data?.message || "Gagal menghapus data", "error"); }
    finally { setSubmitting(false); }
  };

  const handleApprove = async () => {
    if (!showApproveConfirm) return;
    try { setSubmitting(true); await approvePeminjaman(showApproveConfirm.id, userName); showToast("Peminjaman berhasil disetujui!"); setShowApproveConfirm(null); fetchData(); }
    catch (err) { showToast(err.response?.data?.message || "Gagal menyetujui data", "error"); }
    finally { setSubmitting(false); }
  };

  const getPageNumbers = () => {
    const p = [];
    if (totalPages <= 4) { for (let i = 1; i <= totalPages; i++) p.push(i); }
    else if (currentPage <= 3) { for (let i = 1; i <= 3; i++) p.push(i); p.push("..."); p.push(totalPages); }
    else if (currentPage >= totalPages - 2) { p.push(1); p.push("..."); for (let i = totalPages - 2; i <= totalPages; i++) p.push(i); }
    else { p.push(1); p.push("..."); p.push(currentPage); p.push("..."); p.push(totalPages); }
    return p;
  };

  const Pagination = () => (
    <div className="flex items-center justify-between px-5 py-3">
      <div className="flex items-center gap-3">
        <p className="text-sm text-slate-500 text-nowrap">Menampilkan {paginatedData.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + itemsPerPage, sorted.length)} dari <span className="font-semibold text-slate-700">{sorted.length}</span> data</p>
        <div className="flex items-center gap-2">
          <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} 
            className="cursor-pointer rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-primary-hover shadow-sm transition-colors hover:bg-primary-hover">
            {ROWS_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-white text-slate-700">{opt}</option>)}
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

  const ImageCarousel = ({ images, title }) => {
    const [startIndex, setStartIndex] = useState(0);
    if (!images || images.length === 0) return null;

    const visibleImages = images.slice(startIndex, startIndex + 3);
    const canNext = startIndex + 3 < images.length;
    const canPrev = startIndex > 0;

    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-600">{title}</span>
          {images.length > 3 && (
            <div className="flex gap-1">
              <button disabled={!canPrev} onClick={() => setStartIndex(s => Math.max(0, s - 1))} className="p-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="h-4 w-4" /></button>
              <button disabled={!canNext} onClick={() => setStartIndex(s => Math.min(images.length - 3, s + 1))} className="p-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight className="h-4 w-4" /></button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {visibleImages.map((path, i) => (
            <div key={i} className="relative h-20 rounded-lg overflow-hidden border border-slate-200 group cursor-zoom-in shadow-sm hover:border-primary/50 transition-colors" onClick={() => setLightboxImg(`${BACKEND_URL}${path}`)}>
              <Image src={`${BACKEND_URL}${path}`} alt={title} fill className="object-cover group-hover:scale-110 transition-transform duration-300" sizes="120px" unoptimized />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <Search className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
          {[...Array(Math.max(0, 3 - visibleImages.length))].map((_, i) => (
            <div key={`empty-${i}`} className="h-20 rounded-lg bg-slate-50 border border-dashed border-slate-200" />
          ))}
        </div>
      </div>
    );
  };

  // Loading
  if (loading) {
    return (
      <div>
        <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Peminjaman Aset</h1><p className="text-sm text-slate-500">Kelola data peminjaman aset Galeria Production</p></div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-8 space-y-3 animate-pulse">{[1,2,3,4,5].map(i => (<div key={i} className="flex gap-4"><div className="h-4 w-24 rounded bg-slate-200"/><div className="h-4 flex-1 rounded bg-slate-200"/><div className="h-4 w-20 rounded bg-slate-200"/></div>))}</div>
        </div>
      </div>
    );
  }
  // Error
  if (error) {
    return (
      <div>
        <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Peminjaman Aset</h1><p className="text-sm text-slate-500">Kelola data peminjaman aset Galeria Production</p></div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-10">
          <AlertTriangle className="h-12 w-12 text-rose-400 mb-3" />
          <p className="text-sm font-medium text-rose-700 mb-1">Koneksi Gagal</p>
          <p className="text-xs text-rose-500 mb-4 text-center">{error}</p>
          <button onClick={fetchData} className="cursor-pointer rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600">Coba Lagi</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-100 flex items-center gap-2 rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-white transition-all animate-[slideIn_0.3s_ease] ${toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"}`}>
          {toast.type === "error" ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {toast.message}
        </div>
      )}
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Peminjaman Aset</h1>
        <p className="text-sm text-slate-500">Rekapitulasi data transaksi peminjaman dan pengembalian</p>
      </div>

      {/* Toolbar & Table Section */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-blue-500">
        
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-5 border-b border-slate-300 bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Cari nama peminjam..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-lg border-2 border-slate-200 py-2 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-text transition-colors hover:border-slate-300" />
          </div>
          {canAdd && (
            <button onClick={() => router.push("/aset/peminjaman/tambah")}
              className="cursor-pointer w-full sm:w-auto flex justify-center items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover">
              <Plus className="h-4 w-4" />
              Tambah Peminjaman
            </button>
          )}
        </div>

        {/* Table Controls (Pagination Top) & Table */}
        <Pagination />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-t border-t-slate-300 border-b border-b-slate-300">
                <th className="px-5 py-3 font-bold text-slate-700 w-[80px]"><button onClick={() => handleSort("kodePinjam")} className="cursor-pointer flex items-center">No <SortIcon columnKey="kodePinjam" sortConfig={sortConfig} /></button></th>
                <th className="px-5 py-3 font-bold text-slate-700"><button onClick={() => handleSort("namaPeminjam")} className="cursor-pointer flex items-center">Nama Peminjam <SortIcon columnKey="namaPeminjam" sortConfig={sortConfig} /></button></th>
                <th className="px-5 py-3 font-bold text-slate-700">Peminjaman Alat</th>
                <th className="px-5 py-3 font-bold text-slate-700">Alasan</th>
                <th className="px-5 py-3 font-bold text-slate-700 w-[170px]"><button onClick={() => handleSort("tanggalPeminjaman")} className="cursor-pointer flex items-center">Tgl Pinjam <SortIcon columnKey="tanggalPeminjaman" sortConfig={sortConfig} /></button></th>
                <th className="px-5 py-3 font-bold text-slate-700 w-[170px]">Tgl Kembali</th>
                <th className="px-5 py-3 font-bold text-slate-700 w-[180px]"><button onClick={() => handleSort("status")} className="cursor-pointer flex items-center">Status <SortIcon columnKey="status" sortConfig={sortConfig} /></button></th>
                <th className="px-5 py-3 font-bold text-slate-700 text-center w-[120px]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={item.id} className={`border-b border-slate-100 transition-colors ${index % 2 === 0 ? "bg-slate-100" : "bg-white"}`}>
                  <td className="px-5 py-3 font-mono text-xs font-bold text-primary hover:underline cursor-pointer" onClick={() => setShowDetail(item)}>{item.kodePinjam}</td>
                  <td className="px-5 py-3 text-slate-700 font-semibold hover:text-primary cursor-pointer truncate" onClick={() => setShowDetail(item)}>{item.namaPeminjam}</td>
                  <td className="px-5 py-3 text-slate-600 max-w-[220px]">
                    <span className="inline-block bg-slate-200 text-slate-700 rounded-full px-2.5 py-0.5 text-xs font-semibold mr-1 shadow-sm border border-slate-300/60">{item.totalItems || 0} Alat</span>
                    <span className="text-slate-500 text-sm truncate block mt-1">{item.daftarAset || "-"}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-600 text-sm max-w-[160px] truncate">{item.alasanPeminjaman || "-"}</td>
                  <td className="px-5 py-3 text-slate-600 text-sm">{formatDateTime(item.tanggalPeminjaman)}</td>
                  <td className="px-5 py-3 text-slate-600 text-sm">{formatDateTime(item.tanggalPengembalian)}</td>
                  <td className="px-5 py-3"><span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${getStatusBadge(item.status)}`}>{getStatusLabel(item.status)}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Detail */}
                      <button onClick={() => setShowDetail(item)} className="cursor-pointer rounded-lg bg-blue-100 p-1.5 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white" title="Detail"><Info className="h-4 w-4" /></button>
                      {/* Edit */}
                      {canEdit && item.status === "Pending" && (
                        <button onClick={() => router.push(`/aset/peminjaman/edit/${item.id}`)} className="cursor-pointer rounded-lg bg-amber-100 p-1.5 text-amber-600 transition-colors hover:bg-amber-600 hover:text-white" title="Edit / Pengembalian"><Pencil className="h-4 w-4" /></button>
                      )}
                      {/* Approve */}
                      {canApprove && item.status === "Dikembalikan" && (
                        <button onClick={() => setShowApproveConfirm(item)} className="cursor-pointer rounded-lg bg-emerald-100 p-1.5 text-emerald-600 transition-colors hover:bg-emerald-600 hover:text-white" title="Setujui"><Check className="h-4 w-4" /></button>
                      )}
                      {/* Delete */}
                      {canDelete && (
                        <button onClick={() => setShowDeleteConfirm(item)} className="cursor-pointer rounded-lg bg-rose-100 p-1.5 text-rose-600 transition-colors hover:bg-rose-600 hover:text-white" title="Hapus"><Trash2 className="h-4 w-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {dataList.length === 0 && (<tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400">Tidak ada data peminjaman ditemukan.</td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200"><Pagination /></div>
      </div>

      {/* Modal Detail */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl border-t-4 border-t-blue-500">
            <div className="flex items-center justify-between border-b border-slate-100 bg-blue-50 px-6 py-4">
              <h2 className="text-lg font-bold text-blue-800">Detail Peminjaman</h2>
              <button onClick={() => setShowDetail(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <h4 className="mb-3 text-sm font-bold text-slate-800">Daftar Peminjaman</h4>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3"><span className="w-40 shrink-0 text-sm font-semibold text-slate-600">No. Peminjaman</span><span className="text-sm font-mono text-primary font-bold">{showDetail.kodePinjam}</span></div>
                  <div className="flex items-start gap-3"><span className="w-40 shrink-0 text-sm font-semibold text-slate-600">Nama Peminjam</span><span className="text-sm text-slate-800">{showDetail.namaPeminjam}</span></div>
                  <div className="flex items-start gap-3"><span className="w-40 shrink-0 text-sm font-semibold text-slate-600">Tanggal Peminjaman</span><span className="text-sm text-slate-800">{formatDateTime(showDetail.tanggalPeminjaman)}</span></div>
                  <div className="flex items-start gap-3"><span className="w-40 shrink-0 text-sm font-semibold text-slate-600">Yang Menyerahkan</span><span className="text-sm text-slate-800">{showDetail.yangMenyerahkan || "-"}</span></div>
                  <div className="flex items-start gap-3">
                    <span className="w-40 shrink-0 text-sm font-semibold text-slate-600">Alat Dipinjam</span>
                    <div className="text-sm text-slate-800 flex-1">
                      {showDetail.daftarAset ? (
                        <ul className="list-disc pl-4 space-y-1">
                          {showDetail.daftarAset.split(',').map((itemStr, i) => (
                            <li key={i}>{itemStr.trim()}</li>
                          ))}
                        </ul>
                      ) : "-"}
                    </div>
                  </div>
                  <div className="flex items-start gap-3"><span className="w-40 shrink-0 text-sm font-semibold text-slate-600">Alasan</span><span className="text-sm text-slate-800">{showDetail.alasanPeminjaman || "-"}</span></div>
                  <div className="flex items-start gap-3"><span className="w-40 shrink-0 text-sm font-semibold text-slate-600">Status</span><span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusBadge(showDetail.status)}`}>{getStatusLabel(showDetail.status)}</span></div>
                  
                  {/* Bukti Peminjaman Images with Carousel */}
                  {showDetail.buktiPeminjaman && (() => {
                    try {
                      const paths = JSON.parse(showDetail.buktiPeminjaman);
                      return <ImageCarousel images={paths} title="Bukti Peminjaman" />;
                    } catch (e) { return null; }
                  })()}
                </div>
              </div>

              <hr className="border-slate-300" />
              
              <div>
                <h4 className="mb-3 text-sm font-bold text-slate-800">Daftar Pengembalian</h4>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3"><span className="w-40 shrink-0 text-sm font-semibold text-slate-600">Tanggal Pengembalian</span><span className="text-sm text-slate-800">{formatDateTime(showDetail.tanggalPengembalian)}</span></div>
                  <div className="flex items-start gap-3"><span className="w-40 shrink-0 text-sm font-semibold text-slate-600">Penerima Aset</span><span className="text-sm text-slate-800">{showDetail.penerimaAset || "-"}</span></div>
                  <div className="flex items-start gap-3">
                    <span className="w-40 shrink-0 text-sm font-semibold text-slate-600">Disetujui Oleh</span>
                    {showDetail.approvedBy ? (
                      <span className="text-sm text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shadow-sm">{showDetail.approvedBy}</span>
                    ) : (
                      <span className="text-sm text-slate-400 italic">Belum disetujui</span>
                    )}
                  </div>

                  {/* Bukti Pengembalian Images with Carousel */}
                  {showDetail.buktiPengembalian && (() => {
                    try {
                      const paths = JSON.parse(showDetail.buktiPengembalian);
                      return <ImageCarousel images={paths} title="Bukti Pengembalian" />;
                    } catch (e) { return null; }
                  })()}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end border-t border-slate-100 px-6 py-4">
              <button onClick={() => setShowDetail(null)} className="cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Overlay */}
      {lightboxImg && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4 transition-all animate-in fade-in duration-200" onClick={() => setLightboxImg(null)}>
          <button className="absolute right-6 top-6 text-white/70 hover:text-white transition-colors z-110" onClick={() => setLightboxImg(null)}><X className="h-8 w-8" /></button>
          <div className="relative h-full max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <Image src={lightboxImg} alt="Preview Bukti Full" fill className="object-contain" unoptimized />
          </div>
        </div>
      )}

      {/* Modal Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border-t-4 border-t-rose-500">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
                <Trash2 className="h-7 w-7 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Hapus Data?</h3>
              <p className="text-sm text-slate-500 mb-1">Peminjaman #{showDeleteConfirm.kodePinjam} oleh:</p>
              <p className="text-sm font-semibold text-slate-700">{showDeleteConfirm.namaPeminjam}</p>
              <p className="text-xs text-rose-500 mt-3">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className="flex items-center justify-center gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={() => setShowDeleteConfirm(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Batal</button>
              <button onClick={handleDelete} disabled={submitting} className="cursor-pointer rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-600 disabled:opacity-60">{submitting ? "Menghapus..." : "Ya, Hapus"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Approve Confirm */}
      {showApproveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border-t-4 border-t-emerald-500">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <Check className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Setujui Peminjaman?</h3>
              <p className="text-sm text-slate-500 mb-1">Setujui pengembalian #{showApproveConfirm.kodePinjam}?</p>
              <p className="text-sm font-semibold text-slate-700">{showApproveConfirm.namaPeminjam}</p>
              <p className="text-xs text-emerald-600 mt-3">Stok aset akan dikembalikan setelah disetujui.</p>
            </div>
            <div className="flex items-center justify-center gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={() => setShowApproveConfirm(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Batal</button>
              <button onClick={handleApprove} disabled={submitting} className="cursor-pointer rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:opacity-60">{submitting ? "Memproses..." : "Ya, Setujui"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
