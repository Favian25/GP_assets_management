"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllCategories, createCategory, deleteCategory } from "../../lib/categoryService";
import { getAllBrands, createBrand, deleteBrand } from "../../lib/brandService";
import { Plus, Trash2, X, Check, Tag, Bookmark, AlertTriangle } from "lucide-react";

export default function KategoriMerekPage() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showModalKat, setShowModalKat] = useState(false);
  const [showModalMerek, setShowModalMerek] = useState(false);
  
  const [showDeleteKat, setShowDeleteKat] = useState(null);
  const [showDeleteMerek, setShowDeleteMerek] = useState(null);
  
  const [formKat, setFormKat] = useState({ nama: "", kode_singkat: "" });
  const [formMerek, setFormMerek] = useState({ nama: "" });
  
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); } }, [toast]);
  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchData = useCallback(async () => {
    try {
      if (!loading) setTableLoading(true);
      const [catsData, brandsData] = await Promise.all([getAllCategories(), getAllBrands()]);
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

  const handleCreateKat = async (e) => {
    e.preventDefault();
    if (!formKat.nama || !formKat.kode_singkat) { showToast("Nama dan Kode Singkat wajib diisi", "error"); return; }
    try { 
      setSubmitting(true); 
      await createCategory(formKat.nama, formKat.kode_singkat); 
      showToast("Kategori berhasil ditambahkan!"); 
      setShowModalKat(false); 
      setFormKat({ nama: "", kode_singkat: "" }); 
      await fetchData(); 
    } catch (err) { showToast(err.response?.data?.message || "Gagal menambahkan kategori", "error"); }
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
    try { setSubmitting(true); await createBrand(formMerek.nama); showToast("Merek berhasil ditambahkan!"); setShowModalMerek(false); setFormMerek({ nama: "" }); await fetchData(); }
    catch (err) { showToast(err.response?.data?.message || "Gagal menambahkan merek", "error"); }
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
      {toast && (
        <div className={`fixed top-20 right-6 z-100 flex items-center gap-2 rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-white transition-all animate-[slideIn_0.3s_ease] ${toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"}`}>
          {toast.type === "error" ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Kelola Kategori & Merek</h1>
        <p className="text-sm text-slate-500">Manajemen kategori dan merek aset dalam satu tempat</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Kolom Kategori */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Daftar Kategori</h2>
            <button onClick={() => { setFormKat({ nama: "", kode_singkat: "" }); setShowModalKat(true); }}
              className="cursor-pointer flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-600">
              <Plus className="h-4 w-4" />
              Tambah
            </button>
          </div>
          
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-emerald-500 h-full">
            {/* Table Loading Overlay */}
            {tableLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px] transition-all animate-in fade-in duration-200">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-sm" />
                </div>
              </div>
            )}
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-b-slate-300 bg-slate-50 relative">
                    <th className="px-4 py-3 font-bold text-slate-700 w-12 text-center">No</th>
                    <th className="px-4 py-3 font-bold text-slate-700">Nama</th>
                    <th className="px-4 py-3 font-bold text-slate-700">Kode</th>
                    <th className="px-4 py-3 font-bold text-slate-700 w-20 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((item, index) => (
                    <tr key={item.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3 text-center text-slate-500">{index + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-700 truncate">{item.nama}</td>
                      <td className="px-4 py-3"><span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200">{item.kode_singkat}</span></td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => setShowDeleteKat(item)} className="cursor-pointer rounded-lg bg-rose-100 p-1.5 text-rose-600 transition-colors hover:bg-rose-600 hover:text-white" title="Hapus"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (<tr><td colSpan={4} className="px-5 py-10 text-center text-slate-400">Belum ada data.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Kolom Merek */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Daftar Merek</h2>
            <button onClick={() => { setFormMerek({ nama: "" }); setShowModalMerek(true); }}
              className="cursor-pointer flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600">
              <Plus className="h-4 w-4" />
              Tambah
            </button>
          </div>
          
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-amber-500 h-full">
            {/* Table Loading Overlay */}
            {tableLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px] transition-all animate-in fade-in duration-200">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent shadow-sm" />
                </div>
              </div>
            )}
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-b-slate-300 bg-slate-50 relative">
                    <th className="px-4 py-3 font-bold text-slate-700 w-12 text-center">No</th>
                    <th className="px-4 py-3 font-bold text-slate-700">Nama Merek</th>
                    <th className="px-4 py-3 font-bold text-slate-700 w-20 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((item, index) => (
                    <tr key={item.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3 text-center text-slate-500">{index + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-700 truncate">{item.nama}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => setShowDeleteMerek(item)} className="cursor-pointer rounded-lg bg-rose-100 p-1.5 text-rose-600 transition-colors hover:bg-rose-600 hover:text-white" title="Hapus"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {brands.length === 0 && (<tr><td colSpan={3} className="px-5 py-10 text-center text-slate-400">Belum ada data.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Modal Tambah Kategori */}
      {showModalKat && (
        <div className="fixed inset-0 z-35 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowModalKat(false)}>
          <form onSubmit={handleCreateKat} className="w-full max-w-md flex flex-col rounded-2xl bg-white shadow-xl border-t-4 border-t-emerald-500 animate-modal-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-50 px-6 py-4 rounded-t-2xl shrink-0">
              <h2 className="text-lg font-bold text-emerald-800">Tambah Kategori</h2>
              <button type="button" onClick={() => setShowModalKat(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Kategori</label>
                <input type="text" required placeholder="Contoh: Kamera" value={formKat.nama} onChange={(e) => setFormKat(d => ({ ...d, nama: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Kode Singkat</label>
                <input type="text" required placeholder="Contoh: CAM" value={formKat.kode_singkat} onChange={(e) => setFormKat(d => ({ ...d, kode_singkat: e.target.value.toUpperCase() }))} className="w-full font-mono rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
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
        <div className="fixed inset-0 z-35 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowModalMerek(false)}>
          <form onSubmit={handleCreateMerek} className="w-full max-w-md flex flex-col rounded-2xl bg-white shadow-xl border-t-4 border-t-amber-500 animate-modal-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 bg-amber-50 px-6 py-4 rounded-t-2xl shrink-0">
              <h2 className="text-lg font-bold text-amber-800">Tambah Merek</h2>
              <button type="button" onClick={() => setShowModalMerek(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Merek</label>
                <input type="text" required placeholder="Contoh: Sony" value={formMerek.nama} onChange={(e) => setFormMerek(d => ({ ...d, nama: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-white rounded-b-2xl shrink-0">
              <button type="button" onClick={() => setShowModalMerek(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Batal</button>
              <button type="submit" disabled={submitting} className="cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-60">{submitting ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Hapus Kategori */}
      {showDeleteKat && (
        <div className="fixed inset-0 z-35 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowDeleteKat(null)}>
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
        <div className="fixed inset-0 z-35 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowDeleteMerek(null)}>
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
    </div>
  );
}
