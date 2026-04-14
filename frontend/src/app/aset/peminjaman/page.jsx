"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAllPeminjaman, deletePeminjaman, searchPeminjaman, approvePeminjaman } from "../../lib/peminjamanService";
import { getUserContext } from "../../lib/authService";

const ITEMS_PER_PAGE = 10;

function SortIcon({ columnKey, sortConfig }) {
  const isActive = sortConfig.key === columnKey;
  return (
    <span className="ml-1.5 inline-flex flex-col -space-y-1.5">
      <svg className={`h-3.5 w-3.5 ${isActive && sortConfig.direction === "asc" ? "text-primary" : "text-slate-300"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M5 12l5-5 5 5H5z" /></svg>
      <svg className={`h-3.5 w-3.5 ${isActive && sortConfig.direction === "desc" ? "text-primary" : "text-slate-300"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M5 8l5 5 5-5H5z" /></svg>
    </span>
  );
}

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  }).format(new Date(dateString)) + " WIB";
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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [toast, setToast] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState("user");
  const [userName, setUserName] = useState("");

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
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
    try { setSubmitting(true); await approvePeminjaman(showApproveConfirm.id, userName); showToast("Peminjaman berhasil di-approve!"); setShowApproveConfirm(null); fetchData(); }
    catch (err) { showToast(err.response?.data?.message || "Gagal approve data", "error"); }
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
      <p className="text-sm text-slate-500">Menampilkan {sorted.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, sorted.length)} dari <span className="font-semibold text-slate-700">{sorted.length}</span> data</p>
      <div className="flex items-center gap-1">
        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Halaman Pertama"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M18 19l-7-7 7-7" /></svg></button>
        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Sebelumnya"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
        {getPageNumbers().map((page, idx) => page === "..." ? (<span key={`e-${idx}`} className="min-w-[32px] px-1 py-1.5 text-center text-sm text-slate-400">...</span>) : (<button key={page} onClick={() => setCurrentPage(page)} className={`cursor-pointer min-w-[32px] rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${currentPage === page ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"}`}>{page}</button>))}
        <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Berikutnya"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Halaman Terakhir"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M6 5l7 7-7 7" /></svg></button>
      </div>
    </div>
  );

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
          <svg className="h-12 w-12 text-rose-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.732c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
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
        <div className={`fixed top-20 right-6 z-[100] flex items-center gap-2 rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-white transition-all animate-[slideIn_0.3s_ease] ${toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"}`}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {toast.type === "error" ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />}
          </svg>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Peminjaman Aset</h1><p className="text-sm text-slate-500">Rekapitulasi data transaksi peminjaman dan pengembalian</p></div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div />
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Cari nama peminjam..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-text" />
          </div>
          {canAdd && (
            <button onClick={() => router.push("/aset/peminjaman/tambah")}
              className="cursor-pointer flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Tambah Peminjaman
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-primary">
        <Pagination />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-t border-t-slate-300 border-b border-b-slate-300">
                <th className="px-5 py-3 font-bold text-slate-700 w-[80px]"><button onClick={() => handleSort("kodePinjam")} className="cursor-pointer flex items-center">No <SortIcon columnKey="kodePinjam" sortConfig={sortConfig} /></button></th>
                <th className="px-5 py-3 font-bold text-slate-700"><button onClick={() => handleSort("namaPeminjam")} className="cursor-pointer flex items-center">Nama Peminjam <SortIcon columnKey="namaPeminjam" sortConfig={sortConfig} /></button></th>
                <th className="px-5 py-3 font-bold text-slate-700">Barang Dipinjam</th>
                <th className="px-5 py-3 font-bold text-slate-700">Alasan</th>
                <th className="px-5 py-3 font-bold text-slate-700"><button onClick={() => handleSort("tanggalPeminjaman")} className="cursor-pointer flex items-center">Tgl Pinjam <SortIcon columnKey="tanggalPeminjaman" sortConfig={sortConfig} /></button></th>
                <th className="px-5 py-3 font-bold text-slate-700">Tgl Kembali</th>
                <th className="px-5 py-3 font-bold text-slate-700 w-[130px]"><button onClick={() => handleSort("status")} className="cursor-pointer flex items-center">Status <SortIcon columnKey="status" sortConfig={sortConfig} /></button></th>
                <th className="px-5 py-3 font-bold text-slate-700 text-center w-[140px]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={item.id} className={`border-b border-slate-100 transition-colors ${index % 2 === 0 ? "bg-slate-100" : "bg-white"}`}>
                  <td className="px-5 py-3 font-mono text-xs font-bold text-primary hover:underline cursor-pointer" onClick={() => setShowDetail(item)}>{item.kodePinjam}</td>
                  <td className="px-5 py-3 text-slate-700 font-semibold hover:text-primary cursor-pointer truncate" onClick={() => setShowDetail(item)}>{item.namaPeminjam}</td>
                  <td className="px-5 py-3 text-slate-600 max-w-[220px]">
                    <span className="inline-block bg-slate-200 text-slate-700 rounded-full px-2.5 py-0.5 text-xs font-semibold mr-1 shadow-sm border border-slate-300/60">{item.totalItems || 0} barang</span>
                    <span className="text-slate-500 text-sm truncate block mt-1">{item.daftarAset || "-"}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-600 text-sm max-w-[160px] truncate">{item.alasanPeminjaman || "-"}</td>
                  <td className="px-5 py-3 text-slate-600 text-sm">{formatDateTime(item.tanggalPeminjaman)}</td>
                  <td className="px-5 py-3 text-slate-600 text-sm">{formatDateTime(item.tanggalPengembalian)}</td>
                  <td className="px-5 py-3"><span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase ${getStatusBadge(item.status)}`}>{item.status}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Detail */}
                      <button onClick={() => setShowDetail(item)} className="cursor-pointer rounded-lg bg-blue-100 p-1.5 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white" title="Detail"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
                      {/* Edit */}
                      {canEdit && item.status === "Pending" && (
                        <button onClick={() => router.push(`/aset/peminjaman/edit/${item.id}`)} className="cursor-pointer rounded-lg bg-amber-100 p-1.5 text-amber-600 transition-colors hover:bg-amber-600 hover:text-white" title="Edit / Pengembalian"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                      )}
                      {/* Approve */}
                      {canApprove && item.status === "Dikembalikan" && (
                        <button onClick={() => setShowApproveConfirm(item)} className="cursor-pointer rounded-lg bg-emerald-100 p-1.5 text-emerald-600 transition-colors hover:bg-emerald-600 hover:text-white" title="Approve"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></button>
                      )}
                      {/* Delete */}
                      {canDelete && (
                        <button onClick={() => setShowDeleteConfirm(item)} className="cursor-pointer rounded-lg bg-rose-100 p-1.5 text-rose-600 transition-colors hover:bg-rose-600 hover:text-white" title="Hapus"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
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
              <button onClick={() => setShowDetail(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
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
                    <span className="w-40 shrink-0 text-sm font-semibold text-slate-600">Barang Dipinjam</span>
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
                  <div className="flex items-start gap-3"><span className="w-40 shrink-0 text-sm font-semibold text-slate-600">Status</span><span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium uppercase ${getStatusBadge(showDetail.status)}`}>{showDetail.status}</span></div>
                </div>
              </div>

              <hr className="border-slate-300" />
              
              <div>
                <h4 className="mb-3 text-sm font-bold text-slate-800">Daftar Pengembalian</h4>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3"><span className="w-40 shrink-0 text-sm font-semibold text-slate-600">Batas Pengembalian</span><span className="text-sm text-slate-800">{formatDateTime(showDetail.tanggalPengembalian)}</span></div>
                  <div className="flex items-start gap-3"><span className="w-40 shrink-0 text-sm font-semibold text-slate-600">Penerima Aset</span><span className="text-sm text-slate-800">{showDetail.penerimaAset || "-"}</span></div>
                  <div className="flex items-start gap-3">
                    <span className="w-40 shrink-0 text-sm font-semibold text-slate-600">Approved By</span>
                    {showDetail.approvedBy ? (
                      <span className="text-sm text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shadow-sm">{showDetail.approvedBy}</span>
                    ) : (
                      <span className="text-sm text-slate-400 italic">Belum diverifikasi</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end border-t border-slate-100 px-6 py-4">
              <button onClick={() => setShowDetail(null)} className="cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border-t-4 border-t-rose-500">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
                <svg className="h-7 w-7 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
                <svg className="h-7 w-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Approve Peminjaman?</h3>
              <p className="text-sm text-slate-500 mb-1">Verifikasi pengembalian #{showApproveConfirm.kodePinjam}</p>
              <p className="text-sm font-semibold text-slate-700">{showApproveConfirm.namaPeminjam}</p>
              <p className="text-xs text-emerald-600 mt-3">Stok aset akan dikembalikan setelah approve.</p>
            </div>
            <div className="flex items-center justify-center gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={() => setShowApproveConfirm(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Batal</button>
              <button onClick={handleApprove} disabled={submitting} className="cursor-pointer rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:opacity-60">{submitting ? "Memproses..." : "Ya, Approve"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
