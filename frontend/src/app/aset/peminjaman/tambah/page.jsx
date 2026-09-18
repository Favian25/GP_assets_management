"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createPeminjaman, getNextKodePinjam } from "../../../lib/peminjamanService";
import { getAllAssets } from "../../../lib/assetService";
import { getAllAksesoris } from "../../../lib/aksesorisService";
import { getActivePegawai, getApprovers } from "../../../lib/pegawaiService";
import api from "../../../lib/api";
import { getUserContext } from "../../../lib/authService";
import { ChevronLeft, FileText, Package, Plus, X, Check, AlertTriangle, Camera, Trash2, Grid, Image as ImageIcon, Search } from "lucide-react";

export default function TambahPeminjamanPage() {
  const router = useRouter();

  // User & Auth State
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");

  // Form Data State
  const [kodePinjam, setKodePinjam] = useState("");
  const [namaPeminjam, setNamaPeminjam] = useState("");
  const [yangMenyerahkan, setYangMenyerahkan] = useState("");
  const [tanggalPeminjaman, setTanggalPeminjaman] = useState("");
  const [keperluanList, setKeperluanList] = useState([{ keperluan: "" }]);
  const [items, setItems] = useState([]);
  const [buktiFiles, setBuktiFiles] = useState([]);
  const [buktiPreviews, setBuktiPreviews] = useState([]);

  // Dropdown Data State
  const [pegawaiList, setPegawaiList] = useState([]);
  const [approversList, setApproversList] = useState([]);
  const [allItems, setAllItems] = useState([]);

  // UI State
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" atau "grid"
  const [itemSearch, setItemSearch] = useState("");
  const [itemFilter, setItemFilter] = useState("semua"); // "semua" | "asset" | "aksesoris"
  const [brandFilter, setBrandFilter] = useState("semua"); // "semua" | "Galeria Studio" | "Galeria Production"
  const fileInputRef = useRef(null);

  // Initialize user context
  useEffect(() => {
    const ctx = getUserContext();
    if (ctx) {
      setUserRole(ctx.role || "");
      setUserId(ctx.id);
      setUserName(ctx.namaLengkap || "");
      
      // Untuk non-super admin, autofill nama peminjam
      if (ctx.role !== "super admin") {
        setNamaPeminjam(ctx.namaLengkap || "");
      }
    }
  }, []);

  // Toast management
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = "success") => setToast({ message, type });

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    try {
      const [kode, assets, aksesoris, pegawai, approvers] = await Promise.all([
        getNextKodePinjam(),
        getAllAssets(),
        getAllAksesoris(),
        getActivePegawai(),
        getApprovers(),
      ]);

      setKodePinjam(kode);
      setPegawaiList(pegawai);
      setApproversList(approvers);

      // Combine assets dan aksesoris
      const combined = [
        ...assets
          .filter((a) => a.kondisi !== "Dijual")
          .map((a) => ({
            id: a.id,
            nama: a.namaAset,
            kode: a.kodeAset,
            kategori: a.kategori,
            merek: a.merek,
            harga: a.hargaAset || 0,
            stok: a.jumlah,
            kondisi: a.kondisi,
            gambar: a.gambar,
            jenisAset: a.jenisAset,
            tipe: "asset",
          })),
        ...aksesoris
          .filter((ak) => ak.kondisi !== "Dijual")
          .map((ak) => ({
            id: ak.id,
            nama: ak.namaAksesoris,
            kode: ak.kodeAksesoris,
            kategori: ak.kategori,
            merek: ak.merek,
            harga: ak.hargaAset || 0,
            stok: ak.jumlahUnit,
            kondisi: ak.kondisi,
            gambar: ak.gambar,
            jenisAset: ak.jenisAset,
            tipe: "aksesoris",
          })),
      ];
      setAllItems(combined);
    } catch (err) {
      console.error("Error fetching data:", err);
      showToast("Gagal memuat data awal", "error");
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Load temp data
  useEffect(() => {
    if (!isLoaded) {
      const saved = localStorage.getItem("tempPeminjaman");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Hanya restore namaPeminjam untuk super admin (non-super admin sudah autofill)
          if (parsed.namaPeminjam && userRole === "super admin") setNamaPeminjam(parsed.namaPeminjam);
          if (parsed.yangMenyerahkan && userRole === "super admin") setYangMenyerahkan(parsed.yangMenyerahkan);
          if (parsed.tanggalPeminjaman) setTanggalPeminjaman(parsed.tanggalPeminjaman);
          if (parsed.keperluanList) setKeperluanList(parsed.keperluanList);
          if (parsed.items) setItems(parsed.items);
        } catch (e) {}
      }
      setIsLoaded(true);
    }
  }, [isLoaded, userRole]);

  // Save temp data
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        "tempPeminjaman",
        JSON.stringify({
          namaPeminjam,
          yangMenyerahkan,
          tanggalPeminjaman,
          keperluanList,
          items,
        })
      );
    }
  }, [namaPeminjam, yangMenyerahkan, tanggalPeminjaman, keperluanList, items, isLoaded]);

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

    const previews = updated.map((f) => URL.createObjectURL(f));
    setBuktiPreviews(previews);
  };

  const removeFile = (index) => {
    const updated = buktiFiles.filter((_, i) => i !== index);
    setBuktiFiles(updated);
    setBuktiPreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  // Keperluan management
  const addKeperluan = () => {
    setKeperluanList([...keperluanList, { keperluan: "" }]);
  };

  const removeKeperluan = (index) => {
    if (keperluanList.length > 1) {
      setKeperluanList(keperluanList.filter((_, i) => i !== index));
    }
  };

  const updateKeperluan = (index, field, value) => {
    const updated = [...keperluanList];
    updated[index][field] = value;
    setKeperluanList(updated);
  };

  // Item management
  const addItemToList = (item) => {
    const alreadySelected = items.some(
      (it) => it.id === item.id && it.tipe === item.tipe
    );
    if (alreadySelected) {
      showToast("Item sudah dipilih", "error");
      return;
    }

    if (item.kondisi !== "Siap Digunakan") {
      showToast(`"${item.nama}" tidak dalam kondisi Siap Digunakan`, "error");
      return;
    }

    if (item.stok <= 0) {
      showToast(`"${item.nama}" stok kosong`, "error");
      return;
    }

    setItems([
      ...items,
      {
        id: item.id,
        nama: item.nama,
        kode: item.kode,
        tipe: item.tipe,
        harga: item.harga,
        stok: item.stok,
        jumlah: 1,
        kategori: item.kategori,
        merek: item.merek,
        jenisAset: item.jenisAset,
      },
    ]);
  };

  const removeItemFromList = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItemJumlah = (index, jumlah) => {
    const updated = [...items];
    updated[index].jumlah = Math.max(1, Math.min(jumlah, updated[index].stok));
    setItems(updated);
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!namaPeminjam || !tanggalPeminjaman) {
      showToast("Nama peminjam dan tanggal harus diisi", "error");
      return;
    }

    if (userRole === "super admin" && !yangMenyerahkan) {
      showToast("Yang menyerahkan harus diisi", "error");
      return;
    }

    if (!keperluanList[0]?.keperluan?.trim()) {
      showToast("Keperluan peminjaman harus diisi", "error");
      return;
    }

    if (items.length === 0) {
      showToast("Pilih minimal 1 item", "error");
      return;
    }

    if (buktiFiles.length === 0) {
      showToast("Upload bukti peminjaman minimal 1 gambar", "error");
      return;
    }

    // Validate stock
    for (const item of items) {
      if (item.jumlah > item.stok) {
        showToast(`Stok "${item.nama}" tidak cukup`, "error");
        return;
      }
    }

    try {
      setSubmitting(true);

      // Otomatis capture current time saat simpan
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const dateTimeStr = `${tanggalPeminjaman} ${hours}:${minutes}:${seconds}`;

      await createPeminjaman(
        {
          namaPeminjam: namaPeminjam,
          yangMenyerahkan: yangMenyerahkan || null,
          tanggalPeminjaman: dateTimeStr,
          alasanPeminjaman: keperluanList[0]?.keperluan?.trim() || "",
          keperluanList: keperluanList.filter((k) => k.keperluan?.trim()),
          items: items.map((item) => ({
            [item.tipe === "asset" ? "assetId" : "aksesorisId"]: item.id,
            jumlah: parseInt(item.jumlah) || 0,
          })),
        },
        buktiFiles
      );

      showToast("Peminjaman berhasil dibuat!", "success");
      localStorage.removeItem("tempPeminjaman");

      setTimeout(() => {
        router.push("/aset/peminjaman");
      }, 1500);
    } catch (err) {
      showToast(err.message || "Gagal membuat peminjaman", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper functions
  const getKondisiBadge = (kondisi, isList = false) => {
    const borderClass = isList ? " border " : "";
    const badges = {
      "Siap Digunakan": `bg-green-100 text-green-800${isList ? " border-green-200" : ""}`,
      Rusak: `bg-red-100 text-red-800${isList ? " border-red-200" : ""}`,
      "Rusak Berat": `bg-red-900 text-white${isList ? " border-red-800" : ""}`,
      Maintenance: `bg-yellow-100 text-yellow-800${isList ? " border-yellow-200" : ""}`,
    };
    return (badges[kondisi] || `bg-gray-100 text-gray-800${isList ? " border-gray-200" : ""}`) + borderClass;
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.harga * item.jumlah, 0);
  };

  const renderBrandBadge = (jenisAset, isList = false) => {
    const borderClass = isList ? " border " : "";
    const baseClass = `${isList ? "w-[84px]" : "w-auto"} text-center inline-block text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full font-semibold shrink-0`;
    if (jenisAset === "Galeria Studio") {
      return <span className={`${baseClass} bg-amber-100 text-amber-700${borderClass}${isList ? "border-amber-200" : ""}`}>Studio</span>;
    }
    if (jenisAset === "Galeria Production") {
      return <span className={`${baseClass} bg-teal-100 text-teal-700${borderClass}${isList ? "border-teal-200" : ""}`}>Production</span>;
    }
    return null;
  };

  // Filtered items for search & filter
  const filteredItems = allItems.filter((item) => {
    const matchSearch = itemSearch === "" ||
      item.nama.toLowerCase().includes(itemSearch.toLowerCase()) ||
      item.kode.toLowerCase().includes(itemSearch.toLowerCase()) ||
      (item.kategori && item.kategori.toLowerCase().includes(itemSearch.toLowerCase())) ||
      (item.merek && item.merek.toLowerCase().includes(itemSearch.toLowerCase()));
    const matchTipe = itemFilter === "semua" || item.tipe === itemFilter;
    const matchBrand = brandFilter === "semua" || item.jenisAset === brandFilter;
    return matchSearch && matchTipe && matchBrand;
  });

  if (itemFilter === "semua" && brandFilter === "semua") {
    filteredItems.sort((a, b) => a.nama.localeCompare(b.nama));
  }

  // Render
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="cursor-pointer p-2 bg-primary rounded-lg transition hover:bg-primary-hover"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Tambah Peminjaman Alat</h1>
              <p className="text-sm text-slate-500">Kode: {kodePinjam}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Data Peminjam & Keperluan (Merged) */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-primary p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informasi Peminjaman
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Nama Peminjam - Manual Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nama Peminjam *
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama peminjam"
                  value={namaPeminjam}
                  onChange={(e) => setNamaPeminjam(e.target.value)}
                  readOnly={userRole !== "super admin"}
                  className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none ${userRole !== "super admin" ? "bg-slate-50 cursor-not-allowed text-slate-500" : ""}`}
                  required
                />
              </div>

              {/* Tanggal Peminjaman */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tanggal Peminjaman *
                </label>
                <input
                  type="date"
                  value={tanggalPeminjaman}
                  onChange={(e) => setTanggalPeminjaman(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              {/* Yang Menyerahkan - Hanya visible untuk super admin */}
              {userRole === "super admin" && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Yang Menyerahkan *
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan nama yang menyerahkan"
                    value={yangMenyerahkan}
                    onChange={(e) => setYangMenyerahkan(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>
              )}
            </div>

            {/* Divider */}
            <hr className="my-6 border-slate-200" />

            {/* Keperluan Peminjaman (merged into this card) */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Keperluan Peminjaman
              </h3>
              <button
                type="button"
                onClick={addKeperluan}
                className="cursor-pointer flex items-center gap-2 px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary-hover transition"
              >
                <Plus className="w-4 h-4" /> Tambah Keperluan
              </button>
            </div>

            <div className="space-y-3">
              {keperluanList.map((k, idx) => (
                <div key={idx} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Keperluan peminjaman (misal: Acara, Dokumentasi, dsb)"
                    value={k.keperluan}
                    onChange={(e) => updateKeperluan(idx, "keperluan", e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    required={idx === 0}
                  />
                  <button
                    type="button"
                    onClick={() => removeKeperluan(idx)}
                    className="cursor-pointer p-2 text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                    disabled={keperluanList.length === 1}
                    style={{ opacity: keperluanList.length === 1 ? 0.5 : 1 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Item Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-primary p-6">
            {/* Header Row: Title + Search + Filter + View Toggle */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 shrink-0">
                <Package className="w-5 h-5" />
                Pilih Item ({items.length} terpilih)
              </h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 lg:justify-end">
                {/* Search */}
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama, kode, kategori..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                {/* Filter Dropdowns */}
                <div className="flex gap-2 items-center">
                  <select
                    value={itemFilter}
                    onChange={(e) => setItemFilter(e.target.value)}
                    className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-white"
                  >
                    <option value="semua">Semua Tipe</option>
                    <option value="asset">Aset</option>
                    <option value="aksesoris">Aksesoris</option>
                  </select>
                  <select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-white"
                  >
                    <option value="semua">Semua Brand</option>
                    <option value="Galeria Studio">Galeria Studio</option>
                    <option value="Galeria Production">Galeria Production</option>
                  </select>
                </div>
                {/* View Mode Toggle */}
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`cursor-pointer px-3 py-2 text-sm rounded-lg transition ${
                      viewMode === "list"
                        ? "bg-primary text-white hover:bg-primary-hover"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    List
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`cursor-pointer px-3 py-2 text-sm rounded-lg transition ${
                      viewMode === "grid"
                        ? "bg-primary text-white hover:bg-primary-hover"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Grid className="w-4 h-4 inline mr-1" /> Grid
                  </button>
                </div>
              </div>
            </div>

            {/* Item Selection - Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 max-h-96 overflow-y-auto">
                {filteredItems.map((item) => (
                  <div
                    key={`${item.tipe}-${item.id}`}
                    onClick={() => addItemToList(item)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      items.some((it) => it.id === item.id && it.tipe === item.tipe)
                        ? "border-primary bg-blue-50"
                        : "border-slate-200 hover:border-primary hover:bg-slate-50"
                    } ${item.kondisi !== "Siap Digunakan" || item.stok <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {/* Gambar */}
                    <div className="mb-3 h-40 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                      {item.gambar ? (
                        <Image
                          src={item.gambar}
                          alt={item.nama}
                          width={150}
                          height={150}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-slate-400" />
                      )}
                    </div>

                    {/* Info */}
                    <p className="font-semibold text-slate-900 text-sm truncate">{item.nama}</p>
                    <p className="text-xs text-slate-500">{item.kode}</p>

                    {/* Badge */}
                    <div className="flex gap-1 mt-2 flex-nowrap items-center">
                      {renderBrandBadge(item.jenisAset, false)}
                      <span className={`shrink-0 text-center inline-block text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full font-semibold ${
                        item.tipe === "asset"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}>
                        {item.tipe === "asset" ? "Aset" : "Aksesoris"}
                      </span>
                      <span className={`shrink-0 text-center inline-block text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full font-semibold ${getKondisiBadge(item.kondisi, false)}`}>
                        {item.kondisi}
                      </span>
                    </div>

                    {/* Stok & Harga */}
                    <div className="mt-2 pt-2 border-t border-slate-200 text-xs">
                      <p className="text-slate-600">Stok: <span className="font-semibold">{item.stok}</span></p>
                      {item.harga > 0 && (
                        <p className="text-slate-600">Harga: <span className="font-semibold text-emerald-600">Rp {(item.harga || 0).toLocaleString('id-ID')}</span></p>
                      )}
                    </div>

                    {items.some((it) => it.id === item.id && it.tipe === item.tipe) && (
                      <div className="mt-2 flex items-center justify-center text-primary">
                        <Check className="w-4 h-4 mr-1" /> Terpilih
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Item Selection - List View */}
            {viewMode === "list" && (
              <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                {filteredItems.map((item) => (
                  <div
                    key={`${item.tipe}-${item.id}`}
                    onClick={() => addItemToList(item)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition flex items-center justify-between ${
                      items.some((it) => it.id === item.id && it.tipe === item.tipe)
                        ? "border-primary bg-blue-50"
                        : "border-slate-200 hover:border-primary"
                    } ${item.kondisi !== "Siap Digunakan" || item.stok <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {renderBrandBadge(item.jenisAset, true)}
                      <span className={`w-[84px] text-center inline-block text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full font-semibold border shrink-0 ${
                        item.tipe === "asset"
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : "bg-purple-100 text-purple-700 border-purple-200"
                      }`}>
                        {item.tipe === "asset" ? "Aset" : "Aksesoris"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900">{item.nama}</p>
                        <p className="text-xs text-slate-500">{item.kode} • {item.kategori} • {item.merek}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600">Stok: {item.stok}</span>
                      {item.harga > 0 && (
                        <span className="text-xs font-semibold text-emerald-600">Rp {(item.harga || 0).toLocaleString('id-ID')}</span>
                      )}
                      <span className={`text-center inline-block text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-semibold border ${getKondisiBadge(item.kondisi, true)}`}>
                        {item.kondisi}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Tidak ada item yang cocok dengan pencarian</p>
              </div>
            )}
          </div>

          {/* Section 3: Selected Items */}
          {items.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-primary p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Item Terpilih</h3>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg border-2 border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Item Info */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {renderBrandBadge(item.jenisAset, true)}
                      <span className={`w-[84px] text-center inline-block text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full font-semibold border shrink-0 ${
                        item.tipe === "asset"
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : "bg-purple-100 text-purple-700 border-purple-200"
                      }`}>
                        {item.tipe === "asset" ? "Aset" : "Aksesoris"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{item.nama}</p>
                        <p className="text-xs text-slate-500 truncate">{item.kode} • Stok: {item.stok}</p>
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      {item.harga > 0 && (
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-semibold text-emerald-600">
                            Rp {(item.harga * item.jumlah).toLocaleString('id-ID')}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                        <label className="text-xs text-slate-600 font-medium ml-1">Jml:</label>
                        <input
                          type="number"
                          min="1"
                          max={item.stok}
                          value={item.jumlah}
                          onChange={(e) => updateItemJumlah(idx, parseInt(e.target.value))}
                          className="w-14 rounded bg-white border border-slate-300 px-2 py-1 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItemFromList(idx)}
                        className="cursor-pointer p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition"
                        title="Hapus Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Value */}
              {items.some((it) => it.harga > 0) && (
                <div className="mt-4 pt-4 border-t border-slate-200 text-right">
                  <p className="text-sm text-slate-600">Total Nilai Aset:</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    Rp {calculateTotal().toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Anda bertanggung jawab atas aset di atas
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Section 4: Bukti Peminjaman */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-primary p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Bukti Peminjaman ({buktiFiles.length}/5)
            </h2>

            <div className="space-y-4">
              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-blue-50 transition"
              >
                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">Klik atau drag gambar</p>
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

              {/* Preview */}
              {buktiPreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
                        className="cursor-pointer absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="cursor-pointer px-6 py-2.5 rounded-lg border-2 border-slate-400 text-slate-700 font-semibold hover:bg-slate-200 hover:border-slate-500 hover:text-slate-900 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {submitting ? "Menyimpan..." : "Simpan Peminjaman"}
            </button>
          </div>
        </form>

      {/* Toast */}
      {toast && createPortal(
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white font-medium shadow-lg animation-fade-in ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.message}
        </div>,
        document.body
      )}
    </div>
  );
}
