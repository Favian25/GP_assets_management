"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  getPeminjamanById,
  updatePeminjaman,
  getItemsWithPricing,
} from "../../../../lib/peminjamanService";
import { getAllAssets } from "../../../../lib/assetService";
import { getAllAksesoris } from "../../../../lib/aksesorisService";
import { getUserContext } from "../../../../lib/authService";
import {
  ChevronLeft,
  FileText,
  Check,
  X,
  Calendar,
  Package,
  Camera,
  ImageIcon,
  Info,
  Search,
  ChevronRight
} from "lucide-react";

const getBackendURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, "");
  }
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:5000`;
  }
  return "http://localhost:5000";
};
const BACKEND_URL = getBackendURL();

const parseBuktiImages = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
};

const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

const getStatusBadge = (status) => {
  const s = {
    "Menunggu Persetujuan": "bg-amber-100 text-amber-800 border-amber-200",
    "Sedang Dipinjam": "bg-blue-100 text-blue-800 border-blue-200",
    "Menunggu Verifikasi": "bg-violet-100 text-violet-800 border-violet-200",
    "Peminjaman Selesai": "bg-emerald-100 text-emerald-800 border-emerald-200",
  };
  return s[status] || "bg-slate-100 text-slate-800 border-slate-200";
};

const getKondisiBadge = (kondisi) => {
  const badges = {
    "Siap Digunakan": "bg-green-100 text-green-800",
    Rusak: "bg-red-100 text-red-800",
    "Rusak Berat": "bg-red-900 text-white",
    Maintenance: "bg-yellow-100 text-yellow-800",
  };
  return badges[kondisi] || "bg-slate-100 text-slate-800";
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
      <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider block mb-3">{title}</span>
      <div className="flex items-center gap-2">
        {images.length > 3 && (
          <button type="button" onClick={prev} className="cursor-pointer p-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shadow-sm">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className="grid grid-cols-3 gap-2 flex-1">
          {visibleImages.map((img, i) => (
            <div key={`${startIndex}-${i}`} className="relative h-24 rounded-lg overflow-hidden border border-slate-200 group cursor-zoom-in shadow-sm hover:border-primary/50 transition-colors cursor-pointer" 
              onClick={() => onImageClick(images, img.originalIndex)}>
              <img src={`${backendUrl}${img.path}`} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
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
          <button type="button" onClick={next} className="cursor-pointer p-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shadow-sm">
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function EditPeminjamanPage() {
  const router = useRouter();
  const params = useParams();
  const peminjamanId = params.id;

  // Data State
  const [data, setData] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Return form state
  const [tanggalPengembalian, setTanggalPengembalian] = useState("");
  const [buktiFiles, setBuktiFiles] = useState([]);
  const [buktiPreviews, setBuktiPreviews] = useState([]);
  const [existingBuktiPeminjaman, setExistingBuktiPeminjaman] = useState([]);
  
  // Lightbox
  const [lightboxData, setLightboxData] = useState(null);

  // Other state
  const [currentUser, setCurrentUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize
  useEffect(() => {
    setMounted(true);
    const ctx = getUserContext();
    setCurrentUser(ctx);

    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = "success") => setToast({ message, type });

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [peminjamanData, itemsData] = await Promise.all([
        getPeminjamanById(peminjamanId),
        getItemsWithPricing(peminjamanId),
      ]);

      setData(peminjamanData);
      setItems(itemsData || []);
      setExistingBuktiPeminjaman(parseBuktiImages(peminjamanData.buktiPeminjaman));

      if (peminjamanData.tanggalPengembalian) {
        const dateOnly = peminjamanData.tanggalPengembalian.split(" ")[0];
        setTanggalPengembalian(dateOnly);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      showToast("Gagal memuat data", "error");
    } finally {
      setLoading(false);
    }
  }, [peminjamanId]);

  useEffect(() => {
    if (mounted) {
      fetchData();
    }
  }, [mounted, fetchData]);

  // File handling
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    let filesToAdd = [];

    for (let file of files) {
      if (!validTypes.includes(file.type)) {
        showToast("Format file harus JPG/JPEG/PNG", "error");
        return;
      }
      filesToAdd.push(file);
    }

    if (buktiFiles.length + filesToAdd.length > 5) {
      showToast("Maksimal 5 gambar", "error");
      return;
    }

    const updated = [...buktiFiles, ...filesToAdd];
    setBuktiFiles(updated);
    setBuktiPreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (index) => {
    const updated = buktiFiles.filter((_, i) => i !== index);
    setBuktiFiles(updated);
    setBuktiPreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tanggalPengembalian) {
      showToast("Tanggal pengembalian wajib diisi", "error");
      return;
    }

    if (buktiFiles.length === 0) {
      showToast("Upload bukti pengembalian minimal 1 gambar", "error");
      return;
    }

    try {
      setSubmitting(true);
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const dateTimeStr = `${tanggalPengembalian} ${hours}:${minutes}:${seconds}`;

      await updatePeminjaman(
        peminjamanId,
        {
          tanggalPengembalian: dateTimeStr,
          status: "Menunggu Verifikasi",
        },
        buktiFiles
      );

      showToast("Data pengembalian berhasil disimpan!");
      setTimeout(() => {
        router.push("/aset/peminjaman");
      }, 1500);
    } catch (err) {
      showToast(err.message || "Gagal menyimpan data", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-slate-500 text-lg">
        Data peminjaman tidak ditemukan.
      </div>
    );
  }

  const canReturnItems =
    data?.status === "Sedang Dipinjam" ||
    (data?.status === "Selesai" &&
      items.some(
        (it) => it.status_pengembalian === "Belum Kembali" || !it.status_pengembalian
      ));

  const renderBrandBadge = (merek, isSmall = false) => {
    if (merek === "Galeria Studio") {
      return (
        <span className={`shrink-0 text-center inline-block ${isSmall ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-xs'} rounded bg-orange-100 text-orange-600 font-bold border border-orange-200 flex items-center justify-center`} title="Galeria Studio">
          S
        </span>
      );
    } else if (merek === "Galeria Production") {
      return (
        <span className={`shrink-0 text-center inline-block ${isSmall ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-xs'} rounded bg-blue-100 text-blue-600 font-bold border border-blue-200 flex items-center justify-center`} title="Galeria Production">
          P
        </span>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="cursor-pointer p-2 bg-primary rounded-lg transition hover:bg-primary-hover hover:bg-primary-dark"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Detail Peminjaman</h1>
              <p className="text-sm text-slate-500 flex items-center gap-2">
                Kode: {data.kodePinjam} 
                <span className="mx-1">•</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                    data.status
                  )}`}
                >
                  {data.status}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* KOLOM KIRI (Info & Item) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Data Peminjaman */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-primary p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Informasi Peminjaman
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Nama Peminjam
                  </label>
                  <div className="bg-slate-100 rounded-lg px-4 py-3 text-slate-900 font-semibold border border-slate-200">
                    {data.namaPeminjam}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Tanggal Peminjaman
                  </label>
                  <div className="bg-slate-100 rounded-lg px-4 py-3 text-slate-900 font-semibold border border-slate-200">
                    {formatDateTime(data.tanggalPeminjaman)}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Diserahkan Oleh
                  </label>
                  <div className="bg-slate-100 rounded-lg px-4 py-3 text-slate-900 font-semibold border border-slate-200">
                    {data.yangMenyerahkan || "-"}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Disetujui Oleh
                  </label>
                  <div className="bg-slate-100 rounded-lg px-4 py-3 text-slate-900 font-semibold border border-slate-200">
                    {data.approvedBy || "-"}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Alasan / Keperluan
                  </label>
                  <div className="bg-slate-100 rounded-lg px-4 py-3 text-slate-900 font-semibold border border-slate-200 min-h-[80px]">
                    {data.alasanPeminjaman || "-"}
                  </div>
                </div>
              </div>

              {existingBuktiPeminjaman.length > 0 && (
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <ImageCarouselInner
                    images={existingBuktiPeminjaman}
                    title="Bukti Peminjaman Awal"
                    backendUrl={BACKEND_URL}
                    onImageClick={(imgs, idx) => setLightboxData({ images: imgs, index: idx })}
                  />
                </div>
              )}
            </div>

            {/* Item yang Dipinjam */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-primary p-6 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Daftar Alat Dipinjam
                  <span className="bg-primary/10 text-primary text-sm px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                </h2>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto pr-1" style={{ maxHeight: '400px' }}>
                {items.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                    <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 font-medium">Tidak ada alat</p>
                  </div>
                ) : (
                  items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      {/* Item Info */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {renderBrandBadge(item.merek, true)}
                        <span className={`w-[84px] text-center inline-block text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full font-semibold border shrink-0 ${
                          item.tipe === "asset"
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "bg-purple-100 text-purple-700 border-purple-200"
                        }`}>
                          {item.tipe === "asset" ? "Alat" : "Aksesoris"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{item.namaAset}</p>
                          <p className="text-xs text-slate-500 truncate">{item.kodeAset} • {item.kategori} • {item.merek}</p>
                        </div>
                      </div>
                      
                      {/* Quantity */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-semibold text-slate-900">
                          Jumlah: {item.jumlah}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total Value */}
              {items.some((it) => it.hargaUnit > 0) && (
                <div className="mt-5 pt-5 border-t border-slate-100 flex justify-between items-center bg-emerald-50/50 p-4 rounded-lg border border-emerald-100/50">
                  <p className="text-sm font-semibold text-slate-600">Total Nilai Alat</p>
                  <p className="text-xl font-bold text-emerald-600">
                    Rp{" "}
                    {items
                      .reduce((sum, item) => sum + (item.hargaUnit * item.jumlah || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* KOLOM KANAN (Form Pengembalian & Aksi) */}
          <div className="lg:col-span-1 space-y-6">
            {canReturnItems ? (
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-primary p-6 sticky top-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Aksi Pengembalian
                    </h3>
                    <p className="text-sm text-slate-500">
                      Lengkapi data di bawah ini untuk mengembalikan alat ke sistem.
                    </p>
                  </div>

                <div className="space-y-6">
                  {/* Tanggal */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tanggal Pengembalian <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={tanggalPengembalian}
                      onChange={(e) => setTanggalPengembalian(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-slate-50 hover:bg-white focus:bg-white"
                      required
                    />
                  </div>

                  {/* Bukti Upload */}
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Bukti Pengembalian <span className="text-red-500">*</span>
                      </label>
                      <span className="text-xs font-medium text-slate-500">
                        {buktiFiles.length}/5 file
                      </span>
                    </div>
                    
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-blue-50/50 transition-all group bg-slate-50"
                    >
                      <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                        <Camera className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 mb-1">
                        Klik atau Drag Gambar
                      </p>
                      <p className="text-xs text-slate-500">Maks. 5 file (JPG, PNG)</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>

                    {/* Preview */}
                    {buktiPreviews.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-3 mt-4">
                        {buktiPreviews.map((preview, idx) => (
                          <div key={idx} className="relative group w-24 h-24 sm:w-28 sm:h-28 shrink-0">
                            <img
                              src={preview}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-full object-cover rounded-lg border border-slate-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile(idx)}
                              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-5 h-5" />
                    {submitting ? "Memproses..." : "Simpan Pengembalian"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="w-full py-3 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition shadow-sm cursor-pointer"
                  >
                    Batalkan
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-slate-50 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-primary p-6 text-center sticky top-6">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                  <Info className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  Informasi Status
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Alat tidak dapat dikembalikan pada saat ini. Form pengembalian hanya aktif saat status peminjaman adalah <span className="font-bold text-slate-800">"Sedang Dipinjam"</span>.
                </p>
                <p className="text-sm font-medium text-slate-500 mt-4 bg-white py-2 px-4 rounded-lg inline-block border border-slate-100">
                  Status Saat Ini: {data.status}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxData && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4">
          <button 
            type="button"
            onClick={() => setLightboxData(null)} 
            className="absolute top-4 right-4 text-white hover:text-slate-300 transition-colors z-[110] cursor-pointer"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative w-full max-w-5xl aspect-video flex items-center justify-center">
            {lightboxData.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setLightboxData(prev => ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length }))}
                  className="absolute left-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors z-[110] cursor-pointer"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxData(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length }))}
                  className="absolute right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors z-[110] cursor-pointer"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
            <img 
              src={`${BACKEND_URL}${lightboxData.images[lightboxData.index]}`} 
              alt="Bukti Preview" 
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm font-medium">
            Gambar {lightboxData.index + 1} dari {lightboxData.images.length}
          </div>
        </div>,
        document.body
      )}

      {/* Modern Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[120] animate-fade-in-up">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl shadow-black/5 border ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-red-50 text-red-900 border-red-200"
            }`}
          >
            {toast.type === "success" ? (
              <div className="bg-emerald-100 p-1 rounded-full">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
            ) : (
              <div className="bg-red-100 p-1 rounded-full">
                <X className="w-4 h-4 text-red-600" />
              </div>
            )}
            <p className="font-semibold text-sm">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
