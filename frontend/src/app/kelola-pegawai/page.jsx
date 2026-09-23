"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { getAllPegawai, createPegawai, updatePegawai, deletePegawai } from "../lib/pegawaiService";
import { getUserContext } from "../lib/authService";
import { 
  Search, Plus, Pencil, Trash2, X, AlertTriangle, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Check,
  ChevronUp, ChevronDown, Users
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const ROWS_OPTIONS = [10, 20, 30, 40, 50];

// Format tanggal: "13 Mei 2026"
const formatTanggalLahir = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const hari = String(date.getDate()).padStart(2, "0");
  const bulanText = bulan[date.getMonth()];
  const tahun = date.getFullYear();
  return `${hari} ${bulanText} ${tahun}`;
};

const emptyForm = {
  namaLengkap: "",
  tempatLahir: "",
  tanggalLahir: "",
  alamat: "",
  email: "",
  nomorHp: "",
};

export default function KelolaPegawaiPage() {
  const router = useRouter();
  const [pegawaiList, setPegawaiList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Table controls
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState(""); // "" | "asc" | "desc"
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modals & States
  const [showModal, setShowModal] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [editFormData, setEditFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [userRole, setUserRole] = useState("user");
  const [mounted, setMounted] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    const ctx = getUserContext();
    if (ctx) {
      const role = ctx.role || "user";
      setUserRole(role);
      if (!["super admin", "admin"].includes(role)) {
        router.push("/?error=unauthorized");
      }
    }
  }, [router]);

  useEffect(() => {
    if (mounted && ["super admin", "admin"].includes(userRole)) {
      fetchPegawai();
    }
  }, [mounted, userRole]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const fetchPegawai = async () => {
    try {
      if (!loading) setTableLoading(true);
      const data = await getAllPegawai();
      setPegawaiList(data);
    } catch (err) {
      console.error("Error fetching pegawai:", err);
      showToast("Gagal memuat data pegawai", "error");
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  const handleSortName = () => {
    if (sortOrder === "") setSortOrder("asc");
    else if (sortOrder === "asc") setSortOrder("desc");
    else setSortOrder("");
  };

  // Filter & Sort
  const processedData = useMemo(() => {
    let result = [...pegawaiList];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some((val) => val?.toString().toLowerCase().includes(q))
      );
    }

    if (sortOrder === "asc") {
      result.sort((a, b) => a.namaLengkap.localeCompare(b.namaLengkap));
    } else if (sortOrder === "desc") {
      result.sort((a, b) => b.namaLengkap.localeCompare(a.namaLengkap));
    }

    return result;
  }, [pegawaiList, search, sortOrder]);

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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.namaLengkap.trim()) {
      showToast("Nama lengkap wajib diisi", "error");
      return;
    }
    try {
      setSubmitting(true);
      await createPegawai(formData);
      showToast("Pegawai berhasil ditambahkan!");
      setFormData(emptyForm);
      setShowModal(false);
      fetchPegawai();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal menambahkan pegawai", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (item) => {
    setEditFormData({
      namaLengkap: item.namaLengkap || "",
      tempatLahir: item.tempatLahir || "",
      tanggalLahir: item.tanggalLahir || "",
      alamat: item.alamat || "",
      email: item.email || "",
      nomorHp: item.nomorHp || "",
    });
    setShowEdit(item);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editFormData.namaLengkap.trim()) {
      showToast("Nama lengkap wajib diisi", "error");
      return;
    }
    try {
      setSubmitting(true);
      await updatePegawai(showEdit.id, editFormData);
      showToast("Data pegawai berhasil diperbarui!");
      setShowEdit(null);
      fetchPegawai();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal memperbarui pegawai", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    try {
      setSubmitting(true);
      await deletePegawai(showDeleteConfirm.id);
      showToast("Pegawai berhasil dihapus!");
      setShowDeleteConfirm(null);
      setDeleteError(null);
      
      if (currentData.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
      
      fetchPegawai();
    } catch (err) {
      if (err.response?.status === 409) {
        setDeleteError({
          title: "❌ Pegawai Masih Terhubung ke User",
          message: err.response?.data?.message || "Pegawai tidak bisa dihapus",
          details: err.response?.data?.details,
          linkedUser: err.response?.data?.linkedUser
        });
      } else {
        showToast(err.response?.data?.message || "Gagal menghapus pegawai", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const Pagination = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 gap-3">
      <div className="hidden sm:flex items-center gap-3">
        <p className="text-sm text-slate-500 text-nowrap">Menampilkan {currentData.length === 0 ? 0 : indexOfFirstItem + 1}-{Math.min(indexOfFirstItem + itemsPerPage, processedData.length)} dari <span className="font-semibold text-slate-700">{processedData.length}</span> data</p>
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
        <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Kelola Pegawai</h1><p className="text-sm text-slate-500">Manajemen data pegawai perusahaan</p></div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-8 space-y-3 animate-pulse">{[1,2,3].map(i => (<div key={i} className="flex gap-4"><div className="h-4 w-24 rounded bg-slate-200"/><div className="h-4 flex-1 rounded bg-slate-200"/><div className="h-4 w-20 rounded bg-slate-200"/></div>))}</div>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-slate-800">Kelola Pegawai</h1>
        <p className="text-sm text-slate-500">Manajemen data pegawai dan detail informasi personal</p>
      </div>

      {/* Toolbar & Table Section */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-primary">
        {/* Table Loading Overlay */}
        {tableLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px] transition-all animate-in fade-in duration-200">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-sm" />
              <div className="flex flex-col items-center">
                <p className="text-sm font-bold text-slate-700">Memperbarui Data Pegawai</p>
                <p className="text-[10px] text-slate-400">Mohon tunggu sebentar...</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-b border-slate-300 bg-slate-50/50">
          {/* Search Input & Items per page */}
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Cari nama, email, nomor HP..."
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
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full sm:w-32 rounded-lg border-2 border-slate-200 px-3 py-2 text-sm text-slate-700 bg-white hover:border-slate-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer transition-colors"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
              title="Items per page"
            >
              {ROWS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} Baris
                </option>
              ))}
            </select>
          </div>

          {/* Tambah Button */}
          <button onClick={() => {
            setFormData(emptyForm);
            setShowModal(true);
          }}
            className="cursor-pointer flex w-full justify-center items-center gap-2 rounded-lg bg-primary px-4 py-2 sm:w-auto sm:px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover">
            <Plus className="h-4 w-4" />
            Tambah Pegawai
          </button>
        </div>

        {/* Pagination & Table */}
        <Pagination />
        <div className="overflow-x-auto border-t border-slate-200">
          <table className="w-full text-left text-sm table-fixed">
            <thead>
              <tr className="border-t border-slate-300 border-b border-slate-300 bg-slate-50/50">
                <th className="px-3 py-3 font-bold text-slate-700 w-[60px] text-center text-xs uppercase tracking-wider border-r border-slate-200">No</th>
                <th className="px-4 py-3 font-bold text-slate-700 w-[240px] select-none hover:bg-slate-200/50 transition-colors border-r border-slate-200 text-center">
                  <button onClick={handleSortName} className="flex items-center justify-center gap-2 w-full cursor-pointer uppercase text-xs tracking-wider">
                    Nama Lengkap
                    <div className="flex flex-col">
                      <ChevronUp className={`h-2.5 w-2.5 ${sortOrder === "asc" ? "text-primary" : "text-slate-400"}`} />
                      <ChevronDown className={`h-2.5 w-2.5 ${sortOrder === "desc" ? "text-primary" : "text-slate-400"}`} />
                    </div>
                  </button>
                </th>
                <th className="px-4 py-3 font-bold text-slate-700 w-[220px] text-xs uppercase tracking-wider border-r border-slate-200 text-center">Email</th>
                <th className="px-3 py-3 font-bold text-slate-700 w-[140px] text-center text-xs uppercase tracking-wider border-r border-slate-200">Nomor HP</th>
                <th className="px-3 py-3 font-bold text-slate-700 w-[140px] text-center text-xs uppercase tracking-wider border-r border-slate-200">Tempat Lahir</th>
                <th className="px-3 py-3 font-bold text-slate-700 w-[140px] text-center text-xs uppercase tracking-wider border-r border-slate-200">Tanggal Lahir</th>
                <th className="px-3 py-3 font-bold text-slate-700 text-center w-[120px] text-xs uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentData.map((item, index) => (
                <tr key={item.id} className={`${index % 2 === 0 ? "bg-slate-100" : "bg-white"}`}>
                  <td className="px-3 py-3 text-slate-400 font-medium text-center border-r border-slate-200 align-middle text-xs">{indexOfFirstItem + index + 1}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 border-r border-slate-200 align-middle text-xs truncate">{item.namaLengkap}</td>
                  <td className="px-4 py-3 text-slate-600 border-r border-slate-200 align-middle text-xs truncate text-center">{item.email || "-"}</td>
                  <td className="px-3 py-3 text-slate-600 border-r border-slate-200 align-middle text-xs truncate text-center">{item.nomorHp || "-"}</td>
                  <td className="px-3 py-3 text-slate-600 border-r border-slate-200 align-middle text-xs truncate text-center">{item.tempatLahir || "-"}</td>
                  <td className="px-3 py-3 text-slate-600 border-r border-slate-200 align-middle text-xs truncate text-center">{formatTanggalLahir(item.tanggalLahir)}</td>
                  <td className="px-3 py-3 align-middle text-center">
                    <div className="flex items-center justify-center gap-1">
                      {/* Edit */}
                      <button onClick={() => openEdit(item)}
                        className="cursor-pointer rounded-lg bg-blue-100 p-1 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white" title="Edit Pegawai">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {/* Delete */}
                      <button onClick={() => setShowDeleteConfirm(item)}
                        className="cursor-pointer rounded-lg bg-rose-100 p-1 text-rose-600 transition-colors hover:bg-rose-600 hover:text-white" title="Hapus">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentData.length === 0 && (<tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">Belum ada pegawai terdaftar atau sesuai pencarian.</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {mounted && typeof document !== 'undefined' && createPortal(
        <>
          {/* Modal Tambah Pegawai */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowModal(false)}>
              <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border-t-4 border-t-primary flex flex-col max-h-[90vh] animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0 bg-white rounded-t-2xl">
                  <h2 className="text-lg font-bold text-slate-800">Tambah Pegawai Baru</h2>
                  <button type="button" onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Lengkap <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={formData.namaLengkap}
                      onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Masukkan nama lengkap"
                      required
                      onInvalid={(e) => e.target.setCustomValidity("Nama lengkap wajib diisi")}
                      onInput={(e) => e.target.setCustomValidity("")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Nomor HP</label>
                      <input
                        type="tel"
                        value={formData.nomorHp}
                        onChange={(e) => setFormData({ ...formData, nomorHp: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="081234567890"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Tempat Lahir</label>
                      <input
                        type="text"
                        value={formData.tempatLahir}
                        onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Kota lahir"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={formData.tanggalLahir}
                        onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Alamat</label>
                    <textarea
                      value={formData.alamat}
                      onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Alamat lengkap"
                      rows="3"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</button>
                    <button type="submit" disabled={submitting} className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover disabled:opacity-60">{submitting ? "Menyimpan..." : "Simpan Pegawai"}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Edit Pegawai */}
          {showEdit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowEdit(null)}>
              <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border-t-4 border-t-blue-500 flex flex-col max-h-[90vh] animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0 bg-white rounded-t-2xl">
                  <h2 className="text-lg font-bold text-slate-800">Edit Pegawai</h2>
                  <button type="button" onClick={() => setShowEdit(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleUpdate} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Lengkap <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={editFormData.namaLengkap}
                      onChange={(e) => setEditFormData({ ...editFormData, namaLengkap: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Nama lengkap"
                      required
                      onInvalid={(e) => e.target.setCustomValidity("Nama lengkap wajib diisi")}
                      onInput={(e) => e.target.setCustomValidity("")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Nomor HP</label>
                      <input
                        type="tel"
                        value={editFormData.nomorHp}
                        onChange={(e) => setEditFormData({ ...editFormData, nomorHp: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="081234567890"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Tempat Lahir</label>
                      <input
                        type="text"
                        value={editFormData.tempatLahir}
                        onChange={(e) => setEditFormData({ ...editFormData, tempatLahir: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Kota lahir"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={editFormData.tanggalLahir}
                        onChange={(e) => setEditFormData({ ...editFormData, tanggalLahir: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Alamat</label>
                    <textarea
                      value={editFormData.alamat}
                      onChange={(e) => setEditFormData({ ...editFormData, alamat: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Alamat lengkap"
                      rows="3"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setShowEdit(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</button>
                    <button type="submit" disabled={submitting} className="cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 disabled:opacity-60">{submitting ? "Menyimpan..." : "Simpan Perubahan"}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Delete */}
          {showDeleteConfirm && !deleteError && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowDeleteConfirm(null)}>
              <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border-t-4 border-t-rose-500 flex flex-col max-h-[90vh] animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 text-center overflow-y-auto custom-scrollbar">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
                    <Trash2 className="h-7 w-7 text-rose-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Hapus Pegawai?</h3>
                  <p className="text-sm text-slate-500 mb-1">{showDeleteConfirm.namaLengkap}</p>
                  <p className="text-xs text-rose-500 mt-3">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
                <div className="flex items-center justify-center gap-3 border-t border-slate-100 px-6 py-4">
                  <button onClick={() => setShowDeleteConfirm(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</button>
                  <button onClick={handleDelete} disabled={submitting} className="cursor-pointer rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-600 disabled:opacity-60">{submitting ? "Menghapus..." : "Ya, Hapus"}</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Delete Error */}
          {deleteError && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300">
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border-t-4 border-t-rose-500 animate-modal-in">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 mx-auto">
                  <AlertTriangle className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-center text-lg font-bold text-slate-800">
                  {deleteError.title}
                </h3>
                <p className="mb-3 text-center text-sm text-slate-600">
                  {deleteError.message}
                </p>
                {deleteError.linkedUser && (
                  <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3">
                    <p className="text-xs font-semibold text-rose-900 mb-1">👤 User Terhubung:</p>
                    <p className="text-sm text-rose-800 font-medium">{deleteError.linkedUser.nama_lengkap || deleteError.linkedUser.namaLengkap}</p>
                    <p className="text-xs text-rose-700">{deleteError.linkedUser.email}</p>
                    <p className="text-xs text-rose-700 mt-1">Role: <span className="font-semibold">{deleteError.linkedUser.role}</span></p>
                  </div>
                )}
                <button onClick={() => setDeleteError(null)} className="cursor-pointer w-full rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-300">
                  Tutup
                </button>
              </div>
            </div>
          )}
        </>,
        document.body
      )}
    </div>
  );
}
