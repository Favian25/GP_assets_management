"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import Image from "next/image";
import { getPeminjamanById } from "../../lib/peminjamanService";
import { FileText, Clock, Package, ChevronLeft, ChevronRight, Search, CheckCircle2, AlertCircle, RotateCcw, X } from "lucide-react";

const BACKEND_URL = typeof window !== "undefined" ? `http://${window.location.hostname}:5000` : "http://localhost:5000";

function ImageCarouselInner({ images, title, backendUrl, onImageClick }) {
  const [startIndex, setStartIndex] = useState(0);
  
  if (!images || images.length === 0) return null;

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
    <div className="mt-6 border-t border-slate-100 pt-4">
      <span className="text-xs font-bold text-slate-500 block mb-3 uppercase tracking-wider">{title}</span>
      <div className="flex items-center gap-2">
        {images.length > 3 && (
          <button type="button" onClick={prev} className="p-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shadow-sm">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className="grid grid-cols-3 gap-2 flex-1">
          {visibleImages.map((img, i) => (
            <div key={`${startIndex}-${i}`} className="relative h-24 rounded-lg overflow-hidden border border-slate-200 group cursor-zoom-in shadow-sm hover:border-blue-500/50 transition-colors" 
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

const getStatusBadge = (status) => {
  const s = {
    "Menunggu Persetujuan": "bg-amber-50 text-amber-700 border-amber-500",
    "Sedang Dipinjam": "bg-blue-50 text-blue-700 border-blue-500",
    "Menunggu Verifikasi": "bg-violet-50 text-violet-700 border-violet-500",
    "Peminjaman Selesai": "bg-emerald-50 text-emerald-700 border-emerald-500",
  };
  return s[status] || "bg-slate-50 text-slate-700 border-slate-500";
};

const getStatusIcon = (status) => {
  if (status === "Peminjaman Selesai") return <CheckCircle2 className="h-4 w-4" />;
  if (status === "Sedang Dipinjam") return <Clock className="h-4 w-4" />;
  if (status === "Menunggu Verifikasi") return <RotateCcw className="h-4 w-4" />;
  return <AlertCircle className="h-4 w-4" />;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const parseBuktiImages = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function RiwayatDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightboxData, setLightboxData] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getPeminjamanById(id);
        setDetail(data);
      } catch (err) {
        console.error("Error view detail:", err);
        setError("Gagal memuat detail peminjaman.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-sm font-medium text-slate-500">Memuat detail peminjaman...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
        <p className="text-sm font-medium text-slate-700">{error || "Data tidak ditemukan."}</p>
        <button onClick={() => router.push("/riwayat")} className="mt-4 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200">
          Kembali ke Riwayat
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/riwayat")} className="cursor-pointer p-2 bg-primary rounded-lg transition hover:bg-primary-hover">
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Detail Peminjaman</h1>
            <p className="text-sm text-slate-500">
              Kode: <span className="font-mono font-semibold text-blue-600">{detail.kodePinjam}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Informasi Peminjaman */}
        <div className="relative overflow-hidden bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-blue-500">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <FileText className="h-5 w-5 text-blue-500" /> Informasi Peminjaman
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status Peminjaman</p>
              <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold tracking-wide uppercase shadow-sm ${getStatusBadge(detail.status)}`}>
                <span className="flex items-center gap-1.5">
                  {getStatusIcon(detail.status)}
                  {detail.status}
                </span>
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Peminjam</p>
              <p className="text-sm font-bold text-slate-800">{detail.namaPeminjam}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tanggal Peminjaman</p>
              <p className="text-sm font-bold text-slate-800">{formatDate(detail.tanggalPeminjaman)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Disetujui Oleh</p>
              <p className="text-sm font-medium text-slate-700">{detail.approvedBy || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Keperluan / Alasan</p>
              <p className="text-sm font-medium text-slate-700">{detail.alasanPeminjaman || "-"}</p>
            </div>
            {detail.yangMenyerahkan && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Diserahkan Oleh</p>
                <p className="text-sm font-medium text-slate-700">{detail.yangMenyerahkan}</p>
              </div>
            )}
          </div>
          {parseBuktiImages(detail.buktiPeminjaman).length > 0 && (
            <ImageCarouselInner 
              images={parseBuktiImages(detail.buktiPeminjaman)} 
              title="Bukti Peminjaman" 
              backendUrl={BACKEND_URL} 
              onImageClick={(imgs, idx) => setLightboxData({ images: imgs, index: idx })} 
            />
          )}
        </div>

        {/* Informasi Pengembalian */}
        <div className="relative overflow-hidden bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-emerald-500">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <Clock className="h-5 w-5 text-emerald-500" /> Informasi Pengembalian
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tanggal Pengembalian</p>
              <p className="text-sm font-bold text-slate-800">{formatDate(detail.tanggalPengembalian)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Penerima Aset (Admin)</p>
              <p className="text-sm font-bold text-slate-800">{detail.penerimaAset || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status Pengembalian</p>
              <p className="text-sm font-medium text-slate-700">{detail.status === "Peminjaman Selesai" ? "Sudah Dikembalikan" : "Belum Dikembalikan"}</p>
            </div>
            {detail.returnApprovedBy && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Disetujui Oleh</p>
                <p className="text-sm font-medium text-slate-700">{detail.returnApprovedBy}</p>
              </div>
            )}
          </div>
          {parseBuktiImages(detail.buktiPengembalian).length > 0 && (
            <ImageCarouselInner 
              images={parseBuktiImages(detail.buktiPengembalian)} 
              title="Bukti Pengembalian" 
              backendUrl={BACKEND_URL} 
              onImageClick={(imgs, idx) => setLightboxData({ images: imgs, index: idx })} 
            />
          )}
        </div>
      </div>

      <div className="relative overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-primary">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" /> Daftar Alat yang Dipinjam
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm table-fixed">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4 font-bold text-slate-700 text-xs w-16 text-center border-r border-slate-200 uppercase tracking-wider">No</th>
                <th className="px-5 py-4 font-bold text-slate-700 text-xs border-r border-slate-200 uppercase tracking-wider">Nama Item</th>
                <th className="px-5 py-4 font-bold text-slate-700 text-xs w-48 border-r border-slate-200 uppercase tracking-wider">Kode</th>
                <th className="px-5 py-4 font-bold text-slate-700 text-xs w-28 text-center uppercase tracking-wider">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {detail.items && detail.items.length > 0 ? (
                detail.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-slate-500 text-sm text-center border-r border-slate-200">{idx + 1}</td>
                    <td className="px-5 py-4 font-bold text-slate-700 text-sm border-r border-slate-200">{item.namaAset}</td>
                    <td className="px-5 py-4 font-mono text-blue-600 font-semibold text-sm border-r border-slate-200 bg-blue-50/30">{item.kodeAset}</td>
                    <td className="px-5 py-4 text-slate-700 font-black text-center text-sm">{item.jumlah}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400 text-sm">Tidak ada item yang terkait.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lightbox for Images */}
      {lightboxData && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxData(null)}>
          <button type="button" onClick={() => setLightboxData(null)} className="absolute top-4 right-4 text-white hover:text-slate-300 transition-colors z-[110] cursor-pointer">
            <X className="w-8 h-8" />
          </button>
          
          <div className="relative w-full max-w-5xl aspect-video flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {lightboxData.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setLightboxData(prev => ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length })); }}
                  className="absolute left-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors z-[110] cursor-pointer"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setLightboxData(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length })); }}
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
    </div>
  );
}
