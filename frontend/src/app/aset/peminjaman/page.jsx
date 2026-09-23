"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import Image from "next/image";
import { getAllPeminjaman, deletePeminjaman, searchPeminjaman, approvePeminjaman, downloadPeminjamanPDF, getPeminjamanById, swapPeminjamanItem, addItemToPeminjaman } from "../../lib/peminjamanService";
import { getAllAssets } from "../../lib/assetService";
import { getAllAksesoris } from "../../lib/aksesorisService";
import { getUserContext } from "../../lib/authService";
import { Search, Plus, Info, Pencil, Check, Trash2, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, X, AlertTriangle, ChevronUp, ChevronDown, FileText, ArrowLeftRight, PackagePlus } from "lucide-react";

const ROWS_OPTIONS = [10, 20, 30, 40, 50];
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
const statusOptions = ["Menunggu Persetujuan", "Sedang Dipinjam", "Menunggu Verifikasi", "Peminjaman Selesai"];
const APPROVER_ROLES = ["supervisor", "admin", "super admin"];

// Helper: parse bukti data yang bisa berupa string JSON atau array (jika kolom MySQL bertipe JSON)
const parseBuktiImages = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch { return []; }
  }
  return [];
};

// Helper: parse keperluan list dari backend (bisa string JSON atau array)
const parseKeperluanList = (keperluanList, fallbackAlasan) => {
  if (keperluanList && Array.isArray(keperluanList) && keperluanList.length > 0) {
    return keperluanList.map(k => k.keperluan || k).filter(Boolean);
  }
  if (keperluanList && typeof keperluanList === 'string') {
    try {
      const parsed = JSON.parse(keperluanList);
      if (Array.isArray(parsed)) return parsed.map(k => k.keperluan || k).filter(Boolean);
    } catch { /* fallback */ }
  }
  if (fallbackAlasan) return [fallbackAlasan];
  return [];
};

// Helper: role badge untuk dropdown autocomplete
const getRoleBadge = (role) => {
  const r = (role || '').toLowerCase();
  const map = {
    'super admin': 'bg-rose-100 text-rose-700 border-rose-200',
    'admin': 'bg-blue-100 text-blue-700 border-blue-200',
    'supervisor': 'bg-amber-100 text-amber-700 border-amber-200',
  };
  return map[r] || 'bg-slate-100 text-slate-600 border-slate-200';
};

