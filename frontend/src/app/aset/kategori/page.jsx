"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllCategories, createCategory, deleteCategory } from "../../lib/categoryService";

export default function KategoriPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ nama: "", kode_singkat: "" });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); } }, [toast]);
  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data || []);
    } catch {
      setError("Gagal memuat data kategori.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.nama || !formData.kode_singkat) { showToast("Nama dan Kode Singkat wajib diisi", "error"); return; }
    try { setSubmitting(true); await createCategory(formData.nama, formData.kode_singkat); showToast("Kategori berhasil ditambahkan!"); setShowModal(false); setFormData({ nama: "", kode_singkat: "" }); await fetchCategories(); }
    catch (err) { showToast(err.response?.data?.message || "Gagal menambahkan kategori", "error"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    try { setSubmitting(true); await deleteCategory(showDeleteConfirm.id); showToast("Kategori berhasil dihapus!"); setShowDeleteConfirm(null); await fetchCategories(); }
    catch (err) { showToast(err.response?.data?.message || "Gagal menghapus kategori", "error"); }
    finally { setSubmitting(false); }
  };

  if (loading) {
    return <div className="p-8 animate-pulse space-y-4"><div className="h-8 w-40 bg-slate-200 rounded"></div><div className="h-64 bg-slate-200 rounded"></div></div>;
  }

  if (error) {
    return <div className="p-8 text-rose-500 bg-rose-50 rounded-xl">{error}</div>;
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-[100] flex items-center gap-2 rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-white transition-all animate-[slideIn_0.3s_ease] ${toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Kelola Kategori</h1><p className="text-sm text-slate-500">Daftar kategori aset beserta kode singkatnya</p></div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button onClick={() => { setFormData({ nama: "", kode_singkat: "" }); setShowModal(true); }}
          className="cursor-pointer flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Tambah Kategori
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-primary">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-b-slate-300 bg-slate-50 relative">
                <th className="px-5 py-3 font-bold text-slate-700 w-16 text-center">No</th>
                <th className="px-5 py-3 font-bold text-slate-700">Nama Kategori</th>
                <th className="px-5 py-3 font-bold text-slate-700">Kode Singkat</th>
                <th className="px-5 py-3 font-bold text-slate-700 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                  <td className="px-5 py-3 text-center text-slate-500">{index + 1}</td>
                  <td className="px-5 py-3 font-medium text-slate-700">{item.nama}</td>
                  <td className="px-5 py-3"><span className="inline-block px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200">{item.kode_singkat}</span></td>
                  <td className="px-5 py-3 text-center">
                    <button onClick={() => setShowDeleteConfirm(item)} className="cursor-pointer rounded-lg bg-rose-100 p-1.5 text-rose-600 transition-colors hover:bg-rose-600 hover:text-white" title="Hapus"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (<tr><td colSpan={4} className="px-5 py-10 text-center text-slate-400">Belum ada data kategori.</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleCreate} className="w-full max-w-md rounded-2xl bg-white shadow-xl border-t-4 border-t-emerald-500">
            <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-50 px-6 py-4 rounded-t-2xl">
              <h2 className="text-lg font-bold text-emerald-800">Tambah Kategori</h2>
              <button type="button" onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Kategori</label>
                <input type="text" required placeholder="Contoh: Kamera" value={formData.nama} onChange={(e) => setFormData(d => ({ ...d, nama: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Kode Singkat</label>
                <input type="text" required placeholder="Contoh: CAM" value={formData.kode_singkat} onChange={(e) => setFormData(d => ({ ...d, kode_singkat: e.target.value.toUpperCase() }))} className="w-full font-mono rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button type="button" onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Batal</button>
              <button type="submit" disabled={submitting} className="cursor-pointer rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:opacity-60">{submitting ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Hapus */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border-t-4 border-t-rose-500">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100"><svg className="h-7 w-7 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Hapus Kategori?</h3>
              <p className="text-sm font-semibold text-slate-700 mb-1">{showDeleteConfirm.nama}</p>
              <p className="text-xs text-rose-500 mt-3">Aset dengan kategori ini mungkin akan kehilangan referensi. Pastikan tidak ada aset yang terkait sebelum menghapus.</p>
            </div>
            <div className="flex items-center justify-center gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={() => setShowDeleteConfirm(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Batal</button>
              <button onClick={handleDelete} disabled={submitting} className="cursor-pointer rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-600 disabled:opacity-60">{submitting ? "Menghapus..." : "Ya, Hapus"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
