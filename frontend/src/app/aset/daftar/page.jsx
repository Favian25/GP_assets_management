"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import Image from "next/image";
import { getAllAssets, createAsset, updateAsset, deleteAsset, searchAssets, updateAssetKondisi, importAssets, deleteAllInventory, getAssetUnits, updateAssetUnit, addAssetUnit, deleteAssetUnit } from "../../lib/assetService";
import { getAllCategories, createCategory } from "../../lib/categoryService";
import { getAllBrands, createBrand } from "../../lib/brandService";
import { getUserContext } from "../../lib/authService";
import { getAllUsers } from "../../lib/userService";
import { toSentenceCase, toUpperCaseText } from "../../lib/stringUtils";
import { exportToExcel, downloadAssetTemplate, parseExcelFile } from "../../lib/exportUtils";
import { Search, Plus, Info, Pencil, Trash2, X, Check, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, AlertTriangle, ChevronUp, ChevronDown, MapPin, Image as ImageIcon, Package, Camera, Download, Upload, FileSpreadsheet, Split, Layers } from "lucide-react";

const getBackendURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '');
  }
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:5000`;
  }
  return "http://localhost:5000";
};
const BACKEND_URL = getBackendURL();
const kondisiOptions = ["Siap Digunakan", "Rusak", "Rusak Berat", "Maintenance", "Dijual"];
const ROWS_OPTIONS = [10, 20, 30, 40, 50];

const emptyForm = {
  kodeAset: "", namaAset: "", pengguna: "", kategori: "", merek: "", model: "",
  noSN: "", spesifikasi: "", lokasiAset: "", kondisi: "", keterangan: "",
  jumlah: "", hargaAset: "", tipeHarga: "Per Unit", tanggalPembelian: "", jenisAset: "",
};

const jenisAsetOptions = ["Galeria Studio", "Galeria Production"];
const tipeHargaOptions = ["Per Unit", "Per Paket"];

// =====================================================
// Helper components (outside to prevent re-mount)
// =====================================================

function InputField({ label, required, value, onChange, placeholder, type = "text", className = "", maxLength, hint }) {
  const isDate = type === 'date' || type === 'datetime-local';

  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {hint && <p className="mb-1.5 text-xs text-slate-400 italic">↳ {hint}</p>}
      <div className="relative">
        {isDate && !value && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
            {placeholder || (type === 'date' ? "dd/mm/yyyy" : "dd/mm/yyyy, --:--")}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          onClick={(e) => { if (isDate) { try { e.target.showPicker(); } catch(err) {} } }}
          required={required}
          onInvalid={(e) => required && e.target.setCustomValidity(`${label} wajib diisi`)}
          onInput={(e) => required && e.target.setCustomValidity("")}
          className={`w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${isDate ? 'cursor-pointer' : ''} ${isDate && !value ? 'text-transparent' : 'text-slate-700 placeholder:text-slate-400'}`}
        />
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder = "Pilih...", className = "", hint }) {
  return (
    <div className={className}>
      {label && <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>}
      {hint && <p className="mb-1.5 text-xs text-slate-400 italic">↳ {hint}</p>}
      <select value={value} onChange={onChange}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
        <option value="">{placeholder}</option>
        {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
      </select>
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 2, className = "", hint }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {hint && <p className="mb-1.5 text-xs text-slate-400 italic">↳ {hint}</p>}
      <textarea rows={rows} placeholder={placeholder} value={value} onChange={onChange}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
    </div>
  );
}

function ImageUploadField({ onFileChange, previewUrl, onClear }) {
  const cameraRef = useRef(null);
  const galeriRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragIn = (e) => { handleDrag(e); setDragging(true); };
  const handleDragOut = (e) => { handleDrag(e); setDragging(false); };
  const handleDrop = (e) => {
    handleDrag(e); setDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && ["image/jpeg", "image/jpg", "image/png", "image/heic", "image/heif", "image/webp"].includes(file.type)) {
      onFileChange({ target: { files: [file] } });
    }
  };
  return (
    <div className="sm:col-span-2">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">Upload Gambar</label>
      <div onDragEnter={handleDragIn} onDragLeave={handleDragOut} onDragOver={handleDrag} onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed px-6 py-6 transition-colors ${dragging ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50"}`}>
        <div className="flex flex-col items-center text-center">
          {previewUrl ? (
            <div className="relative mb-4 h-40 w-full max-w-[200px]">
              <Image src={previewUrl} alt="Preview" fill unoptimized className="rounded-lg object-contain border border-slate-200" />
              <button type="button" onClick={onClear}
                className="absolute -top-2 -right-2 cursor-pointer rounded-full bg-rose-500 p-1 text-white shadow-md transition-colors hover:bg-rose-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <ImageIcon className="h-8 w-8 text-slate-300 mb-3" />
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
            {/* Opsi Kamera */}
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onFileChange}
              className="hidden"
            />
            <button type="button" onClick={() => cameraRef.current?.click()}
              className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 shadow-sm rounded-xl hover:border-primary hover:text-primary transition-colors">
              <Camera className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-slate-700">Buka Kamera</span>
            </button>
            {/* Opsi Galeri */}
            <input
              ref={galeriRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/heic,image/heif,image/webp"
              onChange={onFileChange}
              className="hidden"
            />
            <button type="button" onClick={() => galeriRef.current?.click()}
              className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 shadow-sm rounded-xl hover:border-primary hover:text-primary transition-colors">
              <ImageIcon className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-slate-700">Pilih Galeri</span>
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-400">Seret gambar ke sini atau klik tombol · PNG, JPG, JPEG</p>
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

function PengelolaAutocomplete({ value, onChange, allUsers, className = "", hint }) {
  const [search, setSearch] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  const filterUsers = (query) => {
    if (!query.trim()) {
      setFilteredUsers([]);
      return;
    }
    const lowerQuery = query.toLowerCase();
    const filtered = allUsers.filter(user =>
      user.namaLengkap.toLowerCase().includes(lowerQuery)
    ).sort((a, b) => a.namaLengkap.localeCompare(b.namaLengkap));
    setFilteredUsers(filtered);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    filterUsers(val);
    setShowDropdown(true);
  };

  const handleSelectUser = (user) => {
    setSearch(user.namaLengkap);
    onChange({ target: { value: user.namaLengkap } });
    setShowDropdown(false);
    setFilteredUsers([]);
  };

  const handleClear = () => {
    setSearch("");
    onChange({ target: { value: "" } });
    setShowDropdown(false);
    setFilteredUsers([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={className}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">Pengelola</label>
      {hint && <p className="mb-1.5 text-xs text-slate-400 italic">↳ {hint}</p>}
      <div className="relative">
        <input
          type="text"
          placeholder="Cari nama pengelola..."
          value={search}
          onChange={handleInputChange}
          onFocus={() => search && setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-slate-700 placeholder:text-slate-400"
        />
        {search && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
            title="Hapus pilihan"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {showDropdown && filteredUsers.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelectUser(user)}
                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-primary/10 focus:bg-primary/10 focus:outline-none transition-colors first:rounded-t-lg last:rounded-b-lg border-b border-slate-100 last:border-b-0"
              >
                {user.namaLengkap}
              </button>
            ))}
          </div>
        )}
        {showDropdown && search && filteredUsers.length === 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-slate-200 bg-white shadow-lg px-3 py-2">
            <p className="text-xs text-slate-500 text-center">Tidak ada pengelola yang sesuai</p>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// Main Page Component
// =====================================================

export default function DaftarAsetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [kondisiFilter, setKondisiFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [showEdit, setShowEdit] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deleteBlockedAlert, setDeleteBlockedAlert] = useState(null); // { message, item, activePeminjaman }
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
  const [userRole, setUserRole] = useState("user");
  const [kategoriList, setKategoriList] = useState([]);
  const [rawCategories, setRawCategories] = useState([]);
  const [merekList, setMerekList] = useState([]);
  const [usersList, setUsersList] = useState([]);

  const [showKatModal, setShowKatModal] = useState(false);
  const [showMerekModal, setShowMerekModal] = useState(false);
  const [showKondisiModal, setShowKondisiModal] = useState(null);
  const [newKatData, setNewKatData] = useState({ nama: "", kode_singkat: "" });
  const [newMerekData, setNewMerekData] = useState({ nama: "" });
  const [newKondisi, setNewKondisi] = useState("");
  const [isSplitKondisi, setIsSplitKondisi] = useState(false);
  const [jumlahSplit, setJumlahSplit] = useState(1);
  const [keteranganKondisi, setKeteranganKondisi] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Import Excel States
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importData, setImportData] = useState([]);
  const [importError, setImportError] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importDragging, setImportDragging] = useState(false);
  const importFileInputRef = useRef(null);

  // Super Admin Delete All States
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deleteAllTarget, setDeleteAllTarget] = useState("both"); // "both", "assets", "accessories"
  const [deleteAllConfirmation, setDeleteAllConfirmation] = useState("");
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);

  // Unit Management Modal States (Option 3)
  const [showUnitsModal, setShowUnitsModal] = useState(null);
  const [assetUnitsList, setAssetUnitsList] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState(null);
  const [unitForm, setUnitForm] = useState({ nama_unit: "", no_sn: "", kondisi: "Siap Digunakan", lokasi_unit: "", keterangan: "" });
  const [showAddUnitForm, setShowAddUnitForm] = useState(false);
  const [newUnitData, setNewUnitData] = useState({ nama_unit: "", no_sn: "", kondisi: "Siap Digunakan", lokasi_unit: "", keterangan: "" });
  const [unitDeleteConfirm, setUnitDeleteConfirm] = useState(null);
  const [deletingUnit, setDeletingUnit] = useState(false);

  useEffect(() => {
    setMounted(true);
    const ctx = getUserContext();
    if (ctx) {
      const role = ctx.role || "user";
      setUserRole(role);
      // Allow all roles to view asset list, but with limited functionality for users/guests
      if (!["super admin", "admin", "supervisor", "user", "guest"].includes(role)) {
        router.push("/?error=unauthorized");
      }
    }
  }, [router]);

  useEffect(() => {
    const q = searchParams?.get("search");
    if (q) setSearch(q);
    const k = searchParams?.get("kondisi");
    if (k) setKondisiFilter(k);
  }, [searchParams]);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); } }, [toast]);
  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchDependencies = async () => {
    try {
      const cats = await getAllCategories();
      const brds = await getAllBrands();
      const users = await getAllUsers();
      setRawCategories(cats || []);
      setKategoriList((cats || []).map(c => c.nama));
      setMerekList((brds || []).map(b => b.nama));
      setUsersList(users || []);
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
    if (mounted) {
      fetchAssets();
      if (["super admin", "admin"].includes(userRole)) {
        fetchDependencies();
      }
    }
  }, [fetchAssets, userRole, mounted]);

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

  // Filtering, Sorting & Pagination
  const filteredData = assets.filter(item => {
    // Kondisi filter (mendukung filter kondisi master maupun unit spesifik)
    if (kondisiFilter) {
      const matchMaster = item.kondisi === kondisiFilter;
      const matchUnit = Array.isArray(item.units) && item.units.some(u => u.kondisi === kondisiFilter);
      if (!matchMaster && !matchUnit) return false;
    }
    // Brand/Jenis Aset filter
    if (brandFilter === "Galeria studio" && item.jenisAset !== "Galeria Studio") return false;
    if (brandFilter === "Galeria production" && item.jenisAset !== "Galeria Production") return false;
    return true;
  });

  const sorted = [...filteredData].sort((a, b) => {
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
    const namaFormatted = toUpperCaseText(newKatData.nama.trim());
    const kodeFormatted = toUpperCaseText(newKatData.kode_singkat.trim());

    if (!namaFormatted || !kodeFormatted) {
      showToast("Nama dan Kode Singkat wajib diisi", "error");
      return;
    }

    // Pengecekan apakah kategori sudah ada di dropdown
    const existingKat = rawCategories.find(c => (c.nama || "").trim().toUpperCase() === namaFormatted);
    if (existingKat) {
      showToast(`Kategori "${namaFormatted}" sudah ada di pilihan dropdown!`, "error");
      return;
    }

    const existingKode = rawCategories.find(c => (c.kode_singkat || "").trim().toUpperCase() === kodeFormatted);
    if (existingKode) {
      showToast(`Kode singkat "${kodeFormatted}" sudah digunakan oleh kategori "${existingKode.nama}"!`, "error");
      return;
    }

    try {
      setSubmitting(true);
      await createCategory(namaFormatted, kodeFormatted);
      showToast("Kategori berhasil ditambahkan!");
      setShowKatModal(false);
      setNewKatData({ nama: "", kode_singkat: "" });
      await fetchDependencies();
      // Auto-select kategori baru ke form aktif
      if (showEdit) {
        setEditFormData(d => ({ ...d, kategori: namaFormatted }));
      } else {
        setFormData(d => ({ ...d, kategori: namaFormatted }));
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal menambahkan kategori", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateMerek = async (e) => {
    e.preventDefault();
    const namaFormatted = toUpperCaseText(newMerekData.nama.trim());

    if (!namaFormatted) {
      showToast("Nama Merek wajib diisi", "error");
      return;
    }

    // Pengecekan apakah merek sudah ada di dropdown
    const exists = merekList.some(m => (m || "").trim().toUpperCase() === namaFormatted);
    if (exists) {
      showToast(`Merek "${namaFormatted}" sudah ada di pilihan dropdown!`, "error");
      return;
    }

    try {
      setSubmitting(true);
      await createBrand(namaFormatted);
      showToast("Merek berhasil ditambahkan!");
      setShowMerekModal(false);
      setNewMerekData({ nama: "" });
      await fetchDependencies();
      // Auto-select merek baru ke form aktif
      if (showEdit) {
        setEditFormData(d => ({ ...d, merek: namaFormatted }));
      } else {
        setFormData(d => ({ ...d, merek: namaFormatted }));
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal menambahkan merek", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const applyExistingMerek = (merekNama) => {
    if (showEdit) {
      setEditFormData(d => ({ ...d, merek: merekNama }));
    } else {
      setFormData(d => ({ ...d, merek: merekNama }));
    }
    setShowMerekModal(false);
    setNewMerekData({ nama: "" });
    showToast(`Merek "${merekNama}" dipilih dari dropdown.`, "info");
  };

  const applyExistingKat = (katNama) => {
    if (showEdit) {
      setEditFormData(d => ({ ...d, kategori: katNama }));
    } else {
      setFormData(d => ({ ...d, kategori: katNama }));
    }
    setShowKatModal(false);
    setNewKatData({ nama: "", kode_singkat: "" });
    showToast(`Kategori "${katNama}" dipilih dari dropdown.`, "info");
  };

  // CRUD
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.namaAset) { showToast("Nama Aset wajib diisi", "error"); return; }
    const formattedData = {
      ...formData,
      namaAset: toUpperCaseText(formData.namaAset),
      model: toUpperCaseText(formData.model),
      noSN: toUpperCaseText(formData.noSN),
      lokasiAset: toUpperCaseText(formData.lokasiAset),
      spesifikasi: toSentenceCase(formData.spesifikasi),
      keterangan: toSentenceCase(formData.keterangan),
      kodeAset: undefined,
    };
    try {
      setSubmitting(true);
      await createAsset(formattedData, imageFile);
      showToast("Aset berhasil ditambahkan!");
      setShowModal(false);
      setFormData(emptyForm);
      setImageFile(null);
      setImagePreview(null);
      await fetchAssets();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal menambahkan aset", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editFormData.namaAset) { showToast("Nama Aset wajib diisi", "error"); return; }
    const formattedData = {
      ...editFormData,
      namaAset: toUpperCaseText(editFormData.namaAset),
      model: toUpperCaseText(editFormData.model),
      noSN: toUpperCaseText(editFormData.noSN),
      lokasiAset: toUpperCaseText(editFormData.lokasiAset),
      spesifikasi: toSentenceCase(editFormData.spesifikasi),
      keterangan: toSentenceCase(editFormData.keterangan),
    };
    try {
      setSubmitting(true);
      await updateAsset(showEdit.id, formattedData, editImageFile);
      showToast("Aset berhasil diperbarui!");
      setShowEdit(null);
      setEditFormData(emptyForm);
      setEditImageFile(null);
      setEditImagePreview(null);
      await fetchAssets();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal memperbarui aset", "error");
    } finally {
      setSubmitting(false);
    }
  };
  const handleUpdateKondisi = async () => {
    if (!showKondisiModal || !newKondisi) return;
    const currentQty = parseInt(showKondisiModal.jumlah, 10) || 1;
    if (isSplitKondisi) {
      const splitQty = parseInt(jumlahSplit, 10);
      if (isNaN(splitQty) || splitQty <= 0) {
        showToast("Jumlah unit yang diubah harus lebih dari 0", "error");
        return;
      }
      if (splitQty >= currentQty) {
        showToast(`Jumlah split harus kurang dari total unit (${currentQty})`, "error");
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        kondisi: newKondisi,
        is_split: isSplitKondisi,
        jumlah_ubah: isSplitKondisi ? parseInt(jumlahSplit, 10) : currentQty,
        keterangan: keteranganKondisi,
      };
      const res = await updateAssetKondisi(showKondisiModal.id, payload);
      showToast(res.message || "Kondisi berhasil diperbarui!");
      setShowKondisiModal(null);
      await fetchAssets();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal memperbarui kondisi", "error");
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    try {
      setSubmitting(true);
      await deleteAsset(showDeleteConfirm.id);
      showToast("Aset berhasil dihapus!");
      setShowDeleteConfirm(null);
      await fetchAssets();
    } catch (err) {
      const data = err.response?.data;
      const item = showDeleteConfirm;
      setShowDeleteConfirm(null);
      setDeleteBlockedAlert({ message: data?.message || "Gagal menghapus aset", item, activePeminjaman: data?.activePeminjaman || [] });
    } finally { setSubmitting(false); }
  };

  const handleDeleteAll = async () => {
    if (deleteAllConfirmation.trim() !== "HAPUS SEMUA") {
      showToast("Ketik 'HAPUS SEMUA' dengan huruf besar untuk konfirmasi", "error");
      return;
    }
    try {
      setDeleteAllLoading(true);
      const res = await deleteAllInventory(deleteAllTarget);
      showToast(res.message || "Data berhasil dihapus seluruhnya!", "success");
      setShowDeleteAllModal(false);
      setDeleteAllConfirmation("");
      await fetchAssets();
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal menghapus seluruh data";
      showToast(msg, "error");
    } finally {
      setDeleteAllLoading(false);
    }
  };

  // Unit Management Modal Handlers
  const openUnitsModal = async (asset) => {
    setShowUnitsModal(asset);
    setLoadingUnits(true);
    setShowAddUnitForm(false);
    setEditingUnitId(null);
    try {
      const units = await getAssetUnits(asset.id);
      setAssetUnitsList(units || []);
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal memuat rincian unit aset", "error");
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleUnitKondisiChange = async (unitId, newKondisiVal) => {
    try {
      await updateAssetUnit(unitId, { kondisi: newKondisiVal });
      setAssetUnitsList((prev) =>
        prev.map((u) => (u.id === unitId ? { ...u, kondisi: newKondisiVal } : u))
      );
      showToast("Kondisi unit berhasil diperbarui!");
      await fetchAssets();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal mengubah kondisi unit", "error");
    }
  };

  const handleSaveUnitEdit = async (unitId) => {
    try {
      await updateAssetUnit(unitId, unitForm);
      setAssetUnitsList((prev) =>
        prev.map((u) => (u.id === unitId ? { ...u, ...unitForm } : u))
      );
      setEditingUnitId(null);
      showToast("Data unit berhasil diperbarui!");
      await fetchAssets();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal menyimpan perubahan unit", "error");
    }
  };

  const handleCreateNewUnit = async () => {
    if (!showUnitsModal) return;
    try {
      setSubmitting(true);
      await addAssetUnit(showUnitsModal.id, newUnitData);
      showToast("Unit baru berhasil ditambahkan!");
      setShowAddUnitForm(false);
      setNewUnitData({ nama_unit: "", no_sn: "", kondisi: "Siap Digunakan", lokasi_unit: "", keterangan: "" });
      const units = await getAssetUnits(showUnitsModal.id);
      setAssetUnitsList(units || []);
      await fetchAssets();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal menambahkan unit", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUnit = (unit) => {
    setUnitDeleteConfirm(unit);
  };

  const handleConfirmDeleteUnit = async () => {
    if (!unitDeleteConfirm) return;
    try {
      setDeletingUnit(true);
      await deleteAssetUnit(unitDeleteConfirm.id);
      setAssetUnitsList((prev) => prev.filter((u) => u.id !== unitDeleteConfirm.id));
      showToast("Unit fisik berhasil dihapus!");
      setUnitDeleteConfirm(null);
      await fetchAssets();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal menghapus unit fisik", "error");
    } finally {
      setDeletingUnit(false);
    }
  };

  const handleStartEditUnit = (unit) => {
    setEditingUnitId(unit.id);
    setUnitForm({
      nama_unit: unit.nama_unit || "",
      no_sn: unit.no_sn || "",
      kondisi: unit.kondisi || "Siap Digunakan",
      lokasi_unit: unit.lokasi_unit || "",
      keterangan: unit.keterangan || "",
    });
  };

  // Export Excel
  const handleExportExcel = async () => {
    const columns = [
      { header: "Kode Aset", dataKey: "kodeAset" },
      { header: "Nama Aset", dataKey: "namaAset" },
      { header: "Jenis Brand", dataKey: "jenisAset" },
      { header: "Kategori", dataKey: "kategori" },
      { header: "Merek", dataKey: "merek" },
      { header: "Model", dataKey: "model" },
      { header: "Unit Siap", dataKey: "unitSiap" },
      { header: "Total Unit", dataKey: "unitTotal" },
      { header: "Unit Rusak", dataKey: "unitRusak" },
      { header: "Harga Aset", dataKey: "hargaAset" },
      { header: "Tipe Perhitungan Harga", dataKey: "tipeHarga" },
      { header: "Kondisi Utama", dataKey: "kondisi" },
      { header: "Lokasi Aset", dataKey: "lokasiAset" },
      { header: "Pengelola", dataKey: "pengguna" },
      { header: "Serial Number", dataKey: "noSN" },
      { header: "Tanggal Pembelian", dataKey: "tanggalPembelian" },
      { header: "Spesifikasi", dataKey: "spesifikasi" },
      { header: "Keterangan", dataKey: "keterangan" },
    ];
    const rawData = filteredData.length > 0 ? filteredData : assets;
    const dataToExport = rawData.map((item) => ({
      ...item,
      unitSiap: item.readyUnitsCount !== undefined ? item.readyUnitsCount : (item.jumlah ?? 0),
      unitTotal: item.totalUnitsCount !== undefined ? item.totalUnitsCount : (item.jumlahTotal ?? item.jumlah ?? 0),
      unitRusak: Number(item.rusakUnitsCount || 0) + Number(item.rusakBeratUnitsCount || 0),
      tipeHarga: item.tipeHarga || "Per Unit",
    }));
    try {
      await exportToExcel(columns, dataToExport, `Data_Aset_Galeria_${new Date().toISOString().split("T")[0]}.xlsx`, "Data_Aset");
      showToast(`Berhasil mengekspor ${dataToExport.length} data aset`);
    } catch (err) {
      console.error("Export error:", err);
      showToast("Gagal mengekspor data ke Excel", "error");
    }
  };

  // Import Excel Handlers
  const processImportFile = async (file) => {
    if (!file) return;

    // Pengecekan ekstensi file
    const ext = file.name ? file.name.split('.').pop().toLowerCase() : "";
    if (!['xlsx', 'xls'].includes(ext)) {
      setImportError("Format file tidak didukung. Harap unggah file berekstensi .xlsx atau .xls.");
      return;
    }

    setImportError("");
    try {
      const rawRows = await parseExcelFile(file);
      if (!rawRows || rawRows.length === 0) {
        setImportError("File Excel kosong atau tidak memiliki baris data.");
        setImportData([]);
        setImportFile(null);
        return;
      }

      const mapped = rawRows.map((r, idx) => {
        const namaAset = (r["Nama Aset"] || r["nama_aset"] || r["Nama"] || r["nama"] || "").toString().trim();
        const jenisRaw = (r["Jenis Brand"] || r["jenis_aset"] || r["Brand"] || "").toString().trim();
        let jenisAset = "Galeria Production";
        if (jenisRaw.toLowerCase().includes("studio")) jenisAset = "Galeria Studio";

        const tipeHargaRaw = (r["Tipe Perhitungan Harga"] || r["Tipe Harga"] || r["tipe_harga"] || r["Tipe"] || "").toString().trim().toLowerCase();
        const tipeHarga = (tipeHargaRaw.includes("paket") || tipeHargaRaw.includes("box") || tipeHargaRaw.includes("set")) ? "Per Paket" : "Per Unit";

        return {
          idx: idx + 1,
          namaAset: toSentenceCase(namaAset),
          jenisAset,
          kategori: (r["Kategori"] || r["kategori"] || "").toString().trim(),
          merek: (r["Merek"] || r["merek"] || "").toString().trim(),
          model: (r["Model"] || r["model"] || "").toString().trim(),
          jumlah: parseInt(r["Jumlah"] || r["jumlah"] || 1, 10) || 1,
          hargaAset: parseFloat(r["Harga Aset"] || r["Harga"] || r["harga_aset"] || 0) || 0,
          tipeHarga,
          tanggalPembelian: (r["Tanggal Pembelian"] || r["tanggal_pembelian"] || "").toString().trim(),
          lokasiAset: toUpperCaseText((r["Lokasi Aset"] || r["Lokasi"] || r["lokasi_aset"] || "").toString().trim()),
          kondisi: (r["Kondisi"] || r["kondisi"] || "Siap Digunakan").toString().trim(),
          pengguna: (r["Pengelola"] || r["pengguna"] || "").toString().trim(),
          noSN: toUpperCaseText((r["Serial Number"] || r["No SN"] || r["no_sn"] || "").toString().trim()),
          spesifikasi: toSentenceCase((r["Spesifikasi"] || r["spesifikasi"] || "").toString().trim()),
          keterangan: toSentenceCase((r["Keterangan"] || r["keterangan"] || "").toString().trim()),
          isValid: Boolean(namaAset),
        };
      });

      setImportData(mapped);
      setImportFile(file);
    } catch (err) {
      console.error("Error parse excel:", err);
      setImportError("Gagal membaca file Excel. Pastikan format file .xlsx atau .xls valid.");
      setImportData([]);
      setImportFile(null);
    } finally {
      if (importFileInputRef.current) importFileInputRef.current.value = "";
    }
  };

  const handleFileImportChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processImportFile(file);
  };

  const handleImportDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImportDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processImportFile(file);
  };

  const handleConfirmImport = async () => {
    const validItems = importData.filter(d => d.isValid);
    if (validItems.length === 0) {
      showToast("Tidak ada data yang valid untuk diimpor", "error");
      return;
    }

    try {
      setImportLoading(true);
      const res = await importAssets(validItems);
      showToast(res.message || `Berhasil mengimpor ${validItems.length} aset!`);
      setShowImportModal(false);
      setImportFile(null);
      setImportData([]);
      await fetchAssets();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal mengimpor data aset", "error");
    } finally {
      setImportLoading(false);
    }
  };
  const openEdit = (item) => {
    setEditFormData({
      kodeAset: item.kodeAset || "", namaAset: item.namaAset || "", pengguna: item.pengguna || "",
      kategori: item.kategori || "", merek: item.merek || "", model: item.model || "",
      noSN: item.noSN || "", spesifikasi: item.spesifikasi || "", lokasiAset: item.lokasiAset || "",
      kondisi: item.kondisi || "", keterangan: item.keterangan || "",
      jumlah: item.jumlah || "", hargaAset: item.hargaAset || "",
      tipeHarga: item.tipeHarga || "Per Unit",
      tanggalPembelian: item.tanggalPembelian ? item.tanggalPembelian.split('T')[0] : "",
      jenisAset: item.jenisAset || "",
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
      "Rusak Berat": "bg-rose-900 text-white border-rose-950 hover:bg-black hover:border-black",
      "Maintenance": "bg-amber-50 text-amber-700 border-amber-500 hover:bg-amber-600 hover:text-white hover:border-amber-600",
      "Dijual": "bg-slate-100 text-slate-600 border-slate-500 hover:bg-slate-600 hover:text-white hover:border-slate-600"
    };
    return s[kondisi] || "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-600 hover:text-white hover:border-slate-600";
  };

  const getKondisiBadgeStatic = (kondisi) => {
    const s = {
      "Siap Digunakan": "bg-emerald-50 text-emerald-700 border-emerald-500",
      "Rusak": "bg-red-50 text-red-700 border-red-500",
      "Rusak Berat": "bg-rose-900 text-white border-rose-950",
      "Maintenance": "bg-amber-50 text-amber-700 border-amber-500",
      "Dijual": "bg-slate-100 text-slate-600 border-slate-500"
    };
    return s[kondisi] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const getDetailConditionBreakdown = (item) => {
    if (!item) return [];
    if (Array.isArray(item.units) && item.units.length > 0) {
      const counts = {};
      item.units.forEach((u) => {
        const k = u.kondisi || "Siap Digunakan";
        counts[k] = (counts[k] || 0) + 1;
      });
      const order = ["Siap Digunakan", "Maintenance", "Rusak", "Rusak Berat", "Dijual"];
      const result = [];
      order.forEach((k) => {
        if (counts[k]) {
          result.push({ kondisi: k, count: counts[k] });
          delete counts[k];
        }
      });
      Object.keys(counts).forEach((k) => {
        result.push({ kondisi: k, count: counts[k] });
      });
      return result;
    }
    const result = [];
    const ready = Number(item.readyUnitsCount ?? item.jumlah ?? 0);
    const rusak = Number(item.rusakUnitsCount || 0);
    const rusakBerat = Number(item.rusakBeratUnitsCount || 0);
    const maint = Number(item.maintenanceUnitsCount || 0);
    const total = Number(item.totalUnitsCount ?? item.jumlahTotal ?? item.jumlah ?? 1);

    if (ready > 0) result.push({ kondisi: "Siap Digunakan", count: ready });
    if (maint > 0) result.push({ kondisi: "Maintenance", count: maint });
    if (rusak > 0) result.push({ kondisi: "Rusak", count: rusak });
    if (rusakBerat > 0) result.push({ kondisi: "Rusak Berat", count: rusakBerat });

    if (result.length === 0) {
      result.push({ kondisi: item.kondisi || "Siap Digunakan", count: total });
    }
    return result;
  };

  const getTableKondisiInfo = (item) => {
    if (!item) {
      return {
        isMixed: false,
        text: "Siap Digunakan",
        lines: ["Siap Digunakan"],
        badgeClass: getKondisiBadge("Siap Digunakan"),
        title: "Klik untuk melihat & mengelola unit fisik",
      };
    }

    const breakdown = getDetailConditionBreakdown(item) || [];

    if (breakdown.length <= 1) {
      const k = breakdown[0]?.kondisi || item.kondisi || "Siap Digunakan";
      return {
        isMixed: false,
        text: k,
        lines: [k],
        badgeClass: getKondisiBadge(k),
        title: "Klik untuk melihat & mengelola unit fisik",
      };
    }

    const shortNames = {
      "Siap Digunakan": "SIAP",
      "Maintenance": "MAINT",
      "Rusak": "RUSAK",
      "Rusak Berat": "R.BERAT",
      "Dijual": "DIJUAL"
    };

    const getShort = (b) => {
      const name = b?.kondisi || "";
      return `${b?.count || 1} ${shortNames[name] || name.toUpperCase() || "UNIT"}`;
    };

    // Format maksimal 2 baris agar tidak pernah sampai 3 baris
    let lines = [];
    if (breakdown.length === 2) {
      lines = [getShort(breakdown[0]), getShort(breakdown[1])];
    } else {
      const firstLine = getShort(breakdown[0]);
      const secondLine = breakdown.slice(1).map(getShort).join(" • ");
      lines = [firstLine, secondLine];
    }

    const fullSummary = breakdown
      .map((b) => `${b?.count || 1} ${b?.kondisi || "Unit"}`)
      .join(", ");

    return {
      isMixed: true,
      text: lines.join(" • "),
      lines,
      badgeClass: "bg-amber-50 text-amber-700 border-amber-500 hover:bg-amber-600 hover:text-white hover:border-amber-600",
      title: `${fullSummary} (Klik untuk kelola unit)`,
    };
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
    <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 gap-3">
      <div className="hidden sm:flex items-center gap-3">
        <p className="text-sm text-slate-500 text-nowrap">Menampilkan {sorted.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + itemsPerPage, sorted.length)} dari <span className="font-semibold text-slate-700">{sorted.length}</span> data</p>
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
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm font-mono font-semibold text-slate-700">{data.kodeAset}</div>
            </div>
          )}
          <InputField label="Nama Aset" required placeholder="Masukkan nama aset" value={data.namaAset} onChange={(e) => setData(d => ({...d, namaAset: toUpperCaseText(e.target.value)}))} hint="Nama lengkap aset, contoh: &quot;Sony A7III Body Only&quot;" />
          <PengelolaAutocomplete value={data.pengguna} onChange={(e) => setData(d => ({...d, pengguna: e.target.value}))} allUsers={usersList} className={isEdit ? "sm:col-span-2" : ""} hint="Pilih pegawai yang bertanggung jawab atas aset ini" />
          
          <div className="flex gap-1.5 items-end">
             <SelectField label="Kategori" value={data.kategori} onChange={(e) => setData(d => ({...d, kategori: e.target.value}))} options={kategoriList} placeholder="Pilih Kategori" className="flex-1" hint="Jenis/klasifikasi aset" />
             <button type="button" onClick={() => setShowKatModal(true)} title="Tambah Kategori Baru" className="h-[38px] cursor-pointer rounded-lg bg-primary px-3 text-white transition-colors hover:bg-primary-hover mb-[2px]"><Plus className="h-4 w-4" /></button>
          </div>
          
          <div className="flex gap-1.5 items-end">
             <SelectField label="Merek" value={data.merek} onChange={(e) => setData(d => ({...d, merek: e.target.value}))} options={merekList} placeholder="Pilih Merek" className="flex-1" hint="Brand/produsen aset" />
             <button type="button" onClick={() => setShowMerekModal(true)} title="Tambah Merek Baru" className="h-[38px] cursor-pointer rounded-lg bg-primary px-3 text-white transition-colors hover:bg-primary-hover mb-[2px]"><Plus className="h-4 w-4" /></button>
          </div>

          <InputField label="Model" placeholder="Masukkan model" value={data.model} onChange={(e) => setData(d => ({...d, model: toUpperCaseText(e.target.value)}))} hint="Tipe/model spesifik dari aset" />
          <SelectField label="Jenis Brand" value={data.jenisAset} onChange={(e) => setData(d => ({...d, jenisAset: e.target.value}))} options={jenisAsetOptions} placeholder="Pilih Jenis Brand" hint="Departemen pemilik aset" />
          <InputField label="Jumlah" placeholder="Jumlah unit" type="number" value={data.jumlah} onChange={(e) => setData(d => ({...d, jumlah: e.target.value}))} hint="Jumlah unit aset yang tersedia" />
          <InputField label="Tanggal Pembelian" type="date" value={data.tanggalPembelian || ""} onChange={(e) => setData(d => ({...d, tanggalPembelian: e.target.value}))} hint="Tanggal pembelian/perolehan aset" />
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <InputField 
              label="Harga Aset (Rp)" 
              placeholder="Harga Aset" 
              type="text" 
              value={data.hargaAset ? Number(data.hargaAset).toLocaleString("id-ID") : ""} 
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, "");
                setData(d => ({ ...d, hargaAset: rawValue }));
              }} 
              hint={data.tipeHarga === "Per Paket" ? "Harga total 1 paket keseluruhan (isi semua unit)" : "Harga pembelian untuk setiap 1 unit"}
            />
            <SelectField 
              label="Tipe Perhitungan Harga" 
              value={data.tipeHarga || "Per Unit"} 
              onChange={(e) => setData(d => ({ ...d, tipeHarga: e.target.value }))} 
              options={tipeHargaOptions} 
              placeholder="Pilih Tipe Harga" 
              hint={
                data.tipeHarga === "Per Paket" 
                  ? `Paket: Total aset = Rp ${Number(data.hargaAset || 0).toLocaleString("id-ID")}. Saat dipinjam dihitung ~ Rp ${Math.round((Number(data.hargaAset) || 0) / (Number(data.jumlah) || 1)).toLocaleString("id-ID")}/unit.`
                  : `Unit: Total nilai aset = Rp ${((Number(data.hargaAset) || 0) * (Number(data.jumlah) || 1)).toLocaleString("id-ID")}.`
              }
            />
          </div>
          <InputField label="Serial Number" placeholder="Serial number" value={data.noSN} onChange={(e) => setData(d => ({...d, noSN: toUpperCaseText(e.target.value)}))} className="sm:col-span-2" hint="Nomor seri unik di badan aset" />
          <TextAreaField label="Spesifikasi" placeholder="Detail spesifikasi aset" value={data.spesifikasi} onChange={(e) => setData(d => ({...d, spesifikasi: toSentenceCase(e.target.value)}))} rows={3} className="sm:col-span-2" hint="Detail teknis seperti resolusi, kapasitas, dll" />

        </div>
      </div>
      <hr className="border-slate-200" />
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800 uppercase tracking-wide">
          <MapPin className="h-4 w-4 text-primary" />
          Lokasi Aset
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField label="Lokasi Aset" placeholder="Masukkan lokasi aset" value={data.lokasiAset} onChange={(e) => setData(d => ({...d, lokasiAset: toUpperCaseText(e.target.value)}))} hint="Tempat penyimpanan aset saat ini" />
          <SelectField label="Kondisi Aset" value={data.kondisi} onChange={(e) => setData(d => ({...d, kondisi: e.target.value}))} options={kondisiOptions} placeholder="Pilih Kondisi" hint="Status fisik aset saat ini" />
          <ImageUploadField onFileChange={onImageChange} previewUrl={imgPreview} onClear={onImageClear} />
          <TextAreaField label="Keterangan" placeholder="Keterangan tambahan" value={data.keterangan} onChange={(e) => setData(d => ({...d, keterangan: toSentenceCase(e.target.value)}))} className="sm:col-span-2" hint="Informasi tambahan mengenai aset" />
        </div>
      </div>
    </div>
  );

  // Loading
  if (loading) {
    return (
      <div>
        <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Daftar Aset</h1><p className="text-sm text-slate-500">Kelola data aset Galeria Karya Media</p></div>
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
        <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Daftar Aset</h1><p className="text-sm text-slate-500">Kelola data aset Galeria Karya Media</p></div>
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
      {mounted && typeof document !== 'undefined' && toast && createPortal(
        <div className={`fixed top-20 right-6 z-9999 flex items-center gap-2 rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-white transition-all animate-[slideIn_0.3s_ease] ${toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"}`}>
          {toast.type === "error" ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {toast.message}
        </div>,
        document.body
      )}

      {/* Lightbox */}
      {mounted && typeof document !== 'undefined' && lightboxImg && createPortal(
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 cursor-pointer transition-opacity animate-in fade-in duration-300" onClick={() => setLightboxImg(null)}>
          <div className="relative h-[85vh] w-[85vw] max-w-5xl animate-modal-in" onClick={(e) => e.stopPropagation()}>
            <button className="fixed top-6 right-1 z-110 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors" onClick={() => setLightboxImg(null)}>
              <X className="h-8 w-8" />
            </button>
            <Image src={lightboxImg} alt="Preview" fill unoptimized className="rounded-xl object-contain shadow-2xl cursor-default" />
          </div>
        </div>,
        document.body
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Daftar Aset</h1>
        <p className="text-sm text-slate-500">Kelola data aset Galeria Karya Media</p>
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
        
        {/* Total Harga Stats */}
        <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs text-slate-600 font-medium">Total Harga Aset</p>
              <p className="text-2xl font-bold text-slate-800">
                {formatRupiah(filteredData.reduce((sum, item) => {
                  const harga = parseInt(item.hargaAset) || 0;
                  const total = parseInt(item.totalUnitsCount ?? item.jumlahTotal ?? item.jumlah) || 1;
                  return sum + (item.tipeHarga === "Per Paket" ? harga : harga * total);
                }, 0))}
              </p>
            </div>
            <div className="text-xs text-slate-500">
              {brandFilter ? `Filter: ${brandFilter === "Galeria studio" ? "Galeria Studio" : "Galeria Production"}` : "Semua Brand"} • {filteredData.length} aset
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 border-b border-slate-300 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Cari nama aset..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full rounded-lg border-2 border-slate-200 py-2 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-text transition-colors hover:border-slate-300" />
            </div>
            <select
              value={kondisiFilter}
              onChange={(e) => { setKondisiFilter(e.target.value); setCurrentPage(1); }}
              className="w-full sm:w-36 rounded-lg border-2 border-slate-200 py-2 px-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors hover:border-slate-300 outline-none cursor-pointer"
            >
              <option value="">Semua Kondisi</option>
              {kondisiOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <select
              value={brandFilter}
              onChange={(e) => { setBrandFilter(e.target.value); setCurrentPage(1); }}
              className="w-full sm:w-40 rounded-lg border-2 border-slate-200 py-2 px-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors hover:border-slate-300 outline-none cursor-pointer"
            >
              <option value="">Semua Brand</option>
              <option value="Galeria studio">Galeria Studio</option>
              <option value="Galeria production">Galeria Production</option>
            </select>
          </div>
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 w-full sm:w-auto shrink-0">
            {/* Export Excel Button */}
            <button
              onClick={handleExportExcel}
              title="Export data ke file Excel"
              className="cursor-pointer w-full sm:w-auto flex justify-center items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 whitespace-nowrap"
            >
              <Download className="h-4 w-4" />
              Export Excel
            </button>

            {/* Import Excel Button */}
            {["super admin", "admin"].includes(userRole) && (
              <button
                onClick={() => { setImportFile(null); setImportData([]); setImportError(""); setShowImportModal(true); }}
                title="Import data massal dari file Excel"
                className="cursor-pointer w-full sm:w-auto flex justify-center items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 whitespace-nowrap"
              >
                <Upload className="h-4 w-4" />
                Import Excel
              </button>
            )}

            {/* Tambah Aset Button */}
            {["super admin", "admin"].includes(userRole) && (
              <button
                onClick={() => { setFormData(emptyForm); setImageFile(null); setImagePreview(null); setShowModal(true); }}
                className="cursor-pointer w-full sm:w-auto flex justify-center items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                Tambah Aset
              </button>
            )}

            {/* Hapus Seluruh Data - Khusus Super Admin */}
            {userRole === "super admin" && (
              <button
                type="button"
                onClick={() => {
                  setDeleteAllTarget("both");
                  setDeleteAllConfirmation("");
                  setShowDeleteAllModal(true);
                }}
                title="Khusus Super Admin: Hapus seluruh aset dan/atau aksesoris"
                className="cursor-pointer w-full sm:w-auto flex justify-center items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-rose-700 active:scale-95 whitespace-nowrap"
              >
                <Trash2 className="h-4 w-4" />
                Hapus Seluruh Data
              </button>
            )}
          </div>
        </div>

        {/* Table Controls (Pagination Top) & Table */}
        <Pagination />
        <div className="overflow-x-auto border-t border-slate-100">
          <table className="w-full text-left text-sm table-fixed">
            <thead>
              <tr className="border-t border-t-slate-300 border-b border-b-slate-300">
                <th className="w-[125px] px-2 py-3 font-bold text-slate-700 text-center text-xs border-r border-slate-200"><button onClick={() => handleSort("kodeAset")} className="cursor-pointer flex items-center justify-center uppercase tracking-wider w-full">Kode Aset <SortIcon columnKey="kodeAset" sortConfig={sortConfig} /></button></th>
                <th className="w-[100px] px-3 py-3 font-bold text-slate-700 text-center text-xs uppercase tracking-wider border-r border-slate-200">Gambar</th>
                <th className="w-[150px] px-4 py-3 font-bold text-slate-700 text-center text-xs border-r border-slate-200"><button onClick={() => handleSort("namaAset")} className="cursor-pointer flex items-center justify-center uppercase tracking-wider w-full">Nama Aset <SortIcon columnKey="namaAset" sortConfig={sortConfig} /></button></th>
                <th className="w-[140px] px-3 py-3 font-bold text-slate-700 text-center text-xs border-r border-slate-200"><button onClick={() => handleSort("noSN")} className="cursor-pointer flex items-center justify-center uppercase tracking-wider w-full">Serial Number <SortIcon columnKey="noSN" sortConfig={sortConfig} /></button></th>
                <th className="w-[110px] px-3 py-3 font-bold text-slate-700 text-center text-xs border-r border-slate-200"><button onClick={() => handleSort("jumlah")} className="cursor-pointer flex items-center justify-center uppercase tracking-wider w-full">Jumlah <SortIcon columnKey="jumlah" sortConfig={sortConfig} /></button></th>
                <th className="w-[110px] px-3 py-3 font-bold text-slate-700 text-center text-xs border-r border-slate-200"><button onClick={() => handleSort("kategori")} className="cursor-pointer flex items-center justify-center uppercase tracking-wider w-full">Kategori <SortIcon columnKey="kategori" sortConfig={sortConfig} /></button></th>
                <th className="w-[110px] px-3 py-3 font-bold text-slate-700 text-center text-xs border-r border-slate-200"><button onClick={() => handleSort("model")} className="cursor-pointer flex items-center justify-center uppercase tracking-wider w-full">Model <SortIcon columnKey="model" sortConfig={sortConfig} /></button></th>
                <th className="w-[130px] px-3 py-3 font-bold text-slate-700 text-center text-xs border-r border-slate-200"><button onClick={() => handleSort("hargaAset")} className="cursor-pointer flex items-center justify-center uppercase tracking-wider w-full">Harga <SortIcon columnKey="hargaAset" sortConfig={sortConfig} /></button></th>
                <th className="w-[150px] px-2 py-3 font-bold text-slate-700 text-center text-xs uppercase tracking-wider border-r border-slate-200">Kondisi</th>
                {!["user", "guest"].includes(userRole) && (
                  <th className="w-[100px] px-3 py-3 font-bold text-slate-700 text-center text-xs uppercase tracking-wider">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={item.id} className={`border-b border-slate-100 transition-colors ${index % 2 === 0 ? "bg-slate-100" : "bg-white"}`}>
                  <td className="w-[125px] px-2 py-3 font-mono text-xs font-semibold text-slate-700 hover:text-primary cursor-pointer truncate border-r border-slate-200 align-middle text-center" onClick={() => setShowDetail(item)} title={item.kodeAset}>{item.kodeAset}</td>
                  <td className="w-[100px] px-3 py-3 text-center border-r border-slate-200" style={{verticalAlign: 'middle'}}>
                    {item.gambar ? (
                      <div className="inline-block h-12 w-12 relative cursor-pointer hover:ring-2 hover:ring-primary transition-all rounded-md overflow-hidden" onClick={() => setLightboxImg(getImageUrl(item.gambar))}>
                        <Image src={getImageUrl(item.gambar)} alt="" fill unoptimized className="object-cover border border-slate-200" />
                      </div>
                    ) : (
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 text-slate-300">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}
                  </td>
                  <td className="w-[150px] px-4 py-3 text-xs text-slate-600 hover:text-primary cursor-pointer truncate border-r border-slate-200 align-middle" onClick={() => setShowDetail(item)}>{item.namaAset}</td>
                  <td className="w-[140px] px-3 py-3 text-xs text-slate-600 truncate border-r border-slate-200 align-middle">{item.noSN || "-"}</td>
                  <td className="w-[110px] px-3 py-3 text-xs border-r border-slate-200 align-middle">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-emerald-600">{item.readyUnitsCount ?? item.jumlah ?? "-"} Tersisa</span>
                      <span className="text-slate-500 text-[11px]">dari {item.totalUnitsCount ?? item.jumlahTotal ?? item.jumlah ?? "-"} Unit</span>
                    </div>
                  </td>
                  <td className="w-[110px] px-3 py-3 text-xs text-slate-600 truncate border-r border-slate-200 align-middle">{item.kategori}</td>
                  <td className="w-[110px] px-3 py-3 text-xs text-slate-600 truncate border-r border-slate-200 align-middle">{item.model}</td>
                  <td className="w-[130px] px-3 py-3 text-right text-xs font-semibold text-slate-700 border-r border-slate-200 align-middle">
                    <div>{formatRupiah(item.hargaAset)}</div>
                    <div className="text-[10px] font-normal text-slate-400">
                      {item.tipeHarga === "Per Paket" ? "Per Paket" : "Per Unit"}
                    </div>
                  </td>
                  <td className="w-[150px] px-2 py-2 text-center border-r border-slate-200 align-middle">
                    {(() => {
                      const info = getTableKondisiInfo(item);
                      if (!info.isMixed) {
                        return (
                          <span
                            onClick={() => openUnitsModal(item)}
                            className={`cursor-pointer block w-full rounded-full border py-1 px-1.5 text-[11px] sm:text-xs text-center font-semibold tracking-wide uppercase transition-all shadow-xs whitespace-nowrap ${info.badgeClass}`}
                            title={info.title}
                          >
                            {info.text || info.lines?.[0] || item.kondisi || "Siap Digunakan"}
                          </span>
                        );
                      }
                      return (
                        <div
                          onClick={() => openUnitsModal(item)}
                          className={`cursor-pointer flex flex-col items-center justify-center w-full rounded-xl border py-1 px-1.5 text-[10px] sm:text-[11px] text-center font-semibold tracking-wide uppercase transition-all shadow-xs leading-snug gap-0.5 ${info.badgeClass}`}
                          title={info.title}
                        >
                          <span className="whitespace-nowrap">{info.lines?.[0] || ""}</span>
                          {info.lines?.[1] && (
                            <span className="whitespace-nowrap text-[10px] opacity-90">{info.lines[1]}</span>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  {!["user", "guest"].includes(userRole) && (
                    <td className="w-[100px] px-3 py-3 align-middle">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setShowDetail(item)} className="cursor-pointer rounded-lg bg-blue-100 p-1 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white" title="Detail"><Info className="h-3.5 w-3.5" /></button>
                        {["super admin", "admin"].includes(userRole) && (
                          <>
                            <button onClick={() => openEdit(item)} className="cursor-pointer rounded-lg bg-amber-100 p-1 text-amber-600 transition-colors hover:bg-amber-600 hover:text-white" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                            <button onClick={() => setShowDeleteConfirm(item)} className="cursor-pointer rounded-lg bg-rose-100 p-1 text-rose-600 transition-colors hover:bg-rose-600 hover:text-white" title="Hapus"><Trash2 className="h-3.5 w-3.5" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {assets.length === 0 && (<tr><td colSpan={["user", "guest"].includes(userRole) ? 9 : 10} className="px-5 py-10 text-center text-slate-400">Tidak ada data aset ditemukan.</td></tr>)}
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

          {/* Modal Import Excel */}
          {showImportModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => !importLoading && setShowImportModal(false)}>
              <div className="max-h-[90vh] w-full max-w-4xl flex flex-col rounded-2xl bg-white shadow-xl border-t-4 border-t-emerald-600 animate-modal-in" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-50 px-6 py-4 rounded-t-2xl shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-emerald-950">Import Data Aset dari Excel</h2>
                      <p className="text-xs text-emerald-700">Unggah file Excel (.xlsx / .xls) untuk menambahkan data aset secara massal</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={importLoading}
                    onClick={() => setShowImportModal(false)}
                    className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                  {/* Panduan & Tombol Download Template */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-700">💡 Petunjuk Pengisian Excel:</p>
                      <ul className="text-xs text-slate-500 list-disc list-inside space-y-0.5">
                        <li>Kode aset akan dibuat <strong>otomatis</strong> oleh sistem secara berurutan.</li>
                        <li>Kolom <strong>Nama Aset</strong> wajib diisi. Kategori, merek, dan kolom lainnya jika kosong di Excel akan dikosongkan.</li>
                        <li>Gambar aset otomatis bernilai kosong dan dapat dilengkapi nanti melalui menu edit.</li>
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={downloadAssetTemplate}
                      className="cursor-pointer shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-medium rounded-lg shadow-sm transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download Format Excel
                    </button>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={importFileInputRef}
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileImportChange}
                    className="hidden"
                  />

                  {/* Upload Box jika belum ada file (Mendukung Click Upload & Drag and Drop) */}
                  {!importFile ? (
                    <div
                      onClick={() => importFileInputRef.current?.click()}
                      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setImportDragging(true); }}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setImportDragging(true); }}
                      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setImportDragging(false); }}
                      onDrop={handleImportDrop}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all group ${
                        importDragging
                          ? "border-emerald-500 bg-emerald-50/70 scale-[1.01] ring-4 ring-emerald-100"
                          : "border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30"
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border transition-all ${
                        importDragging
                          ? "bg-emerald-600 text-white scale-110 border-emerald-600 animate-bounce"
                          : "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:scale-110"
                      }`}>
                        <Upload className="w-7 h-7" />
                      </div>
                      <p className="text-sm font-bold text-slate-800 mb-1">
                        {importDragging ? "Lepaskan file Excel di sini..." : "Pilih atau Geser (Drag & Drop) File Excel ke Sini"}
                      </p>
                      <p className="text-xs text-slate-400">
                        Klik untuk mencari file atau seret file (.xlsx / .xls) langsung ke area ini
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* File Info Bar */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/70 border border-emerald-200">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                          <span className="text-sm font-semibold text-slate-800">{importFile.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 font-bold">
                            {importData.length} baris terdeteksi
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => importFileInputRef.current?.click()}
                          className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
                        >
                          Ganti File
                        </button>
                      </div>

                      {/* Preview Table */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tabel Preview Data:</h4>
                          <span className="text-xs text-slate-500">
                            Valid: <strong className="text-emerald-600">{importData.filter(d => d.isValid).length}</strong> / Total: {importData.length} baris
                          </span>
                        </div>
                        <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto overflow-x-auto custom-scrollbar">
                          <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-slate-100 sticky top-0 border-b border-slate-200 text-slate-700 font-bold z-10">
                              <tr>
                                <th className="px-3 py-2 text-center w-10">No</th>
                                <th className="px-3 py-2">Nama Aset</th>
                                <th className="px-3 py-2">Jenis Brand</th>
                                <th className="px-3 py-2">Kategori</th>
                                <th className="px-3 py-2">Merek</th>
                                <th className="px-3 py-2">Model</th>
                                <th className="px-3 py-2 text-center">Jumlah</th>
                                <th className="px-3 py-2 text-right">Harga</th>
                                <th className="px-3 py-2 text-center">Tipe</th>
                                <th className="px-3 py-2">Kondisi</th>
                                <th className="px-3 py-2">Lokasi</th>
                                <th className="px-3 py-2">Pengelola</th>
                                <th className="px-3 py-2 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {importData.map((row, idx) => (
                                <tr key={idx} className={!row.isValid ? "bg-rose-50" : idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                  <td className="px-3 py-2 text-center text-slate-500 font-mono">{idx + 1}</td>
                                  <td className="px-3 py-2 font-semibold text-slate-800">{row.namaAset || <span className="text-rose-500 italic">Nama Kosong (Wajib)</span>}</td>
                                  <td className="px-3 py-2 text-slate-600">{row.jenisAset}</td>
                                  <td className="px-3 py-2 text-slate-600">{row.kategori || "-"}</td>
                                  <td className="px-3 py-2 text-slate-600">{row.merek || "-"}</td>
                                  <td className="px-3 py-2 text-slate-600">{row.model || "-"}</td>
                                  <td className="px-3 py-2 text-center font-bold text-slate-700">{row.jumlah}</td>
                                  <td className="px-3 py-2 text-right text-slate-700 font-mono">{formatRupiah(row.hargaAset)}</td>
                                  <td className="px-3 py-2 text-center text-xs">
                                    <span className={`px-2 py-0.5 rounded-full font-medium ${row.tipeHarga === "Per Paket" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"}`}>
                                      {row.tipeHarga}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-slate-600">{row.kondisi}</td>
                                  <td className="px-3 py-2 text-slate-600">{row.lokasiAset || "-"}</td>
                                  <td className="px-3 py-2 text-slate-600">{row.pengguna || "-"}</td>
                                  <td className="px-3 py-2 text-center">
                                    {row.isValid ? (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                        Siap Simpan
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                                        Nama Wajib
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {importError && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{importError}</span>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-white rounded-b-2xl shrink-0">
                  <button
                    type="button"
                    disabled={importLoading}
                    onClick={() => setShowImportModal(false)}
                    className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    disabled={importLoading || !importFile || importData.filter(d => d.isValid).length === 0}
                    onClick={handleConfirmImport}
                    className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Mengimpor Data...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Simpan {importData.filter(d => d.isValid).length > 0 ? `${importData.filter(d => d.isValid).length} Aset` : "Data"}
                      </>
                    )}
                  </button>
                </div>
              </div>
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
                    <h4 className="mb-4 text-sm font-bold text-slate-800">Daftar Inventori</h4>
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                      {[
                        ["Kode Aset", showDetail.kodeAset],
                        ["Nama Aset", showDetail.namaAset],
                        ["Pengelola", showDetail.pengguna],
                        ["Kategori", showDetail.kategori],
                        ["Merek", showDetail.merek],
                        ["Model", showDetail.model],
                        ["Jenis Brand", showDetail.jenisAset],
                        ["Jumlah", `${showDetail.jumlah ?? "-"} Tersisa dari Total ${showDetail.jumlahTotal ?? showDetail.jumlah ?? "-"}`],
                        ["Harga Aset", `${formatRupiah(showDetail.hargaAset)} (${showDetail.tipeHarga || "Per Unit"}${showDetail.tipeHarga === "Per Paket" && (showDetail.jumlahTotal || showDetail.jumlah) > 0 ? ` ~ ${formatRupiah(Math.round(showDetail.hargaAset / (showDetail.jumlahTotal || showDetail.jumlah)))} / unit` : ""})`],
                        ["Tanggal Pembelian", showDetail.tanggalPembelian ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(showDetail.tanggalPembelian)) : "-"],
                        ["Serial Number", showDetail.noSN],
                        ["Spesifikasi", showDetail.spesifikasi]
                      ].map(([l, v]) => (
                        <div key={l} className="flex flex-col gap-1.5">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{l}</span>
                          <span className="text-sm font-medium text-slate-800">{v || "-"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <hr className="border-slate-300" />
                  <div>
                    <h4 className="mb-4 text-sm font-bold text-slate-800">Lokasi & Kondisi Aset</h4>
                    <div className="grid grid-cols-1 gap-4 md:gap-5">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lokasi</span>
                        <span className="text-sm font-medium text-slate-800 break-words">{showDetail.lokasiAset || "-"}</span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Kondisi</span>
                        <div className="flex flex-wrap items-center gap-2">
                          {getDetailConditionBreakdown(showDetail).map((b, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold tracking-wide uppercase shadow-xs ${getKondisiBadgeStatic(b.kondisi)}`}
                            >
                              {b.count} {b.kondisi}
                            </span>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const target = showDetail;
                              setShowDetail(null);
                              openUnitsModal(target);
                            }}
                            className="cursor-pointer inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline ml-1"
                          >
                            <Layers className="h-3.5 w-3.5" />
                            Kelola Unit Fisik ({showDetail.totalUnitsCount ?? showDetail.jumlah ?? 1} unit)
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Keterangan</span>
                        <span className="text-sm font-medium text-slate-800 break-words">{showDetail.keterangan || "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end border-t border-slate-100 px-6 py-4 gap-3 bg-white rounded-b-2xl shrink-0">
                  {["super admin", "admin"].includes(userRole) && (
                    <button onClick={() => {openEdit(showDetail); setShowDetail(null);}} className="cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 shadow-sm">Edit Aset</button>
                  )}
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

          {/* Alert Popup: Delete Aset Diblokir */}
          {deleteBlockedAlert && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setDeleteBlockedAlert(null)}>
              <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border-t-4 border-t-amber-500 flex flex-col max-h-[90vh] animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col items-center text-center mb-5">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                      <AlertTriangle className="h-7 w-7 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Tidak Dapat Dihapus</h3>
                    <p className="text-sm text-slate-500">{deleteBlockedAlert.message}</p>
                  </div>
                  {deleteBlockedAlert.activePeminjaman?.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-amber-200 bg-amber-100">
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Peminjaman Aktif ({deleteBlockedAlert.activePeminjaman.length})</p>
                      </div>
                      <div className="divide-y divide-amber-100">
                        {deleteBlockedAlert.activePeminjaman.map((p, i) => (
                          <div key={i} className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                            <div>
                              <p className="text-xs text-amber-600 font-medium">Kode Peminjaman</p>
                              <p className="text-sm font-semibold text-slate-800">{p.kode_pinjam}</p>
                            </div>
                            <div>
                              <p className="text-xs text-amber-600 font-medium">Tanggal Pinjam</p>
                              <p className="text-sm font-semibold text-slate-800">
                                {p.tanggal_peminjaman ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(p.tanggal_peminjaman)) : "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-amber-600 font-medium">Keperluan</p>
                              <p className="text-sm font-semibold text-slate-800">{p.alasan_peminjaman || "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-amber-600 font-medium">Total Aset</p>
                              <p className="text-sm font-semibold text-slate-800">{p.total_aset} item</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center border-t border-slate-100 px-6 py-4 shrink-0">
                  <button onClick={() => setDeleteBlockedAlert(null)} className="cursor-pointer rounded-lg bg-amber-500 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-600">OK</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Kategori */}
          {showKatModal && (() => {
            const inputNama = toUpperCaseText(newKatData.nama.trim());
            const inputKode = toUpperCaseText(newKatData.kode_singkat.trim());
            const duplicateKat = inputNama ? rawCategories.find(c => (c.nama || "").trim().toUpperCase() === inputNama) : null;
            const duplicateKode = inputKode ? rawCategories.find(c => (c.kode_singkat || "").trim().toUpperCase() === inputKode) : null;

            return (
              <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowKatModal(false)}>
                <form onSubmit={handleCreateKat} className="w-full max-w-sm rounded-2xl bg-white shadow-xl border-t-4 border-t-emerald-500 animate-modal-in" onClick={(e) => e.stopPropagation()}>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Tambah Kategori Baru</h3>
                    <div className="space-y-4">
                      <InputField label="Nama Kategori" required placeholder="Contoh: KAMERA" value={newKatData.nama} onChange={(e) => setNewKatData(d => ({...d, nama: toUpperCaseText(e.target.value)}))} />
                      <InputField label="Kode Singkat" required placeholder="Contoh: CAM" value={newKatData.kode_singkat} onChange={(e) => {
                        const val = toUpperCaseText(e.target.value.replace(/[^a-zA-Z0-9]/g, ""));
                        setNewKatData(d => ({...d, kode_singkat: val}));
                      }} />

                      {/* Alert jika sudah ada di dropdown */}
                      {duplicateKat && (
                        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 animate-in fade-in">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-bold text-amber-800">Kategori sudah ada di dropdown!</p>
                              <p className="mt-0.5 text-amber-700">Kategori <strong>"{duplicateKat.nama}"</strong> sudah tersedia dalam pilihan dropdown.</p>
                              <button
                                type="button"
                                onClick={() => applyExistingKat(duplicateKat.nama)}
                                className="mt-2 inline-flex items-center gap-1 cursor-pointer rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 transition-colors"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Gunakan Kategori Ini
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {!duplicateKat && duplicateKode && (
                        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 animate-in fade-in">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-bold text-amber-800">Kode Singkat sudah digunakan!</p>
                              <p className="mt-0.5 text-amber-700">Kode <strong>"{duplicateKode.kode_singkat}"</strong> sudah dipakai oleh kategori <strong>"{duplicateKode.nama}"</strong>.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
                    <button type="button" onClick={() => setShowKatModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Batal</button>
                    <button type="submit" disabled={submitting || !!duplicateKat || !!duplicateKode} className="cursor-pointer rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed">Simpan</button>
                  </div>
                </form>
              </div>
            );
          })()}

          {/* Modal Merek */}
          {showMerekModal && (() => {
            const inputNama = toUpperCaseText(newMerekData.nama.trim());
            const duplicateMerek = inputNama ? merekList.find(m => (m || "").trim().toUpperCase() === inputNama) : null;

            return (
              <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowMerekModal(false)}>
                <form onSubmit={handleCreateMerek} className="w-full max-w-sm rounded-2xl bg-white shadow-xl border-t-4 border-t-emerald-500 animate-modal-in" onClick={(e) => e.stopPropagation()}>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Tambah Merek Baru</h3>
                    <div className="space-y-4">
                      <InputField label="Nama Merek" required placeholder="Contoh: SONY" value={newMerekData.nama} onChange={(e) => setNewMerekData(d => ({...d, nama: toUpperCaseText(e.target.value)}))} />

                      {/* Alert jika sudah ada di dropdown */}
                      {duplicateMerek && (
                        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 animate-in fade-in">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-bold text-amber-800">Merek sudah ada di dropdown!</p>
                              <p className="mt-0.5 text-amber-700">Merek <strong>"{duplicateMerek}"</strong> sudah tersedia dalam pilihan dropdown.</p>
                              <button
                                type="button"
                                onClick={() => applyExistingMerek(duplicateMerek)}
                                className="mt-2 inline-flex items-center gap-1 cursor-pointer rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 transition-colors"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Gunakan Merek Ini
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
                    <button type="button" onClick={() => setShowMerekModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Batal</button>
                    <button type="submit" disabled={submitting || !!duplicateMerek} className="cursor-pointer rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed">Simpan</button>
                  </div>
                </form>
              </div>
            );
          })()}

          {/* Modal Update Kondisi */}
          {showKondisiModal && (() => {
            const currentQty = parseInt(showKondisiModal.jumlah, 10) || 1;
            const canSplit = currentQty > 1;

            return (
              <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowKondisiModal(null)}>
                <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border-t-4 border-t-blue-500 animate-modal-in overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">Ubah Kondisi Aset</h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{showKondisiModal.kodeAset}</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        {currentQty} Unit
                      </span>
                    </div>

                    <div className="p-3 mb-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <p className="text-sm font-semibold text-slate-800 truncate">{showKondisiModal.namaAset}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                        <span>Kondisi saat ini:</span>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase ${getKondisiBadge(showKondisiModal.kondisi)}`}>
                          {showKondisiModal.kondisi}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Kondisi Baru <span className="text-rose-500">*</span>
                        </label>
                        <SelectField
                          label=""
                          value={newKondisi}
                          onChange={(e) => setNewKondisi(e.target.value)}
                          options={kondisiOptions}
                          placeholder="Pilih Kondisi Baru"
                        />
                      </div>

                      {canSplit && (
                        <div className="pt-2 border-t border-slate-100">
                          <label className="block text-xs font-semibold text-slate-700 mb-2">Cakupan Unit</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setIsSplitKondisi(false)}
                              className={`cursor-pointer px-3 py-2.5 rounded-xl border text-left transition-all ${
                                !isSplitKondisi
                                  ? "border-blue-500 bg-blue-50/50 text-blue-700 font-semibold shadow-xs"
                                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <div className="text-xs font-bold">Semua Unit</div>
                              <div className="text-[11px] opacity-75 mt-0.5">Ubah ke-{currentQty} unit</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsSplitKondisi(true);
                                if (!jumlahSplit || jumlahSplit >= currentQty) setJumlahSplit(1);
                              }}
                              className={`cursor-pointer px-3 py-2.5 rounded-xl border text-left transition-all ${
                                isSplitKondisi
                                  ? "border-blue-500 bg-blue-50/50 text-blue-700 font-semibold shadow-xs"
                                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 text-xs font-bold">
                                <Split className="h-3.5 w-3.5" />
                                Sebagian (Split)
                              </div>
                              <div className="text-[11px] opacity-75 mt-0.5">Pecah unit rusak/servis</div>
                            </button>
                          </div>

                          {isSplitKondisi && (
                            <div className="mt-3.5 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 animate-in fade-in">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-xs font-semibold text-amber-950">
                                    Jumlah Unit Yang Diubah:
                                  </label>
                                  <span className="text-[11px] text-amber-800 font-bold">
                                    Maks {currentQty - 1} unit
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="1"
                                    max={currentQty - 1}
                                    value={jumlahSplit}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value, 10);
                                      if (isNaN(val)) setJumlahSplit("");
                                      else setJumlahSplit(Math.max(1, Math.min(val, currentQty - 1)));
                                    }}
                                    className="w-24 px-3 py-1.5 text-sm font-bold text-center bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                                  />
                                  <span className="text-xs text-amber-900 font-medium">
                                    unit menjadi <strong>{newKondisi || "..."}</strong>
                                  </span>
                                </div>
                                <p className="text-[11px] text-amber-800 mt-1.5">
                                  ℹ️ Sisa <strong>{currentQty - (parseInt(jumlahSplit, 10) || 1)} unit</strong> tetap berkondisi <strong>{showKondisiModal.kondisi}</strong>.
                                </p>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-amber-950 mb-1">
                                  Catatan Unit / Kerusakan (Opsional):
                                </label>
                                <input
                                  type="text"
                                  value={keteranganKondisi}
                                  onChange={(e) => setKeteranganKondisi(e.target.value)}
                                  placeholder="Contoh: Kabinet A4 & A6 rusak modul LED..."
                                  className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                    <button
                      type="button"
                      onClick={() => setShowKondisiModal(null)}
                      className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdateKondisi}
                      disabled={submitting || !newKondisi}
                      className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Memproses..." : isSplitKondisi ? "Pisahkan & Simpan" : "Update Kondisi"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
          {/* Modal Hapus Seluruh Data (Khusus Super Admin) */}
          {showDeleteAllModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-300" onClick={() => setShowDeleteAllModal(false)}>
              <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border-t-4 border-t-rose-600 animate-modal-in overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2.5 rounded-full bg-rose-100 text-rose-600">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-800">Hapus Seluruh Data</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-rose-100 text-rose-700">
                          Super Admin
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Tindakan pembersihan massal (Wipe Data)</p>
                    </div>
                  </div>

                  <div className="p-3.5 mb-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs leading-relaxed space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-rose-700">
                      ⚠️ PERINGATAN KERAS: TINDAKAN INI PERMANEN!
                    </p>
                    <p>
                      Semua data inventaris yang dipilih beserta berkas foto yang tersimpan di server akan <strong>dihapus secara permanen</strong> dan <strong>tidak dapat dipulihkan</strong>.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Pilih Data yang Ingin Dihapus:</label>
                      <div className="grid grid-cols-1 gap-2">
                        <label className={`cursor-pointer flex items-center gap-3 p-3 rounded-xl border transition-all ${deleteAllTarget === "both" ? "border-rose-500 bg-rose-50/50 text-rose-900 font-semibold" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                          <input
                            type="radio"
                            name="deleteTarget"
                            value="both"
                            checked={deleteAllTarget === "both"}
                            onChange={(e) => setDeleteAllTarget(e.target.value)}
                            className="text-rose-600 focus:ring-rose-500"
                          />
                          <div>
                            <div className="text-xs font-bold">Seluruh Aset & Aksesoris</div>
                            <div className="text-[11px] opacity-75">Kosongkan semua data inventaris aset dan aksesoris</div>
                          </div>
                        </label>

                        <label className={`cursor-pointer flex items-center gap-3 p-3 rounded-xl border transition-all ${deleteAllTarget === "assets" ? "border-rose-500 bg-rose-50/50 text-rose-900 font-semibold" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                          <input
                            type="radio"
                            name="deleteTarget"
                            value="assets"
                            checked={deleteAllTarget === "assets"}
                            onChange={(e) => setDeleteAllTarget(e.target.value)}
                            className="text-rose-600 focus:ring-rose-500"
                          />
                          <div>
                            <div className="text-xs font-bold">Hanya Seluruh Aset</div>
                            <div className="text-[11px] opacity-75">Hanya menghapus data pada tabel Daftar Aset</div>
                          </div>
                        </label>

                        <label className={`cursor-pointer flex items-center gap-3 p-3 rounded-xl border transition-all ${deleteAllTarget === "accessories" ? "border-rose-500 bg-rose-50/50 text-rose-900 font-semibold" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                          <input
                            type="radio"
                            name="deleteTarget"
                            value="accessories"
                            checked={deleteAllTarget === "accessories"}
                            onChange={(e) => setDeleteAllTarget(e.target.value)}
                            className="text-rose-600 focus:ring-rose-500"
                          />
                          <div>
                            <div className="text-xs font-bold">Hanya Seluruh Aksesoris</div>
                            <div className="text-[11px] opacity-75">Hanya menghapus data pada tabel Aksesoris</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Ketik <span className="font-mono text-rose-600 font-bold bg-rose-50 px-1 py-0.5 rounded border border-rose-200">HAPUS SEMUA</span> untuk konfirmasi:
                      </label>
                      <input
                        type="text"
                        value={deleteAllConfirmation}
                        onChange={(e) => setDeleteAllConfirmation(e.target.value)}
                        placeholder="Ketik HAPUS SEMUA di sini..."
                        className="w-full px-3.5 py-2 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-mono tracking-wide text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setShowDeleteAllModal(false)}
                    disabled={deleteAllLoading}
                    className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAll}
                    disabled={deleteAllLoading || deleteAllConfirmation.trim() !== "HAPUS SEMUA"}
                    className="cursor-pointer rounded-lg bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {deleteAllLoading ? "Menghapus..." : "Konfirmasi Hapus Permanen"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Kelola Unit Fisik (Option 3) */}
          {showUnitsModal && (
            <div
              className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
              onClick={() => setShowUnitsModal(null)}
            >
              <div
                className="max-h-[90vh] w-full max-w-4xl flex flex-col rounded-2xl bg-white shadow-2xl border-t-4 border-t-blue-600 animate-modal-in overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-blue-50/70 px-6 py-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                      <Layers className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900">Kelola Unit Fisik</h2>
                        <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                          {showUnitsModal.kodeAset}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        {showUnitsModal.namaAset} • {showUnitsModal.kategori || "Aset"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUnitsModal(null)}
                    className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Subheader / Summary Stats */}
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-xs">
                      Total: {assetUnitsList.length} Unit
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-xs">
                      Siap: {assetUnitsList.filter((u) => u.kondisi === "Siap Digunakan").length} Unit
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 border border-rose-200 text-rose-800 shadow-xs">
                      Rusak: {assetUnitsList.filter((u) => u.kondisi === "Rusak" || u.kondisi === "Rusak Berat").length} Unit
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 border border-amber-200 text-amber-800 shadow-xs">
                      Maintenance: {assetUnitsList.filter((u) => u.kondisi === "Maintenance").length} Unit
                    </span>
                  </div>

                  {["super admin", "admin"].includes(userRole) && (
                    <button
                      type="button"
                      onClick={() => setShowAddUnitForm((v) => !v)}
                      className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-xs transition-colors hover:bg-blue-700 active:scale-95"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {showAddUnitForm ? "Tutup Form Tambah" : "Tambah Unit Baru"}
                    </button>
                  )}
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                  {/* Form Tambah Unit Baru (Collapsible) */}
                  {showAddUnitForm && (
                    <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                          Form Tambah Unit Fisik Baru
                        </h4>
                        <span className="text-[11px] text-blue-600">Kode unit dibuat otomatis</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nama Unit (Opsional)</label>
                          <input
                            type="text"
                            placeholder="Contoh: Kabinet A7"
                            value={newUnitData.nama_unit}
                            onChange={(e) => setNewUnitData((d) => ({ ...d, nama_unit: e.target.value }))}
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kondisi Awal</label>
                          <select
                            value={newUnitData.kondisi}
                            onChange={(e) => setNewUnitData((d) => ({ ...d, kondisi: e.target.value }))}
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium"
                          >
                            {kondisiOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Lokasi Unit</label>
                          <input
                            type="text"
                            placeholder="Lokasi spesifik"
                            value={newUnitData.lokasi_unit}
                            onChange={(e) => setNewUnitData((d) => ({ ...d, lokasi_unit: e.target.value }))}
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddUnitForm(false)}
                          className="cursor-pointer px-3 py-1.5 text-xs font-medium text-slate-600 rounded-lg hover:bg-slate-100"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={handleCreateNewUnit}
                          className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {submitting ? "Menyimpan..." : "Simpan Unit Baru"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Unit List Table */}
                  {loadingUnits ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      <p className="text-xs">Memuat daftar unit fisik...</p>
                    </div>
                  ) : assetUnitsList.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                      <p className="text-sm font-medium">Belum ada unit fisik yang terdaftar untuk aset ini.</p>
                      <p className="text-xs mt-1 text-slate-400">Klik "Tambah Unit Baru" di atas untuk menambahkan unit fisik.</p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2.5 w-36">Kode Unit</th>
                            <th className="px-3 py-2.5">Nama / Label Unit</th>
                            <th className="px-3 py-2.5 w-28">Lokasi</th>
                            <th className="px-3 py-2.5 text-center w-28">Status Pinjam</th>
                            <th className="px-3 py-2.5 text-center w-48">Kondisi Fisik</th>
                            {["super admin", "admin"].includes(userRole) && (
                              <th className="px-3 py-2.5 text-center w-16">Aksi</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {assetUnitsList.map((unit, idx) => {
                            return (
                              <tr
                                key={unit.id}
                                className={`transition-colors ${
                                  unit.kondisi === "Rusak" || unit.kondisi === "Rusak Berat"
                                    ? "bg-rose-50/40"
                                    : unit.kondisi === "Maintenance"
                                    ? "bg-amber-50/30"
                                    : idx % 2 === 0
                                    ? "bg-white"
                                    : "bg-slate-50/40"
                                }`}
                              >
                                <td className="px-3 py-2.5 font-mono font-bold text-slate-800">
                                  {unit.kode_unit}
                                </td>
                                <td className="px-3 py-2.5 font-medium text-slate-800">
                                  {unit.nama_unit || <span className="text-slate-400 italic">-</span>}
                                </td>
                                <td className="px-3 py-2.5 text-slate-600">
                                  {unit.lokasi_unit || <span className="text-slate-400 italic">-</span>}
                                </td>
                                <td className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-700">
                                  {unit.status_pinjam || "Tersedia"}
                                </td>
                                <td className="px-3 py-2.5 text-center">
                                  <select
                                    value={unit.kondisi}
                                    disabled={!["super admin", "admin"].includes(userRole)}
                                    onChange={(e) => handleUnitKondisiChange(unit.id, e.target.value)}
                                    className={`w-full text-center px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer focus:outline-none ${
                                      unit.kondisi === "Siap Digunakan"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                                        : unit.kondisi === "Rusak" || unit.kondisi === "Rusak Berat"
                                        ? "bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100"
                                        : unit.kondisi === "Maintenance"
                                        ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                                        : "bg-slate-100 text-slate-700 border-slate-300"
                                    }`}
                                    title="Ubah kondisi unit fisik ini"
                                  >
                                    {kondisiOptions.map((opt) => (
                                      <option key={opt} value={opt} className="bg-white text-slate-800 normal-case">
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                {["super admin", "admin"].includes(userRole) && (
                                  <td className="px-3 py-2.5 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteUnit(unit)}
                                      className="cursor-pointer rounded-lg bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                                      title="Hapus Unit"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/70 gap-3 shrink-0">
                  <span className="text-[11px] text-slate-500">
                    💡 Perubahan kondisi unit fisik langsung memperbarui jumlah stok siap pakai pada daftar aset utama.
                  </span>
                  <div className="flex items-center gap-3">
                    {["super admin", "admin"].includes(userRole) && (
                      <button
                        type="button"
                        onClick={() => {
                          const target = showUnitsModal;
                          setShowUnitsModal(null);
                          openEdit(target);
                        }}
                        className="cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 shadow-sm"
                      >
                        Edit Aset
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowUnitsModal(null)}
                      className="cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 shadow-sm"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Konfirmasi Hapus Unit Fisik (UI Alert) */}
          {unitDeleteConfirm && (
            <div
              className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
              onClick={() => !deletingUnit && setUnitDeleteConfirm(null)}
            >
              <div
                className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border-t-4 border-t-rose-600 animate-modal-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mx-auto">
                  <Trash2 className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-center text-lg font-bold text-slate-800">Hapus Unit Fisik?</h3>
                <p className="mb-4 text-center text-sm text-slate-500">
                  Apakah Anda yakin ingin menghapus unit <strong className="text-slate-800 font-mono">{unitDeleteConfirm.kode_unit}</strong>
                  {unitDeleteConfirm.nama_unit ? ` (${unitDeleteConfirm.nama_unit})` : ""}?
                </p>
                <div className="mb-5 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 text-center">
                  ⚠️ Penghapusan unit fisik ini akan otomatis mengurangi total jumlah unit dan stok aset ini.
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={deletingUnit}
                    onClick={() => setUnitDeleteConfirm(null)}
                    className="cursor-pointer flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={deletingUnit}
                    onClick={handleConfirmDeleteUnit}
                    className="cursor-pointer flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-700 disabled:opacity-60"
                  >
                    {deletingUnit ? "Menghapus..." : "Hapus Unit"}
                  </button>
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
