"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { getAllPegawai, createPegawai, updatePegawai, deletePegawai } from "../lib/pegawaiService";
import { getUserContext } from "../lib/authService";
import { Search, Plus, Edit, Trash2, X, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const ROWS_OPTIONS = [10, 20, 30, 50];

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
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [editFormData, setEditFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [userRole, setUserRole] = useState("user");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [mounted, setMounted] = useState(false);

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
      setLoading(true);
      const data = await getAllPegawai();
      setPegawaiList(data);
      setFilteredData(data);
    } catch (err) {
      console.error("Error fetching pegawai:", err);
      showToast("Gagal memuat data pegawai", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = pegawaiList.filter((item) =>
      Object.values(item).some((val) =>
        val?.toString().toLowerCase().includes(search.toLowerCase())
      )
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [search, pegawaiList]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.namaLengkap.trim()) {
      showToast("Nama lengkap wajib diisi", "error");
      return;
    }
    try {
      setSubmitting(true);
      await createPegawai(formData);
      showToast("Pegawai berhasil ditambahkan");
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
      showToast("Data pegawai berhasil diperbarui");
      setShowEdit(null);
      fetchPegawai();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal memperbarui pegawai", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await deletePegawai(showDeleteConfirm.id);
      showToast("Pegawai berhasil dihapus");
      setShowDeleteConfirm(null);
      setDeleteError(null);
      fetchPegawai();
    } catch (err) {
      // Handle 409 Conflict - pegawai linked to user
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

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Kelola Pegawai</h1>
            <p className="text-sm text-slate-500">{pegawaiList.length} pegawai terdaftar</p>
          </div>
          <button
            onClick={() => {
              setFormData(emptyForm);
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Tambah Pegawai
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, email, atau nomor HP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border-2 border-slate-200 py-2 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-lg border-2 border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {ROWS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt} baris
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-emerald-600"></div>
              <p className="mt-3 text-slate-600">Memuat data pegawai...</p>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500">
              Tidak ada pegawai ditemukan
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                        Nama Lengkap
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                        Nomor HP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                        Tempat Lahir
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                        Tanggal Lahir
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-700">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`border-b border-slate-100 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50"
                        } hover:bg-slate-50`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {item.namaLengkap}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.email || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.nomorHp || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.tempatLahir || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatTanggalLahir(item.tanggalLahir)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEdit(item)}
                              className="rounded-lg bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(item)}
                              className="rounded-lg bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Halaman {currentPage} dari {totalPages} ({filteredData.length} total)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          currentPage === page
                            ? "bg-emerald-600 text-white"
                            : "text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            {/* Modal Tambah */}
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <form
                  onSubmit={handleCreate}
                  className="w-full max-w-md rounded-2xl bg-white shadow-xl border-t-4 border-t-emerald-500"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-50 px-6 py-4 rounded-t-2xl">
                    <h2 className="text-lg font-bold text-emerald-800">Tambah Pegawai Baru</h2>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="space-y-4 p-6">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.namaLengkap}
                        onChange={(e) =>
                          setFormData({ ...formData, namaLengkap: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        placeholder="Nama lengkap"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Nomor HP
                      </label>
                      <input
                        type="tel"
                        value={formData.nomorHp}
                        onChange={(e) => setFormData({ ...formData, nomorHp: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        placeholder="081234567890"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Tempat Lahir
                      </label>
                      <input
                        type="text"
                        value={formData.tempatLahir}
                        onChange={(e) =>
                          setFormData({ ...formData, tempatLahir: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        placeholder="Kota lahir"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Tanggal Lahir
                      </label>
                      <input
                        type="date"
                        value={formData.tanggalLahir}
                        onChange={(e) =>
                          setFormData({ ...formData, tanggalLahir: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Alamat
                      </label>
                      <textarea
                        value={formData.alamat}
                        onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        placeholder="Alamat lengkap"
                        rows="2"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {submitting ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Modal Edit */}
            {showEdit && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <form
                  onSubmit={handleUpdate}
                  className="w-full max-w-md rounded-2xl bg-white shadow-xl border-t-4 border-t-blue-500"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 bg-blue-50 px-6 py-4 rounded-t-2xl">
                    <h2 className="text-lg font-bold text-blue-800">Edit Pegawai</h2>
                    <button
                      type="button"
                      onClick={() => setShowEdit(null)}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="space-y-4 p-6">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.namaLengkap}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, namaLengkap: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        placeholder="Nama lengkap"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, email: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Nomor HP
                      </label>
                      <input
                        type="tel"
                        value={editFormData.nomorHp}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, nomorHp: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        placeholder="081234567890"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Tempat Lahir
                      </label>
                      <input
                        type="text"
                        value={editFormData.tempatLahir}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, tempatLahir: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        placeholder="Kota lahir"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Tanggal Lahir
                      </label>
                      <input
                        type="date"
                        value={editFormData.tanggalLahir}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, tanggalLahir: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Alamat
                      </label>
                      <textarea
                        value={editFormData.alamat}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, alamat: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        placeholder="Alamat lengkap"
                        rows="2"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl">
                    <button
                      type="button"
                      onClick={() => setShowEdit(null)}
                      className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                    >
                      {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Modal Error - Pegawai Masih Terhubung ke User */}
            {deleteError && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border-t-4 border-t-rose-500">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mx-auto">
                    <AlertTriangle className="h-6 w-6" />
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
                      <p className="text-sm text-rose-800 font-medium">{deleteError.linkedUser.nama_lengkap}</p>
                      <p className="text-xs text-rose-700">{deleteError.linkedUser.email}</p>
                      <p className="text-xs text-rose-700 mt-1">Role: <span className="font-semibold">{deleteError.linkedUser.role}</span></p>
                    </div>
                  )}
                  {deleteError.details && (
                    <p className="mb-4 text-xs text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-200">
                      {deleteError.details}
                    </p>
                  )}
                  <button
                    onClick={() => setDeleteError(null)}
                    className="w-full rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-300"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}

            {/* Modal Hapus */}
            {showDeleteConfirm && !deleteError && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mx-auto">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-center text-lg font-bold text-slate-800">
                    Hapus Pegawai?
                  </h3>
                  <p className="mb-6 text-center text-sm text-slate-500">
                    Apakah Anda yakin ingin menghapus pegawai{" "}
                    <strong>{showDeleteConfirm.namaLengkap}</strong>? Data ini tidak dapat dipulihkan.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={submitting}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                    >
                      {submitting ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>,
          document.body
        )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white font-medium shadow-lg ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
