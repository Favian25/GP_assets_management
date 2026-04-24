"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { getPeminjamanById, updatePeminjaman } from "../../../../lib/peminjamanService";
import { ChevronLeft, ChevronRight, FileText, Check, X, Calendar, User, Package, Lock, Plus } from "lucide-react";

const getBackendURL = () => {
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:5000`;
  }
  return "http://localhost:5000";
};
const BACKEND_URL = getBackendURL();

// Helper: parse bukti data yang bisa berupa string JSON atau array (jika kolom MySQL bertipe JSON)
const parseBuktiImages = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch { return []; }
  }
  return [];
};

const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const formatDatetimeForMySQL = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 19).replace("T", " ");
};

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  }).format(new Date(dateString)) + " WIB";
};

const getStatusLabel = (status) => {
  const map = {
    "Pending": "Belum Dikembalikan",
    "Dikembalikan": "Sudah Dikembalikan",
    "Approved": "Sudah Disetujui",
  };
  return map[status] || status;
};

const getStatusBadge = (status) => {
  const s = {
    "Pending": "bg-amber-50 text-amber-700 border-amber-200",
    "Dikembalikan": "bg-blue-50 text-blue-700 border-blue-200",
    "Approved": "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return s[status] || "bg-slate-50 text-slate-700 border-slate-200";
};

export default function EditPeminjamanPage() {
  const router = useRouter();
  const params = useParams();
  const peminjamanId = params.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Editable fields only
  const [tanggalPengembalian, setTanggalPengembalian] = useState("");
  const [status, setStatus] = useState("");
  const [penerimaAset, setPenerimaAset] = useState("");
  const [buktiFiles, setBuktiFiles] = useState([]);
  const [buktiPreviews, setBuktiPreviews] = useState([]);
  const [existingBuktiPeminjaman, setExistingBuktiPeminjaman] = useState([]);
  const [lightboxData, setLightboxData] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); } }, [toast]);
  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getPeminjamanById(peminjamanId);
      setData(result);
      setTanggalPengembalian(formatDateForInput(result.tanggalPengembalian));
      setStatus(result.status);
      setPenerimaAset(result.penerimaAset || "");
      
      // Parse bukti - handle both JSON string and already-parsed array
      setExistingBuktiPeminjaman(parseBuktiImages(result.buktiPeminjaman));
    } catch (err) {
      console.error("Error fetching peminjaman:", err);
      showToast("Gagal memuat data", "error");
    } finally {
      setLoading(false);
    }
  }, [peminjamanId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (newFiles) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    let filesToAdd = [];
    let isValid = true;

    newFiles.forEach(file => {
      if (!validTypes.includes(file.type)) {
        showToast("Format file tidak didukung (harus JPG/PNG)", "error");
        isValid = false;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast(`Ukuran ${file.name} melebihi 5MB`, "error");
        isValid = false;
        return;
      }
      filesToAdd.push(file);
    });

    if (!isValid) return;

    if (buktiFiles.length + filesToAdd.length > 5) {
      showToast("Maksimal 5 gambar diperbolehkan", "error");
      return;
    }

    const updatedFiles = [...buktiFiles, ...filesToAdd];
    setBuktiFiles(updatedFiles);

    const previews = updatedFiles.map(f => URL.createObjectURL(f));
    setBuktiPreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await updatePeminjaman(peminjamanId, {
        tanggalPengembalian: tanggalPengembalian ? formatDatetimeForMySQL(tanggalPengembalian) : null,
        status,
        penerimaAset,
      }, buktiFiles);
      showToast("Data peminjaman berhasil diperbarui!");
      setTimeout(() => router.push("/aset/peminjaman"), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal memperbarui data", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Edit Pengembalian</h1></div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-8 animate-pulse space-y-3">
          {[1,2,3,4].map(i => (<div key={i} className="flex gap-4"><div className="h-4 w-32 rounded bg-slate-200"/><div className="h-4 flex-1 rounded bg-slate-200"/></div>))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-20 text-slate-500">Data peminjaman tidak ditemukan.</div>
      </div>
    );
  }

  return (
    <>
    <div className="max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-100 flex items-center gap-2 rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-white transition-all animate-[slideIn_0.3s_ease] ${toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"}`}>
          {toast.type === "error" ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push("/aset/peminjaman")} className="cursor-pointer rounded-lg bg-primary p-2 text-white hover:bg-primary-hover shadow-sm transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Pengembalian #{data.kodePinjam}</h1>
          <p className="text-sm text-slate-500">Update data pengembalian aset</p>
        </div>
      </div>

      {/* Info Read-Only */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-slate-400 mb-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            Data Peminjaman (Read-Only)
          </h2>
          <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${getStatusBadge(data.status)}`}>{getStatusLabel(data.status)}</span>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">No. Peminjaman</label>
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm font-mono font-bold text-primary">{data.kodePinjam}</div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Nama Peminjam</label>
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-700">{data.namaPeminjam}</div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Tanggal Peminjaman</label>
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-700">{formatDateTime(data.tanggalPeminjaman)}</div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Yang Menyerahkan</label>
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-700">{data.yangMenyerahkan || "-"}</div>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-500">Alasan Peminjaman</label>
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-700 min-h-[60px]">{data.alasanPeminjaman || "-"}</div>
          </div>
          
          {/* Existing Bukti Peminjaman */}
          {existingBuktiPeminjaman.length > 0 && (
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-medium text-slate-500">Bukti Peminjaman</label>
              <div className="flex flex-wrap justify-center gap-3">
                {existingBuktiPeminjaman.map((path, idx) => (
                  <div 
                    key={idx} 
                    className="relative h-24 w-[calc(33.333%-12px)] min-w-[120px] rounded-lg overflow-hidden border border-slate-200 group cursor-zoom-in shadow-sm hover:border-primary/50 transition-colors" 
                    onClick={() => setLightboxData({ images: existingBuktiPeminjaman, index: idx })}
                  >
                    <Image src={`${BACKEND_URL}${path}`} alt={`Bukti Peminjaman ${idx + 1}`} fill className="object-cover group-hover:scale-110 transition-transform duration-300" unoptimized />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Items Read-Only */}
        {data.items && data.items.length > 0 && (
          <div className="px-6 pb-6">
            <label className="mb-2 block text-xs font-medium text-slate-500">Daftar Alat Dipinjam</label>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-2 text-left font-semibold text-slate-600 w-10">No</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600 w-32">Kode Aset</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">Nama Aset</th>
                  <th className="px-4 py-2 text-center font-semibold text-slate-600 w-36">Jumlah Dipinjam</th>
                </tr></thead>
                <tbody>
                  {data.items.map((item, i) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-2 text-slate-500">{i + 1}</td>
                      <td className="px-4 py-2 text-xs text-slate-500 font-mono font-bold">{item.kodeAset}</td>
                      <td className="px-4 py-2 text-slate-700 font-medium">{item.namaAset}</td>
                      <td className="px-4 py-2 text-center font-semibold text-slate-700">{item.jumlah}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Editable Section */}
      <form onSubmit={handleSubmit}>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-amber-500 mb-6">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-500" />
              Data Pengembalian (Dapat Diedit)
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Status <span className="text-rose-500">*</span></label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="Pending">Belum Dikembalikan</option>
                <option value="Dikembalikan">Sudah Dikembalikan</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Tanggal Pengembalian</label>
              <input type="datetime-local" value={tanggalPengembalian} onChange={(e) => setTanggalPengembalian(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Penerima Alat</label>
              <input type="text" placeholder="Siapa yang menerima alat yang dikembalikan" value={penerimaAset} onChange={(e) => setPenerimaAset(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>

            {/* Bukti Pengembalian Upload */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Bukti Pengembalian <span className="text-xs text-slate-400 font-normal ml-1">(Opsional)</span></label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
                <input type="file" multiple accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" id="bukti-pengembalian-upload" />
                <label htmlFor="bukti-pengembalian-upload" className="cursor-pointer flex flex-col items-center justify-center">
                  <Plus className="h-8 w-8 text-slate-300 mb-2" />
                  <span className="text-sm font-medium text-slate-600">Klik untuk upload bukti pengembalian</span>
                  <span className="text-xs text-slate-400 mt-1">Maks. 5 file (JPG/PNG), masing-masing maks 5MB</span>
                </label>
              </div>

              {/* Previews */}
              {buktiPreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {buktiPreviews.map((src, idx) => (
                    <div key={idx} className="relative group h-20 rounded-lg overflow-hidden border border-slate-200">
                      <Image src={src} alt="Preview Bukti" fill unoptimized className="object-cover" />
                      <button type="button" 
                        onClick={() => {
                          const newFiles = [...buktiFiles]; newFiles.splice(idx, 1); setBuktiFiles(newFiles);
                          const newPreviews = [...buktiPreviews]; newPreviews.splice(idx, 1); setBuktiPreviews(newPreviews);
                        }}
                        className="absolute top-1 right-1 rounded-full bg-rose-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 shadow-sm"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mb-10">
          <button type="button" onClick={() => router.push("/aset/peminjaman")}
            className="cursor-pointer rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
            Batal
          </button>
          <button type="submit" disabled={submitting}
            className="cursor-pointer rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-60">
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>

    {/* Lightbox Overlay */}
    {lightboxData && (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4 cursor-pointer" onClick={() => setLightboxData(null)}>
        <div className="relative flex items-center gap-4 w-full max-w-5xl h-[85vh]" onClick={(e) => e.stopPropagation()}>
          {lightboxData.images.length > 1 && (
            <button 
              onClick={() => setLightboxData(prev => ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length }))}
              className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm shadow-xl"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}
          
          <div className="relative flex-1 h-full">
            <Image 
              src={`${BACKEND_URL}${lightboxData.images[lightboxData.index]}`} 
              alt="Preview Bukti Full" 
              fill 
              className="rounded-xl object-contain shadow-2xl cursor-default" 
              unoptimized 
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
              {lightboxData.index + 1} / {lightboxData.images.length}
            </div>
          </div>

          {lightboxData.images.length > 1 && (
            <button 
              onClick={() => setLightboxData(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length }))}
              className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm shadow-xl"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}
        </div>
        <button className="absolute right-6 top-6 text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full" onClick={() => setLightboxData(null)}>
          <X className="h-8 w-8" />
        </button>
      </div>
    )}
    </>
  );
}
