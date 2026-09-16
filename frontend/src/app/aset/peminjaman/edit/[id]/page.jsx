"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  getPeminjamanById,
  updatePeminjaman,
  getItemsWithPricing,
  swapPeminjamanItem,
  addItemToPeminjaman,
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
  Plus,
  Camera,
  ImageIcon,
  Trash2,
  ArrowLeftRight,
  PackagePlus,
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
    "Menunggu Persetujuan": "bg-amber-50 text-amber-700 border-amber-500",
    "Sedang Dipinjam": "bg-blue-50 text-blue-700 border-blue-500",
    "Menunggu Verifikasi": "bg-violet-50 text-violet-700 border-violet-500",
    "Peminjaman Selesai": "bg-emerald-50 text-emerald-700 border-emerald-500",
  };
  return s[status] || "bg-slate-50 text-slate-700 border-slate-200";
};

const getKondisiBadge = (kondisi) => {
  const badges = {
    "Siap Digunakan": "bg-green-100 text-green-800",
    Rusak: "bg-red-100 text-red-800",
    "Rusak Berat": "bg-red-900 text-white",
    Maintenance: "bg-yellow-100 text-yellow-800",
  };
  return badges[kondisi] || "bg-gray-100 text-gray-800";
};

export default function EditPeminjamanPage() {
  const router = useRouter();
  const params = useParams();
  const peminjamanId = params.id;

  // State
  const [data, setData] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Return form state
  const [tanggalPengembalian, setTanggalPengembalian] = useState("");
  const [penerimaAset, setPenerimaAset] = useState("");
  const [buktiFiles, setBuktiFiles] = useState([]);
  const [buktiPreviews, setBuktiPreviews] = useState([]);
  const [existingBuktiPeminjaman, setExistingBuktiPeminjaman] = useState([]);

  // Swap/Add Item state
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItemForSwap, setSelectedItemForSwap] = useState(null);
  const [allItems, setAllItems] = useState([]);
  const [swapNewItem, setSwapNewItem] = useState(null);
  const [addNewItem, setAddNewItem] = useState(null);
  const [swapJumlah, setSwapJumlah] = useState(1);
  const [addJumlah, setAddJumlah] = useState(1);

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

  const showToast = (message, type = "success") =>
    setToast({ message, type });

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [peminjamanData, itemsData, assets, aksesoris] = await Promise.all([
        getPeminjamanById(peminjamanId),
        getItemsWithPricing(peminjamanId),
        getAllAssets(),
        getAllAksesoris(),
      ]);

      setData(peminjamanData);
      setItems(itemsData || []);
      setExistingBuktiPeminjaman(
        parseBuktiImages(peminjamanData.buktiPeminjaman)
      );

      // Auto-fill penerima_aset if empty
      if (!peminjamanData.penerimaAset && currentUser) {
        setPenerimaAset(currentUser.nama || "");
      } else {
        setPenerimaAset(peminjamanData.penerimaAset || "");
      }

      // Combine all items for swap/add modal
      const combined = [
        ...assets
          .filter((a) => a.kondisi === "Siap Digunakan")
          .map((a) => ({
            id: a.id,
            nama: a.namaAset,
            kode: a.kodeAset,
            harga: a.hargaAset || 0,
            stok: a.jumlah,
            kondisi: a.kondisi,
            tipe: "asset",
          })),
        ...aksesoris
          .filter((ak) => ak.kondisi === "Siap Digunakan")
          .map((ak) => ({
            id: ak.id,
            nama: ak.namaAksesoris,
            kode: ak.kodeAksesoris,
            harga: ak.hargaAset || 0,
            stok: ak.jumlahUnit,
            kondisi: ak.kondisi,
            tipe: "aksesoris",
          })),
      ];
      setAllItems(combined);
    } catch (err) {
      console.error("Error fetching data:", err);
      showToast("Gagal memuat data", "error");
    } finally {
      setLoading(false);
    }
  }, [peminjamanId, currentUser]);

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

  // Swap item handler
  const handleSwapItem = async () => {
    if (!selectedItemForSwap || !swapNewItem) {
      showToast("Pilih item lama dan baru", "error");
      return;
    }

    if (swapJumlah > selectedItemForSwap.stok) {
      showToast("Jumlah melebihi stok", "error");
      return;
    }

    try {
      setSubmitting(true);
      await swapPeminjamanItem(peminjamanId, {
        oldItemId: selectedItemForSwap.id,
        oldItemType: selectedItemForSwap.tipe,
        newItemId: swapNewItem.id,
        newItemType: swapNewItem.tipe,
        jumlah: swapJumlah,
      });

      showToast("Item berhasil ditukar!");
      setShowSwapModal(false);
      setSelectedItemForSwap(null);
      setSwapNewItem(null);
      setSwapJumlah(1);

      // Reload items
      const newItems = await getItemsWithPricing(peminjamanId);
      setItems(newItems || []);
    } catch (err) {
      showToast(err.message || "Gagal menukar item", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Add item handler
  const handleAddItem = async () => {
    if (!addNewItem) {
      showToast("Pilih item yang ingin ditambahkan", "error");
      return;
    }

    if (addJumlah > addNewItem.stok) {
      showToast("Jumlah melebihi stok", "error");
      return;
    }

    try {
      setSubmitting(true);
      await addItemToPeminjaman(peminjamanId, {
        itemId: addNewItem.id,
        itemType: addNewItem.tipe,
        jumlah: addJumlah,
      });

      showToast("Item berhasil ditambahkan!");
      setShowAddModal(false);
      setAddNewItem(null);
      setAddJumlah(1);

      // Reload items
      const newItems = await getItemsWithPricing(peminjamanId);
      setItems(newItems || []);
    } catch (err) {
      showToast(err.message || "Gagal menambah item", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tanggalPengembalian) {
      showToast("Tanggal pengembalian wajib diisi", "error");
      return;
    }

    if (!penerimaAset?.trim()) {
      showToast("Penerima aset wajib diisi", "error");
      return;
    }

    if (buktiFiles.length === 0) {
      showToast("Upload bukti pengembalian minimal 1 gambar", "error");
      return;
    }

    try {
      setSubmitting(true);
      const dateStr = tanggalPengembalian;

      await updatePeminjaman(
        peminjamanId,
        {
          tanggal_pengembalian: dateStr,
          status: "Menunggu Verifikasi",
          penerima_aset: penerimaAset,
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
      <div className="min-h-screen bg-slate-50 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 py-6 px-4">
        <div className="max-w-4xl mx-auto text-center py-20 text-slate-500">
          Data peminjaman tidak ditemukan
        </div>
      </div>
    );
  }

  const canReturnItems = data.status === "Sedang Dipinjam";

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Detail Peminjaman #{data.kodePinjam}
            </h1>
            <p className="text-sm text-slate-500">
              Status: <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(data.status)}`}>{data.status}</span>
            </p>
          </div>
        </div>

        {/* Info Read-Only */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Data Peminjaman
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Nama Peminjam
              </label>
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-slate-900">
                {data.namaPeminjam}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Tanggal Peminjaman
              </label>
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-slate-900">
                {formatDateTime(data.tanggalPeminjaman)}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Yang Menyerahkan
              </label>
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-slate-900">
                {data.yangMenyerahkan || "-"}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Disetujui Oleh
              </label>
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-slate-900">
                {data.approvedBy || "-"}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Alasan/Keperluan Peminjaman
              </label>
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-slate-900 min-h-[60px]">
                {data.alasanPeminjaman || "-"}
              </div>
            </div>
          </div>

          {/* Bukti Peminjaman */}
          {existingBuktiPeminjaman.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <label className="text-xs font-medium text-slate-600 block mb-2">
                Bukti Peminjaman
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {existingBuktiPeminjaman.map((path, idx) => (
                  <img
                    key={idx}
                    src={`${BACKEND_URL}${path}`}
                    alt={`Bukti ${idx + 1}`}
                    className="h-24 w-full object-cover rounded-lg border border-slate-200"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Item yang Dipinjam ({items.length})
            </h2>

            {canReturnItems && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSwapModal(true)}
                  className="flex items-center gap-2 px-3 py-1 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition"
                >
                  <ArrowLeftRight className="w-4 h-4" /> Tukar
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                >
                  <PackagePlus className="w-4 h-4" /> Tambah
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-center text-slate-500 py-4">Tidak ada item</p>
            ) : (
              items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{item.namaAset}</p>
                    <p className="text-xs text-slate-500">
                      {item.kodeAset} • {item.kategori}
                    </p>
                    <div className="flex gap-1 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${getKondisiBadge(item.kondisi)}`}>
                        {item.kondisi}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {item.tipe === "asset" ? "Aset" : "Aksesoris"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      Qty: {item.jumlah}
                    </p>
                    {item.hargaUnit > 0 && (
                      <p className="text-xs text-emerald-600 font-semibold">
                        Rp {(item.hargaUnit * item.jumlah).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total Value */}
          {items.some((it) => it.hargaUnit > 0) && (
            <div className="mt-4 pt-4 border-t border-slate-200 text-right">
              <p className="text-sm text-slate-600">Total Nilai Aset:</p>
              <p className="text-2xl font-bold text-emerald-600">
                Rp{" "}
                {items
                  .reduce((sum, item) => sum + (item.hargaUnit * item.jumlah || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Return Form - Conditional */}
        {canReturnItems && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Return Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                ✓ Aset sedang dipinjam. Isi data pengembalian di bawah.
              </p>
            </div>

            {/* Tanggal Pengembalian */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Data Pengembalian
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tanggal Pengembalian *
                  </label>
                  <input
                    type="date"
                    value={tanggalPengembalian}
                    onChange={(e) => setTanggalPengembalian(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Jam akan otomatis diisi saat menyimpan
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Penerima Aset *
                  </label>
                  <input
                    type="text"
                    value={penerimaAset}
                    onChange={(e) => setPenerimaAset(e.target.value)}
                    placeholder="Nama orang yang menerima"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Bukti Pengembalian */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Bukti Pengembalian ({buktiFiles.length}/5)
              </h3>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-blue-50 transition"
              >
                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">
                  Klik atau drag gambar
                </p>
                <p className="text-xs text-slate-500">PNG, JPG max 5 gambar</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {buktiPreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
                  {buktiPreviews.map((preview, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {submitting ? "Menyimpan..." : "Simpan Pengembalian"}
              </button>
            </div>
          </form>
        )}

        {/* Info jika belum bisa dikembalikan */}
        {!canReturnItems && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
            <p className="text-sm text-amber-900">
              Aset hanya dapat dikembalikan saat status "Sedang Dipinjam".<br />
              Status saat ini: <span className="font-semibold">{data.status}</span>
            </p>
          </div>
        )}
      </div>

      {/* Swap Item Modal */}
      {showSwapModal && canReturnItems &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Tukar Barang
              </h3>

              <div className="space-y-4">
                {/* Pilih item yang ingin ditukar */}
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Item yang Ditukar
                  </label>
                  <select
                    value={selectedItemForSwap?.id || ""}
                    onChange={(e) => {
                      const selected = items.find((it) => it.id == e.target.value);
                      setSelectedItemForSwap(selected);
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary focus:outline-none"
                  >
                    <option value="">-- Pilih Item --</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.namaAset} (qty: {item.jumlah})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pilih item pengganti */}
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Item Pengganti
                  </label>
                  <select
                    value={swapNewItem?.id || ""}
                    onChange={(e) => {
                      const selected = allItems.find((it) => it.id == e.target.value);
                      setSwapNewItem(selected);
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary focus:outline-none"
                  >
                    <option value="">-- Pilih Item Pengganti --</option>
                    {allItems
                      .filter(
                        (it) =>
                          !(items.some(
                            (item) =>
                              item.id === it.id && item.tipe === it.tipe
                          ))
                      )
                      .map((item) => (
                        <option key={`${item.tipe}-${item.id}`} value={item.id}>
                          {item.nama} (stok: {item.stok})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Jumlah */}
                {selectedItemForSwap && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">
                      Jumlah
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedItemForSwap.jumlah}
                      value={swapJumlah}
                      onChange={(e) =>
                        setSwapJumlah(Math.min(parseInt(e.target.value) || 1, selectedItemForSwap.jumlah))
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowSwapModal(false);
                    setSelectedItemForSwap(null);
                    setSwapNewItem(null);
                    setSwapJumlah(1);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSwapItem}
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitting ? "Menukar..." : "Tukar"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Add Item Modal */}
      {showAddModal && canReturnItems &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Tambah Barang
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Item yang Ditambahkan
                  </label>
                  <select
                    value={addNewItem?.id || ""}
                    onChange={(e) => {
                      const selected = allItems.find((it) => it.id == e.target.value);
                      setAddNewItem(selected);
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary focus:outline-none"
                  >
                    <option value="">-- Pilih Item --</option>
                    {allItems
                      .filter(
                        (it) =>
                          !(items.some(
                            (item) =>
                              item.id === it.id && item.tipe === it.tipe
                          ))
                      )
                      .map((item) => (
                        <option key={`${item.tipe}-${item.id}`} value={item.id}>
                          {item.nama} (stok: {item.stok})
                        </option>
                      ))}
                  </select>
                </div>

                {addNewItem && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">
                      Jumlah
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={addNewItem.stok}
                      value={addJumlah}
                      onChange={(e) =>
                        setAddJumlah(Math.min(parseInt(e.target.value) || 1, addNewItem.stok))
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setAddNewItem(null);
                    setAddJumlah(1);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitting ? "Menambah..." : "Tambah"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Toast */}
      {toast &&
        createPortal(
          <div
            className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white font-medium shadow-lg ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.message}
          </div>,
          document.body
        )}
    </div>
  );
}
