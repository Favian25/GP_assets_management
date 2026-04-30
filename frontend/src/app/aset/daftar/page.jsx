"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { getAllAssets, createAsset, updateAsset, deleteAsset, searchAssets, updateAssetKondisi } from "../../lib/assetService";
import { getAllCategories, createCategory } from "../../lib/categoryService";
import { getAllBrands, createBrand } from "../../lib/brandService";
import { Search, Plus, Info, Pencil, Trash2, X, Check, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, AlertTriangle, ChevronUp, ChevronDown, MapPin, Image as ImageIcon, Package } from "lucide-react";

const getBackendURL = () => {
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:5000`;
  }
  return "http://localhost:5000";
};
const BACKEND_URL = getBackendURL();
const kondisiOptions = ["Siap Digunakan", "Rusak", "Maintenance", "Dijual"];
const ROWS_OPTIONS = [10, 20, 30, 40, 50];

const emptyForm = {
  kodeAset: "", namaAset: "", pengguna: "", kategori: "", merek: "", model: "",
  noSN: "", spesifikasi: "", lokasiAset: "", kondisi: "", keterangan: "",
  jumlah: "", hargaAset: "", tanggalPembelian: "",
};

// =====================================================
// Helper components (outside to prevent re-mount)
// =====================================================

function InputField({ label, required, value, onChange, placeholder, type = "text", className = "" }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder = "Pilih...", className = "" }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <select value={value} onChange={onChange}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
        <option value="">{placeholder}</option>
        {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
      </select>
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 2, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <textarea rows={rows} placeholder={placeholder} value={value} onChange={onChange}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
    </div>
  );
}

function ImageUploadField({ onFileChange, previewUrl, onClear }) {
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragIn = (e) => { handleDrag(e); setDragging(true); };
  const handleDragOut = (e) => { handleDrag(e); setDragging(false); };
  const handleDrop = (e) => {
    handleDrag(e); setDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && ["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      onFileChange({ target: { files: [file] } });
    }
  };
  return (
    <div className="sm:col-span-2">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">Upload Gambar</label>
      <div onDragEnter={handleDragIn} onDragLeave={handleDragOut} onDragOver={handleDrag} onDrop={handleDrop}
        className={`rounded-lg border-2 border-dashed px-6 py-6 transition-colors ${dragging ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50"}`}>
        <div className="flex flex-col items-center text-center">
          {previewUrl ? (
            <div className="relative mb-3 h-40 w-full max-w-[200px]">
              <Image src={previewUrl} alt="Preview" fill unoptimized className="rounded-lg object-contain border border-slate-200" />
              <button type="button" onClick={onClear}
                className="absolute -top-2 -right-2 cursor-pointer rounded-full bg-rose-500 p-1 text-white shadow-md transition-colors hover:bg-rose-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <ImageIcon className="h-8 w-8 text-slate-300 mb-2" />
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png" onChange={onFileChange} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover">
            Pilih Gambar
          </button>
          <p className="mt-2 text-xs text-slate-400">Seret gambar ke sini atau klik tombol · PNG, JPG, JPEG</p>
        </div>
      </div>
    </div>
  );
}

function SortIcon({ columnKey, sortConfig }) {
  const isActive = sortConfig.key === columnKey;
  return (
    <span className="ml-1.5 inline-flex flex-col -space-y-1.5">
      <ChevronUp className={`h-3.5 w-3.5 ${isActive && sortConfig.direction === "asc" ? "text-primary" : "text-slate-300"}`} />
      <ChevronDown className={`h-3.5 w-3.5 ${isActive && sortConfig.direction === "desc" ? "text-primary" : "text-slate-300"}`} />
    </span>
  );
}

// =====================================================
// Main Page Component
// =====================================================

export default function DaftarAsetPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [showEdit, setShowEdit] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [formData, setFormData] = useState(emptyForm);
  const [editFormData, setEditFormData] = useState(emptyForm);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [kategoriList, setKategoriList] = useState([]);
  const [merekList, setMerekList] = useState([]);

  const [showKatModal, setShowKatModal] = useState(false);
  const [showMerekModal, setShowMerekModal] = useState(false);
  const [showKondisiModal, setShowKondisiModal] = useState(null);
  const [newKatData, setNewKatData] = useState({ nama: "", kode_singkat: "" });
  const [newMerekData, setNewMerekData] = useState({ nama: "" });
  const [newKondisi, setNewKondisi] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); } }, [toast]);
  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchDependencies = async () => {
    try {
      const cats = await getAllCategories();
      const brds = await getAllBrands();
      setKategoriList(cats.map(c => c.nama));
      setMerekList(brds.map(b => b.nama));
    } catch (err) {
      console.error("Failed to load dependencies", err);
    }
  };

  const fetchAssets = useCallback(async () => {
    try { 
      if (!loading) setTableLoading(true);
      setError(null); 
      const data = await getAllAssets();
      setAssets(data || []); 
    }
    catch { setError("Gagal memuat data aset."); }
    finally { 
      setLoading(false); 
      setTableLoading(false);
    }
  }, [loading]);

  useEffect(() => { 
    fetchAssets(); 
    fetchDependencies();
  }, [fetchAssets]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.trim()) { try { setAssets(await searchAssets(search.trim())); setCurrentPage(1); } catch { } }
      else { fetchAssets(); }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, fetchAssets]);

  const handleImageSelect = (e, setFile, setPreview) => {
    const file = e.target.files[0] || null;
    setFile(file);
    if (file) { const r = new FileReader(); r.onload = (ev) => setPreview(ev.target.result); r.readAsDataURL(file); }
    else { setPreview(null); }
  };
  const getImageUrl = (gambar) => { if (!gambar) return null; if (gambar.startsWith("http")) return gambar; return `${BACKEND_URL}${gambar}`; };

  // Sorting & Pagination
  const sorted = [...assets].sort((a, b) => {
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

  // CRUD Modals
  const handleCreateKat = async (e) => {
    e.preventDefault();
    if (!newKatData.nama || !newKatData.kode_singkat) return;
    try { setSubmitting(true); await createCategory(newKatData.nama, newKatData.kode_singkat); showToast("Kategori ditambahkan!"); setShowKatModal(false); setNewKatData({nama:"",kode_singkat:""}); await fetchDependencies(); }
    catch { showToast("Gagal menambahkan kategori", "error"); }
    finally { setSubmitting(false); }
  };
  const handleCreateMerek = async (e) => {
    e.preventDefault();
    if (!newMerekData.nama) return;
    try { setSubmitting(true); await createBrand(newMerekData.nama); showToast("Merek ditambahkan!"); setShowMerekModal(false); setNewMerekData({nama:""}); await fetchDependencies(); }
    catch { showToast("Gagal menambahkan merek", "error"); }
    finally { setSubmitting(false); }
  };

  // CRUD
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.namaAset) { showToast("Nama Aset wajib diisi", "error"); return; }
    try { setSubmitting(true); await createAsset({ ...formData, kodeAset: undefined }, imageFile); showToast("Aset berhasil ditambahkan!"); setShowModal(false); setFormData(emptyForm); setImageFile(null); setImagePreview(null); await fetchAssets(); }
    catch (err) { showToast(err.response?.data?.message || "Gagal menambahkan aset", "error"); }
    finally { setSubmitting(false); }
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editFormData.namaAset) { showToast("Nama Aset wajib diisi", "error"); return; }
    try { setSubmitting(true); await updateAsset(showEdit.id, editFormData, editImageFile); showToast("Aset berhasil diperbarui!"); setShowEdit(null); setEditFormData(emptyForm); setEditImageFile(null); setEditImagePreview(null); await fetchAssets(); }
    catch (err) { showToast(err.response?.data?.message || "Gagal memperbarui aset", "error"); }
    finally { setSubmitting(false); }
  };
  const handleUpdateKondisi = async () => {
    if (!showKondisiModal || !newKondisi) return;
    try { setSubmitting(true); await updateAssetKondisi(showKondisiModal.id, newKondisi); showToast("Kondisi berhasil diperbarui!"); setShowKondisiModal(null); await fetchAssets(); }
    catch (err) { showToast(err.response?.data?.message || "Gagal memperbarui kondisi", "error"); }
    finally { setSubmitting(false); }
  };
  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    try { setSubmitting(true); await deleteAsset(showDeleteConfirm.id); showToast("Aset berhasil dihapus!"); setShowDeleteConfirm(null); await fetchAssets(); }
    catch (err) { showToast(err.response?.data?.message || "Gagal menghapus aset", "error"); }
    finally { setSubmitting(false); }
  };
  const openEdit = (item) => {
    setEditFormData({
      kodeAset: item.kodeAset || "", namaAset: item.namaAset || "", pengguna: item.pengguna || "",
      kategori: item.kategori || "", merek: item.merek || "", model: item.model || "",
      noSN: item.noSN || "", spesifikasi: item.spesifikasi || "", lokasiAset: item.lokasiAset || "",
      kondisi: item.kondisi || "", keterangan: item.keterangan || "",
      jumlah: item.jumlah || "", hargaAset: item.hargaAset || "", 
      tanggalPembelian: item.tanggalPembelian ? item.tanggalPembelian.split('T')[0] : "",
    });
    // Ensure existing values are in dropdown lists if deleted previously
    if (item.kategori && !kategoriList.includes(item.kategori)) setKategoriList(prev => [...prev, item.kategori]);
    if (item.merek && !merekList.includes(item.merek)) setMerekList(prev => [...prev, item.merek]);
    setEditImageFile(null);
    setEditImagePreview(getImageUrl(item.gambar));
    setShowEdit(item);
  };

  const getKondisiBadge = (kondisi) => {
    const s = { 
      "Siap Digunakan": "bg-emerald-50 text-emerald-700 border-emerald-500 hover:bg-emerald-600 hover:text-white hover:border-emerald-600", 
      "Rusak": "bg-red-50 text-red-700 border-red-500 hover:bg-red-600 hover:text-white hover:border-red-600", 
      "Maintenance": "bg-amber-50 text-amber-700 border-amber-500 hover:bg-amber-600 hover:text-white hover:border-amber-600", 
      "Dijual": "bg-slate-100 text-slate-600 border-slate-500 hover:bg-slate-600 hover:text-white hover:border-slate-600" 
    };
    return s[kondisi] || "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-600 hover:text-white hover:border-slate-600";
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
        <p className="text-sm text-slate-500 text-nowrap">Menampilkan {sorted.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + itemsPerPage, sorted.length)} dari <span className="font-semibold text-slate-700">{sorted.length}</span> data</p>
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

  // --- Form section builder ---
  const renderFormFields = (data, setData, onImageChange, imgPreview, onImageClear, isEdit = false) => (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800 uppercase tracking-wide">
          <Package className="h-4 w-4 text-primary" />
          Daftar Inventori
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {isEdit && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Kode Aset</label>
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm font-mono font-bold text-primary">{data.kodeAset}</div>
            </div>
          )}
          <InputField label="Nama Aset" required placeholder="Masukkan nama aset" value={data.namaAset} onChange={(e) => setData(d => ({...d, namaAset: e.target.value}))} />
          <InputField label="Pengguna" placeholder="Nama pengguna" value={data.pengguna} onChange={(e) => setData(d => ({...d, pengguna: e.target.value}))} className={isEdit ? "sm:col-span-2" : ""} />
          
          <div className="flex gap-1.5 items-end">
             <SelectField label="Kategori" value={data.kategori} onChange={(e) => setData(d => ({...d, kategori: e.target.value}))} options={kategoriList} placeholder="Pilih Kategori" className="flex-1" />
             <button type="button" onClick={() => setShowKatModal(true)} title="Tambah Kategori Baru" className="h-[38px] cursor-pointer rounded-lg bg-primary px-3 text-white transition-colors hover:bg-primary-hover mb-[2px]"><Plus className="h-4 w-4" /></button>
          </div>
          
          <div className="flex gap-1.5 items-end">
             <SelectField label="Merek" value={data.merek} onChange={(e) => setData(d => ({...d, merek: e.target.value}))} options={merekList} placeholder="Pilih Merek" className="flex-1" />
             <button type="button" onClick={() => setShowMerekModal(true)} title="Tambah Merek Baru" className="h-[38px] cursor-pointer rounded-lg bg-primary px-3 text-white transition-colors hover:bg-primary-hover mb-[2px]"><Plus className="h-4 w-4" /></button>
          </div>

          <InputField label="Model" placeholder="Masukkan model" value={data.model} onChange={(e) => setData(d => ({...d, model: e.target.value}))} />
          <InputField label="Jumlah" placeholder="Jumlah unit" type="number" value={data.jumlah} onChange={(e) => setData(d => ({...d, jumlah: e.target.value}))} />
          <InputField 
            label="Harga Aset (Rp)" 
            placeholder="Harga Aset" 
            type="text" 
            value={data.hargaAset ? Number(data.hargaAset).toLocaleString("id-ID") : ""} 
            onChange={(e) => {
              const rawValue = e.target.value.replace(/\D/g, "");
              setData(d => ({ ...d, hargaAset: rawValue }));
            }} 
          />
          <InputField label="Tanggal Pembelian" type="date" value={data.tanggalPembelian || ""} onChange={(e) => setData(d => ({...d, tanggalPembelian: e.target.value}))} />
          <InputField label="Serial Number" placeholder="Serial number" value={data.noSN} onChange={(e) => setData(d => ({...d, noSN: e.target.value}))} className="sm:col-span-2" />
          <TextAreaField label="Spesifikasi" placeholder="Detail spesifikasi aset" value={data.spesifikasi} onChange={(e) => setData(d => ({...d, spesifikasi: e.target.value}))} rows={3} className="sm:col-span-2" />

        </div>
      </div>
      <hr className="border-slate-200" />
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800 uppercase tracking-wide">
          <MapPin className="h-4 w-4 text-primary" />
          Lokasi Aset
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField label="Lokasi Aset" placeholder="Masukkan lokasi aset" value={data.lokasiAset} onChange={(e) => setData(d => ({...d, lokasiAset: e.target.value}))} />
          <SelectField label="Kondisi Aset" value={data.kondisi} onChange={(e) => setData(d => ({...d, kondisi: e.target.value}))} options={kondisiOptions} placeholder="Pilih Kondisi" />
          <ImageUploadField onFileChange={onImageChange} previewUrl={imgPreview} onClear={onImageClear} />
          <TextAreaField label="Keterangan" placeholder="Keterangan tambahan" value={data.keterangan} onChange={(e) => setData(d => ({...d, keterangan: e.target.value}))} className="sm:col-span-2" />
        </div>
      </div>
    </div>
  );

  // Loading
  if (loading) {
    return (
      <div>
        <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Daftar Aset</h1><p className="text-sm text-slate-500">Kelola data aset Galeria Production</p></div>
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
        <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Daftar Aset</h1><p className="text-sm text-slate-500">Kelola data aset Galeria Production</p></div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-10">
          <AlertTriangle className="h-12 w-12 text-rose-400 mb-3" />
          <p className="text-sm font-medium text-rose-700 mb-1">Koneksi Gagal</p>
          <p className="text-xs text-rose-500 mb-4 text-center">{error}</p>
          <button onClick={fetchAssets} className="cursor-pointer rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600">Coba Lagi</button>
        </div>
      </div>
    );
  }

  const formatRupiah = (val) => {
    if (!val) return "-";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-100 flex items-center gap-2 rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-white transition-all animate-[slideIn_0.3s_ease] ${toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"}`}>
          {toast.type === "error" ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 z-35 flex items-center justify-center bg-black/80 p-4 cursor-pointer transition-opacity animate-in fade-in duration-300" onClick={() => setLightboxImg(null)}>
          <div className="relative h-[85vh] w-[85vw] max-w-5xl animate-modal-in" onClick={(e) => e.stopPropagation()}>
            <Image src={lightboxImg} alt="Preview" fill unoptimized className="rounded-xl object-contain shadow-2xl cursor-default" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Daftar Aset</h1>
        <p className="text-sm text-slate-500">Kelola data aset Galeria Production</p>
      </div>

      {/* Toolbar & Table Section */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-primary">
        {/* Table Loading Overlay */}
        {tableLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px] transition-all animate-in fade-in duration-200">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-sm" />
              <div className="flex flex-col items-center">
                <p className="text-sm font-bold text-slate-700">Memperbarui Data</p>
                <p className="text-[10px] text-slate-400">Mohon tunggu sebentar...</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-5 border-b border-slate-300 bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Cari nama aset..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-lg border-2 border-slate-200 py-2 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-text transition-colors hover:border-slate-300" />
          </div>
          <button onClick={() => { setFormData(emptyForm); setImageFile(null); setImagePreview(null); setShowModal(true); }}
            className="cursor-pointer w-full sm:w-auto flex justify-center items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover">
            <Plus className="h-4 w-4" />
            Tambah Aset
          </button>
        </div>

        {/* Table Controls (Pagination Top) & Table */}
        <Pagination />
        <div className="overflow-x-auto border-t border-slate-100">
          <table className="w-full text-left text-sm table-fixed">
            <thead>
              <tr className="border-t border-t-slate-300 border-b border-b-slate-300">
                <th className="w-[140px] px-5 py-3 font-bold text-slate-700"><button onClick={() => handleSort("kodeAset")} className="cursor-pointer flex items-center">Kode Aset <SortIcon columnKey="kodeAset" sortConfig={sortConfig} /></button></th>
                <th className="w-[80px] px-3 py-3 font-bold text-slate-700 text-center">Gambar</th>
                <th className="w-[190px] px-5 py-3 font-bold text-slate-700"><button onClick={() => handleSort("namaAset")} className="cursor-pointer flex items-center">Nama Aset <SortIcon columnKey="namaAset" sortConfig={sortConfig} /></button></th>
                <th className="w-[120px] px-5 py-3 font-bold text-slate-700"><button onClick={() => handleSort("jumlah")} className="cursor-pointer flex items-center">Jumlah <SortIcon columnKey="jumlah" sortConfig={sortConfig} /></button></th>
                <th className="w-[130px] px-5 py-3 font-bold text-slate-700"><button onClick={() => handleSort("kategori")} className="cursor-pointer flex items-center">Kategori <SortIcon columnKey="kategori" sortConfig={sortConfig} /></button></th>
                <th className="w-[130px] px-5 py-3 font-bold text-slate-700"><button onClick={() => handleSort("model")} className="cursor-pointer flex items-center">Model <SortIcon columnKey="model" sortConfig={sortConfig} /></button></th>
                <th className="w-[150px] px-5 py-3 font-bold text-slate-700">Kondisi</th>
                <th className="w-[110px] px-5 py-3 font-bold text-slate-700 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={item.id} className={`border-b border-slate-100 transition-colors ${index % 2 === 0 ? "bg-slate-100" : "bg-white"}`}>
                  <td className="w-[140px] px-5 py-3 font-mono text-xs font-bold text-primary hover:underline cursor-pointer truncate" onClick={() => setShowDetail(item)}>{item.kodeAset}</td>
                  <td className="w-[80px] px-3 py-2 text-center">
                    {item.gambar ? (
                      <div className="mx-auto h-9 w-9 relative cursor-pointer hover:ring-2 hover:ring-primary transition-all rounded-md overflow-hidden" onClick={() => setLightboxImg(getImageUrl(item.gambar))}>
                        <Image src={getImageUrl(item.gambar)} alt="" fill unoptimized className="object-cover border border-slate-200" />
                      </div>
                    ) : (
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-300">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                    )}
                  </td>
                  <td className="w-[190px] px-5 py-3 text-slate-600 hover:text-primary cursor-pointer truncate" onClick={() => setShowDetail(item)}>{item.namaAset}</td>
                  <td className="w-[120px] px-5 py-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-emerald-600">{item.jumlah ?? "-"} Tersisa</span>
                      <span className="text-slate-600">dari Total {item.jumlahTotal ?? item.jumlah ?? "-"}</span>
                    </div>
                  </td>
                  <td className="w-[130px] px-5 py-3 text-slate-600 truncate">{item.kategori}</td>
                  <td className="w-[130px] px-5 py-3 text-slate-600 truncate">{item.model}</td>
                  <td className="w-[150px] px-5 py-3"><span onClick={() => {setShowKondisiModal(item); setNewKondisi(item.kondisi)}} className={`cursor-pointer inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase transition-all ${getKondisiBadge(item.kondisi)}`}>{item.kondisi}</span></td>
                  <td className="w-[110px] px-5 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => setShowDetail(item)} className="cursor-pointer rounded-lg bg-blue-100 p-1.5 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white" title="Detail"><Info className="h-4 w-4" /></button>
                      <button onClick={() => openEdit(item)} className="cursor-pointer rounded-lg bg-amber-100 p-1.5 text-amber-600 transition-colors hover:bg-amber-600 hover:text-white" title="Edit"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setShowDeleteConfirm(item)} className="cursor-pointer rounded-lg bg-rose-100 p-1.5 text-rose-600 transition-colors hover:bg-rose-600 hover:text-white" title="Hapus"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {assets.length === 0 && (<tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400">Tidak ada data aset ditemukan.</td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200"><Pagination /></div>
      </div>

      {mounted && typeof document !== 'undefined' && createPortal(
        <>
          {/* Modal Tambah */}
          {showModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowModal(false)}>
              <form onSubmit={handleCreate} className="max-h-[90vh] w-full max-w-2xl flex flex-col rounded-2xl bg-white shadow-xl border-t-4 border-t-emerald-500 animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-50 px-6 py-4 rounded-t-2xl shrink-0">
                  <h2 className="text-lg font-bold text-emerald-800">Tambah Aset Baru</h2>
                  <button type="button" onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>
                </div>
                <div className="overflow-y-auto custom-scrollbar flex-1">
                  {renderFormFields(formData, setFormData, (e) => handleImageSelect(e, setImageFile, setImagePreview), imagePreview, () => { setImageFile(null); setImagePreview(null); }, false)}
                </div>
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-white rounded-b-2xl shrink-0">
                  <button type="button" onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Batal</button>
                  <button type="submit" disabled={submitting} className="cursor-pointer rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:opacity-60">{submitting ? "Menyimpan..." : "Simpan Aset"}</button>
                </div>
              </form>
            </div>
          )}

          {/* Modal Detail */}
          {showDetail && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowDetail(null)}>
              <div className="max-h-[90vh] w-full max-w-lg flex flex-col rounded-2xl bg-white shadow-xl border-t-4 border-t-blue-500 animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 bg-blue-50 px-6 py-4 rounded-t-2xl shrink-0">
                  <h2 className="text-lg font-bold text-blue-800">Detail Aset</h2>
                  <button onClick={() => setShowDetail(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                  {getImageUrl(showDetail.gambar) && (
                    <div className="flex justify-center">
                      <div className="relative h-48 w-full max-w-[300px] cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all rounded-xl overflow-hidden border border-slate-200" onClick={() => setLightboxImg(getImageUrl(showDetail.gambar))}>
                        <Image src={getImageUrl(showDetail.gambar)} alt={showDetail.namaAset} fill unoptimized className="object-contain" />
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 className="mb-3 text-sm font-bold text-slate-800">Daftar Inventori</h4>
                    <div className="space-y-2.5">
                      {[
                        ["Kode Aset", showDetail.kodeAset], 
                        ["Nama Aset", showDetail.namaAset], 
                        ["Pengguna", showDetail.pengguna], 
                        ["Kategori", showDetail.kategori], 
                        ["Merek", showDetail.merek], 
                        ["Model", showDetail.model], 
                        ["Jumlah", `${showDetail.jumlah ?? "-"} Tersisa dari Total ${showDetail.jumlahTotal ?? showDetail.jumlah ?? "-"}`], 
                        ["Harga Aset", formatRupiah(showDetail.hargaAset)], 
                        ["Tanggal Pembelian", showDetail.tanggalPembelian ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(showDetail.tanggalPembelian)) : "-"],
                        ["Serial Number", showDetail.noSN], 
                        ["Spesifikasi", showDetail.spesifikasi]
                      ].map(([l, v]) => (
                        <div key={l} className="flex items-start gap-3"><span className="w-28 shrink-0 text-sm font-semibold text-slate-600">{l}</span><span className="text-sm text-slate-800">{v || "-"}</span></div>
                      ))}
                    </div>
                  </div>
                  <hr className="border-slate-300" />
                  <div>
                    <h4 className="mb-3 text-sm font-bold text-slate-800">Lokasi Aset</h4>
                    <div className="space-y-2.5">
                      {[["Lokasi", showDetail.lokasiAset], ["Kondisi", showDetail.kondisi], ["Keterangan", showDetail.keterangan]].map(([l, v]) => (
                        <div key={l} className="flex items-start gap-3"><span className="w-28 shrink-0 text-sm font-semibold text-slate-600">{l}</span><span className="text-sm text-slate-800">{v || "-"}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end border-t border-slate-100 px-6 py-4 gap-3 bg-white rounded-b-2xl shrink-0">
                  <button onClick={() => {openEdit(showDetail); setShowDetail(null);}} className="cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 shadow-sm">Edit Aset</button>
                  <button onClick={() => setShowDetail(null)} className="cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 shadow-sm">Tutup</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Edit */}
          {showEdit && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowEdit(null)}>
              <form onSubmit={handleUpdate} className="max-h-[90vh] w-full max-w-2xl flex flex-col rounded-2xl bg-white shadow-xl border-t-4 border-t-amber-500 animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 bg-amber-50 px-6 py-4 rounded-t-2xl shrink-0">
                  <h2 className="text-lg font-bold text-amber-800">Edit Aset</h2>
                  <button type="button" onClick={() => setShowEdit(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>
                </div>
                <div className="overflow-y-auto custom-scrollbar flex-1">
                  {renderFormFields(editFormData, setEditFormData, (e) => handleImageSelect(e, setEditImageFile, setEditImagePreview), editImagePreview, () => { setEditImageFile(null); setEditImagePreview(null); }, true)}
                </div>
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-white rounded-b-2xl shrink-0">
                  <button type="button" onClick={() => setShowEdit(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Batal</button>
                  <button type="submit" disabled={submitting} className="cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-60">{submitting ? "Menyimpan..." : "Simpan Perubahan"}</button>
                </div>
              </form>
            </div>
          )}

          {/* Modal Hapus */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowDeleteConfirm(null)}>
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mx-auto">
                  <Trash2 className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-center text-lg font-bold text-slate-800">Hapus Aset?</h3>
                <p className="mb-6 text-center text-sm text-slate-500">
                  Apakah Anda yakin ingin menghapus aset <strong>{showDeleteConfirm.namaAset}</strong>? Seluruh data riwayat terkait aset ini akan ikut terhapus.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteConfirm(null)} className="cursor-pointer flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Batal</button>
                  <button onClick={handleDelete} disabled={submitting} className="cursor-pointer flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-700 disabled:opacity-60">{submitting ? "Menghapus..." : "Hapus Aset"}</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Kategori */}
          {showKatModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowKatModal(false)}>
              <form onSubmit={handleCreateKat} className="w-full max-w-sm rounded-2xl bg-white shadow-xl border-t-4 border-t-emerald-500 animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Tambah Kategori Baru</h3>
                  <div className="space-y-4">
                    <InputField label="Nama Kategori" required placeholder="Contoh: Kamera" value={newKatData.nama} onChange={(e) => setNewKatData(d => ({...d, nama: e.target.value}))} />
                    <InputField label="Kode Singkat" required placeholder="Contoh: CAM" value={newKatData.kode_singkat} onChange={(e) => setNewKatData(d => ({...d, kode_singkat: e.target.value.toUpperCase()}))} />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
                  <button type="button" onClick={() => setShowKatModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Batal</button>
                  <button type="submit" disabled={submitting} className="cursor-pointer rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-600">Simpan</button>
                </div>
              </form>
            </div>
          )}

          {/* Modal Merek */}
          {showMerekModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowMerekModal(false)}>
              <form onSubmit={handleCreateMerek} className="w-full max-w-sm rounded-2xl bg-white shadow-xl border-t-4 border-t-emerald-500 animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Tambah Merek Baru</h3>
                  <div className="space-y-4">
                    <InputField label="Nama Merek" required placeholder="Contoh: Sony" value={newMerekData.nama} onChange={(e) => setNewMerekData(d => ({...d, nama: e.target.value}))} />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
                  <button type="button" onClick={() => setShowMerekModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Batal</button>
                  <button type="submit" disabled={submitting} className="cursor-pointer rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-600">Simpan</button>
                </div>
              </form>
            </div>
          )}

          {/* Modal Update Kondisi */}
          {showKondisiModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowKondisiModal(null)}>
              <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border-t-4 border-t-blue-500 animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Ubah Kondisi Aset</h3>
                  <p className="text-sm text-slate-500 mb-4 truncate">{showKondisiModal.namaAset}</p>
                  <SelectField label="" value={newKondisi} onChange={(e) => setNewKondisi(e.target.value)} options={kondisiOptions} placeholder="Pilih Kondisi" />
                </div>
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
                  <button onClick={() => setShowKondisiModal(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Batal</button>
                  <button onClick={handleUpdateKondisi} disabled={submitting} className="cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600">Update Kondisi</button>
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