function ImageCarouselInner({ images, title, backendUrl, onImageClick }) {
  const [startIndex, setStartIndex] = useState(0);
  
  const getVisibleImages = () => {
    if (images.length <= 3) return images.map((path, idx) => ({ path, originalIndex: idx }));
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const idx = (startIndex + i) % images.length;
      visible.push({ path: images[idx], originalIndex: idx });
    }
    return visible;
  };

  const next = () => setStartIndex((s) => (s + 1) % images.length);
  const prev = () => setStartIndex((s) => (s - 1 + images.length) % images.length);

  const visibleImages = getVisibleImages();

  return (
    <div className="mt-4">
      <span className="text-sm font-semibold text-slate-600 block mb-2">{title}</span>
      <div className="flex items-center gap-2">
        {images.length > 3 && (
          <button type="button" onClick={prev} className="p-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shadow-sm">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className="grid grid-cols-3 gap-2 flex-1">
          {visibleImages.map((img, i) => (
            <div key={`${startIndex}-${i}`} className="relative h-24 rounded-lg overflow-hidden border border-slate-200 group cursor-zoom-in shadow-sm hover:border-primary/50 transition-colors" 
              onClick={() => onImageClick(images, img.originalIndex)}>
              <Image src={`${backendUrl}${img.path}`} alt={title} fill className="object-cover group-hover:scale-110 transition-transform duration-300" sizes="120px" unoptimized />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <Search className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
          {images.length < 3 && [...Array(3 - images.length)].map((_, i) => (
             <div key={`empty-${i}`} className="h-24 rounded-lg bg-slate-50 border border-dashed border-slate-200" />
          ))}
        </div>
        {images.length > 3 && (
          <button type="button" onClick={next} className="p-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shadow-sm">
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
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

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  }).format(new Date(dateString)) + " WIB";
};

const getStatusLabel = (status) => {
  const map = {
    "Menunggu Persetujuan": "MENUNGGU PERSETUJUAN",
    "Sedang Dipinjam": "SEDANG DIPINJAM",
    "Menunggu Verifikasi": "MENUNGGU VERIFIKASI",
    "Peminjaman Selesai": "PEMINJAMAN SELESAI",
  };
  return map[status] || status;
};

const getStatusBadge = (status) => {
  const s = {
    "Menunggu Persetujuan": "bg-amber-50 text-amber-700 border-amber-500",
    "Sedang Dipinjam": "bg-blue-50 text-blue-700 border-blue-500",
    "Menunggu Verifikasi": "bg-violet-50 text-violet-700 border-violet-500",
    "Peminjaman Selesai": "bg-emerald-50 text-emerald-700 border-emerald-500",
  };
  return s[status] || "bg-slate-50 text-slate-700 border-slate-200";
};

export default function PeminjamanAsetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [toast, setToast] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(null);
  const [approveYangMenyerahkan, setApproveYangMenyerahkan] = useState("");
  const [yangMenyerahkanSearch, setYangMenyerahkanSearch] = useState("");
  const [approvePenerimaAset, setApprovePenerimaAset] = useState("");
  const [penerimaAsetSearch, setPenerimaAsetSearch] = useState("");
  const [userList, setUserList] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredUsers2, setFilteredUsers2] = useState([]);
  const [showYangMenyerahkanDropdown, setShowYangMenyerahkanDropdown] = useState(false);
  const [showPenerimaAsetDropdown, setShowPenerimaAsetDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState("user");
  const [userName, setUserName] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [lightboxData, setLightboxData] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Swap & Add Item Modal States
  const [showSwapModal, setShowSwapModal] = useState(null); // item to swap { peminjaman, oldItem }
  const [showAddItemModal, setShowAddItemModal] = useState(null); // peminjaman to add to
  const [borrowableItems, setBorrowableItems] = useState([]);
  const [swapNewItem, setSwapNewItem] = useState(null);
  const [addNewItem, setAddNewItem] = useState(null);
  const [addNewJumlah, setAddNewJumlah] = useState(1);

  useEffect(() => {
    setMounted(true);
    const ctx = getUserContext();
    if (ctx) {
      setUserRole(ctx.role || "user");
      setUserName(ctx.namaLengkap || ctx.email || "");
      setCurrentUserId(ctx.id || null);
    }
  }, []);

  useEffect(() => {
    const q = searchParams?.get("search");
    if (q) setSearch(q);
    const s = searchParams?.get("status");
    if (s) setStatusFilter(s);
  }, [searchParams]);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); } }, [toast]);
  const showToast = (message, type = "success") => setToast({ message, type });

  // Fetch user list untuk Yang Menyerahkan autocomplete
  const fetchUserList = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.ok) {
        const result = await response.json();
        setUserList(result.data || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // Handle Yang Menyerahkan search (hanya role supervisor, admin, super admin)
  const handleYangMenyerahkanSearch = (value) => {
    setYangMenyerahkanSearch(value);
    setApproveYangMenyerahkan(value);

    if (value.trim().length > 0) {
      const filtered = userList.filter(u =>
        APPROVER_ROLES.includes((u.role || '').toLowerCase()) &&
        (u.nama_lengkap?.toLowerCase().includes(value.toLowerCase()) ||
        u.email?.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredUsers(filtered);
      setShowYangMenyerahkanDropdown(true);
    } else {
      setFilteredUsers([]);
      setShowYangMenyerahkanDropdown(false);
    }
  };

  // Handle select Yang Menyerahkan
  const handleSelectYangMenyerahkan = (user) => {
    setApproveYangMenyerahkan(user.nama_lengkap);
    setYangMenyerahkanSearch(user.nama_lengkap);
    setShowYangMenyerahkanDropdown(false);
    setFilteredUsers([]);
  };

  // Handle Penerima Aset search (hanya role supervisor, admin, super admin)
  const handlePenerimaAsetSearch = (value) => {
    setPenerimaAsetSearch(value);
    setApprovePenerimaAset(value);

    if (value.trim().length > 0) {
      const filtered = userList.filter(u =>
        APPROVER_ROLES.includes((u.role || '').toLowerCase()) &&
        (u.nama_lengkap?.toLowerCase().includes(value.toLowerCase()) ||
        u.email?.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredUsers2(filtered);
      setShowPenerimaAsetDropdown(true);
    } else {
      setFilteredUsers2([]);
      setShowPenerimaAsetDropdown(false);
    }
  };

  // Handle select Penerima Aset
  const handleSelectPenerimaAset = (user) => {
    setApprovePenerimaAset(user.nama_lengkap);
    setPenerimaAsetSearch(user.nama_lengkap);
    setShowPenerimaAsetDropdown(false);
    setFilteredUsers2([]);
  };

  const handleDownloadPDF = async (peminjamanId) => {
    try {
      showToast("PDF sedang diproses, mohon tunggu...");
      await downloadPeminjamanPDF(peminjamanId);
    } catch (err) {
      showToast("Gagal mengunduh PDF", "error");
    }
  };

  const handleShowDetail = async (item) => {
    try {
      setTableLoading(true);
      const detail = await getPeminjamanById(item.id);
      setShowDetail(detail);
    } catch (err) {
      showToast("Gagal memuat detail peminjaman", "error");
    } finally {
      setTableLoading(false);
    }
  };

  const fetchData = useCallback(async () => {
    try { 
      if (!loading) setTableLoading(true);
      setError(null); 
      const data = await getAllPeminjaman(); 
      setDataList(data || []); 
    }
    catch { setError("Gagal memuat data peminjaman."); }
    finally { 
      setLoading(false); 
      setTableLoading(false);
    }
  }, [loading]);

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

  // Filtering, Sorting & Pagination
  const filteredData = dataList.filter(item => {
    // Filter by status
    if (statusFilter && item.status !== statusFilter) return false;

    // Role-based filtering
    if (userRole === "user" || userRole === "guest") {
      // Users can only see their own peminjaman
      return item.namaPeminjam === userName || item.userId === currentUserId;
    }

    if (userRole === "supervisor") {
      // Supervisors can see all peminjaman, optionally filter to what they approved
      // For now, show all (can be enhanced to show only approved-by-them)
      return true;
    }

    // Admins and super admins see all
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

    // Validation for Menunggu Persetujuan
    if (showApproveConfirm.status === 'Menunggu Persetujuan' && !approveYangMenyerahkan.trim()) {
      showToast("Yang Menyerahkan harus diisi", "error");
      return;
    }

    // Validation for Menunggu Verifikasi
    if (showApproveConfirm.status === 'Menunggu Verifikasi' && !approvePenerimaAset.trim()) {
      showToast("Penerima Aset harus diisi", "error");
      return;
    }

    try {
      setSubmitting(true);
      const approveYang = showApproveConfirm.status === 'Menunggu Persetujuan' ? approveYangMenyerahkan : null;
      const approvePenerima = showApproveConfirm.status === 'Menunggu Verifikasi' ? approvePenerimaAset : null;
      await approvePeminjaman(showApproveConfirm.id, userName, approveYang, approvePenerima);

      const message = showApproveConfirm.status === 'Menunggu Persetujuan'
        ? "Peminjaman berhasil disetujui!"
        : "Pengembalian berhasil disetujui!";
      showToast(message);

      setShowApproveConfirm(null);
      setApproveYangMenyerahkan("");
      setYangMenyerahkanSearch("");
      setApprovePenerimaAset("");
      setPenerimaAsetSearch("");
      fetchData();
    }
    catch (err) { showToast(err.response?.data?.message || "Gagal menyetujui data", "error"); }
    finally { setSubmitting(false); }
  };

  // Fetch borrowable items for swap/add modals
  const fetchBorrowableItems = async () => {
    try {
      const [assets, aksesoris] = await Promise.all([getAllAssets(), getAllAksesoris()]);
      const combined = [
        ...assets.map(a => ({
          id: a.id, namaItem: a.namaAset, kodeItem: a.kodeAset, stok: a.jumlah, kondisi: a.kondisi, itemType: 'asset'
        })),
        ...aksesoris.map(ak => ({
          id: ak.id, namaItem: ak.namaAksesoris, kodeItem: ak.kodeAksesoris, stok: ak.jumlahUnit, kondisi: ak.kondisi, itemType: 'aksesoris'
        }))
      ].filter(i => i.kondisi === 'Siap Digunakan' && i.stok > 0);
      setBorrowableItems(combined);
    } catch (e) { console.error('Error fetching borrowable items:', e); }
  };

  const handleOpenSwapModal = (peminjaman, oldItem) => {
    setSwapNewItem(null);
    setShowSwapModal({ peminjaman, oldItem });
    fetchBorrowableItems();
  };

  const handleSwapItem = async () => {
    if (!showSwapModal || !swapNewItem) { showToast('Pilih barang pengganti terlebih dahulu', 'error'); return; }
    try {
      setSubmitting(true);
      await swapPeminjamanItem(showSwapModal.peminjaman.id, {
        oldItemId: showSwapModal.oldItem.assetId || showSwapModal.oldItem.aksesorisId,
        oldItemType: showSwapModal.oldItem.assetId ? 'asset' : 'aksesoris',
        newItemId: swapNewItem.id,
        newItemType: swapNewItem.itemType,
        jumlah: showSwapModal.oldItem.jumlah,
      });
      showToast('Barang berhasil ditukar!');
      setShowSwapModal(null);
      if (showDetail) {
        const detail = await getPeminjamanById(showDetail.id);
        setShowDetail(detail);
      }
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menukar barang', 'error');
    } finally { setSubmitting(false); }
  };

  const handleAddItem = async () => {
    if (!showAddItemModal || !addNewItem) { showToast('Pilih barang yang akan ditambahkan', 'error'); return; }
    try {
      setSubmitting(true);
      await addItemToPeminjaman(showAddItemModal.id, {
        itemId: addNewItem.id,
        itemType: addNewItem.itemType,
        jumlah: addNewJumlah,
      });
      showToast('Barang berhasil ditambahkan!');
      setShowAddItemModal(null);
      if (showDetail) {
        const detail = await getPeminjamanById(showDetail.id);
        setShowDetail(detail);
      }
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menambahkan barang', 'error');
    } finally { setSubmitting(false); }
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
        <p className="text-sm text-slate-500 text-nowrap">Menampilkan {paginatedData.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + itemsPerPage, sorted.length)} dari <span className="font-semibold text-slate-700">{sorted.length}</span> data</p>
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



  // Loading
  if (loading) {
    return (
      <div>
        <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Peminjaman Alat</h1><p className="text-sm text-slate-500">Kelola data peminjaman alat Galeria Karya Media</p></div>
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
        <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Peminjaman Alat</h1><p className="text-sm text-slate-500">Kelola data peminjaman alat Galeria Karya Media</p></div>
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
      {typeof document !== 'undefined' && toast && createPortal(
        <div className={`fixed top-20 right-6 z-9999 flex items-center gap-2 rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-white transition-all animate-[slideIn_0.3s_ease] ${toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"}`}>
          {toast.type === "error" ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {toast.message}
        </div>,
        document.body
      )}
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Peminjaman Alat</h1>
        <p className="text-sm text-slate-500">Rekapitulasi data peminjaman dan pengembalian</p>
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
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Cari peminjaman..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full rounded-lg border-2 border-slate-200 py-2 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-text transition-colors hover:border-slate-300" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full sm:w-60 rounded-lg border-2 border-slate-200 py-2.5 px-3 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all hover:border-slate-300 outline-none cursor-pointer"
            >
              <option value="">Semua Status</option>
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {canAdd && (
            <button onClick={() => router.push("/aset/peminjaman/tambah")}
              className="cursor-pointer w-full sm:w-auto flex justify-center items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-primary-hover hover:shadow-lg active:scale-95">
              <Plus className="h-4 w-4" />
              Pinjam Aset
            </button>
          )}
        </div>

        {/* Table Controls (Pagination Top) & Table */}
        <Pagination />
        <div className="overflow-x-auto border-t border-slate-100">
          <table className="w-full text-left text-sm table-fixed">
            <thead>
              <tr className="border-t border-t-slate-300 border-b border-b-slate-300">
                <th className="w-[140px] px-4 py-3 font-bold text-slate-700 text-center text-xs border-r border-slate-200"><button onClick={() => handleSort("kodePinjam")} className="cursor-pointer flex items-center justify-center uppercase tracking-wider w-full">Kode Pinjam <SortIcon columnKey="kodePinjam" sortConfig={sortConfig} /></button></th>
                <th className="w-[150px] px-4 py-3 font-bold text-slate-700 text-center text-xs border-r border-slate-200"><button onClick={() => handleSort("namaPeminjam")} className="cursor-pointer flex items-center justify-center uppercase tracking-wider w-full">Nama Peminjam <SortIcon columnKey="namaPeminjam" sortConfig={sortConfig} /></button></th>
                <th className="w-[80px] px-3 py-3 font-bold text-slate-700 text-center uppercase tracking-wider text-xs border-r border-slate-200">Jumlah Alat</th>
                <th className="px-4 py-3 font-bold text-slate-700 text-center uppercase tracking-wider text-xs border-r border-slate-200">Keperluan</th>
                <th className="w-[145px] px-3 py-3 font-bold text-slate-700 text-center text-xs border-r border-slate-200"><button onClick={() => handleSort("tanggalPeminjaman")} className="cursor-pointer flex items-center justify-center uppercase tracking-wider w-full">TGL PINJAM <SortIcon columnKey="tanggalPeminjaman" sortConfig={sortConfig} /></button></th>
                <th className="w-[145px] px-3 py-3 font-bold text-slate-700 text-center uppercase tracking-wider text-xs border-r border-slate-200">TGL KEMBALI</th>
                <th className="w-[140px] px-3 py-3 font-bold text-slate-700 text-center text-xs border-r border-slate-200"><button onClick={() => handleSort("status")} className="cursor-pointer flex items-center justify-center uppercase tracking-wider w-full">Status <SortIcon columnKey="status" sortConfig={sortConfig} /></button></th>
                <th className="w-[145px] px-3 py-3 font-bold text-slate-700 text-center uppercase tracking-wider text-xs">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => {
                const keperluanArr = parseKeperluanList(item.keperluanList, item.alasanPeminjaman);
                const keperluanText = keperluanArr.length > 1
                  ? keperluanArr.join(', ')
                  : keperluanArr[0] || '-';
                return (
                <tr key={item.id} className={`border-b border-slate-100 transition-colors ${index % 2 === 0 ? "bg-slate-100" : "bg-white"}`}>
                  <td className="w-[140px] px-4 py-3 font-mono text-xs font-semibold text-slate-700 hover:text-primary cursor-pointer truncate border-r border-slate-200 align-middle text-center" onClick={() => handleShowDetail(item)}>{item.kodePinjam}</td>
                  <td className="w-[150px] px-4 py-3 text-xs text-slate-600 hover:text-primary cursor-pointer truncate border-r border-slate-200 align-middle" onClick={() => handleShowDetail(item)}>{item.namaPeminjam}</td>
                  <td className="w-[80px] px-3 py-3 text-center border-r border-slate-200 align-middle">
                    <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 text-xs font-bold border border-blue-200">
                      {item.totalItems || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-200 align-top">
                    {keperluanArr.length > 1 ? (
                      <ol className="list-decimal list-inside space-y-0.5">
                        {keperluanArr.map((k, i) => (
                          <li key={i} className="line-clamp-2" title={k}>{k}</li>
                        ))}
                      </ol>
                    ) : (
                      <span className="line-clamp-2" title={keperluanArr[0] || '-'}>{keperluanArr[0] || '-'}</span>
                    )}
                  </td>
                  <td className="w-[145px] px-3 py-3 text-xs text-slate-600 text-center whitespace-nowrap border-r border-slate-200 align-middle">{formatDateTime(item.tanggalPeminjaman)}</td>
                  <td className="w-[145px] px-3 py-3 text-xs text-slate-600 text-center whitespace-nowrap border-r border-slate-200 align-middle">{formatDateTime(item.tanggalPengembalian)}</td>
                  <td className="w-[140px] px-3 py-3 text-center border-r border-slate-200 align-middle">
                    <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border whitespace-normal leading-tight max-w-[120px] min-h-[24px] ${getStatusBadge(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                  <td className="w-[145px] px-3 py-3 align-middle">
                    <div className="flex items-center justify-center gap-1">
                      {/* Detail */}
                      <button onClick={() => handleShowDetail(item)} className="cursor-pointer rounded-lg bg-blue-100 p-1 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white" title="Detail"><Info className="h-3.5 w-3.5" /></button>
                      {/* Edit */}
                      {canEdit && (item.status === "Menunggu Persetujuan" || item.status === "Sedang Dipinjam") && (["super admin", "admin"].includes(userRole) || item.userId === currentUserId) && (
                        <button onClick={() => {
                          if (item.status === "Menunggu Persetujuan" && !["admin", "super admin"].includes(userRole.toLowerCase())) {
                            showToast("Peminjaman belum disetujui, tidak dapat mengembalikan alat.", "error");
                          } else {
                            router.push(`/aset/peminjaman/edit/${item.id}`);
                          }
                        }} className="cursor-pointer rounded-lg bg-amber-100 p-1 text-amber-600 transition-colors hover:bg-amber-600 hover:text-white" title="Edit / Pengembalian"><Pencil className="h-3.5 w-3.5" /></button>
                      )}
                      {/* Approve */}
                      {canApprove && (item.status === "Menunggu Persetujuan" || item.status === "Menunggu Verifikasi") && (
                        <button onClick={() => {
                          setShowApproveConfirm(item);
                          setApproveYangMenyerahkan(item.yangMenyerahkan || "");
                          setYangMenyerahkanSearch(item.yangMenyerahkan || "");
                          setApprovePenerimaAset(item.penerimaAset || "");
                          setPenerimaAsetSearch(item.penerimaAset || "");
                          fetchUserList();
                        }} className="cursor-pointer rounded-lg bg-emerald-100 p-1 text-emerald-600 transition-colors hover:bg-emerald-600 hover:text-white" title="Setujui"><Check className="h-3.5 w-3.5" /></button>
                      )}
                      {/* Delete */}
                      {canDelete && (
                        <button onClick={() => setShowDeleteConfirm(item)} className="cursor-pointer rounded-lg bg-rose-100 p-1 text-rose-600 transition-colors hover:bg-rose-600 hover:text-white" title="Hapus"><Trash2 className="h-3.5 w-3.5" /></button>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
              {paginatedData.length === 0 && (<tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400 font-medium">Tidak ada data peminjaman ditemukan.</td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200"><Pagination /></div>
      </div>

      {mounted && typeof document !== 'undefined' && createPortal(
        <>
          {/* Modal Detail */}
          {showDetail && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowDetail(null)}>
              <div className="max-h-[90vh] w-full max-w-lg flex flex-col rounded-2xl bg-white shadow-xl border-t-4 border-t-blue-500 animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 bg-blue-50 px-6 py-4 rounded-t-2xl shrink-0">
                  <h2 className="text-lg font-bold text-blue-800">Detail Peminjaman</h2>
                  <button onClick={() => setShowDetail(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                  <div>
                    <h4 className="mb-4 text-sm font-bold text-slate-800">Informasi Peminjaman</h4>
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                      {[
                        ["No. Peminjaman", showDetail.kodePinjam],
                        ["Nama Peminjam", showDetail.namaPeminjam],
                        ["Tanggal Peminjaman", formatDateTime(showDetail.tanggalPeminjaman)],
                        ["Yang Menyerahkan", showDetail.yangMenyerahkan],
                        ["Status", null], // custom render
                        ["Disetujui Oleh", showDetail.approvedBy],
                      ].map(([l, v]) => (
                        <div key={l} className="flex flex-col gap-1.5">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{l}</span>
                          {l === "Status" ? (
                            <span className={`inline-block self-start rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusBadge(showDetail.status)}`}>{getStatusLabel(showDetail.status)}</span>
                          ) : (
                            <span className="text-sm font-medium text-slate-800">{v || "-"}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Keperluan — full list */}
                    <div className="mt-4 flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Keperluan</span>
                      {(() => {
                        const keperluanArr = parseKeperluanList(showDetail.keperluanList, showDetail.alasanPeminjaman);
                        if (keperluanArr.length === 0) return <span className="text-sm font-medium text-slate-800">-</span>;
                        if (keperluanArr.length === 1) return <span className="text-sm font-medium text-slate-800">{keperluanArr[0]}</span>;
                        return (
                          <ol className="list-decimal list-inside space-y-0.5">
                            {keperluanArr.map((k, i) => (
                              <li key={i} className="text-sm font-medium text-slate-800">{k}</li>
                            ))}
                          </ol>
                        );
                      })()}
                    </div>

                    {/* Daftar Alat Dipinjam */}
                    <div className="flex flex-col gap-2 mt-4">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Daftar Alat Dipinjam</span>
                      {showDetail.items && showDetail.items.length > 0 ? (
                        <div className="rounded-lg border border-slate-200 overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-3 py-2 text-left font-semibold text-slate-600 w-10">No</th>
                                <th className="px-3 py-2 text-left font-semibold text-slate-600">Kode</th>
                                <th className="px-3 py-2 text-left font-semibold text-slate-600">Nama Alat</th>
                                <th className="px-3 py-2 text-center font-semibold text-slate-600 w-16">Jml</th>
                                {showDetail.status === 'Sedang Dipinjam' && canApprove && (
                                  <th className="px-3 py-2 text-center font-semibold text-slate-600 w-20">Aksi</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {showDetail.items.map((it, i) => (
                                <tr key={it.id || i} className="border-b border-slate-100 last:border-0">
                                  <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                                  <td className="px-3 py-2 text-slate-600 font-mono text-xs">{it.kodeAset || "-"}</td>
                                  <td className="px-3 py-2 text-slate-700 font-medium">{it.namaAset || it.namaAksesoris || it.namaItem || "-"}</td>
                                  <td className="px-3 py-2 text-center font-semibold text-slate-700">{it.jumlah}</td>
                                  {showDetail.status === 'Sedang Dipinjam' && canApprove && (
                                    <td className="px-3 py-2 text-center">
                                      <button
                                        onClick={() => handleOpenSwapModal(showDetail, it)}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium hover:bg-amber-200 transition-colors cursor-pointer"
                                        title="Tukar Barang"
                                      >
                                        <ArrowLeftRight className="h-3 w-3" />
                                        Tukar
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">-</span>
                      )}
                      {/* Tambah Barang button when Sedang Dipinjam */}
                      {showDetail.status === 'Sedang Dipinjam' && canApprove && (
                        <button
                          onClick={() => { setAddNewItem(null); setAddNewJumlah(1); setShowAddItemModal(showDetail); fetchBorrowableItems(); }}
                          className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition-colors cursor-pointer w-full justify-center"
                        >
                          <PackagePlus className="h-4 w-4" />
                          Tambah Barang Kurang
                        </button>
                      )}
                    </div>
                    
                    {/* Bukti Peminjaman Images with Carousel */}
                    {(() => {
                      const paths = parseBuktiImages(showDetail.buktiPeminjaman);
                      if (paths.length > 0) {
                        return <ImageCarouselInner images={paths} title="Bukti Peminjaman" backendUrl={BACKEND_URL} onImageClick={(imgs, idx) => setLightboxData({ images: imgs, index: idx })} />;
                      }
                      return null;
                    })()}
                  </div>

                  {/* Section Pengembalian — hanya tampil jika status relevan */}
                  {(showDetail.status === 'Menunggu Verifikasi' || showDetail.status === 'Peminjaman Selesai') && (
                    <>
                      <hr className="border-slate-300" />
                      <div>
                        <h4 className="mb-4 text-sm font-bold text-slate-800">Informasi Pengembalian</h4>
                        <div className="grid grid-cols-2 gap-4 md:gap-6">
                          {[
                            ["Tanggal Pengembalian", formatDateTime(showDetail.tanggalPengembalian)],
                            ["Penerima Aset", showDetail.penerimaAset],
                            ["Diverifikasi Oleh", showDetail.returnApprovedBy],
                          ].map(([l, v]) => (
                            <div key={l} className="flex flex-col gap-1.5">
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{l}</span>
                              <span className="text-sm font-medium text-slate-800">{v || "-"}</span>
                            </div>
                          ))}
                        </div>

                        {/* Bukti Pengembalian Images with Carousel */}
                        {(() => {
                          const paths = parseBuktiImages(showDetail.buktiPengembalian);
                          if (paths.length > 0) {
                            return <ImageCarouselInner images={paths} title="Bukti Pengembalian" backendUrl={BACKEND_URL} onImageClick={(imgs, idx) => setLightboxData({ images: imgs, index: idx })} />;
                          }
                          return null;
                        })()}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-white rounded-b-2xl shrink-0">
                  <button onClick={() => handleDownloadPDF(showDetail.id)} className="flex items-center cursor-pointer gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 shadow-sm">
                    <FileText className="h-4 w-4" />
                    Cetak PDF
                  </button>
                  <button onClick={() => setShowDetail(null)} className="cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 shadow-sm">Tutup</button>
                </div>
              </div>
            </div>
          )}

          {/* Lightbox Overlay */}
          {lightboxData && (
            <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 cursor-pointer transition-opacity animate-in fade-in duration-300" onClick={() => setLightboxData(null)}>
              <div className="relative flex items-center gap-4 w-full max-w-5xl h-[85vh] animate-modal-in" onClick={(e) => e.stopPropagation()}>
                {lightboxData.images.length > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setLightboxData(prev => ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length })); }}
                    className="rounded-full bg-white/10 p-3 text-white backdrop-blur-md hover:bg-white/20 transition-all border border-white/20"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>
                )}
                <div className="relative flex-1 h-full flex items-center justify-center">
                  <Image 
                    src={`${BACKEND_URL}${lightboxData.images[lightboxData.index]}`} 
                    alt="Full View" 
                    fill 
                    unoptimized 
                    className="object-contain drop-shadow-2xl" 
                  />
                </div>
                {lightboxData.images.length > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setLightboxData(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length })); }}
                    className="rounded-full bg-white/10 p-3 text-white backdrop-blur-md hover:bg-white/20 transition-all border border-white/20"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>
                )}
                <button onClick={() => setLightboxData(null)} className="absolute top-0 right-0 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors border border-white/20 backdrop-blur-md"><X className="h-6 w-6" /></button>
              </div>
            </div>
          )}

          {/* Modal Delete Confirm */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowDeleteConfirm(null)}>
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border-t-4 border-t-rose-500 animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mx-auto">
                  <Trash2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 text-center mb-1">Hapus Peminjaman?</h3>
                <p className="text-sm text-slate-500 text-center mb-6">Apakah Anda yakin ingin menghapus data peminjaman #{showDeleteConfirm.kodePinjam}?</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => setShowDeleteConfirm(null)} className="cursor-pointer flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Batal</button>
                  <button onClick={handleDelete} disabled={submitting} className="cursor-pointer flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-700 disabled:opacity-60">{submitting ? "Menghapus..." : "Hapus"}</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Approve Confirm */}
          {showApproveConfirm && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300" onClick={() => setShowApproveConfirm(null)}>
              <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border-t-4 border-t-emerald-500 animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1 text-center">
                    {showApproveConfirm.status === 'Menunggu Persetujuan' ? 'Setujui Peminjaman?' : 'Setujui Pengembalian?'}
                  </h3>
                  <p className="text-sm text-slate-500 mb-1 text-center">
                    {showApproveConfirm.status === 'Menunggu Persetujuan' ? 'Setujui peminjaman' : 'Setujui pengembalian'} #{showApproveConfirm.kodePinjam}?
                  </p>
                  <p className="text-sm font-semibold text-slate-700 text-center">{showApproveConfirm.namaPeminjam}</p>
                  <p className="text-xs text-emerald-600 mt-3 text-center">
                    {showApproveConfirm.status === 'Menunggu Persetujuan'
                      ? 'Status akan berubah menjadi Sedang Dipinjam.'
                      : 'Stok aset akan dikembalikan ke inventaris.'}
                  </p>

                  {/* Input Yang Menyerahkan - Hanya untuk Menunggu Persetujuan */}
                  {showApproveConfirm.status === 'Menunggu Persetujuan' && (
                    <div className="mt-4 space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Yang Menyerahkan <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <input
                          type="text"
                          value={yangMenyerahkanSearch}
                          onChange={(e) => handleYangMenyerahkanSearch(e.target.value)}
                          onFocus={() => { if (yangMenyerahkanSearch.trim().length > 0) setShowYangMenyerahkanDropdown(true); }}
                          onBlur={() => setTimeout(() => setShowYangMenyerahkanDropdown(false), 200)}
                          placeholder="Cari atau ketik nama..."
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />

                        {/* Dropdown Autocomplete */}
                        {showYangMenyerahkanDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto">
                            {filteredUsers.length > 0 ? (
                              filteredUsers.map((user) => (
                                <button
                                  key={user.id}
                                  type="button"
                                  onClick={() => handleSelectYangMenyerahkan(user)}
                                  className="w-full px-3 py-3 text-left text-sm hover:bg-emerald-50 border-b border-slate-100 last:border-b-0 transition-colors flex items-center gap-3"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="font-medium text-slate-900">{user.nama_lengkap}</div>
                                    {user.role && (
                                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getRoleBadge(user.role)}`}>
                                        {user.role}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-slate-500">{user.email}</div>
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-sm text-slate-500 text-center">Hanya Admin & Supervisor yang tersedia</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Input Penerima Aset - Hanya untuk Menunggu Verifikasi */}
                  {showApproveConfirm.status === 'Menunggu Verifikasi' && (
                    <div className="mt-4 space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Penerima Aset <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <input
                          type="text"
                          value={penerimaAsetSearch}
                          onChange={(e) => handlePenerimaAsetSearch(e.target.value)}
                          onFocus={() => { if (penerimaAsetSearch.trim().length > 0) setShowPenerimaAsetDropdown(true); }}
                          onBlur={() => setTimeout(() => setShowPenerimaAsetDropdown(false), 200)}
                          placeholder="Cari atau ketik nama..."
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />

                        {/* Dropdown Autocomplete */}
                        {showPenerimaAsetDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto">
                            {filteredUsers2.length > 0 ? (
                              filteredUsers2.map((user) => (
                                <button
                                  key={user.id}
                                  type="button"
                                  onClick={() => handleSelectPenerimaAset(user)}
                                  className="w-full px-3 py-3 text-left text-sm hover:bg-emerald-50 border-b border-slate-100 last:border-b-0 transition-colors flex items-center gap-3"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="font-medium text-slate-900">{user.nama_lengkap}</div>
                                    {user.role && (
                                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getRoleBadge(user.role)}`}>
                                        {user.role}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-slate-500">{user.email}</div>
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-sm text-slate-500 text-center">Hanya Admin & Supervisor yang tersedia</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center gap-3 border-t border-slate-100 px-6 py-4 bg-white rounded-b-2xl">
                  <button onClick={() => { setShowApproveConfirm(null); setApproveYangMenyerahkan(""); setYangMenyerahkanSearch(""); setShowYangMenyerahkanDropdown(false); }} className="cursor-pointer flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Batal</button>
                  <button onClick={handleApprove} disabled={submitting} className="cursor-pointer flex-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:opacity-60">{submitting ? "Memproses..." : "Ya, Setujui"}</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Tukar Barang */}
          {showSwapModal && (
            <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-300" onClick={() => setShowSwapModal(null)}>
              <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border-t-4 border-t-amber-500 animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50 rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="h-5 w-5 text-amber-600" />
                    <h2 className="text-lg font-bold text-amber-800">Tukar Barang</h2>
                  </div>
                  <button onClick={() => setShowSwapModal(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <p className="text-xs font-semibold text-amber-700 uppercase mb-1">Barang yang Ditukar</p>
                    <p className="text-sm font-bold text-amber-900">{showSwapModal.oldItem.namaAset} (x{showSwapModal.oldItem.jumlah})</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Pilih Barang Pengganti <span className="text-rose-500">*</span></label>
                    <select
                      value={swapNewItem?.id ? `${swapNewItem.itemType}-${swapNewItem.id}` : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) { setSwapNewItem(null); return; }
                        const found = borrowableItems.find(i => `${i.itemType}-${i.id}` === val);
                        setSwapNewItem(found || null);
                      }}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 bg-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">-- Pilih barang pengganti --</option>
                      {borrowableItems.map(i => (
                        <option key={`${i.itemType}-${i.id}`} value={`${i.itemType}-${i.id}`}>
                          {i.namaItem} ({i.kodeItem}) - Stok: {i.stok}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
                  <button onClick={() => setShowSwapModal(null)} className="flex-1 cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</button>
                  <button onClick={handleSwapItem} disabled={submitting || !swapNewItem} className="flex-1 cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60">
                    {submitting ? 'Memproses...' : 'Tukar Barang'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Tambah Barang */}
          {showAddItemModal && (
            <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-300" onClick={() => setShowAddItemModal(null)}>
              <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border-t-4 border-t-blue-500 animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-blue-50 rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <PackagePlus className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-bold text-blue-800">Tambah Barang</h2>
                  </div>
                  <button onClick={() => setShowAddItemModal(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-xs text-slate-500">Tambah barang yang kurang akibat human error pada peminjaman <strong className="text-slate-700">{showAddItemModal.kodePinjam}</strong></p>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Barang yang Ditambah <span className="text-rose-500">*</span></label>
                    <select
                      value={addNewItem?.id ? `${addNewItem.itemType}-${addNewItem.id}` : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) { setAddNewItem(null); return; }
                        const found = borrowableItems.find(i => `${i.itemType}-${i.id}` === val);
                        setAddNewItem(found || null);
                      }}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 bg-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">-- Pilih barang --</option>
                      {borrowableItems.map(i => (
                        <option key={`${i.itemType}-${i.id}`} value={`${i.itemType}-${i.id}`}>
                          {i.namaItem} ({i.kodeItem}) - Stok: {i.stok}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Jumlah <span className="text-rose-500">*</span></label>
                    <input
                      type="number" min="1" max={addNewItem?.stok || 99} value={addNewJumlah}
                      onChange={(e) => setAddNewJumlah(parseInt(e.target.value) || 1)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    {addNewItem && <p className="text-xs text-slate-500 mt-1">Stok tersedia: {addNewItem.stok}</p>}
                  </div>
                </div>
                <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
                  <button onClick={() => setShowAddItemModal(null)} className="flex-1 cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</button>
                  <button onClick={handleAddItem} disabled={submitting || !addNewItem} className="flex-1 cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-60">
                    {submitting ? 'Memproses...' : 'Tambah Barang'}
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
