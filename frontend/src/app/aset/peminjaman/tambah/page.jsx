"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createPeminjaman, getNextKodePinjam } from "../../../lib/peminjamanService";
import { getAllAssets } from "../../../lib/assetService";
import { getAllAksesoris } from "../../../lib/aksesorisService";
import { ChevronLeft, FileText, Package, Plus, X, Check, AlertTriangle } from "lucide-react";

// Format Datetime for MySQL
const formatDatetimeForMySQL = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 19).replace("T", " ");
};

// Autocomplete component for each item row
function AssetAutocompleteRow({ itemsList, value, onSelect, disabled }) {
  const [query, setQuery] = useState(value?.namaItem || "");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value?.namaItem || "");
  }, [value?.namaItem]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = itemsList.filter(item =>
    (item.namaItem || "").toLowerCase().includes(query.toLowerCase()) ||
    (item.kodeItem || "").toLowerCase().includes(query.toLowerCase()) ||
    (item.kategori || "").toLowerCase().includes(query.toLowerCase()) ||
    (item.merek || "").toLowerCase().includes(query.toLowerCase())
  ).slice(0, 15);

  const getKondisiBadge = (kondisi) => {
    switch(kondisi) {
      case "Siap Digunakan": return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "Rusak": return "bg-rose-50 text-rose-600 border-rose-200";
      case "Rusak Berat": return "bg-rose-900 text-white border-rose-900";
      case "Maintenance": return "bg-amber-50 text-amber-600 border-amber-200";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        placeholder="Cari nama aset..."
        value={query}
        disabled={disabled}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          if (e.target.value === "") {
            onSelect(null);
          }
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-slate-50 disabled:cursor-not-allowed"
      />
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto rounded-lg bg-white border border-slate-200 shadow-xl">
          {filtered.length > 0 ? (
            filtered.map(item => {
              const isAvailable = item.kondisi === "Siap Digunakan";
              return (
                <div
                  key={`${item.itemType}-${item.id}`}
                  onClick={() => {
                    if (!isAvailable) return;
                    setQuery(item.namaItem);
                    setIsOpen(false);
                    onSelect(item);
                  }}
                  className={`px-4 py-2 border-b border-slate-100 last:border-0 transition-colors ${isAvailable ? 'cursor-pointer hover:bg-slate-50' : 'cursor-not-allowed bg-slate-50/50 opacity-60'}`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm font-semibold ${isAvailable ? 'text-slate-800' : 'text-slate-400'}`}>{item.namaItem}</p>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${item.itemType === 'asset' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-purple-50 text-purple-600 border-purple-200'}`}>
                        {item.itemType === 'asset' ? 'Aset' : 'Aksesoris'}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${getKondisiBadge(item.kondisi)}`}>
                        {item.kondisi}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-slate-500 font-medium">{item.kodeItem} • {item.kategori}</p>
                    <p className={`text-[11px] font-bold ${item.stok > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      Stok: {item.stok ?? 0}
                    </p>
                  </div>
                  {!isAvailable && (
                    <p className="mt-1 text-[10px] text-rose-500 font-bold italic">
                      * Tidak dapat dipinjam ({item.kondisi})
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500 text-center">Item tidak ditemukan</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TambahPeminjamanPage() {
  const router = useRouter();

  const [kodePinjam, setKodePinjam] = useState("");
  const [namaPeminjam, setNamaPeminjam] = useState("");
  const [yangMenyerahkan, setYangMenyerahkan] = useState("");
  const [tanggalPeminjaman, setTanggalPeminjaman] = useState("");
  const [alasanPeminjaman, setAlasanPeminjaman] = useState("");
  const [items, setItems] = useState([{ assetId: "", aksesorisId: "", namaItem: "", kodeItem: "", jumlah: 1, stokTersedia: 0, itemType: "asset" }]);
  const [buktiFiles, setBuktiFiles] = useState([]);
  const [buktiPreviews, setBuktiPreviews] = useState([]);
  const [borrowableItems, setBorrowableItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); } }, [toast]);

  useEffect(() => {
    const saved = localStorage.getItem('tempPeminjaman');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.namaPeminjam) setNamaPeminjam(parsed.namaPeminjam);
        if (parsed.yangMenyerahkan) setYangMenyerahkan(parsed.yangMenyerahkan);
        if (parsed.tanggalPeminjaman) setTanggalPeminjaman(parsed.tanggalPeminjaman);
        if (parsed.alasanPeminjaman) setAlasanPeminjaman(parsed.alasanPeminjaman);
        if (parsed.items && parsed.items.length > 0) setItems(parsed.items);
      } catch(e) {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('tempPeminjaman', JSON.stringify({
        namaPeminjam, yangMenyerahkan, tanggalPeminjaman, alasanPeminjaman, items
      }));
    }
  }, [namaPeminjam, yangMenyerahkan, tanggalPeminjaman, alasanPeminjaman, items, isLoaded]);
  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchInitialData = useCallback(async () => {
    try {
      const [kode, assets, aksesoris] = await Promise.all([getNextKodePinjam(), getAllAssets(), getAllAksesoris()]);
      setKodePinjam(kode);
      
      const combined = [
        ...assets
          .filter(a => a.kondisi !== "Dijual")
          .map(a => ({
            id: a.id,
            namaItem: a.namaAset,
            kodeItem: a.kodeAset,
            kategori: a.kategori,
            merek: a.merek,
            stok: a.jumlah,
            kondisi: a.kondisi,
            itemType: 'asset'
          })),
        ...aksesoris
          .filter(ak => ak.kondisi !== "Dijual")
          .map(ak => ({
            id: ak.id,
            namaItem: ak.namaAksesoris,
            kodeItem: ak.kodeAksesoris,
            kategori: ak.kategori,
            merek: ak.merek,
            stok: ak.jumlahUnit,
            kondisi: ak.kondisi,
            itemType: 'aksesoris'
          }))
      ];
      setBorrowableItems(combined);
    } catch (err) {
      console.error("Error fetching initial data:", err);
      showToast("Gagal memuat data awal", "error");
    }
  }, []);

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  // Handlers file bukti
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

  const currentFileRef = useRef(null);

  // Item management
  const addItem = () => {
    setItems(prev => [...prev, { assetId: "", namaAset: "", kodeAset: "", jumlah: 1, stokTersedia: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const selectAssetForItem = (index, itemData) => {
    if (!itemData) {
      setItems(prev => prev.map((it, i) => i === index ? { ...it, assetId: "", aksesorisId: "", namaItem: "", kodeItem: "", stokTersedia: 0 } : it));
      return;
    }
    
    // Alert jika bukan Siap Digunakan
    if (itemData.kondisi !== "Siap Digunakan") {
      showToast(`Item "${itemData.namaItem}" dalam kondisi ${itemData.kondisi} dan tidak dapat dipinjam.`, "error");
      return;
    }

    // Alert jika stok kosong
    if ((itemData.stok ?? 0) <= 0) {
      showToast(`Stok "${itemData.namaItem}" kosong. Tidak dapat dipinjam.`, "error");
      return;
    }
    setItems(prev => prev.map((it, i) => i === index ? {
      ...it,
      assetId: itemData.itemType === 'asset' ? itemData.id : "",
      aksesorisId: itemData.itemType === 'aksesoris' ? itemData.id : "",
      namaItem: itemData.namaItem,
      kodeItem: itemData.kodeItem,
      stokTersedia: itemData.stok ?? 0,
      itemType: itemData.itemType
    } : it));
  };

  // Filter out already-selected items from suggestions
  const getAvailableItems = (currentIndex) => {
    const selectedAssetIds = items.filter((it, i) => i !== currentIndex && it.itemType === 'asset').map(it => it.assetId);
    const selectedAksIds = items.filter((it, i) => i !== currentIndex && it.itemType === 'aksesoris').map(it => it.aksesorisId);
    
    return borrowableItems.filter(item => {
      if (item.itemType === 'asset') return !selectedAssetIds.includes(item.id);
      return !selectedAksIds.includes(item.id);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaPeminjam || !tanggalPeminjaman || !yangMenyerahkan || !alasanPeminjaman) {
      showToast("Semua data input wajib diisi", "error");
      return;
    }

    if (buktiFiles.length === 0) {
      showToast("Bukti peminjaman wajib diisi (minimal 1 gambar)", "error");
      return;
    }

    const validItems = items.filter(item => (item.assetId || item.aksesorisId) && item.jumlah > 0);
    if (validItems.length === 0) {
      showToast("Minimal harus ada 1 alat yang dipinjam", "error");
      return;
    }

    // Validasi stok
    for (const item of validItems) {
      if (item.jumlah > item.stokTersedia) {
        showToast(`Stok "${item.namaItem}" tidak cukup. Tersedia: ${item.stokTersedia}`, "error");
        return;
      }
    }

    try {
      setSubmitting(true);
      await createPeminjaman({
        namaPeminjam,
        yangMenyerahkan,
        tanggalPeminjaman: formatDatetimeForMySQL(tanggalPeminjaman),
        alasanPeminjaman,
        items: validItems.map(item => ({ 
          assetId: item.assetId || null, 
          aksesorisId: item.aksesorisId || null,
          jumlah: item.jumlah 
        })),
      }, buktiFiles);
      showToast("Peminjaman berhasil ditambahkan!");
      localStorage.removeItem('tempPeminjaman');
      setTimeout(() => router.push("/aset/peminjaman"), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal menambahkan peminjaman", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Toast */}
      {typeof document !== 'undefined' && toast && createPortal(
        <div className={`fixed top-20 right-6 z-9999 flex items-center gap-2 rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-white transition-all animate-[slideIn_0.3s_ease] ${toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"}`}>
          {toast.type === "error" ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {toast.message}
        </div>,
        document.body
      )}

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push("/aset/peminjaman")} className="cursor-pointer rounded-lg bg-primary p-2 text-white hover:bg-primary-hover transition-colors shadow-sm">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tambah Peminjaman</h1>
          <p className="text-sm text-slate-500">Input data peminjaman aset baru</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Informasi Umum */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-primary mb-6">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Informasi Peminjaman
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Kode Pinjam - Auto */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">No. Peminjaman</label>
                <input type="text" value={kodePinjam} readOnly
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 font-mono font-semibold bg-slate-50 cursor-not-allowed" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Peminjam <span className="text-rose-500">*</span></label>
                <input type="text" placeholder="Nama peminjam" value={namaPeminjam} onChange={(e) => setNamaPeminjam(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required
                  onInvalid={(e) => e.target.setCustomValidity("Nama peminjam wajib diisi")} onInput={(e) => e.target.setCustomValidity("")} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Tanggal Peminjaman <span className="text-rose-500">*</span></label>
                <div className="relative">
                  {!tanggalPeminjaman && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
                      dd/mm/yyyy, --:--
                    </span>
                  )}
                  <input 
                    type="datetime-local" 
                    value={tanggalPeminjaman} 
                    onChange={(e) => setTanggalPeminjaman(e.target.value)}
                    onClick={(e) => { try { e.target.showPicker(); } catch(err) {} }}
                    className={`w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer ${!tanggalPeminjaman ? 'text-transparent' : 'text-slate-700 placeholder:text-slate-400'}`} 
                    required
                    onInvalid={(e) => e.target.setCustomValidity("Tanggal peminjaman wajib diisi")} 
                    onInput={(e) => e.target.setCustomValidity("")}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Yang Menyerahkan <span className="text-rose-500">*</span></label>
                <input type="text" placeholder="Siapa yang menyerahkan alat" value={yangMenyerahkan} onChange={(e) => setYangMenyerahkan(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required
                  onInvalid={(e) => e.target.setCustomValidity("Yang menyerahkan wajib diisi")} onInput={(e) => e.target.setCustomValidity("")} />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Alasan Peminjaman <span className="text-rose-500">*</span></label>
                <textarea rows={3} placeholder="Alasan / keperluan meminjam" value={alasanPeminjaman} onChange={(e) => setAlasanPeminjaman(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none" required
                  onInvalid={(e) => e.target.setCustomValidity("Alasan peminjaman wajib diisi")} onInput={(e) => e.target.setCustomValidity("")} />
              </div>
            </div>
          </div>
        </div>

        {/* Daftar Alat */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-amber-500 mb-6">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-500" />
              Daftar Alat yang Dipinjam
            </h2>
            <button type="button" onClick={addItem}
              className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover">
              <Plus className="h-3.5 w-3.5" />
              Tambah Alat
            </button>
          </div>
          <div className="p-6 space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 sm:flex sm:flex-nowrap sm:items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 relative">
                {/* Header (Mobile) / Number (Desktop) */}
                <div className="flex items-center justify-between sm:shrink-0 sm:pt-0.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {index + 1}
                  </div>
                  <button type="button" onClick={() => removeItem(index)} disabled={items.length <= 1}
                    className="sm:hidden cursor-pointer rounded-lg p-1.5 text-rose-400 hover:bg-rose-100 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Autocomplete Aset */}
                <div className="w-full sm:flex-1 sm:min-w-0">
                  <label className="mb-1 block text-xs font-medium text-slate-500">Nama Alat/Aksesoris</label>
                  <AssetAutocompleteRow
                    itemsList={getAvailableItems(index)}
                    value={{ namaItem: item.namaItem }}
                    onSelect={(itemData) => selectAssetForItem(index, itemData)}
                  />
                </div>

                {/* Jumlah & Stok Info */}
                <div className="flex items-start gap-3 w-full sm:w-auto">
                  <div className="flex-1 sm:w-24 shrink-0">
                    <label className="mb-1 block text-xs font-medium text-slate-500">Jumlah</label>
                    <input type="number" min="1" max={item.stokTersedia || 9999} value={item.jumlah}
                      onChange={(e) => updateItem(index, "jumlah", parseInt(e.target.value) || 1)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 text-center focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div className="w-20 sm:w-20 shrink-0 text-center">
                    <label className="mb-1 block text-xs font-medium text-slate-500">Stok</label>
                    <div className={`rounded-lg border px-2 py-2 text-sm font-semibold ${(item.assetId || item.aksesorisId) && item.stokTersedia > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                      {(item.assetId || item.aksesorisId) ? item.stokTersedia : "-"}
                    </div>
                  </div>
                </div>

                {/* Remove (Desktop) */}
                <div className="hidden sm:block shrink-0 pt-5">
                  <button type="button" onClick={() => removeItem(index)} disabled={items.length <= 1}
                    className="cursor-pointer rounded-lg p-1.5 text-rose-400 transition-colors hover:bg-rose-100 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bukti Peminjaman */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-emerald-500 mb-6">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-500" />
              Bukti Peminjaman <span className="text-rose-500">*</span> <span className="text-xs text-slate-400 ml-1">(Min. 1, Maks. 5 gambar)</span>
            </h2>
          </div>
          <div className="p-6">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileChange}
                ref={currentFileRef}
                className="hidden"
                id="bukti-upload"
              />
              <label htmlFor="bukti-upload" className="cursor-pointer flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                  <Plus className="h-6 w-6 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">Klik untuk upload bukti peminjaman</span>
                <p className="text-xs text-slate-500 mt-1">Maks. 5 gambar (JPG/PNG)</p>
              </label>
            </div>

            {/* Previews */}
            {buktiPreviews.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Preview Gambar ({buktiPreviews.length}/5)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {buktiPreviews.map((src, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 h-24">
                      <Image src={src} alt="Preview Bukti" fill unoptimized className="object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = [...buktiFiles];
                          newFiles.splice(idx, 1);
                          setBuktiFiles(newFiles);
                          const newPreviews = [...buktiPreviews];
                          newPreviews.splice(idx, 1);
                          setBuktiPreviews(newPreviews);
                        }}
                        className="absolute top-1 right-1 rounded-full bg-rose-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 shadow-sm"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mb-10">
          <button type="button" onClick={() => router.push("/aset/peminjaman")}
            className="cursor-pointer rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
            Batal
          </button>
          <button type="submit" disabled={submitting}
            className="cursor-pointer rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-60">
            {submitting ? "Menyimpan..." : "Simpan Peminjaman"}
          </button>
        </div>
      </form>
    </div>
  );
}
